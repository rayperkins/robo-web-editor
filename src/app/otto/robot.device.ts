import { Observable, Subject, Subscriber } from "rxjs";
import { Logger } from "../logger";

export class RobotDevice {

    public static UartServiceUuid: BluetoothServiceUUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
    private readonly _bleDevice: BluetoothDevice;
    private _gattServer?: BluetoothRemoteGATTServer;
    private _gattCharacteristic?: BluetoothRemoteGATTCharacteristic;

    public state?: RobotDevice.State;

    constructor(bleDevice: BluetoothDevice) {
        this._bleDevice = bleDevice;
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

            this._gattCharacteristic
                .readValue()
                .then((dataView) => {
                    //dataView.
                    const version = dataView.getUint8(0);
                    const flags = dataView.getUint8(1);

                    const state: RobotDevice.State = {
                        version: version,
                        programRunning: (flags & 0x01) > 0,
                        // calibration
                        trimLeftLeg: dataView.getInt8(4),
                        trimRightLeg: dataView.getInt8(5),
                        trimLeftFoot: dataView.getInt8(6),
                        trimRightFoot: dataView.getInt8(7),
                        // sensors
                        sensorDistance: ((dataView.getUint8(9) << 8) + (dataView.getUint8(8) << 0))
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
        // setTimeout(() => this._gattCharacteristic
        //     .writeValue(enc.encode(command))
        //     .then(() => {
        //         observer.next(currentIndex);

        //         currentIndex ++;

        //         if(currentIndex < commands.length) {
        //             this.sendCommandInternal(observer, commands, currentIndex);
        //         }
        //         else {
        //             observer.complete();
        //         }
        //     })
        //     .catch(error => {
        //         observer.error(error);
        //         observer.complete();
        //     }), 400);
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
        programRunning: boolean;
        trimLeftLeg: number;
        trimRightLeg: number;
        trimLeftFoot: number;
        trimRightFoot: number;

        sensorDistance: number;
    }
}
