// Program instruction opcode table — the mnemonics understood by firmware's
// `robot::interpreter::CodeInterpreter::step()`. Keep in sync with the
// `OPCODE_*` constants in the firmware header; the generator script emits
// those constants directly from this table.
//
// `argKind` documents what `getArg()` on firmware expects to find after the
// mnemonic in a resolved instruction line:
//   - 'none'         no argument (e.g. `exit`)
//   - 'int16'        a signed 16-bit constant (e.g. `use -1234`)
//   - 'variableIndex' a `#index` reference into the variable list (e.g. `stor #3`)
//   - 'jumpTarget'   an absolute instruction index, already resolved from any
//                    `@delta` relative form by the editor before it is sent
//                    over BLE (e.g. `jmp 12`)

export type OpcodeArgKind = 'none' | 'int16' | 'variableIndex' | 'jumpTarget' | 'int16OrVariableIndex';

export interface OpcodeDefinition {
    /** Firmware constant name, e.g. OPCODE_EXIT. */
    readonly constantName: string;
    /** Wire mnemonic text, e.g. "exit". */
    readonly mnemonic: string;
    readonly argKind: OpcodeArgKind;
    readonly description: string;
}

export const OPCODES: readonly OpcodeDefinition[] = [
    { constantName: 'OPCODE_EXIT', mnemonic: 'exit', argKind: 'none', description: 'Stop the interpreter.' },
    { constantName: 'OPCODE_USE', mnemonic: 'use', argKind: 'int16', description: 'Set the current arithmetic value.' },
    { constantName: 'OPCODE_STOR', mnemonic: 'stor', argKind: 'variableIndex', description: 'Store the current value in a variable.' },
    { constantName: 'OPCODE_LOAD', mnemonic: 'load', argKind: 'variableIndex', description: 'Load a variable into the current value.' },
    { constantName: 'OPCODE_JMP', mnemonic: 'jmp', argKind: 'jumpTarget', description: 'Jump to an instruction.' },
    { constantName: 'OPCODE_JMPE', mnemonic: 'jmpe', argKind: 'jumpTarget', description: 'Jump when the current value is zero.' },
    { constantName: 'OPCODE_JMPN', mnemonic: 'jmpn', argKind: 'jumpTarget', description: 'Jump when the current value is negative.' },
    { constantName: 'OPCODE_JMPP', mnemonic: 'jmpp', argKind: 'jumpTarget', description: 'Jump when the current value is positive.' },
    { constantName: 'OPCODE_ADD', mnemonic: 'add', argKind: 'int16OrVariableIndex', description: 'Add an operand to the current value.' },
    { constantName: 'OPCODE_SUB', mnemonic: 'sub', argKind: 'int16OrVariableIndex', description: 'Subtract an operand from the current value.' },
    { constantName: 'OPCODE_DIV', mnemonic: 'div', argKind: 'int16OrVariableIndex', description: 'Divide the current value by an operand.' },
    { constantName: 'OPCODE_MUL', mnemonic: 'mul', argKind: 'int16OrVariableIndex', description: 'Multiply the current value by an operand.' },
] as const;
