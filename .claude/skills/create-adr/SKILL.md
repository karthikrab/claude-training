---
name: create-adr
description: Document a new architectural decision as an ADR in docs/adr/. Use when a significant decision was just made or confirmed — one that chose an approach over real alternatives, has non-obvious consequences, or encodes a constraint a future contributor would want to understand. Also use after a refactor or architectural change has landed (or is staged/uncommitted) and the reasoning behind it is worth preserving.
---

# Create ADR

Document a new architectural decision as an ADR in `docs/adr/` (singular — this repo does not use
`docs/adrs/`, has no index/README, and has no `npm run check:adrs` script; those belong to a
different project's template and do not apply here).

Before relying on anything below, open the lowest-numbered file in `docs/adr/` and confirm the
format is still what this skill describes. Conventions drift, and a skill that silently assumes a
stale format produces an ADR that looks right but doesn't match its neighbors — which is exactly
what happened to an earlier version of this skill (it assumed `docs/adrs/`, four-digit numbers, and
an index, none of which this repo has). If what's on disk disagrees with this file, trust the disk
and say so.

## When to create an ADR

An ADR is warranted when a decision:

* Chose one approach over meaningful alternatives (not just "we used the default")
* Has non-obvious consequences that a future contributor would want to understand
* Involves a tradeoff that could be revisited (so the original reasoning should be recorded)
* Fixes a non-obvious constraint (a bug workaround, a platform quirk, a security requirement, or a
  training-session requirement like the zero-install setup in `CLAUDE.md`)

Skip trivial implementation details, stylistic choices, and decisions that are self-evident from
reading the code. If the change is pure cleanup, a rename, or otherwise self-evident, say so
directly and don't force a draft — report that no ADR is warranted and briefly why.

## Figuring out what changed

If the user named the decision, use that. Otherwise work out the actual diff before drafting
anything:

* Uncommitted work: `git status` and `git diff` (and `git diff --staged`).
* A specific range or branch: `git diff <base>...<head>` or `git log -p <range>`.
* Nothing specific given: check `git status` first; if the tree is clean, diff the current branch
  against its merge base with main (`git merge-base main HEAD`), falling back to `git show HEAD` for
  the most recent commit if that range is empty.
* A path with no git history at all (newly added and entirely untracked — `git status` shows `??`
  and `git log --all -- <path>` returns nothing): there is no "before" to diff against, so read the
  current file as the only state and look for other evidence of what changed and why — a related
  lock/manifest file (e.g. `skills-lock.json` recording where an installed skill came from), a
  comment or README nearby, or the conversation that led here.

Read the files touched by the diff (not just the patch) when you need surrounding context — a diff
hunk alone often doesn't explain *why*, and this repo's pure-function style (see `todos.js`)
especially rewards reading the whole function, not just the changed lines.

## Process

1. **Identify the decision** using the diff-reading approach above.

2. **Check for duplicates.** List `docs/adr/` and scan existing titles (there is no index file to
   read instead). If the decision is already covered, update the existing ADR rather than creating
   a new one.

3. **Verify against current code.** Before writing, confirm the decision is actually reflected in
   the codebase — read the relevant file(s) and grep for the key patterns. Do not document a
   decision that has already been reversed.

4. **Determine the next ADR number.** List `docs/adr/`, take the highest existing three-digit
   number, and add one, zero-padded to three digits (`ADR-NNN`).

5. **Write the ADR file** at `docs/adr/ADR-NNN-kebab-case-title.md` using the template below.

There is no index file to update afterward — every ADR here lives only as its own file.

## ADR template

```markdown
# ADR-NNN: Title

- **Status:** Accepted
- **Date:** YYYY-MM-DD

## Context

What situation or constraint made this decision necessary? What alternatives were considered and why
were they inadequate? Name the alternatives explicitly — "we considered X and Y" is more useful than
a blank "we needed Z."

## Decision

What was decided, and exactly how is it implemented? Cite the key files/lines. If the decision has
gotchas or non-obvious invariants, call them out here (not in Consequences).

## Consequences

Be honest about the downsides — an ADR with only upsides is not credible and not useful.
```

## Status values

* **Accepted** — in force right now
* **Superseded by ADR-NNN** — replaced; link to the successor
* **Deprecated** — no longer in force but not replaced by a specific decision

Never renumber, rename, or delete an existing ADR file, including one being superseded — add a new
one and update the old one's status to point at it.

## Output

After creating the ADR, print a one-paragraph summary of what was documented and why it merited an
ADR rather than just a code comment — name the alternative(s) that were passed over.
