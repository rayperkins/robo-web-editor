# Copilot Instructions: Robo Web Editor

- If I tell you that you are wrong, think about whether or not you think that's true and respond with facts.
- Avoid apologizing or making conciliatory statements.
- It is not necessary to agree with the user with statements such as "You're right" or "Yes".
- Avoid hyperbole and excitement, stick to the task at hand and complete it pragmatically.

## Project overview

This repo is a **client-only Angular web app** — a [Blockly](https://github.com/google/blockly)-based visual
editor that compiles block programs into a bytecode instruction format and streams it to a robot over
**Web Bluetooth (BLE)**. There is no backend/server; everything runs in the browser.

Firmware for compatible robots (the BLE communication layer and per-robot variants, e.g. Otto-based robots) lives
in a **separate repository**. This repo only owns the editor and the wire protocol contract it compiles down to.
When changing the instruction/opcode format, keep [README.md](/home/rayperkins/repos/personal/robo-web-editor/README.md)'s
"Blockly to firmware instruction format" section, [opcode.ts](/home/rayperkins/repos/personal/robo-web-editor/src/app/editor/generator/opcode.ts)
and [generator.ts](/home/rayperkins/repos/personal/robo-web-editor/src/app/editor/generator/generator.ts) consistent with each other, and
call out in your summary that the paired firmware repo will also need updating.

### Repo layout

- [src/app/editor/](/home/rayperkins/repos/personal/robo-web-editor/src/app/editor) — Blockly workspace host component, block/toolbox config (`config.blocks.ts`, `config.toolbox.ts`), and the `generator/` folder that compiles the workspace into opcode strings.
- [src/app/otto/](/home/rayperkins/repos/personal/robo-web-editor/src/app/otto) — `RobotService` (BLE device discovery) and `RobotDevice` (GATT connect/read/write) plus Otto-specific dialogs (remote control, calibration).
- [src/app/shared/](/home/rayperkins/repos/personal/robo-web-editor/src/app/shared) — cross-feature dialogs not tied to a specific robot type (e.g. disconnect confirmation).
- [src/app/logger.ts](/home/rayperkins/repos/personal/robo-web-editor/src/app/logger.ts) — thin wrapper around `console.log` used by the BLE layer; prefer it over raw `console.log` in code you touch under `otto/`.
- [src/styles/](/home/rayperkins/repos/personal/robo-web-editor/src/styles) — global styles: Angular Material M3 theme setup (`app.scss`) plus hand-rolled flexbox/margin/padding utility classes (`flex.scss`, `margin.scss`, `padding.scss`, prefixed `fx-`/`m-`/`p-`). There is no Tailwind CSS in this project.
- [e2e/](/home/rayperkins/repos/personal/robo-web-editor/e2e) — Playwright end-to-end tests, run against a served build.

## I. TypeScript Style

1.  **Variables:** `const` by default, `let` if reassignment is needed. Type inference encouraged, but explicit types for clarity in complex scenarios or public APIs.
2.  **Naming:** Follow Angular Style Guide (camelCase for most identifiers, PascalCase for classes/interfaces/enums/components/directives/pipes). Note the codebase is not fully consistent: top-level feature components use `*.component.ts`, while dialog components (e.g. `otto-calibrate-dialog.ts`) omit the `.component` suffix — match whichever pattern the surrounding folder already uses rather than introducing a third convention.
3.  **Formatting:** Follow Prettier conventions (integrate with your editor).
4.  **Nulls/Undefined:** Use strict null checking. Leverage optional chaining (`?.`) and nullish coalescing (`??`).
5.  **Strings:** Template literals (` `` `) for embedding expressions.
6.  **RxJS:** This project pins `rxjs ~6.6.3` (not v7+) — `toPromise()` and other v6 APIs are still valid; do not introduce v7/v8-only operators or assume `firstValueFrom`/`lastValueFrom` are available without checking `node_modules`.
7.  **Async/Await:** Fine for internal Promise-based code (e.g. wrapping `navigator.bluetooth`/GATT calls), but public service APIs in this codebase expose `Observable`s, not Promises — keep that boundary when adding methods to `RobotService`/`RobotDevice`.

## II. Angular Code Structure

1.  **Standalone components only** — this app uses Angular 20 with standalone components everywhere; there are no `NgModule`s. New components should follow the existing pattern of an explicit `imports: [...]` array in the `@Component` decorator (only import the specific `MatXModule`s actually used).
2.  **Component Files:** Separate `.html` template and `.scss` stylesheet per component (via `templateUrl`/`styleUrls`) — this is the established pattern, do not inline templates/styles.
3.  **Component Architecture:** `AppComponent` is the container that owns BLE connection state (`connectedDevice`) and dialog orchestration; `EditorComponent` and the Otto dialogs are presentational/feature components that receive the connected device via `input()`/dialog `data`. Follow this smart/dumb split for new features.
4.  **Services:** Injectable, `providedIn: 'root'`, used for BLE/business logic and RxJS-based state — see `RobotService`.
5.  **Error Handling:** BLE `Observable`s should emit through `error()` (not throw) so calling components can handle failures via the `error` callback of `subscribe()`, matching `RobotDevice`'s existing methods.

## III. State Management (RxJS in Services)

1.  Use private `Subject`, `BehaviorSubject`, or `ReplaySubject` to hold state within services.
2.  Expose state as public, read-only `Observable` properties (or return `Observable`s from methods, as `RobotService.discover()` and `RobotDevice` do).
3.  Components subscribe to these Observables to observe state changes.

## IV. Robot Communication (Web Bluetooth, not HTTP)

There is no `HttpClient`/REST API in this app — all "data fetching" is a Web Bluetooth GATT session against the
connected robot.

1.  `RobotService` discovers devices via `navigator.bluetooth.requestDevice` filtered by name prefix and the UART service UUID (`RobotDevice.UartServiceUuid`); `RobotDevice` owns the GATT server/characteristic and exposes `connect()`, `sendCommand(s)()`, `updateState()` as `Observable`s.
2.  Web Bluetooth only works in Chromium-based browsers (Chrome/Edge) and requires a secure context (HTTPS or `localhost`). Do not assume Firefox/WebKit support when adding BLE-dependent features — this is also why the Playwright config exercises multiple browser engines only for non-BLE UI checks.
3.  The `Start devtunnel` VS Code task (`devtunnel host -p 3000 --allow-anonymous`) exists specifically to get an HTTPS URL for testing BLE flows from a phone/other device during dev — mention it when a change needs manual on-device verification.
4.  Commands sent to the robot are plain UTF-8 text opcodes built by `Opcode`/`CodeGenerator` (see the "Blockly to firmware instruction format" section of the README) — keep new opcodes' string format and 20-byte packet size constraint in mind.

## V. Testing

1.  Unit tests run via `npm test` (Karma + Jasmine, config in [karma.conf.js](/home/rayperkins/repos/personal/robo-web-editor/karma.conf.js)), but there are currently **no unit spec files under `src/`** — the harness is configured but unused. When adding non-trivial logic (especially in `generator/`, `robot.device.ts`), add a `*.spec.ts` alongside it using Angular `TestBed`/Jasmine rather than assuming existing coverage.
2.  E2E tests run via `npm run e2e` (Playwright, config in [playwright.config.ts](/home/rayperkins/repos/personal/robo-web-editor/playwright.config.ts), specs under `e2e/`). Currently only the default scaffolded title-check test exists — treat this as a gap, not a template to copy verbatim, when asked to add real E2E coverage.
3.  Mock dependencies to isolate units under test (`jasmine.createSpyObj()`). BLE (`navigator.bluetooth`) cannot run in CI/headless test environments — mock `RobotService`/`RobotDevice` rather than exercising real Bluetooth in tests.

## VI. Security

1.  **XSS Prevention:** Use Angular's security context and `DomSanitizer` if any dynamic/untrusted HTML is ever rendered (none currently is — Blockly renders into its own canvas).
2.  No CSRF/session concerns — there is no backend. The main platform security constraint is Web Bluetooth's secure-context (HTTPS/localhost) and user-gesture requirements for `requestDevice()`.
3.  **Input Validation:** Validate any user-entered numeric/opcode values before encoding them into the 16-bit instruction format (range -32,768 to +32,767) described in the README.
4.  Keep Angular and dependencies updated.

## VII. Build, Run and Deployment

1.  `npm install` then `npm run start` serves the dev server on port 3000 (`http://localhost:3000/`, host `0.0.0.0`, host-check disabled — see the `start` script in [package.json](/home/rayperkins/repos/personal/robo-web-editor/package.json)).
2.  `npm run build` (`ng build`) builds to `dist/robo-web-editor`; the production config enables AOT, optimization, and output hashing (see [angular.json](/home/rayperkins/repos/personal/robo-web-editor/angular.json)).
3.  Deployment is via [.github/workflows/deploy.yml](/home/rayperkins/repos/personal/robo-web-editor/.github/workflows/deploy.yml): on push to `main`, it runs `ng build --base-href "/robo-web-editor/"` and publishes `dist/robo-web-editor/browser` to the `gh-pages` branch (GitHub Pages). Keep the `--base-href` in sync with the repo name if it's ever renamed.
4.  The devcontainer ([.devcontainer/](/home/rayperkins/repos/personal/robo-web-editor/.devcontainer)) is Node-only now that firmware/PlatformIO tooling has been removed from this repo — don't reintroduce C++/CMake/PlatformIO tooling here; that belongs in the separate firmware repo.

## VIII. Styling

1.  Styling is **Angular Material (M3 theming via `@use '@angular/material' as mat;` in `app.scss`) plus SCSS**, with a set of hand-rolled utility classes for layout (`fx-*` flex helpers, `m-*`/`p-*` margin/padding helpers) in [src/styles/](/home/rayperkins/repos/personal/robo-web-editor/src/styles). There is no Tailwind CSS in this project — do not introduce it or assume Tailwind utility classes are available.
2.  Keep per-component `.scss` files for component-specific styles; use the shared utility classes for common layout instead of duplicating flex/spacing rules per component.