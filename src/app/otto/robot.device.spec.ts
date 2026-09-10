import { describe, expect, it, vi } from 'vitest';
import { RobotDevice } from './robot.device';
import { STATE_BYTE_LENGTH } from '../editor/generator/schema/state.schema';
import { OLIBOT_STATE_BYTE_LENGTH } from '../editor/generator/schema/robots/olibot.schema';

describe('RobotDevice.updateState', () => {
    function createDevice(dataView: DataView, deviceName: string = 'OTTO_DEV', calibrationView?: DataView): RobotDevice {
        const characteristic = {
            readValue: vi.fn().mockResolvedValue(dataView),
        };
        const calibrationCharacteristic = {
            readValue: vi.fn().mockResolvedValue(calibrationView ?? dataView),
        };

        const device = new RobotDevice({ name: deviceName } as BluetoothDevice);
        (device as any)._gattServer = { connected: true };
        (device as any)._gattCharacteristic = characteristic;
        (device as any)._stateCharacteristic = characteristic;
        (device as any)._calibrationCharacteristic = calibrationCharacteristic;

        return device;
    }

    it('parses an Otto full-length state payload using schema offsets', async () => {
        const buffer = new ArrayBuffer(STATE_BYTE_LENGTH);
        const view = new DataView(buffer);
        view.setUint8(0, 1); // version
        view.setUint8(1, 0); // Otto type
        view.setUint8(2, 1); // program running
        view.setUint32(5, 0x12345678, true); // program id

        const device = createDevice(view, 'OTTO_01');

        const state = await new Promise<RobotDevice.State>((resolve, reject) => {
            device.updateState().subscribe({ next: resolve, error: reject });
        });

        describe('RobotDevice.validateCommand', () => {
            it('accepts one-argument Olibot instructions and set-prefixed program lines', () => {
                expect(() => RobotDevice.validateCommand('heading 45')).not.toThrow();
                expect(() => RobotDevice.validateCommand('set0 heading 45')).not.toThrow();
            });

            it('rejects multiple arguments and instructions over 20 bytes', () => {
                expect(() => RobotDevice.validateCommand('move 100 200')).toThrow();
                expect(() => RobotDevice.validateCommand('set0 heading 45 extra')).toThrow();
                expect(() => RobotDevice.validateCommand('heading 12345678901234567890')).toThrow(RangeError);
            });
        });

        expect(state.version).toBe(1);
        expect(state.robotStatus).toBe(1);
        expect(state.programId).toBe(0x12345678);
        expect(state.type).toBe(0);
    });

    it('parses an Olibot state payload using Olibot schema offsets', async () => {
        const buffer = new ArrayBuffer(OLIBOT_STATE_BYTE_LENGTH);
        const view = new DataView(buffer);
        view.setUint8(0, 1); // version
        view.setUint8(1, 1); // Olibot type
        view.setUint8(2, 1); // program running
        view.setUint32(5, 42, true); // program id

        const device = createDevice(view, 'OLIBOT_01');

        const state = await new Promise<RobotDevice.State>((resolve, reject) => {
            device.updateState().subscribe({ next: resolve, error: reject });
        });

        expect(device.robotType).toBe('olibot');
        expect(state.version).toBe(1);
        expect(state.robotStatus).toBe(1);
        expect(state.programId).toBe(42);
        expect(state.type).toBe(1);
    });

    it('errors instead of throwing when the payload is shorter than expected', async () => {
        const buffer = new ArrayBuffer(STATE_BYTE_LENGTH - 1);
        const view = new DataView(buffer);
        const device = createDevice(view);

        await expect(new Promise((resolve, reject) => {
            device.updateState().subscribe({ next: resolve, error: reject });
        })).rejects.toBeDefined();
    });

    it('reads Otto trims from the separate calibration characteristic', async () => {
        const stateView = new DataView(new ArrayBuffer(STATE_BYTE_LENGTH));
        stateView.setUint8(1, 0);
        const calibrationView = new DataView(new ArrayBuffer(6));
        calibrationView.setInt8(0, -12);
        calibrationView.setInt8(1, 8);
        calibrationView.setInt8(2, -3);
        calibrationView.setInt8(3, 4);
        calibrationView.setUint16(4, 321, true);
        const device = createDevice(stateView, 'OTTO_01', calibrationView);

        const calibration = await new Promise<RobotDevice.Calibration>((resolve, reject) => {
            device.updateCalibration().subscribe({ next: resolve, error: reject });
        });

        expect(calibration).toEqual({
            trimLeftLeg: -12,
            trimRightLeg: 8,
            trimLeftFoot: -3,
            trimRightFoot: 4,
            motorBias: undefined,
            distanceCalibration: undefined,
            sensorDistance: 321,
        });
    });
});
