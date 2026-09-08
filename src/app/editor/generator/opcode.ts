import { OPCODES } from './schema/opcodes.schema';
import { INT16_MAX, INT16_MIN } from './schema/protocol.schema';
import { ROBOT_MOTION_COMMANDS } from './schema/motion.schema';

function mnemonic(constantName: string): string {
    const opcode = OPCODES.find(o => o.constantName === constantName);
    if (!opcode) {
        throw new Error(`Unknown opcode constant '${constantName}' — check src/app/editor/generator/schema/opcodes.schema.ts`);
    }

    return opcode.mnemonic;
}

function int16(value: number, name: string): number {
    if (!Number.isInteger(value) || value < INT16_MIN || value > INT16_MAX) {
        throw new RangeError(`${name} must be a signed 16-bit integer`);
    }
    return value;
}

function variableIndex(index: number): number {
    return int16(index, 'Variable index');
}

function ranged(value: number, min: number, max: number, name: string): number {
    const checked = int16(value, name);
    if (checked < min || checked > max) {
        throw new RangeError(`${name} must be between ${min} and ${max}`);
    }
    return checked;
}

export class Opcode {
    static exit() : string {
        return `${mnemonic('OPCODE_EXIT')}`;
    }

    static use(arg: number) : string {
        return `${mnemonic('OPCODE_USE')} ${int16(arg, 'Operand')}`;
    }

    static stor(arg: number) : string {
        return `${mnemonic('OPCODE_STOR')} #${variableIndex(arg)}`;
    }

    static load(index: number) : string {
        return `${mnemonic('OPCODE_LOAD')} #${variableIndex(index)}`;
    }

    static jmp_direct(index: number) : string {
        return `${mnemonic('OPCODE_JMP')} ${index}`;
    }

    static jmp(delta: number) : string {
        return `${mnemonic('OPCODE_JMP')} @${delta}`;
    }

    static jmpe_direct(index: number) : string {
        return `${mnemonic('OPCODE_JMPE')} ${index}`;
    }

    static jmpe(delta: number) : string {
        return `${mnemonic('OPCODE_JMPE')} @${delta}`;
    }

    static jmpn_direct(index: number) : string {
        return `${mnemonic('OPCODE_JMPN')} ${index}`;
    }

    static jmpn(delta: number) : string {
        return `${mnemonic('OPCODE_JMPN')} @${delta}`;
    }

    static jmpp_direct(index: number) : string {
        return `${mnemonic('OPCODE_JMPP')} ${index}`;
    }

    static jmpp(delta: number) : string {
        return `${mnemonic('OPCODE_JMPP')} @${delta}`;
    }

    static add(arg: number) : string {
        return `${mnemonic('OPCODE_ADD')} ${arg}`;
    }

    static add_variable(index: number) : string {
        return `${mnemonic('OPCODE_ADD')} #${index}`;
    }

    static sub(arg: number) : string {
        return `${mnemonic('OPCODE_SUB')} ${arg}`;
    }

    static sub_variable(index: number) : string {
        return `${mnemonic('OPCODE_SUB')} #${index}`;
    }

    static div(arg: number) : string {
        return `${mnemonic('OPCODE_DIV')} ${arg}`;
    }

    static div_variable(index: number) : string {
        return `${mnemonic('OPCODE_DIV')} #${index}`;
    }

    static mul(arg: number) : string {
        return `${mnemonic('OPCODE_MUL')} ${arg}`;
    }

    static mul_variable(index: number) : string {
        return `${mnemonic('OPCODE_MUL')} #${index}`;
    }

    static motion(command: string, arg?: number | { variableIndex: number }): string {
        const definition = ROBOT_MOTION_COMMANDS.find(item => item.mnemonic === command);
        if (!definition) {
            throw new Error(`Unknown motion command '${command}'`);
        }
        if (arg === undefined) {
            if (definition.argKind !== 'none') {
                throw new Error(`${command} requires one argument`);
            }
            return command;
        }
        if (definition.argKind === 'none') {
            throw new Error(`${command} does not accept an argument`);
        }
        if (typeof arg !== 'number') {
            if (!Number.isInteger(arg.variableIndex) || arg.variableIndex < 0 || arg.variableIndex >= 64) {
                throw new RangeError('Variable index must be between 0 and 63');
            }
            return `${command} #${variableIndex(arg.variableIndex)}`;
        }
        const ranges: Record<string, [number, number]> = {
            heading: [-360, 360],
            distance: [-32768, INT16_MAX],
            speed: [0, 100],
            move: [0, 100],
            wait: [0, INT16_MAX],
        };
        const range = ranges[command];
        const value = range ? ranged(arg, range[0], range[1], `${command} argument`) : int16(arg, 'Motion argument');
        const result = `${command} ${value}`;
        if (new TextEncoder().encode(result).byteLength > 20) {
            throw new RangeError('Instruction exceeds the 20-byte limit');
        }
        return result;
    }

    static heading(arg: number | { variableIndex: number }): string {
        return Opcode.motion('heading', arg);
    }

    static distance(arg: number | { variableIndex: number }): string {
        return Opcode.motion('distance', arg);
    }

    static speed(arg: number | { variableIndex: number }): string {
        return Opcode.motion('speed', arg);
    }

    static move(arg: number | { variableIndex: number }): string {
        return Opcode.motion('move', arg);
    }

    static stop(): string {
        return Opcode.motion('stop');
    }

    static wait(arg: number | { variableIndex: number }): string {
        return Opcode.motion('wait', arg);
    }
}
