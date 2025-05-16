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

TEST_CASE( "clearInstruction", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    interpreter.setInstruction(0, "use 0", sizeof("use 0"));
    interpreter.clearInstructions();

    REQUIRE( interpreter.getInstructionCount() == 0 );
}

TEST_CASE( "setInstruction", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    interpreter.setInstruction(0, "use 0", sizeof("use 0"));
    interpreter.setInstruction(1, "add 1", sizeof("add 1"));    
    interpreter.setInstruction(2, "stor 0", sizeof("stor 0"));

    REQUIRE( interpreter.getInstructionCount() == 3 );
}

TEST_CASE( "step", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    interpreter.setInstruction(0, "use 0", sizeof("use 0"));
    interpreter.setInstruction(1, "add 1", sizeof("add 1"));    
    interpreter.setInstruction(2, "stor 0", sizeof("stor 0"));

    REQUIRE( interpreter.getInstructionCount() == 3 );

    interpreter.step();
    REQUIRE( interpreter.currentInstruction() == 1 );
    interpreter.step();
    REQUIRE( interpreter.currentInstruction() == 2 );
    interpreter.step();
    REQUIRE( interpreter.currentInstruction() == 3 );
}

TEST_CASE( "isOpcode", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.isOpcode("use", sizeof("use"), "use 123", sizeof("use 123")) == true );
}

TEST_CASE( "isOpcode is false", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.isOpcode("notuse", sizeof("notuse"), "use 123", sizeof("use 123")) == false );
}

TEST_CASE( "isOpcode checks whitespace", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.isOpcode("jmp", sizeof("jmp"), "jmpe 123", sizeof("jmpe 123")) == false );
}

TEST_CASE( "hasArg", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.hasArg("use", sizeof("use"), "use 123", sizeof("use 123")) == true );
}

TEST_CASE( "hasArg is false", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.hasArg("use", sizeof("use"), "use", sizeof("use")) == false );
}

TEST_CASE( "getArg", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.getArg("use", sizeof("use"), "use 123", sizeof("use 123")) == 123 );
}

TEST_CASE( "getArg is negative", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( interpreter.getArg("use", sizeof("use"), "use -123", sizeof("use -123")) == -123 );
}

TEST_CASE( "getArg is variable", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    interpreter.setVariable(1, 123);
    REQUIRE( interpreter.getArg("use", sizeof("use"), "use #1", sizeof("use #1")) == 123 );
}

TEST_CASE( "INSTRUCTION_ISOPCODE", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( INSTRUCTION_ISOPCODE(interpreter, "use", "use 123", sizeof("use 123")) == true );
}

TEST_CASE( "INSTRUCTION_HASARG", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( INSTRUCTION_HASARG(interpreter, "use", "use 123", sizeof("use 123")) == true );
}

TEST_CASE( "INSTRUCTION_GETARG", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    REQUIRE( INSTRUCTION_GETARG(interpreter, "use", "use 123", sizeof("use 123")) == 123 );
}

// for loop
TEST_CASE( "for loop", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    // example of a for loop, ie: for( i = 0; i < 10; i++)
    SETINSTRUCTION(interpreter, 0, "use 0");
    SETINSTRUCTION(interpreter, 1, "stor 1"); // store 0 to variable 1
    SETINSTRUCTION(interpreter, 2, "stor 0"); // store 0 to variable 0
    SETINSTRUCTION(interpreter, 3, "sub 10"); // prev result now negative if loop not done
    SETINSTRUCTION(interpreter, 4, "jmpe 11"); // jump to end if 0, ie loop is done
    SETINSTRUCTION(interpreter, 5, "load 1"); // increment variable 1
    SETINSTRUCTION(interpreter, 6, "add 1"); // increment variable 1
    SETINSTRUCTION(interpreter, 7, "stor 1");
    SETINSTRUCTION(interpreter, 8, "load 0"); // end of loop body, increment variable 0
    SETINSTRUCTION(interpreter, 9, "add 1"); 
    SETINSTRUCTION(interpreter, 10, "jmp 2");
    SETINSTRUCTION(interpreter, 11, "exit");

    int stepCount = 0;

    while(!interpreter.completed()
        && stepCount < 100) {
        interpreter.step();
        stepCount++;
    }

    REQUIRE( interpreter.getVariable(1) == 10 );
}

// for loop  from web
// ['clear', 'set0 use 0', 'set1 stor 0', 'set2 sub 10', 'set3 jmpe 9', 'set4 backward 1', 'set5 forward 1', 'set6 load #0', 'set7 add 1', 'set8 jmp 1', 'start']
TEST_CASE( "for loop from web", "[CodeInterpreter]" ) {
    TestCodeInterpreter interpreter;
    // example of a for loop, ie: for( i = 0; i < 10; i++)
    SETINSTRUCTION(interpreter, 0, "use 0");
    SETINSTRUCTION(interpreter, 1, "stor 0"); // store 0 to variable 1
    SETINSTRUCTION(interpreter, 2, "sub 10"); // store 0 to variable 0
    SETINSTRUCTION(interpreter, 3, "jmpe 9"); // prev result now negative if loop not done
    SETINSTRUCTION(interpreter, 4, "backward 1"); // jump to end if 0, ie loop is done
    SETINSTRUCTION(interpreter, 5, "forward 1"); // increment variable 1
    SETINSTRUCTION(interpreter, 6, "load 0"); // increment variable 1
    SETINSTRUCTION(interpreter, 7, "add 1");
    SETINSTRUCTION(interpreter, 8, "jmp 1"); // end of loop body, increment variable 0

    int stepCount = 0;

    while(!interpreter.completed()
        && stepCount < 100) {
        interpreter.step();
        stepCount++;
    }

    REQUIRE( stepCount < 100 );
}


