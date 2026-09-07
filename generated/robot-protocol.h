// GENERATED FILE — do not edit by hand.
// Source: robo-web-editor/src/app/editor/generator/schema/*.ts
// Regenerate with: npm run generate:firmware-header
#pragma once

#include <cstdint>

namespace robot::protocol {

constexpr int PROTOCOL_VERSION = 1;

constexpr std::size_t INSTRUCTION_SIZE = 20;
constexpr std::size_t INSTRUCTION_LIST_SIZE = 512;
constexpr std::size_t VARIABLE_LIST_SIZE = 64;

// Program instruction opcodes.
constexpr const char* OPCODE_EXIT = "exit";
constexpr const char* OPCODE_USE = "use";
constexpr const char* OPCODE_STOR = "stor";
constexpr const char* OPCODE_LOAD = "load";
constexpr const char* OPCODE_JMP = "jmp";
constexpr const char* OPCODE_JMPE = "jmpe";
constexpr const char* OPCODE_JMPN = "jmpn";
constexpr const char* OPCODE_JMPP = "jmpp";
constexpr const char* OPCODE_ADD = "add";
constexpr const char* OPCODE_SUB = "sub";
constexpr const char* OPCODE_DIV = "div";
constexpr const char* OPCODE_MUL = "mul";

// Otto motion commands (handled outside CodeInterpreter::step()).
constexpr const char* MOTION_FORWARD = "forward";
constexpr const char* MOTION_BACKWARD = "backward";
constexpr const char* MOTION_LEFT = "left";
constexpr const char* MOTION_RIGHT = "right";
constexpr const char* MOTION_TURNLEFT = "turnleft";
constexpr const char* MOTION_TURNRIGHT = "turnright";
constexpr const char* MOTION_SPEED = "speed";
constexpr const char* MOTION_STOP = "stop";
constexpr const char* MOTION_VICTORY = "victory";
constexpr const char* MOTION_WAIT = "wait";

// BLE state characteristic payload (read back from the robot).
constexpr std::size_t STATE_BYTE_LENGTH = 10;

#pragma pack(push, 1)
struct State {
    std::uint8_t version;
    std::uint8_t flags;
    std::uint8_t _reserved_2[2];
    std::int8_t trimLeftLeg;
    std::int8_t trimRightLeg;
    std::int8_t trimLeftFoot;
    std::int8_t trimRightFoot;
    std::uint16_t sensorDistance;
};
#pragma pack(pop)
static_assert(sizeof(State) == STATE_BYTE_LENGTH, "State struct size must match STATE_BYTE_LENGTH");

// Bits within State::flags.
constexpr std::uint8_t STATE_FLAG_PROGRAMRUNNING_BIT = 0;

}  // namespace robot::protocol
