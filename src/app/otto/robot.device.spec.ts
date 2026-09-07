import { describe, expect, it, vi } from 'vitest';
import { RobotDevice } from './robot.device';
import { STATE_BYTE_LENGTH } from '../editor/generator/schema/state.schema';
import { OLIBOT_STATE_BYTE_LENGTH } from '../editor/generator/schema/robots/olibot.schema';

describe('RobotDevice.updateState', () => {
    function createDevice(dataView: DataView, deviceName: string = 'OTTO_DEV'): RobotDevice {
        const characteristic = {
            readValue: vi.fn().mockResolvedValue(dataView),
        };

        const device = new RobotDevice({ name: deviceName } as BluetoothDevice);
        (device as any)._gattServer = { connected: true };
        (device as any)._gattCharacteristic = characteristic;

        return device;
    }

    it('parses an Otto full-length state payload using schema offsets', async () => {
        const buffer = new ArrayBuffer(STATE_BYTE_LENGTH);
        const view = new DataView(buffer);
        view.setUint8(0, 1); // version
        view.setUint8(1, 0x01); // flags: programRunning
        view.setInt8(4, -1); // trimLeftLeg
        view.setInt8(5, 2); // trimRightLeg
        view.setInt8(6, -3); // trimLeftFoot
        view.setInt8(7, 4); // trimRightFoot
        view.setUint8(8, 0x34); // sensorDistance low byte
        view.setUint8(9, 0x12); // sensorDistance high byte

        const device = createDevice(view, 'OTTO_01');

        const state = await new Promise<RobotDevice.State>((resolve, reject) => {
            device.updateState().subscribe({ next: resolve, error: reject });
        });

        expect(state.version).toBe(1);
        expect(state.programRunning).toBe(true);
        expect(state.trimLeftLeg).toBe(-1);
        expect(state.trimRightLeg).toBe(2);
        expect(state.trimLeftFoot).toBe(-3);
        expect(state.trimRightFoot).toBe(4);
        expect(state.sensorDistance).toBe(0x1234);
    });

    it('parses an Olibot state payload using Olibot schema offsets', async () => {
        const buffer = new ArrayBuffer(OLIBOT_STATE_BYTE_LENGTH);
        const view = new DataView(buffer);
        view.setUint8(0, 1); // version
        view.setUint8(1, 0x01); // flags: programRunning
        view.setInt8(4, -5); // motorBias
        view.setUint8(6, 0x64); // distanceCalibration low byte (100)
        view.setUint8(7, 0x00); // distanceCalibration high byte
        view.setUint8(8, 0x78); // sensorDistance low byte (120)
        view.setUint8(9, 0x00); // sensorDistance high byte

        const device = createDevice(view, 'OLIBOT_01');

        const state = await new Promise<RobotDevice.State>((resolve, reject) => {
            device.updateState().subscribe({ next: resolve, error: reject });
        });

        expect(device.robotType).toBe('olibot');
        expect(state.version).toBe(1);
        expect(state.programRunning).toBe(true);
        expect(state.motorBias).toBe(-5);
        expect(state.distanceCalibration).toBe(100);
        expect(state.sensorDistance).toBe(120);
    });

    it('errors instead of throwing when the payload is shorter than expected', async () => {
        const buffer = new ArrayBuffer(STATE_BYTE_LENGTH - 1);
        const view = new DataView(buffer);
        const device = createDevice(view);

        await expect(new Promise((resolve, reject) => {
            device.updateState().subscribe({ next: resolve, error: reject });
        })).rejects.toBeDefined();
    });
});

