#include <catch2/catch_test_macros.hpp>
#include "code_interpreter.h"

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

TEST_CASE( "clearInstruction", "[Ottointerpreter]" ) {
    TestCodeInterpreter interpreter;
    interpreter.setInstruction(0, "forward", sizeof("forward"));
    interpreter.clearInstructions();

    REQUIRE( interpreter.getInstructionCount() == 0 );
}

TEST_CASE( "setInstruction", "[Ottointerpreter]" ) {
    TestCodeInterpreter interpreter;
    interpreter.setInstruction(0, "forward", sizeof("forward"));
    interpreter.setInstruction(1, "backward", sizeof("backward"));    
    interpreter.setInstruction(2, "stop", sizeof("stop"));

    REQUIRE( interpreter.getInstructionCount() == 3 );
}

TEST_CASE( "step", "[Ottointerpreter]" ) {
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

TEST_CASE( "isOpcode", "[Ottointerpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.isOpcode("forward", sizeof("forward"), "forward 123", sizeof("forward 123")) == true );
}

TEST_CASE( "isOpcode is false", "[Ottointerpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.isOpcode("notforward", sizeof("notforward"), "forward 123", sizeof("forward 123")) == false );
}

TEST_CASE( "hasArg", "[Ottointerpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.hasArg("forward", sizeof("forward"), "forward 123", sizeof("forward 123")) == true );
}

TEST_CASE( "hasArg is false", "[Ottointerpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.hasArg("forward", sizeof("forward"), "forward", sizeof("forward")) == false );
}

TEST_CASE( "getArg", "[Ottointerpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.getArg("forward", sizeof("forward"), "forward 123", sizeof("forward 123")) == 123 );
}

TEST_CASE( "getArg is negative", "[Ottointerpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.getArg("forward", sizeof("forward"), "forward -123", sizeof("forward -123")) == -123 );
}

TEST_CASE( "INSTRUCTION_ISOPCODE", "[Ottointerpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( INSTRUCTION_ISOPCODE(interpreter, "forward", "forward 123", sizeof("forward 123")) == true );
}

TEST_CASE( "INSTRUCTION_HASARG", "[Ottointerpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( INSTRUCTION_HASARG(interpreter, "forward", "forward 123", sizeof("forward 123")) == true );
}

TEST_CASE( "INSTRUCTION_GETARG", "[Ottointerpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( INSTRUCTION_GETARG(interpreter, "forward", "forward 123", sizeof("forward 123")) == 123 );
}
