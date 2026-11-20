# ADR-002: Restrict Claude Code's permissions for the training session

- **Status:** Superseded by ADR-004 (the npm allow rule, sandbox paths/domains and marketplace; the
  `.env`/secrets deny and `git push` ask rules carry forward unchanged)
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
- `permissions.allow` whitelists the npm start/test commands (see ADR-004/ADR-005 for the current patterns) so the test/start flows run without an
  interruption.
- `permissions.ask` requires confirmation before `Bash(git push *)`, since several attendees may
  share or fork the same remote during the hour.
- `sandbox.enabled` adds a second layer on top of the permission rules: network access is
  restricted to an explicit domain allowlist (current values in ADR-005).
- The same file sets `plansDirectory` to `./plans`; marketplace and plugin settings are covered in
  ADR-004 and ADR-005.

## Consequences

- The `.env`/secrets block now holds even if CLAUDE.md's wording changes later, or an attendee
  asks Claude to "just read the .env file" — enforcement lives in settings, not instructions.
- The original version of this ADR shipped with a `*.*.com` network wildcard, a third-party `acme-tools`
  marketplace and a Unix-only `/tmp/build` write path. Those were fixed in ADR-004 and ADR-005, which
  describe the current settings; the details are no longer repeated here.
