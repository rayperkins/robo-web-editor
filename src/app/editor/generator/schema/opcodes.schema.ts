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
}

export const OPCODES: readonly OpcodeDefinition[] = [
    { constantName: 'OPCODE_EXIT', mnemonic: 'exit', argKind: 'none' },
    { constantName: 'OPCODE_USE', mnemonic: 'use', argKind: 'int16' },
    { constantName: 'OPCODE_STOR', mnemonic: 'stor', argKind: 'variableIndex' },
    { constantName: 'OPCODE_LOAD', mnemonic: 'load', argKind: 'variableIndex' },
    { constantName: 'OPCODE_JMP', mnemonic: 'jmp', argKind: 'jumpTarget' },
    { constantName: 'OPCODE_JMPE', mnemonic: 'jmpe', argKind: 'jumpTarget' },
    { constantName: 'OPCODE_JMPN', mnemonic: 'jmpn', argKind: 'jumpTarget' },
    { constantName: 'OPCODE_JMPP', mnemonic: 'jmpp', argKind: 'jumpTarget' },
    { constantName: 'OPCODE_ADD', mnemonic: 'add', argKind: 'int16OrVariableIndex' },
    { constantName: 'OPCODE_SUB', mnemonic: 'sub', argKind: 'int16OrVariableIndex' },
    { constantName: 'OPCODE_DIV', mnemonic: 'div', argKind: 'int16OrVariableIndex' },
    { constantName: 'OPCODE_MUL', mnemonic: 'mul', argKind: 'int16OrVariableIndex' },
] as const;
