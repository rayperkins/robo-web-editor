// Binary layout of the BLE "state" characteristic read back from the robot
// (see RobotDevice.updateState()). This struct is what previously crashed
// with `RangeError: Offset is outside the bounds of the DataView` when a
// firmware variant (OLIB) returned a shorter payload than expected —
// STATE_BYTE_LENGTH below is now checked explicitly before parsing.

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

export const STATE_FIELDS: readonly StateFieldDefinition[] = [
    { name: 'version', offset: 0, type: 'u8' },
    { name: 'flags', offset: 1, type: 'u8' },
    { name: 'trimLeftLeg', offset: 4, type: 'i8' },
    { name: 'trimRightLeg', offset: 5, type: 'i8' },
    { name: 'trimLeftFoot', offset: 6, type: 'i8' },
    { name: 'trimRightFoot', offset: 7, type: 'i8' },
    { name: 'sensorDistance', offset: 8, type: 'u16le' },
] as const;

/** Bits within the `flags` byte (offset 1). */
export const STATE_FLAG_BITS: readonly StateFlagBit[] = [
    { name: 'programRunning', bit: 0 },
] as const;

/**
 * Total number of bytes firmware sends for the state characteristic.
 * Computed as the highest (offset + type size) across all fields.
 */
export const STATE_BYTE_LENGTH = 10;
