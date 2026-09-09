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
constexpr bool BLE_COMMAND_WRITE_WITH_RESPONSE = true;
constexpr std::size_t BLE_COMMAND_MAX_PAYLOAD_BYTES = 20;
constexpr char BLE_COMMAND_TERMINATOR = '\n';
constexpr std::size_t BLE_STATE_PAYLOAD_LENGTH = 16;

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

// Bits within State::flags / CoreState::flags.
constexpr std::uint8_t STATE_FLAG_PROGRAMRUNNING_BIT = 0;

// Generic state characteristic header / envelope.
enum class ProgramState : std::uint8_t {
    Stopped = 0,
    Running = 1,
    Completed = 2,
    Error = 3,
};
enum class ProgramError : std::uint8_t {
    None = 0,
    MotionTimeout = 1,
    RuntimeFailure = 2,
};

constexpr std::size_t CORE_STATE_HEADER_BYTE_LENGTH = 10;

#pragma pack(push, 1)
struct CoreState {
    std::uint8_t version;
    std::uint8_t flags;
    std::uint8_t programState;
    std::uint8_t programError;
    std::uint16_t currentInstructionIndex;
    std::uint32_t programId;
};
#pragma pack(pop)
static_assert(sizeof(CoreState) == CORE_STATE_HEADER_BYTE_LENGTH, "CoreState struct size must match CORE_STATE_HEADER_BYTE_LENGTH");

// ---------------------------------------------------------------------------
// Robot-specific state configurations
// ---------------------------------------------------------------------------

// Olibot (two-wheel differential-drive robot)
constexpr std::size_t OLIBOT_STATE_BYTE_LENGTH = 16;

#pragma pack(push, 1)
struct OlibotState {
    std::uint8_t version;
    std::uint8_t flags;
    std::uint8_t programState;
    std::uint8_t programError;
    std::uint16_t currentInstructionIndex;
    std::uint32_t programId;
    std::int8_t motorBias;
    std::uint8_t _reserved_11[1];
    std::uint16_t distanceCalibration;
    std::uint16_t sensorDistance;
};
#pragma pack(pop)
static_assert(sizeof(OlibotState) == OLIBOT_STATE_BYTE_LENGTH, "OlibotState struct size must match OLIBOT_STATE_BYTE_LENGTH");

// Otto DIY (bipedal walking robot)
constexpr std::size_t OTTO_STATE_BYTE_LENGTH = 16;

#pragma pack(push, 1)
struct OttoState {
    std::uint8_t version;
    std::uint8_t flags;
    std::uint8_t programState;
    std::uint8_t programError;
    std::uint16_t currentInstructionIndex;
    std::uint32_t programId;
    std::int8_t trimLeftLeg;
    std::int8_t trimRightLeg;
    std::int8_t trimLeftFoot;
    std::int8_t trimRightFoot;
    std::uint16_t sensorDistance;
};
#pragma pack(pop)
static_assert(sizeof(OttoState) == OTTO_STATE_BYTE_LENGTH, "OttoState struct size must match OTTO_STATE_BYTE_LENGTH");

// Default State alias
using State = OlibotState;
constexpr std::size_t STATE_BYTE_LENGTH = OLIBOT_STATE_BYTE_LENGTH;

}  // namespace robot::protocol
