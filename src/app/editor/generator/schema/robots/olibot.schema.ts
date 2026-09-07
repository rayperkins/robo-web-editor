import { SHARED_MOTION_COMMANDS } from '../motion.schema';
import { StateFieldDefinition, StateFlagBit } from '../state.schema';
import { RobotSchema } from '../robot-types';

export const OLIBOT_MOTION_COMMANDS = SHARED_MOTION_COMMANDS;

export const OLIBOT_STATE_FIELDS: readonly StateFieldDefinition[] = [
    { name: 'version', offset: 0, type: 'u8' },
    { name: 'flags', offset: 1, type: 'u8' },
    { name: 'motorBias', offset: 4, type: 'i8' },
    { name: 'distanceCalibration', offset: 6, type: 'u16le' },
    { name: 'sensorDistance', offset: 8, type: 'u16le' },
] as const;

export const OLIBOT_STATE_FLAG_BITS: readonly StateFlagBit[] = [
    { name: 'programRunning', bit: 0 },
] as const;

export const OLIBOT_STATE_BYTE_LENGTH = 10;

export const OLIBOT_ROBOT_SCHEMA: RobotSchema = {
    id: 'olibot',
    name: 'Olibot',
    headerFileName: 'olibot-protocol.h',
    description: '140mm circular two-wheel differential drive robot',
    motionCommands: OLIBOT_MOTION_COMMANDS,
    stateFields: OLIBOT_STATE_FIELDS,
    stateFlagBits: OLIBOT_STATE_FLAG_BITS,
    stateByteLength: OLIBOT_STATE_BYTE_LENGTH,
};

