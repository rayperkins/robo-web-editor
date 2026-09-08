// Binary layout of the BLE "state" characteristic read back from the robot.
// The state layout is split into a robot-agnostic core envelope (version, flags,
// reserved bytes) and per-robot extension payloads (trim, calibration, sensors).

export type StateFieldType = 'u8' | 'i8' | 'u16le';

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

/** Robot-agnostic core state envelope header fields. */
export const CORE_STATE_FIELDS: readonly StateFieldDefinition[] = [
    { name: 'version', offset: 0, type: 'u8' },
    { name: 'flags', offset: 1, type: 'u8' },
] as const;

/** Bits within the core `flags` byte (offset 1). */
export const CORE_STATE_FLAG_BITS: readonly StateFlagBit[] = [
    { name: 'programRunning', bit: 0 },
] as const;

/**
 * Size in bytes of the core state envelope header (offset 0: version, offset 1: flags, offsets 2..3: reserved).
 */
export const CORE_STATE_HEADER_BYTE_LENGTH = 4;

// Re-export Otto state definitions by default for backwards compatibility
export {
    OTTO_STATE_FIELDS as STATE_FIELDS,
    OTTO_STATE_FLAG_BITS as STATE_FLAG_BITS,
    OTTO_STATE_BYTE_LENGTH as STATE_BYTE_LENGTH,
} from './robots/otto.schema';

