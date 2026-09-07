import { describe, expect, it } from 'vitest';
import { Opcode } from './opcode';
import { OPCODES } from './schema/opcodes.schema';

describe('Opcode', () => {
    it('emits mnemonics that match the schema table', () => {
        const opcodeByConstant = new Map(OPCODES.map(o => [o.constantName, o.mnemonic]));

        expect(Opcode.exit()).toBe(`${opcodeByConstant.get('OPCODE_EXIT')}`);
        expect(Opcode.use(5)).toBe(`${opcodeByConstant.get('OPCODE_USE')} 5`);
        expect(Opcode.stor(2)).toBe(`${opcodeByConstant.get('OPCODE_STOR')} 2`);
        expect(Opcode.load(3)).toBe(`${opcodeByConstant.get('OPCODE_LOAD')} 3`);
        expect(Opcode.jmp_direct(7)).toBe(`${opcodeByConstant.get('OPCODE_JMP')} 7`);
        expect(Opcode.jmp(-3)).toBe(`${opcodeByConstant.get('OPCODE_JMP')} @-3`);
        expect(Opcode.jmpe_direct(7)).toBe(`${opcodeByConstant.get('OPCODE_JMPE')} 7`);
        expect(Opcode.jmpe(2)).toBe(`${opcodeByConstant.get('OPCODE_JMPE')} @2`);
        expect(Opcode.jmpn_direct(7)).toBe(`${opcodeByConstant.get('OPCODE_JMPN')} 7`);
        expect(Opcode.jmpn(2)).toBe(`${opcodeByConstant.get('OPCODE_JMPN')} @2`);
        expect(Opcode.jmpp_direct(7)).toBe(`${opcodeByConstant.get('OPCODE_JMPP')} 7`);
        expect(Opcode.jmpp(2)).toBe(`${opcodeByConstant.get('OPCODE_JMPP')} @2`);
        expect(Opcode.add(1)).toBe(`${opcodeByConstant.get('OPCODE_ADD')} 1`);
        expect(Opcode.add_variable(1)).toBe(`${opcodeByConstant.get('OPCODE_ADD')} #1`);
        expect(Opcode.sub(1)).toBe(`${opcodeByConstant.get('OPCODE_SUB')} 1`);
        expect(Opcode.sub_variable(1)).toBe(`${opcodeByConstant.get('OPCODE_SUB')} #1`);
        expect(Opcode.div(1)).toBe(`${opcodeByConstant.get('OPCODE_DIV')} 1`);
        expect(Opcode.div_variable(1)).toBe(`${opcodeByConstant.get('OPCODE_DIV')} #1`);
        expect(Opcode.mul(1)).toBe(`${opcodeByConstant.get('OPCODE_MUL')} 1`);
        expect(Opcode.mul_variable(1)).toBe(`${opcodeByConstant.get('OPCODE_MUL')} #1`);
    });

    it('has no duplicate mnemonics in the schema', () => {
        const mnemonics = OPCODES.map(o => o.mnemonic);
        expect(new Set(mnemonics).size).toBe(mnemonics.length);
    });
});
