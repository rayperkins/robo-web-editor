import { Observable, Subject, Subscriber } from "rxjs";
import { Logger } from "../logger";
import { RobotSchema } from "../editor/generator/schema/robot-types";
import { OTTO_ROBOT_SCHEMA } from "../editor/generator/schema/robots/otto.schema";
import { OLIBOT_ROBOT_SCHEMA } from "../editor/generator/schema/robots/olibot.schema";

export type RobotTypeId = 'otto' | 'olibot';

export class RobotDevice {

    public static UartServiceUuid: BluetoothServiceUUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
    private readonly _bleDevice: BluetoothDevice;
    private _gattServer?: BluetoothRemoteGATTServer;
    private _gattCharacteristic?: BluetoothRemoteGATTCharacteristic;

    public state?: RobotDevice.State;

    constructor(bleDevice: BluetoothDevice) {
        this._bleDevice = bleDevice;
    }

    public get name(): string {
        return this._bleDevice.name ?? '';
    }

    public get robotType(): RobotTypeId {
        const name = this.name.toUpperCase();
        if (name.startsWith('OLIB')) {
            return 'olibot';
        }
        return 'otto';
    }

    public get schema(): RobotSchema {
        return this.robotType === 'olibot' ? OLIBOT_ROBOT_SCHEMA : OTTO_ROBOT_SCHEMA;
    }

    public connect(): Observable<boolean> {
        const observable = new Observable<boolean>(observer => {
            Logger.log('connecting device ', this._bleDevice);

            new Promise(async (resolve, reject) => {
                try {
                    const gattServer = await this._bleDevice.gatt.connect();
                    Logger.log('connected to device ', this._bleDevice);
                    
                    this._gattServer = gattServer;

                    const service = await gattServer.getPrimaryService(RobotDevice.UartServiceUuid);
                    Logger.log('got primary service for' , this._bleDevice, ' service ', service);

                    const characteristic = await service.getCharacteristics();
                    Logger.log('got characteristics for ', this._bleDevice);

                    this._gattCharacteristic = characteristic[0];

                    observer.next(gattServer.connected);
                    resolve(gattServer.connected);
                }
                catch (error) {
                    // Logger.log('could not connect to device ', this._bleDevice, error);
                    // observer.error(error);
                    reject(error);
                }
            }).catch(error => {
                Logger.log('could not connect to device ', this._bleDevice, error);

                this.disconnectIfConnected();

                observer.error(error);
            }).finally(() => {
                observer.complete();
            });
        });

        return observable;
    }

    public disconnect() {
        this.disconnectIfConnected();
    }

    public sendCommand(command: string): Observable<number> {
        return this.sendCommands([command]);
    }

    public sendCommands(commands: string[]): Observable<number> {
        const subject = new Subject<number>();
        const observable = new Observable<number>(observer => {
            // check that encoding is supported
            if (!("TextEncoder" in window)) {
                observer.error("TextEncoder is not supported");
                observer.complete();
                return;
            }

            // trigger  first command to send
            this.sendCommandInternal(observer, commands, 0);
        }).subscribe({
            next: value => subject.next(value),
            error: err => subject.error(err),
            complete: () => subject.complete()
        });

        return subject;
    }

    public updateState() : Observable<RobotDevice.State> {
        const subject = new Subject<RobotDevice.State>();
        const observable = new Observable<RobotDevice.State>(observer => {
            // check is connected
            if(this._gattServer?.connected !== true || !this._gattCharacteristic) {
                observer.error("not connected");
                observer.complete();
                return;
            }

            const schema = this.schema;

            this._gattCharacteristic
                .readValue()
                .then((dataView) => {
                    if (dataView.byteLength < schema.stateByteLength) {
                        observer.error(`state payload too short: expected ${schema.stateByteLength} bytes, got ${dataView.byteLength}`);
                        observer.complete();
                        return;
                    }

                    const rawFields: Record<string, number> = {};
                    for (const field of schema.stateFields) {
                        switch (field.type) {
                            case 'u8':
                                rawFields[field.name] = dataView.getUint8(field.offset);
                                break;
                            case 'i8':
                                rawFields[field.name] = dataView.getInt8(field.offset);
                                break;
                            case 'u16le':
                                rawFields[field.name] = dataView.getUint8(field.offset) | (dataView.getUint8(field.offset + 1) << 8);
                                break;
                        }
                    }

                    const flags = rawFields['flags'] ?? 0;
                    const state: RobotDevice.State = {
                        version: rawFields['version'],
                        flags,
                        programRunning: schema.stateFlagBits.some(f => f.name === 'programRunning' && (flags & (1 << f.bit)) > 0),
                        // Otto calibration
                        trimLeftLeg: rawFields['trimLeftLeg'],
                        trimRightLeg: rawFields['trimRightLeg'],
                        trimLeftFoot: rawFields['trimLeftFoot'],
                        trimRightFoot: rawFields['trimRightFoot'],
                        // Olibot calibration
                        motorBias: rawFields['motorBias'],
                        distanceCalibration: rawFields['distanceCalibration'],
                        // Sensors
                        sensorDistance: rawFields['sensorDistance'] ?? 0
                    };

                    this.state = state;

                    observer.next(state);
                    observer.complete();
                })
                .catch(error => {
                    observer.error(error);
                    observer.complete();
                });
        }).subscribe({
            next: value => subject.next(value),
            error: err => subject.error(err),
            complete: () => subject.complete()
        });

        return subject;
    }

    // Recursively send commands and then complete the observer
    private sendCommandInternal(observer: Subscriber<number>, commands: string[], currentIndex: number) {
        // check is connected
        if(this._gattServer?.connected !== true || !this._gattCharacteristic) {
            observer.error("not connected");
            observer.complete();
            return;
        }

        const command = commands[currentIndex];

        Logger.log('sending data ', this._bleDevice, ' ', command);
        const enc = new TextEncoder(); // always utf-8
        this._gattCharacteristic
            .writeValue(enc.encode(command))
            .then(() => {
                observer.next(currentIndex);

                currentIndex ++;

                if(currentIndex < commands.length) {
                    this.sendCommandInternal(observer, commands, currentIndex);
                }
                else {
                    observer.complete();
                }
            })
            .catch(error => {
                observer.error(error);
                observer.complete();
            });
    }

    private disconnectIfConnected(): void {
        if (this._gattServer && this._gattServer.connected) {
            this._gattServer.disconnect();
            this._gattServer = undefined;
        }
    }
}

export namespace RobotDevice
{
    export interface State {
        version: number;
        flags?: number;
        programRunning: boolean;
        // Otto-specific calibration
        trimLeftLeg?: number;
        trimRightLeg?: number;
        trimLeftFoot?: number;
        trimRightFoot?: number;
        // Olibot-specific calibration
        motorBias?: number;
        distanceCalibration?: number;
        // Sensors
        sensorDistance: number;
    }
}

