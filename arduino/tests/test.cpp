#include <catch2/catch_test_macros.hpp>
#include "code_interpreter.h"

#define SETINSTRUCTION(interpreter, index, instruction) interpreter.setInstruction(index, instruction, sizeof(instruction))

class TestCodeInterpreter : public CodeInterpreter {
public:
    int stepCount = 0;

    TestCodeInterpreter() {
        // Initialize variables

    }

    bool handle_instruction(const char* instruction, char length) { 
        stepCount ++;
        return true; 
    } 

};

TEST_CASE( "clearInstruction", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    interpreter.setInstruction(0, "forward", sizeof("forward"));
    interpreter.clearInstructions();

    REQUIRE( interpreter.getInstructionCount() == 0 );
}

TEST_CASE( "setInstruction", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    interpreter.setInstruction(0, "forward", sizeof("forward"));
    interpreter.setInstruction(1, "backward", sizeof("backward"));    
    interpreter.setInstruction(2, "stop", sizeof("stop"));

    REQUIRE( interpreter.getInstructionCount() == 3 );
}

TEST_CASE( "step", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    interpreter.setInstruction(0, "forward", sizeof("forward"));
    interpreter.setInstruction(1, "backward", sizeof("backward"));    
    interpreter.setInstruction(2, "stop", sizeof("stop"));

    REQUIRE( interpreter.getInstructionCount() == 3 );

    interpreter.step();
    REQUIRE( interpreter.stepCount == 1 );
    interpreter.step();
    REQUIRE( interpreter.stepCount == 2 );
    interpreter.step();
    REQUIRE( interpreter.stepCount == 3 );
}

TEST_CASE( "isOpcode", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.isOpcode("forward", sizeof("forward"), "forward 123", sizeof("forward 123")) == true );
}

TEST_CASE( "isOpcode is false", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.isOpcode("notforward", sizeof("notforward"), "forward 123", sizeof("forward 123")) == false );
}

TEST_CASE( "hasArg", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.hasArg("forward", sizeof("forward"), "forward 123", sizeof("forward 123")) == true );
}

TEST_CASE( "hasArg is false", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.hasArg("forward", sizeof("forward"), "forward", sizeof("forward")) == false );
}

TEST_CASE( "getArg", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.getArg("forward", sizeof("forward"), "forward 123", sizeof("forward 123")) == 123 );
}

TEST_CASE( "getArg is negative", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.getArg("forward", sizeof("forward"), "forward -123", sizeof("forward -123")) == -123 );
}

TEST_CASE( "INSTRUCTION_ISOPCODE", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( INSTRUCTION_ISOPCODE(interpreter, "forward", "forward 123", sizeof("forward 123")) == true );
}

TEST_CASE( "INSTRUCTION_HASARG", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( INSTRUCTION_HASARG(interpreter, "forward", "forward 123", sizeof("forward 123")) == true );
}

TEST_CASE( "INSTRUCTION_GETARG", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( INSTRUCTION_GETARG(interpreter, "forward", "forward 123", sizeof("forward 123")) == 123 );
}

// for loop
TEST_CASE( "for loop", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    // example of a for loop, ie: for( i = 0; i < 10; i++)
    SETINSTRUCTION(interpreter, 0, "use 0");
    SETINSTRUCTION(interpreter, 1, "stor 1"); // store 0 to variable 1
    SETINSTRUCTION(interpreter, 2, "stor 0"); // store 0 to variable 0
    SETINSTRUCTION(interpreter, 3, "sub 10"); // prev result negative if loop not done
    SETINSTRUCTION(interpreter, 4, "jmpe 11"); // jump to end if 0, ie loop is done
    SETINSTRUCTION(interpreter, 5, "load 0"); // increment variable 1
    SETINSTRUCTION(interpreter, 6, "add 1"); // increment variable 1
    SETINSTRUCTION(interpreter, 7, "stor 1");
    SETINSTRUCTION(interpreter, 8, "load 0"); // end of loop body, increment variable 0
    SETINSTRUCTION(interpreter, 9, "add 1"); 
    SETINSTRUCTION(interpreter, 10, "jump 2");
    SETINSTRUCTION(interpreter, 11, "exit");

    int stepCount = 0;

    while(interpreter.getVariable(1) < 10
        && !interpreter.hasExited()
        && stepCount < 100) {
        interpreter.step();
        stepCount++;
    }

    REQUIRE( interpreter.getVariable(1) == 10 );
}
