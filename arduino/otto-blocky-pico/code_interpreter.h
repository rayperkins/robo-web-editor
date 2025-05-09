#ifndef CODE_INTERPRETER_H
#define CODE_INTERPRETER_H
#include <string.h>

#define VARIABLE_LIST_SIZE 64
#define INSTRUCTION_SIZE 20
#define INSTRUCTION_LIST_ITEM_SIZE (INSTRUCTION_SIZE + 1)
#define INSTRUCTION_LIST_SIZE (512)

#define INSTRUCTION_ISOPCODE(interpreter, opcode, instruction, length) (interpreter.isOpcode(opcode, sizeof(opcode), instruction, length) == true)
#define INSTRUCTION_HASARG(interpreter, opcode, instruction, length) (interpreter.hasArg(opcode, sizeof(opcode), instruction, length) == true)
#define INSTRUCTION_GETARG(interpreter, opcode, instruction, length) (interpreter.getArg(opcode, sizeof(opcode), instruction, length))

#define _ISOPCODE(opcode, instruction, length) (isOpcode(opcode, sizeof(opcode), instruction, length) == true)
#define _HASARG(opcode, instruction, length) (hasArg(opcode, sizeof(opcode), instruction, length) == true)
#define _GETARG(opcode, instruction, length) (getArg(opcode, sizeof(opcode), instruction, length))

#define OPCODE_exit "exit"
#define OPCODE_use "use"
#define OPCODE_stor "stor"
#define OPCODE_load "load"
#define OPCODE_jump "jump"
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
  virtual bool handle_instruction(const char* instruction, char length) { return false; }

  int getInstructionCount() {
    return _instructionCount;
  }

  void clearInstructions() {
    _instructionCount = 0;
  }

  int16_t getVariable(int index) {
    return _variables[index];
  }

  void setVariable(int index, int16_t value) {
    _variables[index] = value;
  }

  bool hasExited() {
    return _instructionIndex < _instructionCount ? false : true;
  }

  void setInstruction(int index, const char * instruction, char length) {
    // copy instruction to list if space
    // and if successful, null terminate and update index
    if(index < INSTRUCTION_LIST_SIZE && length <= INSTRUCTION_SIZE) {
      mempcpy(_instructions[index], instruction, length);
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

    const char * end = opcode + opcodeLength;
    while(opcode < end && *opcode != '\0') {
      if(*opcode != *instruction) {
        return false;
      }

      opcode++;
      instruction++;
    }

    return true;
  }

  bool hasArg(const char* opcode, int opcodeLength, const char* instruction, int instructionLength) {
    return (instructionLength > opcodeLength);
  }

  int getArg(const char* opcode, int opcodeLength, const char* instruction, int instructionLength) {
    const char * start = instruction + opcodeLength;
    const char * end = instruction + instructionLength;
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
      
      if(isdigit(*start )) {
        places ++;
        value *= 10;
        value += (*start - 0x30);
      }

      start ++;
    }

    return value * sign;
  }

  void step() {
    if(_instructionIndex < _instructionCount)
    {
      char * instruction = _instructions[_instructionIndex];
      char length = instruction[INSTRUCTION_SIZE]; // convention to store length at end

      if(length == 0) {
        // do nothing this step
      }
      else if (_ISOPCODE(OPCODE_exit, instruction, length)) {
        _instructionIndex = _instructionCount;
      }
      else if (_ISOPCODE(OPCODE_use, instruction, length)) {
        if(_HASARG(OPCODE_use, instruction, length)) {
          _current = _GETARG(OPCODE_use, instruction, length);
        }
      }
      else if (_ISOPCODE(OPCODE_stor, instruction, length)) {
        if(_HASARG(OPCODE_stor, instruction, length)) {
          int arg = _GETARG(OPCODE_stor, instruction, length);
          _variables[arg] = _current;
        }
      }
      else if (_ISOPCODE(OPCODE_load, instruction, length)) {
        if(_HASARG(OPCODE_load, instruction, length)) {
          int arg = _GETARG(OPCODE_load, instruction, length);
          _current = _variables[arg];
        }
      }
      else if (_ISOPCODE(OPCODE_jump, instruction, length)) {
        if(_HASARG(OPCODE_jump, instruction, length)) {
          int arg = _GETARG(OPCODE_jump, instruction, length);
          _instructionIndex = arg < 0 ? 0 : (arg - 1);
        }
      }
      else if (_ISOPCODE(OPCODE_jmpe, instruction, length)) {
        // jump if current is 0 (ie, the result of comparing)
        if(_current == 0) {
          if(_HASARG(OPCODE_jmpe, instruction, length)) {
            int arg = _GETARG(OPCODE_jmpe, instruction, length);
            _instructionIndex = arg < 0 ? 0 : (arg - 1);
          }
        }
      }
      else if (_ISOPCODE(OPCODE_jmpn, instruction, length)) {
        // jump if current is negative (ie, the result of comparing)
        if(_current < 0) {
          if(_HASARG(OPCODE_jmpn, instruction, length)) {
            int arg = _GETARG(OPCODE_jmpn, instruction, length);
            _instructionIndex = arg < 0 ? 0 : (arg - 1);
          }
        }
      }
      else if (_ISOPCODE(OPCODE_jmpp, instruction, length)) {
        // jump if current is positive (ie, the result of comparing)
        if(_current > 0) {
          if(_HASARG(OPCODE_jmpp, instruction, length)) {
            int arg = _GETARG(OPCODE_jmpp, instruction, length);
            _instructionIndex = arg < 0 ? 0 : (arg - 1);
          }
        }
      }
      else if (_ISOPCODE(OPCODE_add, instruction, length)) {
        if(_HASARG(OPCODE_add, instruction, length)) {
          int arg = _GETARG(OPCODE_add, instruction, length);
          _current += arg;
        }
      }
      else if (_ISOPCODE(OPCODE_sub, instruction, length)) {
        if(_HASARG(OPCODE_sub, instruction, length)) {
          int arg = _GETARG(OPCODE_sub, instruction, length);
          _current -= arg;
        }
      }
      else if (_ISOPCODE(OPCODE_div, instruction, length)) {
        if(_HASARG(OPCODE_div, instruction, length)) {
          int arg = _GETARG(OPCODE_div, instruction, length);
          _current /= arg;
        }
      }
      else if (_ISOPCODE(OPCODE_mul, instruction, length)) {
        if(_HASARG(OPCODE_mul, instruction, length)) {
          int arg = _GETARG(OPCODE_mul, instruction, length);
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

      _instructionIndex++;
    }
  }

private:
  int _instructionIndex = 0;
  int _current = 0;
  int _variableCount = 0;
  int16_t _variables[VARIABLE_LIST_SIZE];
  int _instructionCount = 0;
  char _instructions[INSTRUCTION_LIST_SIZE][INSTRUCTION_LIST_ITEM_SIZE];
};

#endif //CODE_INTERPRETER_H