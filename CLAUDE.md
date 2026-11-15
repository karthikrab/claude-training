# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A small to-do app in plain HTML/CSS/JS used for a one-hour Claude Code training session. There is no framework, bundler, or runtime dependency, and that is deliberate (see `docs/adr/ADR-001-plain-js-no-build.md`). Attendees clone the repo onto Windows, macOS, or Linux, so do not add a toolchain, build step, or npm dependency.

## Commands

- Run all tests: `node --test tests/*.js` (or bare `node --test`, which finds `tests/*.test.js` and `tests/test.js` automatically)
- Run one file: `node --test tests/todos.test.js`
- Run tests by name: `node --test --test-name-pattern="addTask" tests/*.js`
- Serve the app: `npm start` (runs `python -m http.server 8000`, then open http://localhost:8000). `.claude/launch.json` defines the same server as `todo-app` for the preview pane.

`npm test` runs `node --test tests/`. That command only works on Node 16–20. On Node 21+ a bare directory argument fails with `Cannot find module '.../tests'`, so use the commands above instead.

There is no linter or build.

## Architecture

The page loads two classic `<script>` tags in order: `todos.js` and then `app.js`. There are no ES modules.

- `todos.js` holds all task logic as **pure functions**. Each one returns a new array and never mutates its input (`addTask`, `toggleTask`, `removeTask`, `clearDone`, `filterTasks`, `countRemaining`, `sampleTasks`). In the browser these become globals. In Node they're exported through a guarded `if (typeof module !== "undefined") module.exports = {...}`. Any new function must be added to that export block so tests can reach it, and the file must not use `import`/`export`.
- `app.js` is the DOM layer. It keeps module-level `tasks` and `filter` state. Every change goes through `update(next)`, which calls `render()`, and `render()` rebuilds the whole list and **saves to localStorage** under the key `training-todos`. If saved data is missing or invalid, `load()` falls back to `sampleTasks()`.
- A task looks like `{ id, text, done }`. `makeTask` builds the `id` from a timestamp and a random suffix.

Tests use only Node's built-in `node:test` and `node:assert` and cover `todos.js` alone. Nothing tests the DOM, so check UI changes by hand in the browser. Tests depend on `SAMPLE_TASKS` having 5 entries with only the first one done; if you change the sample data, update the tests too.

## Repo notes

- `.env` is gitignored and holds a fake value. The training uses it to show that Claude is blocked from reading it, so don't read it.
- `docs/adr/` holds architecture decision records (`ADR-NNN-title.md`, with Status/Date/Context/Decision/Consequences). Write a new ADR for any significant architectural change.
- The README mentions a `training/templates/` folder of lab answers, but that folder doesn't exist in this checkout.
