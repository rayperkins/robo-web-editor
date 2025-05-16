export class Opcode {
    static exit() : string {
        return `exit`;
    }

    static use(arg: number) : string {
        return `use ${arg}`;
    }

    static stor(arg: number) : string {
        return `stor ${arg}`;
    }

    static load(index: number) : string {
        return `load ${index}`;
    }

    static jmp_direct(index: number) : string {
        return `jmp ${index}`;
    }

    static jmp(delta: number) : string {
        return `jmp @${delta}`;
    }

    static jmpe_direct(index: number) : string {
        return `jmpe ${index}`;
    }

    static jmpe(delta: number) : string {
        return `jmpe @${delta}`;
    }

    static jmpn_direct(index: number) : string {
        return `jmpn ${index}`;
    }

    static jmpn(delta: number) : string {
        return `jmpn @${delta}`;
    }

    static jmpp_direct(index: number) : string {
        return `jmpp ${index}`;
    }

    static jmpp(delta: number) : string {
        return `jmpp @${delta}`;
    }

    static add(arg: number) : string {
        return `add ${arg}`;
    }

    static sub(arg: number) : string {
        return `sub ${arg}`;
    }

    static div(arg: number) : string {
        return `div ${arg}`;
    }

    static mul(arg: number) : string {
        return `mul ${arg}`;
    }
}