import { MotionCommandDefinition, ROBOT_MOTION_COMMANDS } from '../motion.schema';
import { StateFieldDefinition, StateFlagBit } from '../state.schema';
import { ROBOT_COMMANDS } from '../commands.schema';
import { RobotSchema } from '../robot-types';

export const OTTO_MOTION_COMMANDS: readonly MotionCommandDefinition[] = [
    ...ROBOT_MOTION_COMMANDS,
    { mnemonic: 'victory', argKind: 'none', description: 'Victory gesture/dance.' },
] as const;

export const OTTO_STATE_FIELDS: readonly StateFieldDefinition[] = [
    { name: 'version', offset: 0, type: 'u8' },
    { name: 'type', offset: 1, type: 'u8' },
    { name: 'robotStatus', offset: 2, type: 'u8' },
    { name: 'currentStep', offset: 3, type: 'u16le' },
    { name: 'programId', offset: 5, type: 'u32le' },
] as const;

export const OTTO_CALIBRATION_FIELDS: readonly StateFieldDefinition[] = [
    { name: 'trimLeftLeg', offset: 0, type: 'i8' },
    { name: 'trimRightLeg', offset: 1, type: 'i8' },
    { name: 'trimLeftFoot', offset: 2, type: 'i8' },
    { name: 'trimRightFoot', offset: 3, type: 'i8' },
    { name: 'sensorDistance', offset: 4, type: 'u16le' },
] as const;

export const OTTO_STATE_BYTE_LENGTH = 9;
export const OTTO_CALIBRATION_BYTE_LENGTH = 6;

export const OTTO_ROBOT_SCHEMA: RobotSchema = {
    id: 'otto',
    name: 'Otto DIY',
    headerFileName: 'otto-protocol.h',
    description: 'Bipedal walking robot with four servo trim calibration',
    motionCommands: OTTO_MOTION_COMMANDS,
    stateFields: OTTO_STATE_FIELDS,
    stateFlagBits: [],
    stateByteLength: OTTO_STATE_BYTE_LENGTH,
    calibrationFields: OTTO_CALIBRATION_FIELDS,
    calibrationByteLength: OTTO_CALIBRATION_BYTE_LENGTH,
    commands: ROBOT_COMMANDS,
};
