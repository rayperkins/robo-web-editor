// Shared robot motion command types and definitions.
// Motion commands are handled outside the generic CodeInterpreter::step()
// opcode table (e.g. by firmware's robot-specific motion controller /
// instruction handler), but are part of the BLE wire format shared across robots.

export type MotionArgKind = 'none' | 'steps' | 'speed' | 'distanceMm' | 'headingDeg' | 'durationMs' | 'direction';

export interface MotionCommandDefinition {
    /** Wire mnemonic text, e.g. "forward", "turn". */
    readonly mnemonic: string;
    readonly argKind: MotionArgKind;
    readonly description?: string;
}

/**
 * Shared motion commands understood across robot variants.
 * Both walking robots (Otto) and wheeled differential-drive robots (Olibot)
 * share this vehicle-level movement command set (e.g. forward 100mm, turn 45deg, speed 100%).
 */
export const SHARED_MOTION_COMMANDS: readonly MotionCommandDefinition[] = [
    { mnemonic: 'forward', argKind: 'distanceMm', description: 'Move forward specified distance in mm (e.g. forward 100)' },
    { mnemonic: 'backward', argKind: 'distanceMm', description: 'Move backward specified distance in mm (e.g. backward 100)' },
    { mnemonic: 'turn', argKind: 'headingDeg', description: 'Rotate relative heading in degrees (e.g. turn 45, turn -90)' },
    { mnemonic: 'speed', argKind: 'speed', description: 'Set motion speed in percent (e.g. speed 100)' },
    { mnemonic: 'stop', argKind: 'none', description: 'Stop motion immediately' },
    { mnemonic: 'wait', argKind: 'durationMs', description: 'Wait duration in ms (e.g. wait 1000)' },
    { mnemonic: 'victory', argKind: 'none', description: 'Victory gesture/dance' },
] as const;

export { SHARED_MOTION_COMMANDS as MOTION_COMMANDS };



