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

#define OPCODE_speed "speed"
#define OPCODE_stop "stop"
#define OPCODE_forward "forward"
#define OPCODE_backward "backward"


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
    if(_instruction < _instructionCount)
    {
      char * instruction = _instructions[_instruction];
      char length = instruction[INSTRUCTION_SIZE]; // convention to store length at end

      if(length == 0) {
        // do nothing this step
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

      _instruction++;
    }
  }

private:
  int _instruction = 0;
  int _current = 0;
  int _variableCount = 0;
  int16_t _variables[VARIABLE_LIST_SIZE];
  int _instructionCount = 0;
  char _instructions[INSTRUCTION_LIST_SIZE][INSTRUCTION_LIST_ITEM_SIZE];
};

#endif //CODE_INTERPRETER_H