import { describe, expect, it } from 'vitest';
import { OPCODES } from './schema/opcodes.schema';
import { MOTION_COMMANDS, SHARED_MOTION_COMMANDS } from './schema/motion.schema';
import { PROTOCOL_VERSION, INSTRUCTION_SIZE, INSTRUCTION_LIST_SIZE, VARIABLE_LIST_SIZE } from './schema/protocol.schema';
import { CORE_STATE_FIELDS, CORE_STATE_FLAG_BITS, CORE_STATE_HEADER_BYTE_LENGTH } from './schema/state.schema';
import { OTTO_ROBOT_SCHEMA } from './schema/robots/otto.schema';
import { OLIBOT_ROBOT_SCHEMA } from './schema/robots/olibot.schema';
import { validateSchema, generateSingleHeader } from '../../../../scripts/generate-firmware-header';

describe('Protocol Schema and Code Generation', () => {
    it('validates without error', () => {
        expect(() => validateSchema()).not.toThrow();
    });

    it('has fixed protocol limits', () => {
        expect(PROTOCOL_VERSION).toBe(1);
        expect(INSTRUCTION_SIZE).toBe(20);
        expect(INSTRUCTION_LIST_SIZE).toBe(512);
        expect(VARIABLE_LIST_SIZE).toBe(64);
    });

    it('shares motion commands across robots', () => {
        expect(SHARED_MOTION_COMMANDS.length).toBeGreaterThan(0);
        const mnemonics = SHARED_MOTION_COMMANDS.map(m => m.mnemonic);
        expect(mnemonics).toContain('forward');
        expect(mnemonics).toContain('backward');
        expect(mnemonics).toContain('turn');
        expect(mnemonics).toContain('speed');
        expect(mnemonics).toContain('stop');
        expect(mnemonics).toContain('wait');

        expect(OTTO_ROBOT_SCHEMA.motionCommands).toEqual(SHARED_MOTION_COMMANDS);
        expect(OLIBOT_ROBOT_SCHEMA.motionCommands).toEqual(SHARED_MOTION_COMMANDS);
    });

    it('has robot-specific configuration state layouts', () => {
        // Otto has trim fields
        const ottoFieldNames = OTTO_ROBOT_SCHEMA.stateFields.map(f => f.name);
        expect(ottoFieldNames).toContain('trimLeftLeg');
        expect(ottoFieldNames).toContain('trimRightLeg');
        expect(ottoFieldNames).toContain('trimLeftFoot');
        expect(ottoFieldNames).toContain('trimRightFoot');
        expect(ottoFieldNames).not.toContain('motorBias');

        // Olibot has motor bias and distance calibration
        const olibotFieldNames = OLIBOT_ROBOT_SCHEMA.stateFields.map(f => f.name);
        expect(olibotFieldNames).toContain('motorBias');
        expect(olibotFieldNames).toContain('distanceCalibration');
        expect(olibotFieldNames).not.toContain('trimLeftLeg');
    });

    it('generates a single unified C++ header with shared protocol and robot-specific states', () => {
        const header = generateSingleHeader();
        expect(header).toContain('namespace robot::protocol');
        expect(header).toContain('constexpr int PROTOCOL_VERSION = 1;');
        expect(header).toContain('constexpr std::size_t INSTRUCTION_LIST_SIZE = 512;');
        expect(header).toContain('constexpr const char* OPCODE_EXIT = "exit";');
        expect(header).toContain('constexpr const char* MOTION_TURN = "turn";');
        expect(header).toContain('struct CoreState');
        expect(header).toContain('struct OlibotState');
        expect(header).toContain('std::int8_t motorBias;');
        expect(header).toContain('std::uint16_t distanceCalibration;');
        expect(header).toContain('struct OttoState');
        expect(header).toContain('std::int8_t trimLeftLeg;');
        expect(header).toContain('using State = OlibotState;');
    });
});

