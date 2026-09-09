import { MotionCommandDefinition, ROBOT_MOTION_COMMANDS } from '../motion.schema';
import { StateFieldDefinition, StateFlagBit } from '../state.schema';
import { RobotSchema } from '../robot-types';

export const OTTO_MOTION_COMMANDS: readonly MotionCommandDefinition[] = [
    ...ROBOT_MOTION_COMMANDS,
    { mnemonic: 'victory', argKind: 'none', description: 'Victory gesture/dance.' },
] as const;

export const OTTO_STATE_FIELDS: readonly StateFieldDefinition[] = [
    { name: 'version', offset: 0, type: 'u8' },
    { name: 'flags', offset: 1, type: 'u8' },
    { name: 'programState', offset: 2, type: 'u8' },
    { name: 'programError', offset: 3, type: 'u8' },
    { name: 'currentInstructionIndex', offset: 4, type: 'u16le' },
    { name: 'programId', offset: 6, type: 'u32le' },
    { name: 'trimLeftLeg', offset: 10, type: 'i8' },
    { name: 'trimRightLeg', offset: 11, type: 'i8' },
    { name: 'trimLeftFoot', offset: 12, type: 'i8' },
    { name: 'trimRightFoot', offset: 13, type: 'i8' },
    { name: 'sensorDistance', offset: 14, type: 'u16le' },
] as const;

export const OTTO_STATE_FLAG_BITS: readonly StateFlagBit[] = [
    { name: 'programRunning', bit: 0 },
] as const;

export const OTTO_STATE_BYTE_LENGTH = 16;

export const OTTO_ROBOT_SCHEMA: RobotSchema = {
    id: 'otto',
    name: 'Otto DIY',
    headerFileName: 'otto-protocol.h',
    description: 'Bipedal walking robot with four servo trim calibration',
    motionCommands: OTTO_MOTION_COMMANDS,
    stateFields: OTTO_STATE_FIELDS,
    stateFlagBits: OTTO_STATE_FLAG_BITS,
    stateByteLength: OTTO_STATE_BYTE_LENGTH,
};
