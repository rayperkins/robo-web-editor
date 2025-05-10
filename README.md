[Home](../README.md)

# Otto Web Editor 

This sample shows how to load Blockly in an [Angular](https://angular.io/) project.

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

## Arduino Developer guide

The sketch has been written with an RPI Pico in mind. However, it's pretty modular so can be chopped and changed to suit any Bluetooth enabled board.
Open the sketch under the arduino folder in the Arduino IDE, set the target the a RPI Pico W compatible board and upload.

## Otto and blocky

Each instruction line is allocated 20 bytes (BLE packet size).
Supports only 16bit integers: -32,768 to +32,767
Has max of 10000 lines. 
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
10 ::123    // end of loop

```

Otto commands
```

// motion
forward
backward
right
left
speed 5
stop
```

## Todo list

- arduino, send data to computer, such as current state (idle/running) and sensor data. eg: computer sends `state` then device replies with `state=01,d100`
- arduino, expand otto command set
- editor, code generator and basic blocks for motion
- editor, handle disconnects, maybe show toast on connect/disconnect