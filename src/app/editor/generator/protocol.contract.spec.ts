import { describe, expect, it } from 'vitest';
import { Opcode } from './opcode';
import { parseBleResponse, BLE_COMMAND_MAX_PAYLOAD_BYTES, BLE_COMMAND_TERMINATOR, BLE_SERVICE_UUID } from './schema/transport.schema';
import { PROGRAM_COMMANDS, PROGRAM_UPLOAD_INDEX_MAX } from './schema/program.schema';
import { RobotDevice } from '../../otto/robot.device';

describe('Stage 1 protocol contract', () => {
    it('keeps stored instructions separate from upload transport syntax', () => {
        expect(Opcode.heading(0)).toBe('heading 0');
        expect(Opcode.distance(100)).toBe('distance 100');
        expect(Opcode.distance(-100)).toBe('distance -100');
        expect(Opcode.move(1000)).toBe('move 1000');
        expect(PROGRAM_UPLOAD_INDEX_MAX).toBe(511);
    });

    it('defines explicit program lifecycle and motion stop commands', () => {
        expect(PROGRAM_COMMANDS.map(command => command.mnemonic)).toEqual(['clear', 'save', 'run', 'program_stop']);
        expect(Opcode.stop()).toBe('stop');
        expect(Opcode.motion('stop')).toBe('stop');
    });

    it('validates argument counts, ranges, and variable references', () => {
        expect(() => RobotDevice.validateCommand('heading 361')).toThrow(RangeError);
        expect(() => RobotDevice.validateCommand('move 100 20')).toThrow();
        expect(() => RobotDevice.validateCommand('heading #63')).not.toThrow();
        expect(() => RobotDevice.validateCommand('heading #64')).toThrow(RangeError);
        expect(() => RobotDevice.validateCommand('move 32767')).not.toThrow();
        expect(() => RobotDevice.validateCommand('move 32768')).toThrow(RangeError);
        expect(() => RobotDevice.validateCommand('run 4294967295')).not.toThrow();
        expect(() => RobotDevice.validateCommand('run 4294967296')).toThrow(RangeError);
        expect(() => RobotDevice.validateCommand('save')).not.toThrow();
        expect(() => RobotDevice.validateCommand('save 1')).toThrow();
        expect(() => RobotDevice.validateCommand('set512 move 100')).toThrow(RangeError);
        expect(() => RobotDevice.validateCommand('set0 run')).toThrow();
    });

    it('accepts only three-character alphanumeric robot name suffixes', () => {
        expect(() => RobotDevice.validateCommand('name A1Z')).not.toThrow();
        expect(() => RobotDevice.validateCommand('name AB')).toThrow();
        expect(() => RobotDevice.validateCommand('name ABC_')).toThrow();
        expect(() => RobotDevice.validateCommand('name ABC 1')).toThrow();
    });

    it('validates Otto sound commands and tone frequencies', () => {
        for (const command of ['ottoHappy', 'ottoSuperHappy', 'ottoSad', 'ottoSleeping', 'ottoFart']) {
            expect(() => RobotDevice.validateCommand(command)).not.toThrow();
            expect(() => RobotDevice.validateCommand(`${command} 1`)).toThrow();
        }
        expect(() => RobotDevice.validateCommand('ottoTone 1')).not.toThrow();
        expect(() => RobotDevice.validateCommand('ottoTone 32767')).not.toThrow();
        expect(() => RobotDevice.validateCommand('ottoTone 0')).toThrow(RangeError);
        expect(() => RobotDevice.validateCommand('ottoTone 32768')).toThrow(RangeError);
    });

    it('parses correlated acknowledgement and error responses', () => {
        expect(parseBleResponse('ack 7 accepted')).toEqual({ kind: 'ack', requestId: 7, message: 'accepted' });
        expect(parseBleResponse('err 8 unsupported')).toEqual({ kind: 'error', requestId: 8, message: 'unsupported' });
        expect(() => parseBleResponse('ack nope accepted')).toThrow();
    });

    it('centralizes the BLE framing contract', () => {
        expect(BLE_SERVICE_UUID).toMatch(/^0000/);
        expect(BLE_COMMAND_MAX_PAYLOAD_BYTES).toBe(20);
        expect(BLE_COMMAND_TERMINATOR).toBe('\n');
    });
});
