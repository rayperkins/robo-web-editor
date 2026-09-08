// Single source of truth for BLE wire-format constants shared between the
// editor's code generator/BLE layer and firmware. Do not hand-edit the
// generated C++ header (generated/robot-protocol.h) — regenerate it from
// this schema via `npm run generate:firmware-header` instead.

/** Bump whenever any schema file in this folder changes the wire format. */
export const PROTOCOL_VERSION = 1;

/** BLE packet size in bytes; each instruction line must fit in one packet. */
export const INSTRUCTION_SIZE = 20;

/** Maximum number of program instruction lines firmware can store (firmware `INSTRUCTION_LIST_SIZE`). */
export const INSTRUCTION_LIST_SIZE = 512;

/** Maximum number of user/reserved variables firmware can store (firmware `VARIABLE_LIST_SIZE`). */
export const VARIABLE_LIST_SIZE = 64;

/** Valid range for the 16-bit signed integers used throughout the instruction format. */
export const INT16_MIN = -32768;
export const INT16_MAX = 32767;
