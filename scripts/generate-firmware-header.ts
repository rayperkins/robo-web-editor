/**
 * Generates the unified C++ protocol header consumed by firmware from this repo's
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
import { ROBOT_MOTION_COMMANDS } from '../src/app/editor/generator/schema/motion.schema';
import {
    CORE_STATE_HEADER_BYTE_LENGTH,
    CORE_STATE_FLAG_BITS,
    StateFieldType,
} from '../src/app/editor/generator/schema/state.schema';
import { RobotSchema } from '../src/app/editor/generator/schema/robot-types';
import { OTTO_ROBOT_SCHEMA } from '../src/app/editor/generator/schema/robots/otto.schema';
import { OLIBOT_ROBOT_SCHEMA } from '../src/app/editor/generator/schema/robots/olibot.schema';

export const ALL_ROBOT_SCHEMAS: readonly RobotSchema[] = [
    OTTO_ROBOT_SCHEMA,
    OLIBOT_ROBOT_SCHEMA,
];

const OUTPUT_PATH = path.resolve(__dirname, '..', 'generated', 'robot-protocol.h');

export function validateSchema(): void {
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
    for (const command of ROBOT_MOTION_COMMANDS) {
        if (motionMnemonics.has(command.mnemonic)) {
            throw new Error(`Duplicate shared motion command mnemonic: ${command.mnemonic}`);
        }
        if (seenMnemonics.has(command.mnemonic)) {
            throw new Error(`Shared motion command mnemonic collides with an opcode mnemonic: ${command.mnemonic}`);
        }
        motionMnemonics.add(command.mnemonic);
    }

    const fieldTypeSize: Record<StateFieldType, number> = { u8: 1, i8: 1, u16le: 2 };

    for (const robot of ALL_ROBOT_SCHEMAS) {
        let maxEnd = 0;
        for (const field of robot.stateFields) {
            const end = field.offset + fieldTypeSize[field.type];
            maxEnd = Math.max(maxEnd, end);
        }
        if (maxEnd > robot.stateByteLength) {
            throw new Error(
                `[${robot.id}] stateByteLength (${robot.stateByteLength}) is smaller than the highest field extent (${maxEnd})`
            );
        }
    }
}

function cppFieldType(type: StateFieldType): string {
    switch (type) {
        case 'u8': return 'std::uint8_t';
        case 'i8': return 'std::int8_t';
        case 'u16le': return 'std::uint16_t';
    }
}

function generateStructFields(robot: RobotSchema, lines: string[]): void {
    let cursor = 0;
    const sortedFields = [...robot.stateFields].sort((a, b) => a.offset - b.offset);
    for (const field of sortedFields) {
        if (field.offset > cursor) {
            lines.push(`    std::uint8_t _reserved_${cursor}[${field.offset - cursor}];`);
        }
        lines.push(`    ${cppFieldType(field.type)} ${field.name};`);
        const size = field.type === 'u16le' ? 2 : 1;
        cursor = field.offset + size;
    }
    if (cursor < robot.stateByteLength) {
        lines.push(`    std::uint8_t _reserved_${cursor}[${robot.stateByteLength - cursor}];`);
    }
}

export function generateSingleHeader(): string {
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
    lines.push('// Protocol buffer and list limits.');
    lines.push(`constexpr std::size_t INSTRUCTION_SIZE = ${INSTRUCTION_SIZE};`);
    lines.push(`constexpr std::size_t INSTRUCTION_LIST_SIZE = ${INSTRUCTION_LIST_SIZE};`);
    lines.push(`constexpr std::size_t VARIABLE_LIST_SIZE = ${VARIABLE_LIST_SIZE};`);
    lines.push('');
    lines.push('// Program instruction opcodes (handled by CodeInterpreter::step()).');
    for (const opcode of OPCODES) {
        lines.push(`constexpr const char* ${opcode.constantName} = "${opcode.mnemonic}";`);
    }
    lines.push('');
    lines.push('// Generic robot movement commands (ASCII, one optional signed int16 argument).');
    lines.push('// heading: relative degrees [-360, 360], default 0.');
    lines.push('// distance: millimetres [0, 32767], default 0.');
    lines.push('// speed: requested percent [0, 100], default 100.');
    lines.push('// move: submits the current heading/distance setpoints; argument is speed [0, 100].');
    lines.push('// stop: stops motion and clears pending setpoints.');
    lines.push('// wait: interpreter delay in milliseconds [0, 32767].');
    for (const command of ROBOT_MOTION_COMMANDS) {
        const constantName = `ROBOT_${command.mnemonic === 'heading' ? 'SET_HEADING' :
            command.mnemonic === 'distance' ? 'SET_DISTANCE' :
            command.mnemonic === 'speed' ? 'SET_SPEED' : command.mnemonic.toUpperCase()}`;
        lines.push(`constexpr const char* ${constantName} = "${command.mnemonic}";`);
    }
    lines.push('');
    lines.push('// Bits within State::flags / CoreState::flags.');
    for (const flag of CORE_STATE_FLAG_BITS) {
        const constantName = `STATE_FLAG_${flag.name.toUpperCase()}_BIT`;
        lines.push(`constexpr std::uint8_t ${constantName} = ${flag.bit};`);
    }
    lines.push('');
    lines.push('// Generic state characteristic header / envelope.');
    lines.push(`constexpr std::size_t CORE_STATE_HEADER_BYTE_LENGTH = ${CORE_STATE_HEADER_BYTE_LENGTH};`);
    lines.push('');
    lines.push('#pragma pack(push, 1)');
    lines.push('struct CoreState {');
    lines.push('    std::uint8_t version;');
    lines.push('    std::uint8_t flags;');
    lines.push('    std::uint8_t _reserved_2[2];');
    lines.push('};');
    lines.push('#pragma pack(pop)');
    lines.push(`static_assert(sizeof(CoreState) == CORE_STATE_HEADER_BYTE_LENGTH, "CoreState struct size must match CORE_STATE_HEADER_BYTE_LENGTH");`);
    lines.push('');
    lines.push('// ---------------------------------------------------------------------------');
    lines.push('// Robot-specific state configurations');
    lines.push('// ---------------------------------------------------------------------------');
    lines.push('');
    lines.push('// Olibot (two-wheel differential-drive robot)');
    lines.push(`constexpr std::size_t OLIBOT_STATE_BYTE_LENGTH = ${OLIBOT_ROBOT_SCHEMA.stateByteLength};`);
    lines.push('');
    lines.push('#pragma pack(push, 1)');
    lines.push('struct OlibotState {');
    generateStructFields(OLIBOT_ROBOT_SCHEMA, lines);
    lines.push('};');
    lines.push('#pragma pack(pop)');
    lines.push(`static_assert(sizeof(OlibotState) == OLIBOT_STATE_BYTE_LENGTH, "OlibotState struct size must match OLIBOT_STATE_BYTE_LENGTH");`);
    lines.push('');
    lines.push('// Otto DIY (bipedal walking robot)');
    lines.push(`constexpr std::size_t OTTO_STATE_BYTE_LENGTH = ${OTTO_ROBOT_SCHEMA.stateByteLength};`);
    lines.push('');
    lines.push('#pragma pack(push, 1)');
    lines.push('struct OttoState {');
    generateStructFields(OTTO_ROBOT_SCHEMA, lines);
    lines.push('};');
    lines.push('#pragma pack(pop)');
    lines.push(`static_assert(sizeof(OttoState) == OTTO_STATE_BYTE_LENGTH, "OttoState struct size must match OTTO_STATE_BYTE_LENGTH");`);
    lines.push('');
    lines.push('// Default State alias');
    lines.push('using State = OlibotState;');
    lines.push('constexpr std::size_t STATE_BYTE_LENGTH = OLIBOT_STATE_BYTE_LENGTH;');
    lines.push('');
    lines.push('}  // namespace robot::protocol');
    lines.push('');

    return lines.join('\n');
}

function main(): void {
    validateSchema();
    const header = generateSingleHeader();
    const checkOnly = process.argv.includes('--check');

    const relPath = path.relative(process.cwd(), OUTPUT_PATH);
    if (checkOnly) {
        const existing = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf8') : null;
        if (existing !== header) {
            console.error(`${relPath} is out of date. Run 'npm run generate:firmware-header' and commit the result.`);
            process.exit(1);
        }
        console.log(`${relPath} is up to date.`);
        return;
    }

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, header, 'utf8');
    console.log(`Wrote ${relPath}`);
}

if (require.main === module) {
    main();
}
