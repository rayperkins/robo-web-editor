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
export const OTTO_HAPPY = 'ottoHappy';
export const OTTO_SUPER_HAPPY = 'ottoSuperHappy';
export const OTTO_SAD = 'ottoSad';
export const OTTO_SLEEPING = 'ottoSleeping';
export const OTTO_FART = 'ottoFart';
export const OTTO_TONE = 'ottoTone';
export const CALIBRATE = 'calibrate';
export const SAVE_CALIBRATION = 'save_calibration';
export const ROBOT_NAME_SUFFIX = 'name';

export const ROBOT_COMMANDS: readonly RobotCommandDefinition[] = [
    { constantName: 'OTTO_LEFTLEG_TRIM', mnemonic: OTTO_LEFTLEG_TRIM, argKind: 'int16', description: 'Set the Otto left leg trim.', min: -90, max: 90 },
    { constantName: 'OTTO_RIGHTLEG_TRIM', mnemonic: OTTO_RIGHTLEG_TRIM, argKind: 'int16', description: 'Set the Otto right leg trim.', min: -90, max: 90 },
    { constantName: 'OTTO_LEFTFOOT_TRIM', mnemonic: OTTO_LEFTFOOT_TRIM, argKind: 'int16', description: 'Set the Otto left foot trim.', min: -90, max: 90 },
    { constantName: 'OTTO_RIGHTFOOT_TRIM', mnemonic: OTTO_RIGHTFOOT_TRIM, argKind: 'int16', description: 'Set the Otto right foot trim.', min: -90, max: 90 },
    { constantName: 'OTTO_HOME', mnemonic: OTTO_HOME, argKind: 'none', description: 'Move Otto servos to their zero positions plus trim offsets.' },
    { constantName: 'OTTO_HAPPY', mnemonic: OTTO_HAPPY, argKind: 'none', description: 'Play the Otto happy sound gesture.' },
    { constantName: 'OTTO_SUPER_HAPPY', mnemonic: OTTO_SUPER_HAPPY, argKind: 'none', description: 'Play the Otto super-happy sound gesture.' },
    { constantName: 'OTTO_SAD', mnemonic: OTTO_SAD, argKind: 'none', description: 'Play the Otto sad descending sound gesture.' },
    { constantName: 'OTTO_SLEEPING', mnemonic: OTTO_SLEEPING, argKind: 'none', description: 'Play the Otto sleeping/dream sound gesture.' },
    { constantName: 'OTTO_FART', mnemonic: OTTO_FART, argKind: 'none', description: 'Play the Otto fart sound gesture.' },
    { constantName: 'OTTO_TONE', mnemonic: OTTO_TONE, argKind: 'int16', description: 'Play an Otto tone in Hz for the default 500 ms; frequency range 1-32767 Hz.', min: 1, max: 32767 },
    { constantName: 'CALIBRATE', mnemonic: CALIBRATE, argKind: 'none', description: 'Start the robot auto-calibration cycle.' },
    { constantName: 'SAVE_CALIBRATION', mnemonic: SAVE_CALIBRATION, argKind: 'none', description: 'Persist the current robot calibration.' },
    { constantName: 'ROBOT_NAME_SUFFIX', mnemonic: ROBOT_NAME_SUFFIX, argKind: 'text3', description: 'Set the three-character robot name suffix.' },
] as const;
