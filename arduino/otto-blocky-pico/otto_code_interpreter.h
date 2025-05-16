#ifndef OTTO_CODE_INTERPRETER_H
#define OTTO_CODE_INTERPRETER_H
#include <string.h>
#include "code_interpreter.h"

#define CMD_wait "wait"
#define CMD_stop "stop"
// motion
#define CMD_backward "backward"
#define CMD_forward "forward"
#define CMD_turnleft "turnleft"
#define CMD_turnright "turnright"
// gestures
#define CMD_confused "confused"
#define CMD_victory "victory"

class OttoCodeInterpreter : public CodeInterpreter {
public:
    OttoCodeInterpreter() {
        // Initialize variables

    }

    void setup(Otto* ottobot) {
      _ottobot = ottobot;
    }

    void loop() {
      unsigned long now = millis();

      if(_enabled 
        && _waitUntil < now) {
        step();
      }
      else {
        // is waiting
      }
    }

    bool isEnabled() {
      return _enabled;
    }

    void start() {
      reset();
      _enabled = true;
    }

    void stop() {
      _enabled = false;
    }

    bool handle_instruction(const char* instruction, char length) { 
      bool handled = false;
      if(length == 0) {
        
      }
      else if (ISOPCODE(CMD_wait, instruction, length)) {
        if(HASARG(CMD_wait, instruction, length)) {
          int arg = GETARG(CMD_wait, instruction, length);
          _waitUntil = millis() + (arg < 0 ? 0 : arg);
          handled = true;
        }
      }
      else if (ISOPCODE(CMD_stop, instruction, length)) {
        _ottobot->home();
        handled = true;
      }

      // motion
      else if (ISOPCODE(CMD_backward, instruction, length)) {
        if(HASARG(CMD_backward, instruction, length)) {
          int arg = GETARG(CMD_backward, instruction, length);
          //_waitUntil = millis() + (arg < 0 ? 0 : arg * 2000); // wait until walking done
          _ottobot->walk(arg, _speed, BACKWARD);
          handled = true;
        }
      }
      else if (ISOPCODE(CMD_forward, instruction, length)) {
        if(HASARG(CMD_forward, instruction, length)) {
          int arg = GETARG(CMD_forward, instruction, length);
          //_waitUntil = millis() + (arg < 0 ? 0 : arg * 2000); // wait until walking done
          _ottobot->walk(arg, _speed, FORWARD);
          handled = true;
        }
      }
      else if (ISOPCODE(CMD_turnleft, instruction, length)) {
        if(HASARG(CMD_turnleft, instruction, length)) {
          int arg = GETARG(CMD_turnleft, instruction, length);
          _ottobot->turn(arg, _speed, LEFT);
          handled = true;
        }
      }
      else if (ISOPCODE(CMD_turnright, instruction, length)) {
        if(HASARG(CMD_turnright, instruction, length)) {
          int arg = GETARG(CMD_turnright, instruction, length);
          _ottobot->turn(arg, _speed, RIGHT);
          handled = true;
        }
      }

      // gestures
      else if (ISOPCODE(CMD_confused, instruction, length)) {
        _ottobot->playGesture(OttoConfused);
          handled = true;
      }
      else if (ISOPCODE(CMD_victory, instruction, length)) {
        _ottobot->playGesture(OttoVictory);
          handled = true;
      }

      return handled; 
    } 

private:
  Otto* _ottobot;
  bool _enabled = false;
  int _speed = 1000;
  unsigned long _waitUntil = 0;
};

#endif // OTTO_CODE_INTERPRETER_H