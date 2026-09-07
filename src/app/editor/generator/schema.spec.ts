import { describe, expect, it } from 'vitest';
import { OPCODES } from './schema/opcodes.schema';
import { ROBOT_MOTION_COMMANDS } from './schema/motion.schema';
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

    it('shares generic movement capabilities across robots', () => {
        expect(ROBOT_MOTION_COMMANDS.length).toBeGreaterThan(0);
        const mnemonics = ROBOT_MOTION_COMMANDS.map(m => m.mnemonic);
        expect(mnemonics).toContain('speed');
        expect(mnemonics).toContain('heading');
        expect(mnemonics).toContain('distance');
        expect(mnemonics).toContain('move');
        expect(mnemonics).toContain('stop');
        expect(mnemonics).toContain('wait');

        expect(OTTO_ROBOT_SCHEMA.motionCommands).toEqual([
            ...ROBOT_MOTION_COMMANDS,
            expect.objectContaining({ mnemonic: 'victory' }),
        ]);
        expect(OLIBOT_ROBOT_SCHEMA.motionCommands).toEqual(ROBOT_MOTION_COMMANDS);
        expect(OLIBOT_ROBOT_SCHEMA.motionCommands.map(m => m.mnemonic)).not.toContain('victory');
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
        expect(header).toContain('constexpr const char* ROBOT_SET_HEADING = "heading";');
        expect(header).toContain('constexpr const char* ROBOT_MOVE = "move";');
        expect(header).not.toContain('MOTION_');
        expect(header).not.toContain('OLIBOT_SET_');
        expect(header).not.toContain('MOTION_VICTORY');
        expect(header).toContain('struct CoreState');
        expect(header).toContain('struct OlibotState');
        expect(header).toContain('std::int8_t motorBias;');
        expect(header).toContain('std::uint16_t distanceCalibration;');
        expect(header).toContain('struct OttoState');
        expect(header).toContain('std::int8_t trimLeftLeg;');
        expect(header).toContain('using State = OlibotState;');
    });
});
