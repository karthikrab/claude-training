# ADR-002: Restrict Claude Code's permissions for the training session

- **Status:** Accepted
- **Date:** 2026-11-09

## Context

Attendees run Claude Code against this repo live, during a one-hour session, often several people
against copies of the same repo at once. CLAUDE.md documents a specific demonstration: `.env`
"holds a fake value only... Training uses it to show that Claude is blocked from reading it, so
don't read it or work around that block." Left as prose, that's not enforcement — it's an
instruction Claude could misread or an attendee could edit away, and the demo would silently stop
working. The session also needs two other things balanced: attendees should be able to run
`npm test` / `npm start` (per CLAUDE.md's Commands section) without a permission prompt interrupting
the flow, but should be stopped before pushing to a shared remote, since multiple attendees may be
working against the same origin.

The alternative was to keep relying on CLAUDE.md's wording and Claude Code's own defaults. That
asks every attendee's Claude Code session to independently honor an instruction rather than an
enforced rule, and gives no way to allow routine commands while still gating risky ones.

## Decision

`.claude/settings.json` enforces these rules at the tool-permission layer:

- `permissions.deny` blocks `Read` on `./.env`, `./.env.*`, and `./secrets/**`, so the CLAUDE.md
  "Claude is blocked from reading it" demonstration holds regardless of prompt wording or what an
  attendee asks for.
- `permissions.allow` whitelists `Bash(npm run *)` so the test/start flows run without an
  interruption.
- `permissions.ask` requires confirmation before `Bash(git push *)`, since several attendees may
  share or fork the same remote during the hour.
- `sandbox.enabled` adds a second layer on top of the permission rules: filesystem writes are
  restricted to `/tmp/build`, and network access to an explicit domain allowlist
  (`registry.npmjs.org`, `*.*.com`).
- The same file also enables an external plugin marketplace (`acme-tools`, sourced from
  `github.com/acme-corp/claude-plugins`) with one plugin (`code-formatter`) turned on, and sets
  `plansDirectory` to `./plans`.

## Consequences

- The `.env`/secrets block now holds even if CLAUDE.md's wording changes later, or an attendee
  asks Claude to "just read the .env file" — enforcement lives in settings, not instructions.
- `sandbox.network.allowedDomains` includes the glob `*.*.com`, which is broader than it looks: it
  matches any two-label domain ending in `.com` (e.g. `anything.anywhere.com`), not just npm or
  Anthropic infrastructure. That's a wide allowance for a setting meant to lock things down, and
  it's easy to miss on a quick read of the file.
- Enabling the `acme-tools` marketplace and its `code-formatter` plugin pulls in a third-party,
  GitHub-hosted plugin at session start, which is in tension with this repo's own stated goal —
  "keeping setup to zero installs matters more than anything else" (CLAUDE.md) — and with
  ADR-001's "no framework, bundler or runtime dependencies... without a new ADR." What happens for
  an attendee without reachable GitHub access at session start is untested by this change.
- `sandbox.filesystem.allowWrite` is scoped to `/tmp/build`, a Unix-style path, on a repo that
  CLAUDE.md says attendees run "on Windows, macOS and Linux" — worth confirming this resolves
  sensibly on Windows before relying on it there.
