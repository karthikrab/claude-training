# ADR-001: Plain HTML/CSS/JS with no build step

- **Status:** Accepted
- **Date:** 2026-11-02

## Context

This repo is used in a one-hour Claude Code training session. Attendees clone it on their own laptops,
so setup has to be near-instant and work on Windows, macOS and Linux without a toolchain install.

## Decision

The app is plain HTML, CSS and JavaScript with no framework, bundler or runtime dependencies.

- Task logic lives in `todos.js` as pure functions so it can be tested in Node.
- The browser UI lives in `app.js` and loads `todos.js` with a plain `<script>` tag.
- Tests use Node's built-in runner (`node --test`), so `npm install` installs nothing.
- The app is served with `python -m http.server 8000`.

## Consequences

- Setup is `git clone` plus `npm test`; nothing can fail to install.
- `todos.js` cannot use `import`/`export`; it exposes functions as globals in the browser and through
  `module.exports` in Node.
- There is no DOM test coverage. UI changes are checked by hand in the browser.
