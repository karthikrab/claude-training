# pr-review-check

Runs the claude-training repo's PR review rules before a pull request is opened. Claude Code cannot run `gh pr create` while any rule fails. It gets the list of failures instead and must fix them first.

## Install

Type this at the Claude Code prompt in a terminal:

```
/plugin install pr-review-check --marketplace karthikrab/claude-training
```

Answer `y` to add the marketplace, then press Enter to install for your user. The plugin starts working in that session with no restart.

From a shell:

```bash
claude plugin install pr-review-check --marketplace karthikrab/claude-training
```

In the desktop app: click **+** next to the prompt box, then **Plugins** → **Add marketplace** with `karthikrab/claude-training`, then **Add plugin**.

If the repository is private, you need read access on GitHub and a git credential for github.com on your machine (an SSH key, or `gh auth login` then `gh auth setup-git`).

**Trying a local change** before it's pushed: `claude --plugin-dir plugins/pr-review-check`

## Usage

- **`/pr-check`** runs every check against `origin/main` (or `main` if there's no remote) and prints a report. The changes it checks include uncommitted and untracked files.
- **Automatic gate:** when Claude runs `gh pr create`, the checks run first. If any of them **fails**, the command is blocked. Warnings don't block.

The plugin only acts in a folder that has a `todos.js`, so it stays out of the way in other repositories.

## Rules

Blocking (✘ fails the PR):

| Rule | Why |
| --- | --- |
| `npm test` passes | No broken logic reaches review |
| `todos.js` has no `import`/`export` | It loads via a plain `<script>` tag in the browser (see CLAUDE.md) |
| Every top-level function in `todos.js` is in `module.exports` | Tests in Node can only reach exported functions |
| `package.json` has no `dependencies` / `devDependencies` | ADR-001: plain JS, no toolchain install |
| `.env` is not tracked or staged | It holds a key, even if fake in training |

Warnings (! shown, not blocking):

- `todos.js` changed but nothing in `tests/` changed.
- `app.js`, `index.html` or `style.css` changed. There are no DOM tests, so check the UI by hand with `npm start`.

## Example output

```
PR check against origin/main: 1 failing
✔ npm test passes
✔ todos.js has no import/export
✘ todos.js functions are exported — missing: archiveTask
✔ No dependencies (ADR-001)
✔ .env not committed
! todos.js change has tests — todos.js changed but nothing in tests/
```

## Requirements

- Claude Code 2.1.325 or later
- `git`, `node` (16.17+) and `npm` on the PATH
- To open PRs: the GitHub CLI, `gh`

## Limits

- The gate catches `gh pr create` run by Claude. It does not catch a PR opened from the GitHub website or from your own terminal.
- `npm test` gets 2 minutes before it is stopped and counted as failed.
