import { RobotDevice } from './robot.device';
import { STATE_BYTE_LENGTH } from '../editor/generator/schema/state.schema';

describe('RobotDevice.updateState', () => {
    function createDevice(dataView: DataView): RobotDevice {
        const characteristic = jasmine.createSpyObj('BluetoothRemoteGATTCharacteristic', ['readValue']);
        characteristic.readValue.and.resolveTo(dataView);

        const device = new RobotDevice({} as BluetoothDevice);
        (device as any)._gattServer = { connected: true };
        (device as any)._gattCharacteristic = characteristic;

        return device;
    }

    it('parses a full-length state payload using schema offsets', async () => {
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

        const device = createDevice(view);

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

    it('errors instead of throwing when the payload is shorter than expected', async () => {
        const buffer = new ArrayBuffer(STATE_BYTE_LENGTH - 1);
        const view = new DataView(buffer);
        const device = createDevice(view);

        await expectAsync(new Promise((resolve, reject) => {
            device.updateState().subscribe({ next: resolve, error: reject });
        })).toBeRejected();
    });
});
