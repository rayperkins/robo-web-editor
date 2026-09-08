# Project Todo list

## Completed

## Next

1. editor, handle disconnects, maybe show toast on connect/disconnect
2. save and load blocky code to and from a file
3. Own the BLE DTOs in this repo as generated C++ headers for firmware, instead of splitting the schema across two repos:
   - Add `src/app/editor/generator/schema/` as the single TypeScript source of truth covering: (a) the text opcode table (`exit`/`use`/`stor`/`load`/`jmp*`/`add`/`sub`/`div`/`mul`) and layout constants (`INSTRUCTION_SIZE=20`, `INSTRUCTION_LIST_SIZE=512`, `VARIABLE_LIST_SIZE=64`), (b) Otto motion commands (`forward`/`backward`/`right`/`left`/`speed`/`stop`), and (c) the binary BLE state readback struct (`RobotDevice.State`: version u8, flags u8, 4x trim i8, sensorDistance u16LE).
   - Refactor `opcode.ts`/`generator.ts` to read from this schema instead of hardcoding opcode strings, and refactor `robot.device.ts`'s `updateState()` to parse via schema-derived offsets/length instead of manual `getUint8` math (this is what caused the `RangeError: Offset is outside the bounds of the DataView` crash with the OLIB firmware).
   - Add a generator script (`scripts/generate-firmware-header.ts` + `npm run generate:firmware-header`) that emits a single generated C++ header (e.g. `generated/robot-protocol.h`) with the opcode constants and a packed struct for the state DTO, matching the firmware's existing `robot::interpreter` naming.
   - Commit the generated header in this repo (not fetched at firmware build time); add a version constant bumped on protocol changes; firmware repo maintainers copy the header in manually when updating. Add CI/pre-commit check that the committed header matches current schema output.
   - Reconciled: firmware's `INSTRUCTION_LIST_SIZE` is 512, so corrected README's stale "max 10000 lines" claim to 512 (canonical limit picked over updating firmware).
   - Add spec tests for the generator (schema → expected header snapshot) and for `opcode.ts` staying consistent with the schema table.