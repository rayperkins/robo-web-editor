import { ROBOT_MOTION_COMMANDS } from '../motion.schema';
import { StateFieldDefinition, StateFlagBit } from '../state.schema';
import { RobotSchema } from '../robot-types';

export const OLIBOT_STATE_FIELDS: readonly StateFieldDefinition[] = [
    { name: 'version', offset: 0, type: 'u8' },
    { name: 'flags', offset: 1, type: 'u8' },
    { name: 'programState', offset: 2, type: 'u8' },
    { name: 'programError', offset: 3, type: 'u8' },
    { name: 'currentInstructionIndex', offset: 4, type: 'u16le' },
    { name: 'programId', offset: 6, type: 'u32le' },
    { name: 'motorBias', offset: 10, type: 'i8' },
    { name: 'distanceCalibration', offset: 12, type: 'u16le' },
    { name: 'sensorDistance', offset: 14, type: 'u16le' },
] as const;

export const OLIBOT_STATE_FLAG_BITS: readonly StateFlagBit[] = [
    { name: 'programRunning', bit: 0 },
] as const;

export const OLIBOT_STATE_BYTE_LENGTH = 16;

export const OLIBOT_ROBOT_SCHEMA: RobotSchema = {
    id: 'olibot',
    name: 'Olibot',
    headerFileName: 'olibot-protocol.h',
    description: '140mm circular two-wheel differential drive robot',
    motionCommands: ROBOT_MOTION_COMMANDS,
    stateFields: OLIBOT_STATE_FIELDS,
    stateFlagBits: OLIBOT_STATE_FLAG_BITS,
    stateByteLength: OLIBOT_STATE_BYTE_LENGTH,
};
