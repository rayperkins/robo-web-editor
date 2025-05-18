/// <reference types="web-bluetooth" />
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Logger } from '../logger';
import { RobotDevice } from './robot.device';

@Injectable({
    providedIn: 'root',
})
export class RobotService {
    private ble: Bluetooth;

    constructor() {
        this.ble = navigator.bluetooth;
        if (!this.ble) {
        throw new Error('Your browser does not support Smart Bluetooth. See http://caniuse.com/#search=Bluetooth for more details.');
        }
    }

    public discover(): Observable<RobotDevice> {
        const observable = new Observable<RobotDevice>(observer => {
            
            const options: RequestDeviceOptions = {
                //filters: [ {services: [ottoUartServiceUuid]}],
                filters: [ {namePrefix: 'OTTO'}],
                //acceptAllDevices: false,
                optionalServices: [RobotDevice.UartServiceUuid]
            };

            this.ble.requestDevice(options).then(device => {
                Logger.log('discovered device', device);
                
                observer.next(new RobotDevice(device));
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