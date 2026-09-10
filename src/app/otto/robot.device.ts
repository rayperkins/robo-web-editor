import { Observable, Subject, Subscriber } from "rxjs";
import { Logger } from "../logger";
import { RobotSchema } from "../editor/generator/schema/robot-types";
import { OTTO_ROBOT_SCHEMA } from "../editor/generator/schema/robots/otto.schema";
import { OLIBOT_ROBOT_SCHEMA } from "../editor/generator/schema/robots/olibot.schema";
import {
    BLE_COMMAND_MAX_PAYLOAD_BYTES,
    BLE_COMMAND_TIMEOUT_MS,
    BLE_COMMAND_WRITE_CHARACTERISTIC_UUID,
    BLE_RESPONSE_CHARACTERISTIC_UUID,
    BLE_SERVICE_UUID,
    BLE_STATE_CHARACTERISTIC_UUID,
    BLE_CALIBRATION_CHARACTERISTIC_UUID,
    parseBleResponse,
} from "../editor/generator/schema/transport.schema";
import { PROGRAM_COMMANDS } from "../editor/generator/schema/program.schema";
import { OPCODES } from "../editor/generator/schema/opcodes.schema";
import { ROBOT_MOTION_COMMANDS } from "../editor/generator/schema/motion.schema";
import { ROBOT_COMMANDS } from "../editor/generator/schema/commands.schema";
import { RobotStatus, RobotType } from "../editor/generator/schema/state.schema";

export type RobotTypeId = 'otto' | 'olibot';

export class RobotDevice {

    public static UartServiceUuid: BluetoothServiceUUID = BLE_SERVICE_UUID;
    public static CommandWriteCharacteristicUuid: BluetoothCharacteristicUUID = BLE_COMMAND_WRITE_CHARACTERISTIC_UUID;
    public static ResponseCharacteristicUuid: BluetoothCharacteristicUUID = BLE_RESPONSE_CHARACTERISTIC_UUID;
    public static StateCharacteristicUuid: BluetoothCharacteristicUUID = BLE_STATE_CHARACTERISTIC_UUID;
    public static CalibrationCharacteristicUuid: BluetoothCharacteristicUUID = BLE_CALIBRATION_CHARACTERISTIC_UUID;
    private readonly _bleDevice: BluetoothDevice;
    private _gattServer?: BluetoothRemoteGATTServer;
    private _gattCharacteristic?: BluetoothRemoteGATTCharacteristic;
    private _responseCharacteristic?: BluetoothRemoteGATTCharacteristic;
    private _stateCharacteristic?: BluetoothRemoteGATTCharacteristic;
    private _calibrationCharacteristic?: BluetoothRemoteGATTCharacteristic;

    public state?: RobotDevice.State;
    public currentRunProgramId?: number;
    public readonly stateChanges = new Subject<RobotDevice.State>();

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

                    this._gattCharacteristic = await service.getCharacteristic(RobotDevice.CommandWriteCharacteristicUuid);
                    this._responseCharacteristic = await service.getCharacteristic(RobotDevice.ResponseCharacteristicUuid);
                    this._stateCharacteristic = await service.getCharacteristic(RobotDevice.StateCharacteristicUuid);
                    this._calibrationCharacteristic = await service.getCharacteristic(RobotDevice.CalibrationCharacteristicUuid);
                    await this._responseCharacteristic.startNotifications();
                    this._responseCharacteristic.addEventListener('characteristicvaluechanged', this.onResponse);
                    await this._stateCharacteristic.startNotifications();
                    this._stateCharacteristic.addEventListener('characteristicvaluechanged', this.onStateNotification);
                    Logger.log('got protocol characteristics for ', this._bleDevice);

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
            const stateCharacteristic = this._stateCharacteristic;
            if(this._gattServer?.connected !== true || !stateCharacteristic) {
                observer.error("not connected");
                observer.complete();
                return;
            }

            const schema = this.schema;

            stateCharacteristic
                .readValue()
                .then((dataView) => {
                    if (dataView.byteLength !== schema.stateByteLength) {
                        observer.error(`state payload length mismatch: expected ${schema.stateByteLength} bytes, got ${dataView.byteLength}`);
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
                            case 'u32le':
                                rawFields[field.name] = dataView.getUint8(field.offset)
                                    + dataView.getUint8(field.offset + 1) * 0x100
                                    + dataView.getUint8(field.offset + 2) * 0x10000
                                    + dataView.getUint8(field.offset + 3) * 0x1000000;
                                break;
                        }
                    }

                    const state: RobotDevice.State = {
                        version: rawFields['version'],
                        type: rawFields['type'] as RobotType,
                        robotStatus: rawFields['robotStatus'] as RobotStatus,
                        currentStep: rawFields['currentStep'] ?? 0,
                        programId: rawFields['programId'] ?? 0,
                    };
                    this.state = state;
                    this.stateChanges.next(state);

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

    public updateCalibration(): Observable<RobotDevice.Calibration> {
        return new Observable<RobotDevice.Calibration>(observer => {
            if (this._gattServer?.connected !== true || !this._calibrationCharacteristic) {
                observer.error("not connected");
                return;
            }

            this._calibrationCharacteristic.readValue().then(dataView => {
                const schema = this.schema;
                if (dataView.byteLength !== schema.calibrationByteLength) {
                    observer.error(`calibration payload length mismatch: expected ${schema.calibrationByteLength} bytes, got ${dataView.byteLength}`);
                    return;
                }
                const rawFields = this.readFields(dataView, schema.calibrationFields);
                const calibration: RobotDevice.Calibration = {
                    trimLeftLeg: rawFields['trimLeftLeg'],
                    trimRightLeg: rawFields['trimRightLeg'],
                    trimLeftFoot: rawFields['trimLeftFoot'],
                    trimRightFoot: rawFields['trimRightFoot'],
                    motorBias: rawFields['motorBias'],
                    distanceCalibration: rawFields['distanceCalibration'],
                    sensorDistance: rawFields['sensorDistance'] ?? 0,
                };
                Logger.log('robot calibration read', calibration);
                this.state = { ...this.state, ...calibration } as RobotDevice.State;
                observer.next(calibration);
                observer.complete();
            }).catch(error => observer.error(error));
        });
    }

    private readFields(dataView: DataView, fields: readonly { name: string; offset: number; type: 'u8' | 'i8' | 'u16le' | 'u32le' }[]): Record<string, number> {
        const rawFields: Record<string, number> = {};
        for (const field of fields) {
            switch (field.type) {
                case 'u8': rawFields[field.name] = dataView.getUint8(field.offset); break;
                case 'i8': rawFields[field.name] = dataView.getInt8(field.offset); break;
                case 'u16le': rawFields[field.name] = dataView.getUint16(field.offset, true); break;
                case 'u32le': rawFields[field.name] = dataView.getUint32(field.offset, true); break;
            }
        }
        return rawFields;
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
        try {
            RobotDevice.validateCommand(command);
        } catch (error) {
            observer.error(error);
            observer.complete();
            return;
        }

        Logger.log('sending data ', this._bleDevice, ' ', command);
        const enc = new TextEncoder(); // always utf-8
        const payload = enc.encode(`${command}\n`);
        if (payload.byteLength > BLE_COMMAND_MAX_PAYLOAD_BYTES) {
            observer.error(new RangeError(`Command exceeds the ${BLE_COMMAND_MAX_PAYLOAD_BYTES}-byte payload limit`));
            observer.complete();
            return;
        }
        const write = this._gattCharacteristic.writeValueWithResponse
            ? this._gattCharacteristic.writeValueWithResponse(payload)
            : this._gattCharacteristic.writeValue(payload);
        Promise.race([
            write,
            new Promise<void>((_, reject) => setTimeout(
                () => reject(new Error(`Command write timed out after ${BLE_COMMAND_TIMEOUT_MS} ms`)),
                BLE_COMMAND_TIMEOUT_MS
            )),
        ])
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

    public static validateCommand(command: string): void {
        const trimmed = command.trim();
        if (trimmed.length === 0) {
            throw new Error('Command must not be empty');
        }

        const byteLength = new TextEncoder().encode(trimmed).byteLength;
        if (byteLength > BLE_COMMAND_MAX_PAYLOAD_BYTES) {
            throw new RangeError(`Command exceeds the ${BLE_COMMAND_MAX_PAYLOAD_BYTES}-byte instruction limit: ${byteLength}`);
        }

        const tokens = trimmed.split(/\s+/);
        const upload = /^set(\d+)$/.exec(tokens[0]);
        const instructionTokens = upload ? tokens.slice(1) : tokens;
        if (instructionTokens.length > 2) {
            throw new Error('Instructions may contain at most one argument');
        }
        const mnemonic = instructionTokens[0];
        const opcode = OPCODES.find(item => item.mnemonic === mnemonic);
        const motion = ROBOT_MOTION_COMMANDS.find(item => item.mnemonic === mnemonic);
        const robotCommand = ROBOT_COMMANDS.find(item => item.mnemonic === mnemonic);
        const program = PROGRAM_COMMANDS.find(item => item.mnemonic === mnemonic);
        const known = Boolean(opcode || motion || program || robotCommand);
        if (!known) {
            throw new Error(`Unsupported command '${mnemonic}'`);
        }
        if (upload && program) {
            throw new Error('Program lifecycle commands cannot be stored as instructions');
        }
        const definition = opcode ?? motion ?? robotCommand;
        if (program?.requiresArgument && instructionTokens.length !== 2) {
            throw new Error(`${mnemonic} requires one argument`);
        }
        if (program && !program.requiresArgument && instructionTokens.length !== 1) {
            throw new Error(`${mnemonic} does not accept an argument`);
        }
        if (!program?.requiresArgument && definition?.argKind === 'none' && instructionTokens.length !== 1) {
            throw new Error(`${mnemonic} does not accept an argument`);
        }
        if (!program && definition && definition.argKind !== 'none' && instructionTokens.length !== 2) {
            throw new Error(`${mnemonic} requires one argument`);
        }
        if (robotCommand?.argKind === 'text3' && !/^[A-Za-z0-9]{3}$/.test(instructionTokens[1] ?? '')) {
            throw new Error(`${mnemonic} argument must be exactly three letters or digits`);
        }
        if (robotCommand && instructionTokens.length === 2 && robotCommand.min !== undefined
            && (Number(instructionTokens[1]) < robotCommand.min || Number(instructionTokens[1]) > (robotCommand.max ?? 32767))) {
            throw new RangeError(`${mnemonic} argument is outside the supported range`);
        }
        if (instructionTokens.length === 2
            && definition?.argKind !== 'text3'
            && !/^#?-?\d+$/.test(instructionTokens[1])) {
            throw new Error(`${mnemonic} argument must be a signed integer or #variable reference`);
        }
        if (instructionTokens.length === 2 && definition?.argKind !== 'text3') {
            const argument = instructionTokens[1];
            const isVariable = argument.startsWith('#');
            const value = Number(isVariable ? argument.slice(1) : argument);
            if (!Number.isInteger(value) || value < -32768 || value > 32767) {
                if (mnemonic === 'run' && Number.isInteger(value) && value >= 0 && value <= 4294967295) {
                    return;
                }
                throw new RangeError(`${mnemonic} argument must be a signed 16-bit integer`);
            }
            if (isVariable && (value < 0 || value >= 64)) {
                throw new RangeError('Variable index must be between 0 and 63');
            }
            if (!isVariable && mnemonic === 'heading' && (value < -360 || value > 360)) {
                throw new RangeError('heading argument must be between -360 and 360');
            }
            if (!isVariable && mnemonic === 'wait' && value < 0) {
                throw new RangeError(`${mnemonic} argument must not be negative`);
            }
            if (!isVariable && mnemonic === 'speed' && (value < 0 || value > 100)) {
                throw new RangeError(`${mnemonic} argument must be between 0 and 100`);
            }
            if (!isVariable && mnemonic === 'move' && (value < 0 || value > 32767)) {
                throw new RangeError(`${mnemonic} timeout must be between 0 and 32767 milliseconds`);
            }
        }
        if (upload && Number(upload[1]) >= 512) {
            throw new RangeError('Program instruction index must be between 0 and 511');
        }
        if (mnemonic === 'stop' && instructionTokens.length !== 1) {
            throw new Error('Motion stop does not accept an argument');
        }
    }

    private readonly onResponse = (event: Event): void => {
        const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
        const payload = new TextDecoder().decode(characteristic.value);
        const response = parseBleResponse(payload);
        if (response.kind === 'error') {
            Logger.log('firmware rejected command', response.message);
        }
    };

    private readonly onStateNotification = (): void => {
        this.updateState().subscribe({
            error: error => Logger.log('state notification decode failed', error),
        });
    };

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
        type: RobotType;
        robotStatus: RobotStatus;
        currentStep: number;
        programId: number;
        // Otto-specific calibration
        trimLeftLeg?: number;
        trimRightLeg?: number;
        trimLeftFoot?: number;
        trimRightFoot?: number;
        // Olibot-specific calibration
        motorBias?: number;
        distanceCalibration?: number;
        // Sensors
        sensorDistance?: number;
    }

    export interface Calibration {
        trimLeftLeg?: number;
        trimRightLeg?: number;
        trimLeftFoot?: number;
        trimRightFoot?: number;
        motorBias?: number;
        distanceCalibration?: number;
        sensorDistance: number;
    }
}
