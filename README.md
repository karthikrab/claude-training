# claude-training
training session

A small to-do app (plain HTML/CSS/JS, no dependencies) used for the Claude Code training session.

## Setup

Needs Node 16.17+ and Python 3.

```bash
npm install
cp .env.example .env
```

`.env` holds a fake value only. It exists so you can check that Claude is blocked from reading it.

## Commands

- `npm test` – run the tests in `tests/`
- `npm start` – serve the app at http://localhost:8000

## Files

- `index.html`, `style.css` – page markup and styles
- `todos.js` – task logic as pure functions (tested)
- `app.js` – browser UI: rendering, events, localStorage
- `tests/` – Node tests for `todos.js`
- `docs/adr/` – architecture decision records

## Falling behind?

`training/templates/` holds finished copies of the four lab files. Copy any of them to the same path at the repo root:

| Template | Copy to |
| --- | --- |
| `training/templates/CLAUDE.md` | `CLAUDE.md` |
| `training/templates/.claude/settings.json` | `.claude/settings.json` |
| `training/templates/docs/adr/ADR-002-claude-code-setup.md` | `docs/adr/ADR-002-claude-code-setup.md` |
| `training/templates/tests/todos.test.js` | `tests/todos.test.js` (Lab 3 answer) |

After copying `.claude/settings.json`, start a new Claude Code session so it picks up the permission rules.
