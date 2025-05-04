/// <reference types="web-bluetooth" />
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Logger } from '../logger';
import { OttoDevice } from './otto.device';

@Injectable({
    providedIn: 'root',
})
export class OttoService {
    private ble: Bluetooth;

    constructor() {
        this.ble = navigator.bluetooth;
        if (!this.ble) {
        throw new Error('Your browser does not support Smart Bluetooth. See http://caniuse.com/#search=Bluetooth for more details.');
        }
    }

    public discover(): Observable<OttoDevice> {
        const observable = new Observable<OttoDevice>(observer => {
            
            const options: RequestDeviceOptions = {
                //filters: [ {services: [ottoUartServiceUuid]}],
                filters: [ {namePrefix: 'OTTO'}],
                //acceptAllDevices: false,
                optionalServices: [OttoDevice.UartServiceUuid]
            };

            this.ble.requestDevice(options).then(device => {
                Logger.log('discovered device', device);
                
                observer.next(new OttoDevice(device));
                observer.complete();
            }).catch(error => {
                observer.error(error);
            }).finally(() => {
                observer.complete();
            });
        });

        return observable;
    }

    requestOttoDevice(options: RequestDeviceOptions): Promise<BluetoothDevice> {
        return this.ble.requestDevice(options);
    }
}

