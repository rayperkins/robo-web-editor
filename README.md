[Home](../README.md)

# Robo Web Editor 

This project is a web-based Blockly editor used to control and program hobby robots.
Currently this targets the open source [OttoDiy robot](https://www.ottodiy.com/).

[![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

## Editor Application Developer guide

The code editor is an angular web application with all the logic running from the browser, no server.

To build the application first restore the dependencies by running the below from the repo root.

```bash
npm install
```

And then run the angular development server using:
```bash
npm run start
```

The application should then be served from [http://localhost:3000/](http://localhost:3000/).

The firmware for compatible robots (Bluetooth communication layer and per-robot variants) now lives in a separate repository. This repo's editor compiles Blockly programs down to the bytecode instruction format understood by that firmware, described below.

## Blockly to firmware instruction format

The editor's code generator (see [generator.ts](/home/rayperkins/repos/personal/robo-web-editor/src/app/editor/generator/generator.ts) and [opcode.ts](/home/rayperkins/repos/personal/robo-web-editor/src/app/editor/generator/opcode.ts)) compiles the Blockly workspace into a list of fixed-size instructions that are streamed to the robot over Bluetooth (BLE). This section documents that wire format so it stays in sync between the editor and any firmware variant that consumes it.

Each instruction line is allocated 20 bytes (BLE packet size).
Supports only 16bit integers: -32,768 to +32,767
Has max of 512 lines (firmware `INSTRUCTION_LIST_SIZE`).
a '#' in front of the constant indicates a variable address

The BLE packet to set a particular instruction line is:
```
set9999 add -32768
```

Logic and Program flow
```
// Set constant to current
use 1234

// Store current to variable
stor #variableIndex

// Load variable to current
load #variableIndex

// Set the execution to an instruction line
jmp #instruction

// jump to instruction if current is 0
jmpe #instruction

// stop the program
exit

// Add, subtract, divide or multiply constant to current
add 32767
sub 32767
div 32767
mul 32767

// Add, subtract, divide or multiply variable to current
add #variableIndex
sub #variableIndex
div #variableIndex
mul #variableIndex

// example of a for loop, ie: for(  = 0; i < 10; i++)
00 use 0    // set current to 0
01 stor #0  // store 0 into variable 0
02 use 10   // set current to 10
03 sub #0  // subtract, ie 10 - 0 = 10
04 jmpe 10  // jump to 123 if the result is 0
05 ...      // body of loop
06 load #0  // load variable 0
07 add 1    // increment by 1
08 stor #0  // store back into variable 0
09 jmp 02   // jump to the start of the loop evaluation
10 blahblah // end of loop block

```

```

Shared Motion commands
```
// Vehicle motion (unified across robot variants, e.g. Otto, Olibot)
forward 100       // Move forward distance in mm
backward 100      // Move backward distance in mm
turn 45           // Rotate relative heading in degrees (positive = right/clockwise, negative = left/counter-clockwise)
speed 80          // Set motion speed in percent (0 - 100%)
stop              // Stop motion immediately
wait 1000         // Pause execution for duration in ms
victory           // Play victory gesture/dance
```

## Robot Protocol & Firmware Header

The protocol schema lives in `src/app/editor/generator/schema/`:
- **Core Interpreter Opcodes**: Shared opcodes (`exit`, `use`, `stor`, `load`, `jmp*`, `add`, `sub`, `div`, `mul`), protocol limits (512 instruction lines, 20 bytes/line, 64 variables), and core state envelope (`CoreState`).
- **Shared Motion Commands**: Unified vehicle-level movement commands (`forward`, `backward`, `turn`, `speed`, `stop`, `wait`, `victory`).
- **Robot Configuration Schemas**:
  - `OttoState`: Four-servo leg/foot trim calibration (`trimLeftLeg`, `trimRightLeg`, `trimLeftFoot`, `trimRightFoot`, `sensorDistance`).
  - `OlibotState`: Differential-drive configuration (`motorBias`, `distanceCalibration`, `sensorDistance`).

Generate the single shared C++ header for firmware via:
```bash
npm run generate:firmware-header
```
This produces `generated/robot-protocol.h`.
Verify the header is up-to-date in CI via:
```bash
npm run generate:firmware-header:check
```



