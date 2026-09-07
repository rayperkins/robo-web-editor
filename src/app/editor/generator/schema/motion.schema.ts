// Otto motion command mnemonics — handled by firmware's `handleInstruction()`
// subclass hook rather than the generic `CodeInterpreter::step()` opcode
// table, but still part of the BLE wire format and documented in README.md.

export type MotionArgKind = 'none' | 'steps' | 'speed';

export interface MotionCommandDefinition {
    /** Wire mnemonic text, e.g. "forward". */
    readonly mnemonic: string;
    readonly argKind: MotionArgKind;
}

export const MOTION_COMMANDS: readonly MotionCommandDefinition[] = [
    { mnemonic: 'forward', argKind: 'steps' },
    { mnemonic: 'backward', argKind: 'steps' },
    { mnemonic: 'left', argKind: 'steps' },
    { mnemonic: 'right', argKind: 'steps' },
    { mnemonic: 'turnleft', argKind: 'steps' },
    { mnemonic: 'turnright', argKind: 'steps' },
    { mnemonic: 'speed', argKind: 'speed' },
    { mnemonic: 'stop', argKind: 'none' },
    { mnemonic: 'victory', argKind: 'none' },
    { mnemonic: 'wait', argKind: 'steps' },
] as const;
