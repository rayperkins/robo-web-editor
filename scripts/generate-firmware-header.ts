/**
 * Generates the C++ protocol header consumed by firmware from this repo's
 * TypeScript schema (src/app/editor/generator/schema/*.ts).
 *
 * Usage:
 *   npm run generate:firmware-header          # (re)write generated/robot-protocol.h
 *   npm run generate:firmware-header:check    # fail if the committed header is stale
 *
 * The generated file is committed to this repo (see generated/robot-protocol.h)
 * and is copied manually into the firmware repo when the protocol changes —
 * there is no build-time coupling between the two repos.
 */
import * as fs from 'fs';
import * as path from 'path';
import {
    PROTOCOL_VERSION,
    INSTRUCTION_SIZE,
    INSTRUCTION_LIST_SIZE,
    VARIABLE_LIST_SIZE,
} from '../src/app/editor/generator/schema/protocol.schema';
import { OPCODES } from '../src/app/editor/generator/schema/opcodes.schema';
import { MOTION_COMMANDS } from '../src/app/editor/generator/schema/motion.schema';
import { STATE_FIELDS, STATE_FLAG_BITS, STATE_BYTE_LENGTH } from '../src/app/editor/generator/schema/state.schema';

const OUTPUT_PATH = path.resolve(__dirname, '..', 'generated', 'robot-protocol.h');

function validateSchema(): void {
    const seenConstantNames = new Set<string>();
    const seenMnemonics = new Set<string>();
    for (const opcode of OPCODES) {
        if (seenConstantNames.has(opcode.constantName)) {
            throw new Error(`Duplicate opcode constant name: ${opcode.constantName}`);
        }
        seenConstantNames.add(opcode.constantName);

        if (seenMnemonics.has(opcode.mnemonic)) {
            throw new Error(`Duplicate opcode mnemonic: ${opcode.mnemonic}`);
        }
        seenMnemonics.add(opcode.mnemonic);
    }

    const motionMnemonics = new Set<string>();
    for (const command of MOTION_COMMANDS) {
        if (motionMnemonics.has(command.mnemonic)) {
            throw new Error(`Duplicate motion command mnemonic: ${command.mnemonic}`);
        }
        if (seenMnemonics.has(command.mnemonic)) {
            throw new Error(`Motion command mnemonic collides with an opcode mnemonic: ${command.mnemonic}`);
        }
        motionMnemonics.add(command.mnemonic);
    }

    const fieldTypeSize: Record<string, number> = { u8: 1, i8: 1, u16le: 2 };
    let maxEnd = 0;
    for (const field of STATE_FIELDS) {
        const end = field.offset + fieldTypeSize[field.type];
        maxEnd = Math.max(maxEnd, end);
    }
    if (maxEnd !== STATE_BYTE_LENGTH) {
        throw new Error(
            `STATE_BYTE_LENGTH (${STATE_BYTE_LENGTH}) does not match the highest field extent (${maxEnd}) in state.schema.ts`
        );
    }
}

function cppFieldType(type: 'u8' | 'i8' | 'u16le'): string {
    switch (type) {
        case 'u8': return 'std::uint8_t';
        case 'i8': return 'std::int8_t';
        case 'u16le': return 'std::uint16_t';
    }
}

function generateHeader(): string {
    const lines: string[] = [];
    lines.push('// GENERATED FILE — do not edit by hand.');
    lines.push('// Source: robo-web-editor/src/app/editor/generator/schema/*.ts');
    lines.push('// Regenerate with: npm run generate:firmware-header');
    lines.push('#pragma once');
    lines.push('');
    lines.push('#include <cstdint>');
    lines.push('');
    lines.push('namespace robot::protocol {');
    lines.push('');
    lines.push(`constexpr int PROTOCOL_VERSION = ${PROTOCOL_VERSION};`);
    lines.push('');
    lines.push(`constexpr std::size_t INSTRUCTION_SIZE = ${INSTRUCTION_SIZE};`);
    lines.push(`constexpr std::size_t INSTRUCTION_LIST_SIZE = ${INSTRUCTION_LIST_SIZE};`);
    lines.push(`constexpr std::size_t VARIABLE_LIST_SIZE = ${VARIABLE_LIST_SIZE};`);
    lines.push('');
    lines.push('// Program instruction opcodes.');
    for (const opcode of OPCODES) {
        lines.push(`constexpr const char* ${opcode.constantName} = "${opcode.mnemonic}";`);
    }
    lines.push('');
    lines.push('// Otto motion commands (handled outside CodeInterpreter::step()).');
    for (const command of MOTION_COMMANDS) {
        const constantName = `MOTION_${command.mnemonic.toUpperCase()}`;
        lines.push(`constexpr const char* ${constantName} = "${command.mnemonic}";`);
    }
    lines.push('');
    lines.push('// BLE state characteristic payload (read back from the robot).');
    lines.push(`constexpr std::size_t STATE_BYTE_LENGTH = ${STATE_BYTE_LENGTH};`);
    lines.push('');
    lines.push('#pragma pack(push, 1)');
    lines.push('struct State {');
    // Emit raw bytes in declared field order with explicit padding so the
    // struct layout matches STATE_FIELDS offsets exactly.
    let cursor = 0;
    const sortedFields = [...STATE_FIELDS].sort((a, b) => a.offset - b.offset);
    for (const field of sortedFields) {
        if (field.offset > cursor) {
            lines.push(`    std::uint8_t _reserved_${cursor}[${field.offset - cursor}];`);
        }
        lines.push(`    ${cppFieldType(field.type)} ${field.name};`);
        const size = field.type === 'u16le' ? 2 : 1;
        cursor = field.offset + size;
    }
    if (cursor < STATE_BYTE_LENGTH) {
        lines.push(`    std::uint8_t _reserved_${cursor}[${STATE_BYTE_LENGTH - cursor}];`);
    }
    lines.push('};');
    lines.push('#pragma pack(pop)');
    lines.push(`static_assert(sizeof(State) == STATE_BYTE_LENGTH, "State struct size must match STATE_BYTE_LENGTH");`);
    lines.push('');
    lines.push('// Bits within State::flags.');
    for (const flag of STATE_FLAG_BITS) {
        const constantName = `STATE_FLAG_${flag.name.toUpperCase()}_BIT`;
        lines.push(`constexpr std::uint8_t ${constantName} = ${flag.bit};`);
    }
    lines.push('');
    lines.push('}  // namespace robot::protocol');
    lines.push('');

    return lines.join('\n');
}

function main(): void {
    validateSchema();
    const header = generateHeader();
    const checkOnly = process.argv.includes('--check');

    if (checkOnly) {
        const existing = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf8') : null;
        if (existing !== header) {
            console.error(`generated/robot-protocol.h is out of date. Run 'npm run generate:firmware-header' and commit the result.`);
            process.exit(1);
        }
        console.log('generated/robot-protocol.h is up to date.');
        return;
    }

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, header, 'utf8');
    console.log(`Wrote ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}

main();
