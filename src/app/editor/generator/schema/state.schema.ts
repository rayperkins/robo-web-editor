// Binary layout of the BLE "state" characteristic read back from the robot.
// The state layout is split into a robot-agnostic core envelope and per-robot
// extension payloads (trim, calibration, sensors).

export type StateFieldType = 'u8' | 'i8' | 'u16le' | 'u32le';

export enum RobotType {
    Otto = 0,
    Olibot = 1,
}

export enum RobotStatus {
    Ready = 0,
    ProgramRunning = 1,
    ProgramError = 2,
    CalibrationRunning = 3,
}

export interface StateFieldDefinition {
    /** Field name surfaced on RobotDevice.State. */
    readonly name: string;
    readonly offset: number;
    readonly type: StateFieldType;
}

export interface StateFlagBit {
    /** Flag name surfaced on RobotDevice.State. */
    readonly name: string;
    /** Bit index (0 = least significant) within the `flags` byte. */
    readonly bit: number;
}

/** Robot-agnostic core state envelope header fields. Runtime errors remain latched until firmware clears or resets them. */
export const CORE_STATE_FIELDS: readonly StateFieldDefinition[] = [
    { name: 'version', offset: 0, type: 'u8' },
    { name: 'type', offset: 1, type: 'u8' },
    { name: 'robotStatus', offset: 2, type: 'u8' },
    { name: 'currentStep', offset: 3, type: 'u16le' },
    { name: 'programId', offset: 5, type: 'u32le' },
] as const;

/**
 * Size in bytes of the core state envelope header.
 */
export const CORE_STATE_HEADER_BYTE_LENGTH = 9;

// Re-export Otto state definitions by default for backwards compatibility
export {
    OTTO_STATE_FIELDS as STATE_FIELDS,
    OTTO_STATE_BYTE_LENGTH as STATE_BYTE_LENGTH,
} from './robots/otto.schema';
