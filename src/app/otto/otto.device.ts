import { Observable } from "rxjs";
import { Logger } from "../logger";

export class OttoDevice {

    public static UartServiceUuid: BluetoothServiceUUID = '0000ffe0-0000-1000-8000-00805f9b34fb';
    private readonly _bleDevice: BluetoothDevice;
    private _gattServer?: BluetoothRemoteGATTServer;
    private _gattCharacteristic?: BluetoothRemoteGATTCharacteristic;

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

                    const service = await gattServer.getPrimaryService(OttoDevice.UartServiceUuid);
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

    public sendCommand(command: string): Observable<boolean> {
        const observable = new Observable<boolean>(observer => {
            // check is connected
            if(this._gattServer?.connected !== true || !this._gattCharacteristic) {
                observer.next(false);
                observer.complete();
            }
            // that encoding is supported
            else if (!("TextEncoder" in window)) {
                observer.error("TextEncoder is not supported");
                observer.complete();
            }
            // now good to send data
            else {
                Logger.log('sending data ', this._bleDevice, ' ', command);
                const enc = new TextEncoder(); // always utf-8

                this._gattCharacteristic
                    .writeValue(enc.encode(command))
                    .then(() => observer.next(true))
                    .catch(error => observer.error(error))
                    .finally(() => observer.complete());
            }
        });

        return observable;
    }
    

    private disconnectIfConnected(): void {
        if (this._gattServer && this._gattServer.connected) {
            this._gattServer.disconnect();
            this._gattServer = undefined;
        }
    }
    
}