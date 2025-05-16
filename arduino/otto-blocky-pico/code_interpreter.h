#ifndef CODE_INTERPRETER_H
#define CODE_INTERPRETER_H
#include <string.h>

#define VARIABLE_LIST_SIZE 64
#define INSTRUCTION_SIZE 20
#define INSTRUCTION_LIST_ITEM_SIZE (INSTRUCTION_SIZE + 1)
#define INSTRUCTION_LIST_SIZE (512)
#define INSTRUCTION_LIST_MAX (512)

#define SETINSTRUCTION(interpreter, index, instruction) interpreter.setInstruction(index, instruction, sizeof(instruction))
#define INSTRUCTION_ISOPCODE(interpreter, opcode, instruction, length) (interpreter.isOpcode(opcode, sizeof(opcode), instruction, length) == true)
#define INSTRUCTION_HASARG(interpreter, opcode, instruction, length) (interpreter.hasArg(opcode, sizeof(opcode), instruction, length) == true)
#define INSTRUCTION_GETARG(interpreter, opcode, instruction, length) (interpreter.getArg(opcode, sizeof(opcode), instruction, length))

#define ISOPCODE(opcode, instruction, length) (isOpcode(opcode, sizeof(opcode), instruction, length) == true)
#define HASARG(opcode, instruction, length) (hasArg(opcode, sizeof(opcode), instruction, length) == true)
#define GETARG(opcode, instruction, length) (getArg(opcode, sizeof(opcode), instruction, length))

#define OPCODE_exit "exit"
#define OPCODE_use "use"
#define OPCODE_stor "stor"
#define OPCODE_load "load"
#define OPCODE_jmp "jmp"
#define OPCODE_jmpe "jmpe"
#define OPCODE_jmpn "jmpn"
#define OPCODE_jmpp "jmpp"
#define OPCODE_add "add"
#define OPCODE_sub "sub"
#define OPCODE_div "div"
#define OPCODE_mul "mul"

class CodeInterpreter
{
public:  
  int _instructionIndex = 0;
  int _instructionCount = 0;
  int _current = 0;
  int _variableCount = 0;
  int16_t _variables[VARIABLE_LIST_SIZE];
  char _instructions[INSTRUCTION_LIST_SIZE][INSTRUCTION_LIST_ITEM_SIZE];

  CodeInterpreter() {
    _current = 0;
    _instructionIndex = 0;
    _instructionCount = 0;
    _variableCount = 0;

    memset(_variables, 0, sizeof(_variables));
  }

  virtual bool handle_instruction(const char* instruction, char length) { return false; }

  int getInstructionCount() {
    return _instructionCount;
  }

  void reset() {
    _instructionIndex = 0;
  }

  void clearInstructions() {
    _instructionIndex = 0;
    _instructionCount = 0;
    
    for(int i = 0; i < INSTRUCTION_LIST_SIZE; i++) {
      memset(_instructions[i], 0, INSTRUCTION_LIST_ITEM_SIZE);
    }
  }

  int16_t getVariable(int index) {
    return _variables[index];
  }

  void setVariable(int index, int16_t value) {
    _variables[index] = value;
  }

  int currentInstruction() {
    return _instructionIndex;
  }

  bool completed() {
    return _instructionIndex < _instructionCount ? false : true;
  }

  void setInstruction(int index, const char * instruction, char length) {
    // copy instruction to list if space
    // and if successful, null terminate and update index
    if(index < INSTRUCTION_LIST_SIZE && length <= INSTRUCTION_SIZE) {
      memcpy(_instructions[index], instruction, length);
      _instructions[index][INSTRUCTION_SIZE] = length; // convention to store length at end

      if(_instructionCount < (index + 1)) {
        _instructionCount = index + 1;
      }
    }
  }

  bool isOpcode(const char* opcode, int opcodeLength, const char* instruction, int instructionLength) {
    if(instructionLength < opcodeLength) {
      return false;
    }

    // ignore checking null termination
    if(opcodeLength > 0 && opcode[opcodeLength - 1] == '\0') {
      opcodeLength -= 1;
    }

    if(instructionLength > 0 && instruction[instructionLength - 1] == '\0') {
      instructionLength -= 1;
    }

    // opcode in form of 'jmp' and instruction 'jmp 1234' 
    // loop and check opcode is in instruction
    const char * opcodeEnd = opcode + opcodeLength;
    const char * instructionEnd = instruction + instructionLength;

    while(opcode < opcodeEnd) {
      if(*opcode != *instruction) {
        return false;
      }

      opcode++;
      instruction++;
    }

    // instruction starts with opcode, but instruction may have additional chars
    // confirm that the next is whitespace
    if(instruction < instructionEnd 
      && isalnum(*instruction)) {
        return false;
    }

    return true;
  }

  bool hasArg(const char* opcode, int opcodeLength, const char* instruction, int instructionLength) {
    return (instructionLength > opcodeLength);
  }

  int getArg(const char* opcode, int opcodeLength, const char* instruction, int instructionLength, bool useVariableLookup = false) {
    const char * start = instruction + opcodeLength;
    const char * end = instruction + instructionLength;
    bool isVariableIndex = false;
    char sign = 1;
    char places = 0;
    int value = 0;
    
    while (start < end)
    {
      // assume value in form of 12345 or -12345
      if(*start == '-' && places == 0) {
        sign = -1;
        start ++;
      }
      else if(*start == '#' && places == 0) {
        isVariableIndex = true;
        start ++;
      }
      
      if(isdigit(*start )) {
        places ++;
        value *= 10;
        value += (*start - 0x30);
      }

      start ++;
    }

    // TODO: out of range check for variable index? and int16_t size?

    return isVariableIndex ? _variables[value] : value * sign;
  }

  void step() {
    if(_instructionIndex < _instructionCount)
    {
      char * instruction = _instructions[_instructionIndex];
      char length = instruction[INSTRUCTION_SIZE]; // convention to store length at end

      if(length == 0) {
        // do nothing this step
      }
      else if (ISOPCODE(OPCODE_exit, instruction, length)) {
        _instructionIndex = _instructionCount;
      }
      else if (ISOPCODE(OPCODE_use, instruction, length)) {
        if(HASARG(OPCODE_use, instruction, length)) {
          _current = GETARG(OPCODE_use, instruction, length);
        }
      }
      else if (ISOPCODE(OPCODE_stor, instruction, length)) {
        if(HASARG(OPCODE_stor, instruction, length)) {
          int arg = GETARG(OPCODE_stor, instruction, length);
          _variables[arg] = _current;
        }
      }
      else if (ISOPCODE(OPCODE_load, instruction, length)) {
        if(HASARG(OPCODE_load, instruction, length)) {
          int arg = GETARG(OPCODE_load, instruction, length);
          _current = _variables[arg];
        }
      }
      else if (ISOPCODE(OPCODE_jmp, instruction, length)) {
        if(HASARG(OPCODE_jmp, instruction, length)) {
          int arg = GETARG(OPCODE_jmp, instruction, length);
          _instructionIndex = arg < 0 ? INSTRUCTION_LIST_MAX : (arg - 1);
        }
      }
      else if (ISOPCODE(OPCODE_jmpe, instruction, length)) {
        // jump if current is 0 (ie, the result of comparing)
        if(_current == 0) {
          if(HASARG(OPCODE_jmpe, instruction, length)) {
            int arg = GETARG(OPCODE_jmpe, instruction, length);
            _instructionIndex = arg < 0 ? INSTRUCTION_LIST_MAX : (arg - 1);
          }
        }
      }
      else if (ISOPCODE(OPCODE_jmpn, instruction, length)) {
        // jump if current is negative (ie, the result of comparing)
        if(_current < 0) {
          if(HASARG(OPCODE_jmpn, instruction, length)) {
            int arg = GETARG(OPCODE_jmpn, instruction, length);
            _instructionIndex = arg < 0 ? INSTRUCTION_LIST_MAX : (arg - 1);
          }
        }
      }
      else if (ISOPCODE(OPCODE_jmpp, instruction, length)) {
        // jump if current is positive (ie, the result of comparing)
        if(_current > 0) {
          if(HASARG(OPCODE_jmpp, instruction, length)) {
            int arg = GETARG(OPCODE_jmpp, instruction, length);
            _instructionIndex = arg < 0 ? INSTRUCTION_LIST_MAX : (arg - 1);
          }
        }
      }
      else if (ISOPCODE(OPCODE_add, instruction, length)) {
        if(HASARG(OPCODE_add, instruction, length)) {
          int arg = GETARG(OPCODE_add, instruction, length);
          _current += arg;
        }
      }
      else if (ISOPCODE(OPCODE_sub, instruction, length)) {
        if(HASARG(OPCODE_sub, instruction, length)) {
          int arg = GETARG(OPCODE_sub, instruction, length);
          _current -= arg;
        }
      }
      else if (ISOPCODE(OPCODE_div, instruction, length)) {
        if(HASARG(OPCODE_div, instruction, length)) {
          int arg = GETARG(OPCODE_div, instruction, length);
          _current /= arg;
        }
      }
      else if (ISOPCODE(OPCODE_mul, instruction, length)) {
        if(HASARG(OPCODE_mul, instruction, length)) {
          int arg = GETARG(OPCODE_mul, instruction, length);
          _current *= arg;
        }
      }
      else if(handle_instruction(instruction, length)) {
        
      }
      // else if (INSTRUCTION_ISOPCODE(this, OPCODE_speed, instruction, length)) {
      //   // set speed
      //   if(INSTRUCTION_HASARG(this, OPCODE_speed, instruction, length)) {
      //     //_ottoSpeed = INSTRUCTION_GETARG(OPCODE_speed, instruction, length);
      //   }
      // }
      // else if (INSTRUCTION_ISOPCODE(this, OPCODE_forward, instruction, length)) {
      //   // walk forward
      // }
      // else if (INSTRUCTION_ISOPCODE(this, OPCODE_backward, instruction, length)) {
      //   // walk backwards
      // }

      // increment steps, but check a clear hasn't been done in the mean time.
      if(_instructionCount > 0) {
        _instructionIndex++;
      }
    }
  }

private:

};

#endif //CODE_INTERPRETER_H