import * as Blockly from 'blockly';
import { Names, Variables, } from 'blockly';
import { Opcode } from './opcode';

enum Order {
  ATOMIC = 0, 
}

export class CodeGenerator extends Blockly.Generator {
    variableCount: number = 0;
    variables: Blockly.VariableModel[];

    constructor() {
        super('Editor');

        this.setupBlockGenerators();
        // list of reserved sensor names
        this.addReservedWords('distance');
    }

    setWorkspaceDefaults(workspace: Blockly.Workspace) {
        workspace.createVariable("distance", "init", "reserved_distance");
    }

    init(workspace: Blockly.Workspace): void {
        super.init(workspace);

        if (!this.nameDB_) {
            this.nameDB_ = new Names(this.RESERVED_WORDS_);
        } 
        else {
            this.nameDB_.reset();
        }

        const varList: Blockly.VariableModel[] = [];
        workspace.getAllVariables().forEach(variable => {
            if(variable.getId().startsWith("reserved_")) {
                varList.push(variable);
            }
        });

        Variables.allUsedVarModels(workspace).forEach(variable => {
            if(!variable.getId().startsWith("reserved_")) {
                varList.push(variable);
            }
        });

        this.variables = varList;
    }

    // blockToCode(block: Block | null, opt_thisOnly?: boolean): string | [string, number];
    blockToCode(block: Blockly.Block | null, thisOnly?: boolean): string | [string, number] {
        var result = super.blockToCode(block, thisOnly);
        return result;
    }

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
        this.forBlock['action_turnleft'] = this.forBlock_action_turnleft;
        this.forBlock['action_turnright'] = this.forBlock_action_turnright;
        this.forBlock['action_victory'] = this.forBlock_action_victory;
        // Logic 
        this.forBlock['controls_restart'] = this.forBlock_logic_controls_restart; // TODO
        this.forBlock['controls_if_basic'] = this.forBlock_logic_controls_if_basic; // TODO
        this.forBlock['controls_repeat_ext'] = this.forBlock_logic_controls_repeat_ext;
        this.forBlock['variables_get'] = this.forBlock_variables_get;
        this.forBlock['variables_set'] = this.forBlock_variables_set;

    }

    // Operations
    forBlock_action_wait(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        const seconds = block.getFieldValue('SECONDS');
        return generator.formatInstruction(`wait ${seconds * 1000}`);
    }

    // Math
    forBlock_math_number(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        const number = Number(block.getFieldValue('NUM'));
        const codeLines = [];
        codeLines.push(Opcode.use(number));

        return [generator.formatInstructions(codeLines), Order.ATOMIC];
    }

    // Motion
    forBlock_action_stop(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        const codeLines = [];
        codeLines.push(Opcode.exit());

        return generator.formatInstructions(codeLines);
    }

    forBlock_action_backward(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        const steps = block.getFieldValue('STEPS');
        return generator.formatInstruction(`backward ${steps}`);
    }
    
    forBlock_action_forward(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        const steps = block.getFieldValue('STEPS');
        return generator.formatInstruction(`forward ${steps}`);
    }

    forBlock_action_turnleft(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        const steps = block.getFieldValue('STEPS');
        return generator.formatInstruction(`turnleft ${steps}`);
    }

    forBlock_action_turnright(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        const steps = block.getFieldValue('STEPS');
        return generator.formatInstruction(`turnright ${steps}`);
    }

    forBlock_action_victory(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        return generator.formatInstruction(`victory`);
    }

    forBlock_logic_controls_restart(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        const codeLines = [];
        codeLines.push(Opcode.jmp_direct(0));

        return generator.formatInstructions(codeLines);
    }

    // Logic

    forBlock_logic_controls_if_basic(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        const operator = block.getFieldValue('OP');
        const argument0 = generator.valueToCode(block, 'A', Order.ATOMIC) || '0';
        const argument0Lines = generator.removeEmpty(argument0.split("\n"));
        const argument1 = generator.valueToCode(block, 'B', Order.ATOMIC) || '0';
        const argument1Lines = generator.removeEmpty(argument1.split("\n"));

        const varIndex = generator.variables.length;
        const varId = `${block.id}_compare`;
        const varModel = new Blockly.VariableModel(null, 'compare', 'int', varId);
        generator.variables.push(varModel);

        const codeLines = [];
        // load/use first arg and store it
        codeLines.push(...argument0Lines);
        codeLines.push(Opcode.stor(varIndex)); // store 0 to loop var
        // load/use second arg
        codeLines.push(...argument1Lines);
        // perform operation
        const branch = generator.statementToCode(block, 'DO0');
        const innerBlockLines = generator.removeEmpty(branch.split("\n"));

        switch(operator) {
            case 'EQ':
                codeLines.push(Opcode.sub_variable(varIndex)); // result will be 0 if equal
                codeLines.push(Opcode.jmpe(2)); // if zero then jump to start of inner block
                codeLines.push(Opcode.jmp(innerBlockLines.length + 1));
                break;
            case 'NEQ':
                codeLines.push(Opcode.sub_variable(varIndex)); // result will be 0 if equal
                codeLines.push(Opcode.jmpe(innerBlockLines.length + 1));  // if zero then jump over the inner block
                 break;
            case 'LT':
                codeLines.push(Opcode.sub_variable(varIndex)); // result will be positive if right hand if larger
                codeLines.push(Opcode.jmpp(2)); // if zero then jump to start of inner block
                codeLines.push(Opcode.jmp(innerBlockLines.length + 1));
                break;
            case 'LTE': break;
            case 'GT':
                codeLines.push(Opcode.sub_variable(varIndex)); // result will be negative if right hand if smaller
                codeLines.push(Opcode.jmpn(2)); // if zero then jump to start of inner block
                codeLines.push(Opcode.jmp(innerBlockLines.length + 1));
                break;
            case 'GTE': break;
        }

        codeLines.push(...innerBlockLines);

        return generator.formatInstructions(codeLines);
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

    forBlock_variables_get(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        const varIndex = generator.getVariableIndex(block.getFieldValue('VAR'));
        const codeLines = [];

        if(varIndex >= 0) {
            codeLines.push(Opcode.load(varIndex)); 
        }

        return [generator.formatInstructions(codeLines), Order.ATOMIC];
    }

    forBlock_variables_set(block: Blockly.Block, generator: CodeGenerator): [string, number] | string | null {
        
        const varIndex = generator.getVariableIndex(block.getFieldValue('VAR'));
        const codeLines = [];

        if(varIndex >= 0) {
            const argument0 = generator.valueToCode(block, 'VALUE', Order.ATOMIC);
            //codeLines.push(Opcode.use(argument0)); 
            const innerBlockLines = generator.removeEmpty(argument0.split("\n"));
            codeLines.push(...innerBlockLines);
            codeLines.push(Opcode.stor(varIndex)); 
        }

        return generator.formatInstructions(codeLines);
    }

    private getVariableIndex(nameOrId: string): number {
        for(let i = 0; i < this.variables.length; i ++) {
            const variable = this.variables[i];
            const id = variable.getId();
            if(nameOrId == id || nameOrId == variable.name) {
                return i;
            }
        }

        return -1;
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