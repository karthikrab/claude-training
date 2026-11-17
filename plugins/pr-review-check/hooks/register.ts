import type { EngineInterface, Register } from 'claude-code'

// PR review checks for the claude-training to-do app.
// /pr-check runs them and prints a report; `gh pr create` is refused while any fails.

type Check = { name: string; status: 'pass' | 'fail' | 'warn'; detail?: string }

const PR_CREATE = /\bgh\s+pr\s+create\b/

async function git($: EngineInterface, args: string[]) {
  return $.process.run(['git', ...args])
}

async function readOrNull($: EngineInterface, path: string) {
  try {
    return await $.fs.read(path)
  } catch {
    return null
  }
}

async function findBase($: EngineInterface) {
  for (const ref of ['origin/main', 'main']) {
    const r = await git($, ['merge-base', 'HEAD', ref])
    if (r.exitCode === 0 && r.stdout.trim()) return { ref, sha: r.stdout.trim() }
  }
  return null
}

async function runChecks($: EngineInterface): Promise<{ base: string; checks: Check[] } | null> {
  const todos = await readOrNull($, 'todos.js')
  if (todos === null) return null // not this repo: nothing to check

  const checks: Check[] = []
  const base = await findBase($)
  if (!base) {
    checks.push({ name: 'Find base branch', status: 'fail', detail: 'no merge-base with origin/main or main' })
  }

  // Files changed against the base, committed or not, plus untracked files.
  const changed = new Set<string>()
  if (base) {
    const diff = await git($, ['diff', '--name-only', base.sha])
    diff.stdout.split('\n').filter(Boolean).forEach(f => changed.add(f))
  }
  const untracked = await git($, ['ls-files', '--others', '--exclude-standard'])
  untracked.stdout.split('\n').filter(Boolean).forEach(f => changed.add(f))

  // 1. Tests pass.
  const test = await $.process.run(['npm', 'test'], { timeoutMs: 120_000 })
  const failLine = (test.stdout + test.stderr).split('\n').find(l => /^(#|ℹ) fail \d+/.test(l))
  checks.push(
    test.exitCode === 0
      ? { name: 'npm test passes', status: 'pass' }
      : { name: 'npm test passes', status: 'fail', detail: failLine?.trim() ?? `exit code ${test.exitCode}` },
  )

  // 2. todos.js stays loadable by a plain <script> tag: no import/export.
  const esm = todos.split('\n').filter(l => /^\s*(import|export)\b/.test(l))
  checks.push(
    esm.length === 0
      ? { name: 'todos.js has no import/export', status: 'pass' }
      : { name: 'todos.js has no import/export', status: 'fail', detail: esm[0]!.trim() },
  )

  // 3. Every top-level function in todos.js is in the module.exports block.
  const exportsBlock = todos.slice(todos.indexOf('module.exports'))
  const fns = [...todos.matchAll(/^function\s+(\w+)/gm)].map(m => m[1]!)
  const missing = fns.filter(fn => !new RegExp(`\\b${fn}\\b`).test(exportsBlock))
  checks.push(
    todos.includes('module.exports') && missing.length === 0
      ? { name: 'todos.js functions are exported', status: 'pass' }
      : { name: 'todos.js functions are exported', status: 'fail', detail: `missing: ${missing.join(', ') || 'module.exports block'}` },
  )

  // 4. ADR-001: no runtime or dev dependencies.
  const pkgText = await readOrNull($, 'package.json')
  let deps: string[] = []
  try {
    const pkg = JSON.parse(pkgText ?? '{}')
    deps = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]
  } catch {
    deps = ['(package.json does not parse)']
  }
  checks.push(
    deps.length === 0
      ? { name: 'No dependencies (ADR-001)', status: 'pass' }
      : { name: 'No dependencies (ADR-001)', status: 'fail', detail: deps.join(', ') },
  )

  // 5. .env is never committed or added.
  const envTracked = (await git($, ['ls-files', '.env'])).stdout.trim()
  checks.push(
    envTracked || changed.has('.env')
      ? { name: '.env not committed', status: 'fail', detail: '.env is tracked or staged' }
      : { name: '.env not committed', status: 'pass' },
  )

  // 6. Logic changes come with test changes (warning only).
  if (changed.has('todos.js')) {
    const testsTouched = [...changed].some(f => f.startsWith('tests/'))
    checks.push(
      testsTouched
        ? { name: 'todos.js change has tests', status: 'pass' }
        : { name: 'todos.js change has tests', status: 'warn', detail: 'todos.js changed but nothing in tests/' },
    )
  }

  // 7. UI changes need a manual browser check (no DOM tests).
  const ui = ['app.js', 'index.html', 'style.css'].filter(f => changed.has(f))
  if (ui.length > 0) {
    checks.push({ name: 'UI checked in browser', status: 'warn', detail: `${ui.join(', ')} changed: verify by hand (npm start)` })
  }

  return { base: base?.ref ?? 'unknown', checks }
}

function report(base: string, checks: Check[]) {
  const mark = { pass: '✔', fail: '✘', warn: '!' } as const
  const lines = checks.map(c => `${mark[c.status]} ${c.name}${c.detail ? ` — ${c.detail}` : ''}`)
  const fails = checks.filter(c => c.status === 'fail').length
  const warns = checks.filter(c => c.status === 'warn').length
  const verdict = fails > 0 ? `${fails} failing` : warns > 0 ? `ready, ${warns} warning(s)` : 'ready'
  return `PR check against ${base}: ${verdict}\n${lines.join('\n')}`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'pr-check',
      description: 'Run the PR review checks for this repo',
    })
    return next(e)
  })

  on('command.run', { command: 'pr-check' }, async $ => {
    $.ui.status('pr-check: running…')
    try {
      const run = await runChecks($)
      if (!run) return { text: 'pr-check: no todos.js here, so this is not the training repo.' }
      const text = report(run.base, run.checks)
      return { text, context: [text] }
    } finally {
      $.ui.status(undefined)
    }
  })

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    if (!PR_CREATE.test(e.command)) return next(e)
    const run = await runChecks($)
    if (!run || run.checks.every(c => c.status !== 'fail')) return next(e)
    return { deny: `${$.plugin.name}: PR checks failed, fix these before opening the PR.\n${report(run.base, run.checks)}` }
  }).catch(($, e, next) => (next.called ? next(e) : { deny: `${$.plugin.name}: its PR check failed to run.` }))
}
