# ADR-005: Tighten sandbox network rules and point the `internal` marketplace at `main`

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

ADR-004 narrowed `.claude/settings.json` but its own Consequences section left several problems open,
and review of PR #4 confirmed them:

- `sandbox.network.allowedDomains` used `*.com`, which permits almost every `.com` host and is no
  narrower than the `*.*.com` it replaced.
- `sandbox.filesystem.allowWrite` was `./build`, but there is no build step (ADR-001), so the
  allowance was unused.
- The `internal` marketplace was pinned to `sameergijare/claude-training` at the feature branch
  `feature/responsetrain15`, which breaks once that branch is merged or deleted.
- `plugins-day8/.claude/settings.json` enabled `pr-check@internal`, duplicating the root
  `enabledPlugins` entry.
- `Bash(npm start *)` / `Bash(npm test *)` were unverified against the bare commands.

Alternatives considered: keeping the wildcard and accepting the risk (rejected: it defeats the
sandbox), and a local directory marketplace source (not adopted here; it would avoid network access
entirely and remains an option).

## Decision

Changes to `.claude/settings.json`:

- `permissions.allow` is `Bash(npm start)` and `Bash(npm test)` (bare forms).
- `sandbox.network.allowedDomains` is `registry.npmjs.org`, `github.com`, `api.github.com`.
- `sandbox.filesystem.allowWrite` is removed.
- `extraKnownMarketplaces.internal` points at `karthikrab/claude-training`, ref `main`, path
  `plugins-day8/.claude-plugin/marketplace.json`.

`plugins-day8/.claude/settings.json` is deleted. Everything else from ADR-002 and ADR-004 is unchanged.

Gotcha: `main` on `karthikrab/claude-training` has no `plugins-day8/` until PR #4 is merged, so
`pr-check@internal` will not resolve before then.

## Consequences

- The sandbox no longer allows arbitrary `.com` hosts. Any other host a command needs will be blocked
  and the allowlist must be extended.
- The marketplace no longer depends on a personal branch, but it still needs GitHub access at session
  start, so the "zero installs" tension from ADR-004 is reduced, not removed.
- Bare `npm test` / `npm start` no longer match with trailing arguments, so
  `npm test -- --something` will prompt.
- Until PR #4 merges, the plugin install fails; attendees on other branches see nothing from the plugin.
