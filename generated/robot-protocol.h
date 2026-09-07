// GENERATED FILE — do not edit by hand.
// Source: robo-web-editor/src/app/editor/generator/schema/*.ts
// Regenerate with: npm run generate:firmware-header
#pragma once

#include <cstdint>

namespace robot::protocol {

constexpr int PROTOCOL_VERSION = 1;

// Protocol buffer and list limits.
constexpr std::size_t INSTRUCTION_SIZE = 20;
constexpr std::size_t INSTRUCTION_LIST_SIZE = 512;
constexpr std::size_t VARIABLE_LIST_SIZE = 64;

// Program instruction opcodes (handled by CodeInterpreter::step()).
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

// Shared vehicle-level motion commands (handled outside CodeInterpreter::step()).
constexpr const char* MOTION_FORWARD = "forward";
constexpr const char* MOTION_BACKWARD = "backward";
constexpr const char* MOTION_TURN = "turn";
constexpr const char* MOTION_SPEED = "speed";
constexpr const char* MOTION_STOP = "stop";
constexpr const char* MOTION_WAIT = "wait";
constexpr const char* MOTION_VICTORY = "victory";

// Bits within State::flags / CoreState::flags.
constexpr std::uint8_t STATE_FLAG_PROGRAMRUNNING_BIT = 0;

// Generic state characteristic header / envelope.
constexpr std::size_t CORE_STATE_HEADER_BYTE_LENGTH = 4;

#pragma pack(push, 1)
struct CoreState {
    std::uint8_t version;
    std::uint8_t flags;
    std::uint8_t _reserved_2[2];
};
#pragma pack(pop)
static_assert(sizeof(CoreState) == CORE_STATE_HEADER_BYTE_LENGTH, "CoreState struct size must match CORE_STATE_HEADER_BYTE_LENGTH");

// ---------------------------------------------------------------------------
// Robot-specific state configurations
// ---------------------------------------------------------------------------

// Olibot (two-wheel differential-drive robot)
constexpr std::size_t OLIBOT_STATE_BYTE_LENGTH = 10;

#pragma pack(push, 1)
struct OlibotState {
    std::uint8_t version;
    std::uint8_t flags;
    std::uint8_t _reserved_2[2];
    std::int8_t motorBias;
    std::uint8_t _reserved_5[1];
    std::uint16_t distanceCalibration;
    std::uint16_t sensorDistance;
};
#pragma pack(pop)
static_assert(sizeof(OlibotState) == OLIBOT_STATE_BYTE_LENGTH, "OlibotState struct size must match OLIBOT_STATE_BYTE_LENGTH");

// Otto DIY (bipedal walking robot)
constexpr std::size_t OTTO_STATE_BYTE_LENGTH = 10;

#pragma pack(push, 1)
struct OttoState {
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
static_assert(sizeof(OttoState) == OTTO_STATE_BYTE_LENGTH, "OttoState struct size must match OTTO_STATE_BYTE_LENGTH");

// Default State alias
using State = OlibotState;
constexpr std::size_t STATE_BYTE_LENGTH = OLIBOT_STATE_BYTE_LENGTH;

}  // namespace robot::protocol
