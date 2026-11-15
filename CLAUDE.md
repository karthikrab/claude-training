# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A small to-do app in plain HTML/CSS/JS with no framework, bundler, or runtime dependencies, used for a one-hour Claude Code training session. Attendees clone it on Windows, macOS, and Linux, so setup must stay near-instant — see `docs/adr/ADR-001-plain-js-no-build.md` before adding any dependency or build step.

## Commands

- `npm test` — run all tests (`node --test tests/`, Node's built-in runner; no packages to install)
- `node --test --test-name-pattern="addTask" tests/` — run a single test by name (`--test-name-pattern` needs Node 18.11+, newer than the README's stated Node 16.17 minimum)
- `npm start` — serve the app at http://localhost:8000 (`python -m http.server 8000`; also defined as `todo-app` in `.claude/launch.json`). On machines where only `python3` exists (e.g. stock macOS), both fail with "python not found"; run `python3 -m http.server 8000` instead.

There is no lint or build step.

## Architecture

- `todos.js` holds all task logic as pure functions. Every function returns a new array and never mutates its input — keep it that way.
- `todos.js` is loaded two ways: by a plain `<script>` tag in `index.html` (functions become browser globals) and via `require` in the Node tests (through the guarded `module.exports` at the bottom). It therefore cannot use `import`/`export`, and any new function must be added to `module.exports` to be testable.
- `app.js` is the browser UI: it holds `tasks`/`filter` state, calls the `todos.js` globals, and re-renders the whole list on every change via `update()` → `render()`. `render()` also calls `save()`, which persists to `localStorage` under the key `training-todos`; `load()` falls back to `sampleTasks()` when nothing valid is saved.
- `index.html` must load `todos.js` before `app.js`.
- Tests cover only `todos.js`. There is no DOM test coverage; UI changes are checked by hand in the browser.

## Notes

- `.env` (copied from `.env.example`) holds a fake value that nothing in the app reads. It exists only as a target for checking that Claude is blocked from reading it — don't read or rely on it.
- Architecture decisions are recorded as ADRs in `docs/adr/` (`ADR-NNN-short-title.md`, with Status/Date, Context, Decision, Consequences).
- The README's "Falling behind?" section points to `training/templates/` (finished lab files: `CLAUDE.md`, `.claude/settings.json`, ADR-002, `tests/todos.test.js`), but that directory is not in this repo.
