export type RobotCommandArgKind = 'none' | 'int16' | 'text3';

export interface RobotCommandDefinition {
    readonly constantName: string;
    readonly mnemonic: string;
    readonly argKind: RobotCommandArgKind;
    readonly description: string;
    readonly min?: number;
    readonly max?: number;
}

export const OTTO_LEFTLEG_TRIM = 'ottoLLtrim';
export const OTTO_RIGHTLEG_TRIM = 'ottoRLtrim';
export const OTTO_LEFTFOOT_TRIM = 'ottoLFtrim';
export const OTTO_RIGHTFOOT_TRIM = 'ottoRFtrim';
export const OTTO_HOME = 'ottoHome';
export const CALIBRATE = 'calibrate';
export const SAVE_CALIBRATION = 'save_calibration';
export const ROBOT_NAME_SUFFIX = 'name';

export const ROBOT_COMMANDS: readonly RobotCommandDefinition[] = [
    { constantName: 'OTTO_LEFTLEG_TRIM', mnemonic: OTTO_LEFTLEG_TRIM, argKind: 'int16', description: 'Set the Otto left leg trim.', min: -90, max: 90 },
    { constantName: 'OTTO_RIGHTLEG_TRIM', mnemonic: OTTO_RIGHTLEG_TRIM, argKind: 'int16', description: 'Set the Otto right leg trim.', min: -90, max: 90 },
    { constantName: 'OTTO_LEFTFOOT_TRIM', mnemonic: OTTO_LEFTFOOT_TRIM, argKind: 'int16', description: 'Set the Otto left foot trim.', min: -90, max: 90 },
    { constantName: 'OTTO_RIGHTFOOT_TRIM', mnemonic: OTTO_RIGHTFOOT_TRIM, argKind: 'int16', description: 'Set the Otto right foot trim.', min: -90, max: 90 },
    { constantName: 'OTTO_HOME', mnemonic: OTTO_HOME, argKind: 'none', description: 'Move Otto servos to their zero positions plus trim offsets.' },
    { constantName: 'CALIBRATE', mnemonic: CALIBRATE, argKind: 'none', description: 'Start the robot auto-calibration cycle.' },
    { constantName: 'SAVE_CALIBRATION', mnemonic: SAVE_CALIBRATION, argKind: 'none', description: 'Persist the current robot calibration.' },
    { constantName: 'ROBOT_NAME_SUFFIX', mnemonic: ROBOT_NAME_SUFFIX, argKind: 'text3', description: 'Set the three-character robot name suffix.' },
] as const;
