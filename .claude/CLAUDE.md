# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A small to-do app in plain HTML/CSS/JS, used for a one-hour Claude Code training session. It has no framework, bundler or runtime dependencies (see `docs/adr/ADR-001-plain-js-no-build.md`). Keep it that way: attendees clone it on Windows, macOS and Linux and must be able to run it with no toolchain install.

## Commands

- `npm test`: runs all tests with Node's built-in runner (`node --test tests/`)
- `node --test --test-name-pattern="addTask" tests/todos.test.js`: runs a single test by name
- `npm start`: serves the app at http://localhost:8000 (`python -m http.server 8000`; also the `todo-app` config in `.claude/launch.json`)

There is no lint or build step.

## Architecture

- `todos.js` holds all task logic as **pure functions** that return new arrays and never mutate their input. It is shared by the browser and the tests, so it **cannot use `import`/`export`**. In the browser its functions are globals, loaded by a plain `<script>` tag before `app.js`. In Node they are exposed through the `if (typeof module !== "undefined") module.exports = {...}` block at the bottom. When you add a function, add it to that export block too.
- `app.js` is the browser UI. It keeps `tasks` and `filter` in module state, and every change goes through `update(next)`, which re-renders the whole list. `render()` also saves to localStorage under the key `training-todos`. If nothing is saved, the task list starts from `sampleTasks()`.
- Tests in `tests/` cover only `todos.js`. There is no DOM test coverage, so check UI changes by hand in the browser.
- Architecture decisions are recorded as ADRs in `docs/adr/` (`ADR-NNN-title.md`).

## Training notes

- `.env` (copied from `.env.example`) holds a fake key, and nothing in the app reads it. It exists so the training can show that Claude is blocked from reading it. Don't read or print it.
- The README mentions `training/templates/` with finished lab files (CLAUDE.md, `.claude/settings.json`, ADR-002, `tests/todos.test.js`). That directory is not in this checkout yet.
