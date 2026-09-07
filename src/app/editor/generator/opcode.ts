import { OPCODES } from './schema/opcodes.schema';

function mnemonic(constantName: string): string {
    const opcode = OPCODES.find(o => o.constantName === constantName);
    if (!opcode) {
        throw new Error(`Unknown opcode constant '${constantName}' — check src/app/editor/generator/schema/opcodes.schema.ts`);
    }
    return opcode.mnemonic;
}

export class Opcode {
    static exit() : string {
        return `${mnemonic('OPCODE_EXIT')}`;
    }

    static use(arg: number) : string {
        return `${mnemonic('OPCODE_USE')} ${arg}`;
    }

    static stor(arg: number) : string {
        return `${mnemonic('OPCODE_STOR')} ${arg}`;
    }

    static load(index: number) : string {
        return `${mnemonic('OPCODE_LOAD')} ${index}`;
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
}
