import { INT16_MAX, INT16_MIN, INSTRUCTION_LIST_SIZE } from './protocol.schema';

export const PROGRAM_UPLOAD_PREFIX = 'set';
export const PROGRAM_UPLOAD_INDEX_MIN = 0;
export const PROGRAM_UPLOAD_INDEX_MAX = INSTRUCTION_LIST_SIZE - 1;

export interface ProgramCommandDefinition {
    readonly mnemonic: string;
    readonly description: string;
    readonly requiresArgument?: boolean;
}

export const PROGRAM_COMMANDS: readonly ProgramCommandDefinition[] = [
    { mnemonic: 'clear', description: 'Clear all interpreter slots.' },
    { mnemonic: 'save', description: 'Store the uploaded program in persistent memory.' },
    { mnemonic: 'run', description: 'Start executing the uploaded program with its 32-bit correlation identifier.', requiresArgument: true },
    { mnemonic: 'program_stop', description: 'Stop and cancel the running program.' },
] as const;

export const PROGRAM_ARGUMENT_RULES = {
    int16: { min: INT16_MIN, max: INT16_MAX },
    uint32: { min: 0, max: 4294967295 },
    variableIndex: { min: 0, max: 63 },
} as const;

export function isProgramUploadLine(command: string): boolean {
    return new RegExp(`^${PROGRAM_UPLOAD_PREFIX}(\\d+)\\s+\\S+(?:\\s+\\S+)?$`).test(command.trim());
}
