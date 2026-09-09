// Generic robot motion command types and definitions.
// Motion commands are handled outside the generic CodeInterpreter::step()
// opcode table (e.g. by firmware's robot-specific motion controller /
// instruction handler), but are part of the BLE wire format shared across robots.

export type MotionArgKind = 'none' | 'int16OrVariableIndex';

export interface MotionCommandDefinition {
    /** Wire mnemonic text, e.g. "forward", "turn". */
    readonly mnemonic: string;
    readonly argKind: MotionArgKind;
    readonly description?: string;
    readonly min?: number;
    readonly max?: number;
    readonly defaultValue?: number;
}

/**
 * Generic movement capabilities understood across supported robot variants.
 * Robot adapters interpret these setpoints according to their own drive
 * mechanism; the wire-level command names remain stable.
 */
export const ROBOT_MOTION_COMMANDS: readonly MotionCommandDefinition[] = [
    { mnemonic: 'heading', argKind: 'int16OrVariableIndex', min: -360, max: 360, defaultValue: 0, description: 'Set the relative heading target in degrees.' },
    { mnemonic: 'distance', argKind: 'int16OrVariableIndex', min: -32768, max: 32767, defaultValue: 0, description: 'Set the signed travel distance target in millimetres; negative values drive in reverse.' },
    { mnemonic: 'speed', argKind: 'int16OrVariableIndex', min: 0, max: 100, defaultValue: 100, description: 'Set the requested speed percentage.' },
    { mnemonic: 'move', argKind: 'int16OrVariableIndex', min: 0, max: 32767, defaultValue: 1000, description: 'Start motion using the current heading and distance setpoints; the argument is a timeout in milliseconds.' },
    { mnemonic: 'stop', argKind: 'none', description: 'Stop motion and clear pending movement setpoints.' },
    { mnemonic: 'wait', argKind: 'int16OrVariableIndex', min: 0, max: 32767, description: 'Wait in the interpreter without issuing a movement command; duration is milliseconds.' },
] as const;

export const MOTION_VARIABLE_REFERENCES_ALLOWED = true;
