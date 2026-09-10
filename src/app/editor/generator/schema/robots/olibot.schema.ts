import { ROBOT_MOTION_COMMANDS } from '../motion.schema';
import { StateFieldDefinition } from '../state.schema';
import { ROBOT_COMMANDS } from '../commands.schema';
import { RobotSchema } from '../robot-types';

export const OLIBOT_STATE_FIELDS: readonly StateFieldDefinition[] = [
    { name: 'version', offset: 0, type: 'u8' },
    { name: 'type', offset: 1, type: 'u8' },
    { name: 'robotStatus', offset: 2, type: 'u8' },
    { name: 'currentStep', offset: 3, type: 'u16le' },
    { name: 'programId', offset: 5, type: 'u32le' },
] as const;

export const OLIBOT_CALIBRATION_FIELDS: readonly StateFieldDefinition[] = [
    { name: 'motorBias', offset: 0, type: 'i8' },
    { name: 'distanceCalibration', offset: 2, type: 'u16le' },
    { name: 'sensorDistance', offset: 4, type: 'u16le' },
] as const;

export const OLIBOT_STATE_BYTE_LENGTH = 9;
export const OLIBOT_CALIBRATION_BYTE_LENGTH = 6;

export const OLIBOT_ROBOT_SCHEMA: RobotSchema = {
    id: 'olibot',
    name: 'Olibot',
    headerFileName: 'olibot-protocol.h',
    description: '140mm circular two-wheel differential drive robot',
    motionCommands: ROBOT_MOTION_COMMANDS,
    stateFields: OLIBOT_STATE_FIELDS,
    stateFlagBits: [],
    stateByteLength: OLIBOT_STATE_BYTE_LENGTH,
    calibrationFields: OLIBOT_CALIBRATION_FIELDS,
    calibrationByteLength: OLIBOT_CALIBRATION_BYTE_LENGTH,
    commands: ROBOT_COMMANDS,
};
