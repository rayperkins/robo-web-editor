import * as Blockly from 'blockly';
import { Names, Variables, } from 'blockly';
import { Opcode } from './Opcode';

enum Order {
  ATOMIC = 0, 
}

export class CodeGenerator extends Blockly.Generator {

    
    variableCount: number = 0;
    variables: Blockly.VariableModel[];

    constructor() {
        super('Editor');

        this.setupBlockGenerators();
    }

    init(workspace: Blockly.Workspace): void {
        super.init(workspace);

        if (!this.nameDB_) {
            this.nameDB_ = new Names(this.RESERVED_WORDS_);
        } 
        else {
            this.nameDB_.reset();
        }

        this.variables = Variables.allUsedVarModels(workspace);

        // this.nameDB_.setVariableMap(workspace.getVariableMap());
        // const variables = Variables.allUsedVarModels(workspace);
        // for (let i = 0; i < variables.length; i++) {
        //     this.nameDB_.getName(variables[i].getId(), NameType.VARIABLE);
        //     this.nameDB_.
        // }
        
        // this.nameDB_.populateVariables(workspace);

        // this.variableCount = 0;
    }

    // blockToCode(block: Block | null, opt_thisOnly?: boolean): string | [string, number];
    blockToCode(block: Blockly.Block | null, thisOnly?: boolean): string | [string, number] {
        var result = super.blockToCode(block, thisOnly);
        return result;
    }

    // workspaceToCode(workspace?: Blockly.Workspace): string {
    //     const result = super.workspaceToCode(workspace);
    //     let lines = result.split("\n");
    //     let output = '';
    //     let count = 0;

    //     for(let i = 0; i < lines.length; i++) {
    //         const line = lines[i];
    //         if(line.length > 0) {
    //             // adjust index?
    //             output += `set${count} ${line}\n`
    //             count ++;
    //         }
    //     }

    //     return output;
    // }

    workspaceToSetCommands(workspace?: Blockly.Workspace): string[] {
        const result = super.workspaceToCode(workspace);
        let lines = result.split("\n");
        let outputLines = [];

        for(let i = 0; i < lines.length; i++) {
            let line = lines[i];

            if(line.length > 0) {
                // adjust index?
                const lineParts = line.split('@');
                if(lineParts.length > 1) {
                    const delta = Number(lineParts[1]);
                    outputLines.push(`set${outputLines.length} ${lineParts[0]}${outputLines.length + delta}`);
                } else {
                    outputLines.push(`set${outputLines.length} ${lineParts[0]}`);
                }
            }
        }

        return outputLines;
    }

    scrub_(block: Blockly.Block, code: string, thisOnly?: boolean): string {
        const nextBlock = block.nextConnection && block.nextConnection.targetBlock();

        if (nextBlock && !thisOnly) {
            return code + this.blockToCode(nextBlock);
        }

        return code;
    }

    prefixLines(text: string, prefix: string): string {
        return text;
    }

    setupBlockGenerators() {
        // Operations
        this.forBlock['action_wait'] = this.forBlock_action_wait
        // Math
        this.forBlock['math_number'] = this.forBlock_math_number
        // Actions
        this.forBlock['action_stop'] = this.forBlock_action_stop
        this.forBlock['action_backward'] = this.forBlock_action_backward;
        this.forBlock['action_forward'] = this.forBlock_action_forward;
        // Logic 
        this.forBlock['controls_repeat_ext'] = this.forBlock_logic_controls_repeat_ext
    }

    // Operations
    forBlock_action_wait(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        const seconds = block.getFieldValue('SECONDS');
        return generator.formatInstruction(`wait ${seconds * 1000}`);
    }

    // Math
    forBlock_math_number(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        const number = Number(block.getFieldValue('NUM'));
        return [String(number), Order.ATOMIC];
    }

    // Motion
    forBlock_action_stop(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        return generator.formatInstruction(`stop`);
    }

    forBlock_action_backward(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        const steps = block.getFieldValue('STEPS');
        return generator.formatInstruction(`backward ${steps}`);
    }
    
    forBlock_action_forward(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        const steps = block.getFieldValue('STEPS');
        return generator.formatInstruction(`forward ${steps}`);
    }

    forBlock_logic_controls_repeat_ext(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        let repeats;
        if (block.getField('TIMES')) {
            // Internal number.
            repeats = String(Number(block.getFieldValue('TIMES')));
        } else {
            // External number.
            repeats = generator.valueToCode(block, 'TIMES', 0) || '0';
        }

        const loopVarIndex = generator.variables.length;
        const loopVarId = `${block.id}_loop_var`;
        const loopVar = new Blockly.VariableModel(null, 'loop_var', 'int', loopVarId);
        generator.variables.push(loopVar)

        let steps = 0;

        if(block.getField('TIMES')) { // Internal number.
            steps = Number(block.getFieldValue('STEPS'));
        }
        else { // external number.
            steps = Number(generator.valueToCode(block, 'TIMES', Order.ATOMIC) || '0')
        }

        const branch = generator.statementToCode(block, 'DO');
        const innerBlockLines = generator.removeEmpty(branch.split("\n"));
        const codeLines = [];
        // start of loop
        codeLines.push(Opcode.use(0)); 
        codeLines.push(Opcode.stor(loopVarIndex)); // store 0 to loop var
        codeLines.push(Opcode.sub(steps)); // subtract step count
        codeLines.push(Opcode.jmpe(innerBlockLines.length + 4)); // if 0 loop, then jump to end
        // inner block
        codeLines.push(...innerBlockLines);
        // end inner block
        codeLines.push(Opcode.load(loopVarIndex)); // load loop var and increment
        codeLines.push(Opcode.add(1));
        codeLines.push(Opcode.jmp(-(innerBlockLines.length + 5))); // jump back to stor loopOpcode.

        return generator.formatInstructions(codeLines);
    }

    private formatInstructions(instructions: string[]) : string {
        return `${instructions.join('\n')}\n`;
    }

    private formatInstruction(instruction: string) : string {
        return `${instruction}\n`;
    }

    private removeEmpty(instructions: string[]) : string[] {
        let cleanedInstructions = []
        for(let i = 0; i < instructions.length; i++) {
            var instruction = instructions[i].trim();

            if(instruction.length > 0) {
                cleanedInstructions.push(instruction);
            }
        }
        return cleanedInstructions;
    }
}