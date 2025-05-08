#include <catch2/catch_test_macros.hpp>
#include "otto-interpreter.h"

TEST_CASE( "OttoInterperter clearInstruction", "[OttoInterperter]" ) {
    OttoInterpreter interperter;
    interperter.setup();
    interperter.setInstruction(0, "forward", sizeof("forward"));
    interperter.clearInstructions();

    REQUIRE( interperter.getInstructionCount() == 0 );
}

TEST_CASE( "OttoInterperter setInstruction", "[OttoInterperter]" ) {
    OttoInterpreter interperter;
    interperter.setup();
    interperter.setInstruction(0, "forward", sizeof("forward"));
    interperter.setInstruction(1, "backward", sizeof("backward"));    
    interperter.setInstruction(2, "stop", sizeof("stop"));

    REQUIRE( interperter.getInstructionCount() == 3 );
}