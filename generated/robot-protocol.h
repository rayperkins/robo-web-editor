// GENERATED FILE — do not edit by hand.
// Source: robo-web-editor/src/app/editor/generator/schema/*.ts
// Regenerate with: npm run generate:firmware-header
#pragma once

#include <cstdint>
#include <cstddef>

namespace robot::protocol {

constexpr int PROTOCOL_VERSION = 1;

// Protocol buffer and list limits.
constexpr std::size_t INSTRUCTION_SIZE = 20;
constexpr std::size_t INSTRUCTION_LIST_SIZE = 512;
constexpr std::size_t VARIABLE_LIST_SIZE = 64;

// Program transport and lifecycle.
// set<number> <instruction>: Store an instruction in a program slot.
constexpr const char* PROGRAM_UPLOAD_PREFIX = "set";
constexpr std::size_t PROGRAM_UPLOAD_INDEX_MAX = 511;
// clear: Clear all interpreter slots.
constexpr const char* PROGRAM_CLEAR = "clear";
// save: Store the uploaded program in persistent memory.
constexpr const char* PROGRAM_SAVE = "save";
// run <argument>: Start executing the uploaded program with its 32-bit correlation identifier.
constexpr const char* PROGRAM_RUN = "run";
// program_stop: Stop and cancel the running program.
constexpr const char* PROGRAM_PROGRAM_STOP = "program_stop";

// BLE transport contract.
constexpr const char* BLE_SERVICE_UUID = "0000ffe0-0000-1000-8000-00805f9b34fb";
constexpr const char* BLE_COMMAND_WRITE_CHARACTERISTIC_UUID = "0000ffe1-0000-1000-8000-00805f9b34fb";
constexpr const char* BLE_RESPONSE_CHARACTERISTIC_UUID = "0000ffe2-0000-1000-8000-00805f9b34fb";
constexpr const char* BLE_STATE_CHARACTERISTIC_UUID = "0000ffe3-0000-1000-8000-00805f9b34fb";
constexpr const char* BLE_CALIBRATION_CHARACTERISTIC_UUID = "0000ffe4-0000-1000-8000-00805f9b34fb";
constexpr bool BLE_COMMAND_WRITE_WITH_RESPONSE = true;
constexpr std::size_t BLE_COMMAND_MAX_PAYLOAD_BYTES = 20;
constexpr char BLE_COMMAND_TERMINATOR = '\n';
constexpr std::size_t BLE_STATE_PAYLOAD_LENGTH = 9;

// Program instruction opcodes (handled by CodeInterpreter::step()).
// exit: Stop the interpreter.
constexpr const char* OPCODE_EXIT = "exit";
// use: Set the current arithmetic value.
constexpr const char* OPCODE_USE = "use";
// stor: Store the current value in a variable.
constexpr const char* OPCODE_STOR = "stor";
// load: Load a variable into the current value.
constexpr const char* OPCODE_LOAD = "load";
// jmp: Jump to an instruction.
constexpr const char* OPCODE_JMP = "jmp";
// jmpe: Jump when the current value is zero.
constexpr const char* OPCODE_JMPE = "jmpe";
// jmpn: Jump when the current value is negative.
constexpr const char* OPCODE_JMPN = "jmpn";
// jmpp: Jump when the current value is positive.
constexpr const char* OPCODE_JMPP = "jmpp";
// add: Add an operand to the current value.
constexpr const char* OPCODE_ADD = "add";
// sub: Subtract an operand from the current value.
constexpr const char* OPCODE_SUB = "sub";
// div: Divide the current value by an operand.
constexpr const char* OPCODE_DIV = "div";
// mul: Multiply the current value by an operand.
constexpr const char* OPCODE_MUL = "mul";

// Generic robot movement commands (ASCII, one optional signed int16 argument).
// heading: relative degrees [-360, 360], default 0.
// distance: signed millimetres [-32768, 32767], default 0; negative drives in reverse.
// speed: requested percent [0, 100], default 100.
// move: submits the current heading/distance setpoints; argument is timeout in milliseconds [0, 32767].
// stop: stops motion and clears pending setpoints.
// wait: interpreter delay in milliseconds [0, 32767].
// heading: Set the relative heading target in degrees.
constexpr const char* ROBOT_SET_HEADING = "heading";
// distance: Set the signed travel distance target in millimetres; negative values drive in reverse.
constexpr const char* ROBOT_SET_DISTANCE = "distance";
// speed: Set the requested speed percentage.
constexpr const char* ROBOT_SET_SPEED = "speed";
// move: Start motion using the current heading and distance setpoints; the argument is a timeout in milliseconds.
constexpr const char* ROBOT_MOVE = "move";
// stop: Stop motion and clear pending movement setpoints.
constexpr const char* ROBOT_STOP = "stop";
// wait: Wait in the interpreter without issuing a movement command; duration is milliseconds.
constexpr const char* ROBOT_WAIT = "wait";

// Robot-specific commands.
// ottoLLtrim: Set the Otto left leg trim.
constexpr const char* OTTO_LEFTLEG_TRIM = "ottoLLtrim";
// ottoRLtrim: Set the Otto right leg trim.
constexpr const char* OTTO_RIGHTLEG_TRIM = "ottoRLtrim";
// ottoLFtrim: Set the Otto left foot trim.
constexpr const char* OTTO_LEFTFOOT_TRIM = "ottoLFtrim";
// ottoRFtrim: Set the Otto right foot trim.
constexpr const char* OTTO_RIGHTFOOT_TRIM = "ottoRFtrim";
// ottoHome: Move Otto servos to their zero positions plus trim offsets.
constexpr const char* OTTO_HOME = "ottoHome";
// ottoHappy: Play the Otto happy sound gesture.
constexpr const char* OTTO_HAPPY = "ottoHappy";
// ottoSuperHappy: Play the Otto super-happy sound gesture.
constexpr const char* OTTO_SUPER_HAPPY = "ottoSuperHappy";
// ottoSad: Play the Otto sad descending sound gesture.
constexpr const char* OTTO_SAD = "ottoSad";
// ottoSleeping: Play the Otto sleeping/dream sound gesture.
constexpr const char* OTTO_SLEEPING = "ottoSleeping";
// ottoFart: Play the Otto fart sound gesture.
constexpr const char* OTTO_FART = "ottoFart";
// ottoTone: Play an Otto tone in Hz for the default 500 ms; frequency range 1-32767 Hz.
constexpr const char* OTTO_TONE = "ottoTone";
// calibrate: Start the robot auto-calibration cycle.
constexpr const char* CALIBRATE = "calibrate";
// save_calibration: Persist the current robot calibration.
constexpr const char* SAVE_CALIBRATION = "save_calibration";
// name: Set the three-character robot name suffix.
constexpr const char* ROBOT_NAME_SUFFIX = "name";

// Generic state characteristic header / envelope.
enum class RobotType : std::uint8_t {
    Otto = 0,
    Olibot = 1,
};
enum class RobotStatus : std::uint8_t {
    Ready = 0,
    ProgramRunning = 1,
    ProgramError = 2,
    CalibrationRunning = 3,
};

constexpr std::size_t STATE_BYTE_LENGTH = 9;

#pragma pack(push, 1)
struct RobotState {
    std::uint8_t version;
    std::uint8_t type;
    std::uint8_t robotStatus;
    std::uint16_t currentStep;
    std::uint32_t programId;
};
#pragma pack(pop)
static_assert(sizeof(RobotState) == STATE_BYTE_LENGTH, "RobotState struct size must match STATE_BYTE_LENGTH");

// ---------------------------------------------------------------------------
// Robot-specific calibration payloads
// ---------------------------------------------------------------------------

// Olibot (two-wheel differential-drive robot)
constexpr std::size_t OLIBOT_CALIBRATION_BYTE_LENGTH = 6;

#pragma pack(push, 1)
struct OlibotCalibration {
    std::int8_t motorBias;
    std::uint8_t _reserved_1[1];
    std::uint16_t distanceCalibration;
    std::uint16_t sensorDistance;
};
#pragma pack(pop)
static_assert(sizeof(OlibotCalibration) == OLIBOT_CALIBRATION_BYTE_LENGTH, "OlibotCalibration struct size must match OLIBOT_CALIBRATION_BYTE_LENGTH");

// Otto DIY (bipedal walking robot)
constexpr std::size_t OTTO_CALIBRATION_BYTE_LENGTH = 6;

#pragma pack(push, 1)
struct OttoCalibration {
    std::int8_t trimLeftLeg;
    std::int8_t trimRightLeg;
    std::int8_t trimLeftFoot;
    std::int8_t trimRightFoot;
    std::uint16_t sensorDistance;
};
#pragma pack(pop)
static_assert(sizeof(OttoCalibration) == OTTO_CALIBRATION_BYTE_LENGTH, "OttoCalibration struct size must match OTTO_CALIBRATION_BYTE_LENGTH");

}  // namespace robot::protocol
