# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A small to-do app (plain HTML/CSS/JS) used for a one-hour Claude Code training session. Attendees run it on Windows, macOS and Linux, so keeping setup to zero installs matters more than anything else here.

## Commands

- `npm test`: run all tests (Node's built-in runner, `node --test tests/`). Needs Node 16.17+.
- `node --test tests/todos.test.js`: run one test file.
- `node --test --test-name-pattern="addTask" tests/`: run tests whose names match a pattern (needs Node 18.11+).
- `npm start`: serve the app at http://localhost:8000 (`python -m http.server 8000`, needs Python 3). `.claude/launch.json` has the same config as `todo-app`.

There is no build, lint or bundle step, and `npm install` installs nothing.

## Architecture

See `docs/adr/ADR-001-plain-js-no-build.md`. No framework, bundler or runtime dependencies. Don't add any without a new ADR.

- `todos.js` holds all task logic as **pure functions**. Each one returns a new array and never mutates its input. The same file runs in two environments:
  - Browser: loaded with a plain `<script>` tag before `app.js`, so its functions are globals.
  - Node/tests: exposed through the `if (typeof module !== "undefined") module.exports = {...}` block at the bottom.
  
  That means **no `import`/`export`** in `todos.js`. A new function has to be added to the `module.exports` object before tests can use it.
- `app.js` is the browser-only UI: DOM rendering, event wiring and `localStorage` persistence (key `training-todos`). All state changes go through `update(next)`, which swaps the `tasks` array and calls `render()`, and `render()` also saves. If storage is empty or invalid, the app falls back to `sampleTasks()`.
- A task looks like `{ id, text, done }`. Ids come from `makeTask` (a timestamp plus a random suffix in base 36).

## Testing notes

- Only `todos.js` is tested. There is no DOM test coverage, so check UI changes by hand in the browser.
- Tests use `node:test` and `node:assert` with CommonJS `require`.

## Environment

- `.env` (copied from `.env.example`) holds a fake value only. Training uses it to show that Claude is blocked from reading it, so don't read it or work around that block.
- The README mentions `training/templates/` (finished lab files, including a reference `CLAUDE.md`), but that directory is not in this checkout.
