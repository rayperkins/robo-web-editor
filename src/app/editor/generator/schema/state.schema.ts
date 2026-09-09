// Binary layout of the BLE "state" characteristic read back from the robot.
// The state layout is split into a robot-agnostic core envelope and per-robot
// extension payloads (trim, calibration, sensors).

export type StateFieldType = 'u8' | 'i8' | 'u16le' | 'u32le';

export enum ProgramState {
    Stopped = 0,
    Running = 1,
    Completed = 2,
    Error = 3,
}

export enum ProgramError {
    None = 0,
    MotionTimeout = 1,
    RuntimeFailure = 2,
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
    { name: 'flags', offset: 1, type: 'u8' },
    { name: 'programState', offset: 2, type: 'u8' },
    { name: 'programError', offset: 3, type: 'u8' },
    { name: 'currentInstructionIndex', offset: 4, type: 'u16le' },
    { name: 'programId', offset: 6, type: 'u32le' },
] as const;

/** Bits within the core `flags` byte (offset 1). */
export const CORE_STATE_FLAG_BITS: readonly StateFlagBit[] = [
    { name: 'programRunning', bit: 0 },
] as const;

/**
 * Size in bytes of the core state envelope header.
 */
export const CORE_STATE_HEADER_BYTE_LENGTH = 10;

// Re-export Otto state definitions by default for backwards compatibility
export {
    OTTO_STATE_FIELDS as STATE_FIELDS,
    OTTO_STATE_FLAG_BITS as STATE_FLAG_BITS,
    OTTO_STATE_BYTE_LENGTH as STATE_BYTE_LENGTH,
} from './robots/otto.schema';
