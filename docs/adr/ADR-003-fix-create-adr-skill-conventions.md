# ADR-003: Fix the create-adr skill's conventions instead of retiring it

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

This repo already has a read-only `adr-writer` subagent (`.claude/agents/adr-writer.md`) that drafts
ADRs matching this repo's real conventions — `docs/adr/` (singular), three-digit `ADR-NNN` numbers,
the `- **Status:** / - **Date:**` bullet template, no index/README — and refuses to write files by
design: "You are read-only with respect to the repo: you have no Write or Edit tool... nothing is
saved until the caller copies the draft into docs/adr/ by hand."

A second, independent `create-adr` skill (`.claude/skills/create-adr/SKILL.md`) existed for the same
job but was installed from an external template. `skills-lock.json` records its source as
`KyleMit/Splotch` (`.agents/skills/create-adr/SKILL.md`) with a `computedHash` fixed at install
time. That template assumed a different project's conventions: `docs/adrs/` (plural), four-digit ADR
numbers, and an index/checker script (`npm run check:adrs`) — none of which exist here. Reading the
two ADRs that actually exist, `docs/adr/ADR-001-plain-js-no-build.md` and
`docs/adr/ADR-002-restrict-claude-code-permissions.md`, confirms the real format: `docs/adr/`
singular, three-digit numbers, the Status/Date bullet template, and no index file anywhere in the
repo. Left uncorrected, the installed skill would have produced an ADR that looked plausible but
landed in the wrong directory with the wrong numbering scheme and an unwanted index — out of step
with every ADR already in this repo.

Two remedies were considered and rejected in favor of a third:

- **Leave the skill as installed.** Rejected: the first real use would produce a wrong artifact
  (wrong directory, wrong numbering, possibly a spurious index file) that a reviewer has to catch
  and undo after the fact, rather than catching the mismatch up front.
- **Retire the skill and rely only on the `adr-writer` subagent**, since it already encodes the
  correct conventions. Rejected: the subagent is deliberately read-only and can never by itself
  produce a saved ADR file — someone still has to copy its printed draft into `docs/adr/` by hand
  every time. The skill is the only one of the two that can place the file on disk itself. Retiring
  it would remove the only self-serve, file-writing path and leave manual copy-paste as the sole
  option for every future ADR.

## Decision

`.claude/skills/create-adr/SKILL.md` was rewritten in place to match this repo's actual, established
conventions instead of the external template's: `docs/adr/` (singular), three-digit `ADR-NNN`
numbers, the `- **Status:** / - **Date:**` bullet template, and no README/index file. The rewritten
skill now explicitly tells the reader to open the lowest-numbered file in `docs/adr/` and confirm the
format before trusting the skill's own description, and to trust the disk over the skill file if they
disagree — documenting, inside the skill itself, the exact kind of drift that happened here.

Both the skill and the `adr-writer` subagent now independently encode the same corrected
conventions. This was cross-checked by reading `docs/adr/ADR-001-plain-js-no-build.md` and
`docs/adr/ADR-002-restrict-claude-code-permissions.md` side by side with both
`.claude/skills/create-adr/SKILL.md` and `.claude/agents/adr-writer.md` — all four agree on the
three-digit, no-index, Status/Date-bullet format.

`skills-lock.json` still records the skill's source as `KyleMit/Splotch` and a `computedHash` taken
at install time (`43617f29...`). That hash no longer matches the file now on disk (recomputed as
`d4009fad...`), because the content was hand-edited after installation to apply this fix.

## Consequences

- There are now two independent tools that both claim to create ADRs for this repo, with different
  capabilities: the skill can write `docs/adr/` files directly; the subagent only ever prints a
  draft for a human to save. Keeping both means their conventions have to be kept in sync by hand —
  if this repo's ADR format changes again, both files need a separate edit, and nothing enforces
  that they stay identical.
- `skills-lock.json`'s `computedHash` for `create-adr` is now stale relative to the file on disk.
  Any future skill-sync tooling that trusts that hash — to detect local modification, or to refresh
  the skill from `KyleMit/Splotch` — could flag this file as corrupted, or silently overwrite this
  repo-specific fix with the original mismatched template. Nothing in this repo today recomputes or
  re-pins that hash after a manual edit.
- The correction was verified against only the two ADRs that exist today (ADR-001, ADR-002). Both
  the skill and the subagent hard-code "read `docs/adr/ADR-001-...`" as their format reference, so if
  a future ADR legitimately deviates from that format, both files need re-verification, not just one.
