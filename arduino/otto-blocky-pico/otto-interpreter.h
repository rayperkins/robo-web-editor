#ifndef OTTO_INTERPRETER_H
#define OTTO_INTERPRETER_H
#include <string.h>

#define VARIABLE_LIST_SIZE 64
#define INSTRUCTION_SIZE 20
#define INSTRUCTION_LIST_ITEM_SIZE (INSTRUCTION_SIZE + 1)
#define INSTRUCTION_LIST_SIZE (512)

#define INSTRUCTION_ISOPCODE(opcode, instruction, length) (length >= sizeof(opcode) && (strncmp(opcode, instruction, sizeof(opcode)) == 0))
#define INSTRUCTION_HASARG(opcode, instruction, length) (length > sizeof(opcode))
#define INSTRUCTION_GETARG(opcode, instruction, length) (strtol(instruction + sizeof(opcode), instruction + length, 10))

#define OPCODE_speed "speed"
#define OPCODE_stop "stop"
#define OPCODE_forward "forward"
#define OPCODE_backward "backward"

class OttoInterpreter
{
public:
  void setup() {

  }

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

  void step() {
    if(_instruction < _instructionCount)
    {
      char * instruction = _instructions[_instruction];
      char length = instruction[INSTRUCTION_SIZE]; // convention to store length at end

      if(length == 0) {
        // do nothing this step
      }
      else if (INSTRUCTION_ISOPCODE(OPCODE_speed, instruction, length)) {
        // set speed
        if(INSTRUCTION_HASARG(OPCODE_speed, instruction, length)) {
          //_ottoSpeed = INSTRUCTION_GETARG(OPCODE_speed, instruction, length);
        }
      }
      else if (INSTRUCTION_ISOPCODE(OPCODE_forward, instruction, length)) {
        // walk forward
      }
      else if (INSTRUCTION_ISOPCODE(OPCODE_backward, instruction, length)) {
        // walk backwards
      }

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

#endif //OTTO_INTERPRETER_H