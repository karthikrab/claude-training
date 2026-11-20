# ADR-004: Narrow Claude Code permissions and swap to the in-repo `internal` marketplace

- **Status:** Accepted
- **Date:** 2026-11-20

## Context

ADR-002 locked down `.claude/settings.json` for the training session, but its own Consequences
section flagged four problems with what it shipped:

- `Bash(npm run *)` allows any npm script, not just the two documented in CLAUDE.md.
- `sandbox.filesystem.allowWrite` was `/tmp/build`, a Unix path, on a repo attendees run on Windows.
- `sandbox.network.allowedDomains` included `*.*.com`, broader than it looks.
- The `acme-tools` marketplace (`acme-corp/claude-plugins`, plugin `code-formatter`) pulled in a
  third-party GitHub dependency, in tension with CLAUDE.md's "zero installs" priority and ADR-001.
  Nothing else in the repo referenced it, and no `acme-corp` code is used.

Alternatives considered: leaving the settings as they were and accepting the documented risks, or
removing the marketplace and plugin entirely. The repo now ships its own `pr-check` plugin under
`plugins-day8/` (see `plugins-day8/.claude-plugin/marketplace.json`), so the marketplace slot has a
real, first-party use and can be pointed at this repo instead.

## Decision

`.claude/settings.json` is changed as follows. Everything not listed here is unchanged from ADR-002
and remains in force: the `deny` rules on `./.env`, `./.env.*` and `./secrets/**`, the `ask` rule on
`Bash(git push *)`, `sandbox.enabled: true`, and `plansDirectory: ./plans`.

- `permissions.allow`: `Bash(npm run *)` becomes `Bash(npm start *)` and `Bash(npm test *)`, matching
  the two commands in CLAUDE.md.
- `extraKnownMarketplaces`: `acme-tools` is replaced by `internal`, sourced from this repo
  (`sameergijare/claude-training`, ref `feature/responsetrain15`, path
  `plugins-day8/.claude-plugin/marketplace.json`). `enabledPlugins` enables `pr-check@internal`
  instead of `code-formatter@acme-tools`.
- `sandbox.filesystem.allowWrite`: `/tmp/build` becomes `./build`, a relative path.
- `sandbox.network.allowedDomains`: `*.*.com` becomes `*.com`.
- `plugins-day8/.claude/settings.json` (new) also enables `pr-check@internal` for that subdirectory.

Gotcha: the marketplace `ref` is a feature branch, so the plugin only resolves while that branch exists
on GitHub. `git ls-remote` for it returned nothing when this ADR was written, so it may not be pushed
yet. `ref` should move to `main` once merged.

## Consequences

- The npm allowance now matches documented commands only; other scripts will prompt.
- The marketplace is first-party, which removes the third-party dependency from ADR-002. It still
  needs GitHub access at session start, so the "zero installs" tension is reduced, not gone.
- `./build` is portable across operating systems, but it is relative to the project and `build/` does
  not exist in this repo (there is no build step, per ADR-001), so the write allowance is effectively
  unused.
- `*.com` is not meaningfully narrower than `*.*.com`: it still permits a very wide set of `.com`
  hosts, and arguably reads as broader. The risk ADR-002 flagged is not resolved; it was reworded.
  Pinning explicit hostnames would fix it.
- Pointing the marketplace `ref` at a personal feature branch means attendees on other branches or
  forks will get this branch's plugin version, or a failure if it is deleted.
- The `allow` patterns `npm start *` / `npm test *` have not been checked against a bare `npm test`
  with no arguments; if that prompts, add the bare forms.
