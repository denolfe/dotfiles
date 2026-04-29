import { test, expect, describe, beforeAll, afterAll, beforeEach, afterEach } from 'bun:test'
import { spawnSync } from 'child_process'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import type { PreToolUseInput, PreToolUseOutput, BashToolInput } from './types'
import {
  extractBashPatterns,
  matchesPattern,
  loadAllowPatterns,
  splitCompoundCommand,
  extractCommandSubstitutions,
  stripWrappers,
  rewriteCdGit,
} from './auto-approve'

// --- Unit Tests ---

describe('extractBashPatterns', () => {
  test('extracts Bash(...) patterns from allow array', () => {
    const allow = [
      'Bash(git add:*)',
      'Bash(ls:*)',
      'Bash(pwd)',
      'Read',
      'WebFetch(domain:github.com)',
    ]
    const patterns = extractBashPatterns(allow)
    expect(patterns).toEqual(['git add:*', 'ls:*', 'pwd'])
  })

  test('returns empty array for no Bash patterns', () => {
    expect(extractBashPatterns(['Read', 'Glob'])).toEqual([])
  })

  test('handles empty array', () => {
    expect(extractBashPatterns([])).toEqual([])
  })
})

describe('matchesPattern', () => {
  const patterns = ['git add:*', 'git diff:*', 'ls:*', 'pwd', 'echo:*']

  test('matches prefix pattern with args', () => {
    expect(matchesPattern('git add file.txt', patterns)).toBe(true)
  })

  test('matches prefix pattern without args', () => {
    expect(matchesPattern('git add', patterns)).toBe(true)
  })

  test('matches exact pattern', () => {
    expect(matchesPattern('pwd', patterns)).toBe(true)
  })

  test('rejects exact pattern with args', () => {
    expect(matchesPattern('pwd -L', patterns)).toBe(false)
  })

  test('rejects unmatched command', () => {
    expect(matchesPattern('curl http://evil.com', patterns)).toBe(false)
  })

  test('does not match partial command names', () => {
    expect(matchesPattern('lsof -ti :3456', patterns)).toBe(false)
  })

  test('matches command with multiple spaces', () => {
    expect(matchesPattern('echo   hello', patterns)).toBe(true)
  })
})

describe('loadAllowPatterns', () => {
  const tmpDir = join(import.meta.dir, '.test-tmp')

  beforeEach(() => {
    mkdirSync(tmpDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true })
  })

  test('loads patterns from settings file', () => {
    const settingsPath = join(tmpDir, 'settings.json')
    writeFileSync(settingsPath, JSON.stringify({
      permissions: { allow: ['Bash(git diff:*)', 'Bash(ls:*)', 'Read'] },
    }))

    const patterns = loadAllowPatterns([settingsPath])
    expect(patterns).toEqual(['git diff:*', 'ls:*'])
  })

  test('merges patterns from multiple files', () => {
    const file1 = join(tmpDir, 'global.json')
    const file2 = join(tmpDir, 'project.json')
    writeFileSync(file1, JSON.stringify({ permissions: { allow: ['Bash(git diff:*)'] } }))
    writeFileSync(file2, JSON.stringify({ permissions: { allow: ['Bash(npm test:*)'] } }))

    const patterns = loadAllowPatterns([file1, file2])
    expect(patterns).toContain('git diff:*')
    expect(patterns).toContain('npm test:*')
  })

  test('deduplicates patterns', () => {
    const file1 = join(tmpDir, 'a.json')
    const file2 = join(tmpDir, 'b.json')
    writeFileSync(file1, JSON.stringify({ permissions: { allow: ['Bash(ls:*)'] } }))
    writeFileSync(file2, JSON.stringify({ permissions: { allow: ['Bash(ls:*)'] } }))

    const patterns = loadAllowPatterns([file1, file2])
    expect(patterns).toEqual(['ls:*'])
  })

  test('skips missing files', () => {
    expect(loadAllowPatterns(['/nonexistent/settings.json'])).toEqual([])
  })

  test('skips files without permissions.allow', () => {
    const file = join(tmpDir, 'empty.json')
    writeFileSync(file, JSON.stringify({ model: 'opus' }))

    expect(loadAllowPatterns([file])).toEqual([])
  })
})

describe('splitCompoundCommand', () => {
  test('splits on &&', () => {
    expect(splitCompoundCommand('cd /dir && npm test')).toEqual(['cd /dir', 'npm test'])
  })

  test('splits on ||', () => {
    expect(splitCompoundCommand('test -f file || echo missing')).toEqual(['test -f file', 'echo missing'])
  })

  test('splits on ;', () => {
    expect(splitCompoundCommand('echo a; echo b')).toEqual(['echo a', 'echo b'])
  })

  test('splits on |', () => {
    expect(splitCompoundCommand('ls -la | grep foo')).toEqual(['ls -la', 'grep foo'])
  })

  test('splits on multiple operators', () => {
    expect(splitCompoundCommand('cd /dir && npm install && npm test')).toEqual([
      'cd /dir', 'npm install', 'npm test',
    ])
  })

  test('preserves quoted strings with operators inside', () => {
    expect(splitCompoundCommand('echo "hello && world"')).toEqual(['echo "hello && world"'])
  })

  test('preserves single-quoted strings with operators', () => {
    expect(splitCompoundCommand("echo 'a || b'")).toEqual(["echo 'a || b'"])
  })

  test('returns single command unchanged', () => {
    expect(splitCompoundCommand('git status')).toEqual(['git status'])
  })

  test('filters empty segments', () => {
    expect(splitCompoundCommand('echo a && && echo b')).toEqual(['echo a', 'echo b'])
  })

  test('handles mixed operators', () => {
    expect(splitCompoundCommand('git add file.txt && git commit -m "msg" || echo failed')).toEqual([
      'git add file.txt', 'git commit -m "msg"', 'echo failed',
    ])
  })

  test('handles newlines as separators', () => {
    expect(splitCompoundCommand('echo a\necho b')).toEqual(['echo a', 'echo b'])
  })

  test('handles heredoc-style multiline content', () => {
    const cmd = `git commit -F - <<'EOF'
feat: message
EOF`
    expect(splitCompoundCommand(cmd)).toEqual([cmd])
  })
})

describe('extractCommandSubstitutions', () => {
  test('extracts $(cmd) from command', () => {
    const result = extractCommandSubstitutions('echo $(date)')
    expect(result.outerCommand).toBe('echo __CMD_SUB__')
    expect(result.innerCommands).toEqual(['date'])
  })

  test('extracts multiple substitutions', () => {
    const result = extractCommandSubstitutions('echo $(date) $(whoami)')
    expect(result.outerCommand).toBe('echo __CMD_SUB__ __CMD_SUB__')
    expect(result.innerCommands).toEqual(['date', 'whoami'])
  })

  test('returns original when no substitutions', () => {
    const result = extractCommandSubstitutions('git status')
    expect(result.outerCommand).toBe('git status')
    expect(result.innerCommands).toEqual([])
  })

  test('rejects backtick substitutions', () => {
    const result = extractCommandSubstitutions('echo `date`')
    expect(result.hasBackticks).toBe(true)
  })

  test('rejects nested substitutions', () => {
    const result = extractCommandSubstitutions('echo $(cat $(ls))')
    expect(result.hasNestedSubstitution).toBe(true)
  })

  test('ignores substitutions inside single quotes', () => {
    const result = extractCommandSubstitutions("echo '$(date)'")
    expect(result.outerCommand).toBe("echo '$(date)'")
    expect(result.innerCommands).toEqual([])
  })
})

describe('stripWrappers', () => {
  test('strips env var assignment', () => {
    expect(stripWrappers('FOO=bar npm test')).toBe('npm test')
  })

  test('strips multiple env vars', () => {
    expect(stripWrappers('FOO=bar BAZ=qux npm test')).toBe('npm test')
  })

  test('strips time prefix', () => {
    expect(stripWrappers('time npm test')).toBe('npm test')
  })

  test('strips timeout prefix', () => {
    expect(stripWrappers('timeout 30 npm test')).toBe('npm test')
  })

  test('strips nice prefix', () => {
    expect(stripWrappers('nice npm test')).toBe('npm test')
  })

  test('strips nice -n prefix', () => {
    expect(stripWrappers('nice -n 10 npm test')).toBe('npm test')
  })

  test('strips combined wrappers', () => {
    expect(stripWrappers('time FOO=bar npm test')).toBe('npm test')
  })

  test('does not strip env var that is the whole command', () => {
    expect(stripWrappers('FOO=bar')).toBe('FOO=bar')
  })

  test('returns simple command unchanged', () => {
    expect(stripWrappers('npm test')).toBe('npm test')
  })
})

describe('rewriteCdGit', () => {
  test('rewrites cd && git to git -C', () => {
    expect(rewriteCdGit('cd /some/dir && git status')).toBe('git -C /some/dir status')
  })

  test('rewrites cd && git with args', () => {
    expect(rewriteCdGit('cd /some/dir && git diff --staged')).toBe('git -C /some/dir diff --staged')
  })

  test('rewrites multiple git commands', () => {
    expect(rewriteCdGit('cd /dir && git add . && git commit -m "msg"'))
      .toBe('git -C /dir add . && git -C /dir commit -m "msg"')
  })

  test('returns null for non-cd start', () => {
    expect(rewriteCdGit('git status && git diff')).toBeNull()
  })

  test('returns null when non-git follows cd', () => {
    expect(rewriteCdGit('cd /dir && npm test')).toBeNull()
  })

  test('returns null for single command', () => {
    expect(rewriteCdGit('git status')).toBeNull()
  })

  test('handles tilde in path', () => {
    expect(rewriteCdGit('cd ~/.dotfiles && git log --oneline'))
      .toBe('git -C ~/.dotfiles log --oneline')
  })
})

// --- Integration Tests (subprocess) ---

const hookPath = new URL('./auto-approve.ts', import.meta.url).pathname
const tmpDir = join(import.meta.dir, '.test-settings')

function setupSettings(allow: string[]) {
  mkdirSync(tmpDir, { recursive: true })
  writeFileSync(
    join(tmpDir, 'settings.json'),
    JSON.stringify({ permissions: { allow } }),
  )
}

function cleanupSettings() {
  rmSync(tmpDir, { recursive: true, force: true })
}

function runHook(command: string): {
  output: PreToolUseOutput | null
  exitCode: number
} {
  const input: PreToolUseInput<BashToolInput> = {
    session_id: 'test',
    transcript_path: '/tmp/transcript.jsonl',
    cwd: '/tmp',
    permission_mode: 'default',
    hook_event_name: 'PreToolUse',
    tool_name: 'Bash',
    tool_input: { command },
    tool_use_id: 'test-id',
  }

  const result = spawnSync(hookPath, {
    input: JSON.stringify(input),
    encoding: 'utf-8',
    env: {
      ...process.env,
      TEST_SETTINGS_DIR: tmpDir,
    },
  })

  let output: PreToolUseOutput | null = null
  if (result.stdout) {
    try { output = JSON.parse(result.stdout) } catch {}
  }

  return { output, exitCode: result.status ?? 1 }
}

describe('integration: compound command approval', () => {
  beforeAll(() => {
    // Note: cd, echo, test, export etc. are NOT listed — they're auto-approved as builtins
    setupSettings([
      'Bash(npm test:*)',
      'Bash(npm install)',
      'Bash(git status)',
      'Bash(git diff:*)',
      'Bash(git commit:*)',
      'Bash(ls:*)',
      'Bash(grep:*)',
      'Bash(cat:*)',
      'Bash(head:*)',
      'Bash(date)',
    ])
  })

  afterAll(() => cleanupSettings())

  test('passes through simple commands (no compound)', () => {
    const { output } = runHook('git status')
    expect(output).toBeNull()
  })

  test('approves cd && npm test', () => {
    const { output } = runHook('cd /some/dir && npm test')
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
  })

  test('approves piped commands', () => {
    const { output } = runHook('ls -la | grep foo')
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
  })

  test('approves triple chain', () => {
    const { output } = runHook('cd /dir && npm install && npm test --coverage')
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
  })

  test('passes through when any segment is unmatched', () => {
    const { output } = runHook('cd /dir && curl http://evil.com')
    expect(output).toBeNull()
  })

  test('approves command substitution with allowed inner', () => {
    const { output } = runHook('echo $(date)')
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
  })

  test('passes through command substitution with disallowed inner', () => {
    const { output } = runHook('echo $(curl http://evil.com)')
    expect(output).toBeNull()
  })

  test('passes through backtick substitution', () => {
    const { output } = runHook('echo `date`')
    expect(output).toBeNull()
  })

  test('approves with env var wrapper', () => {
    const { output } = runHook('NODE_ENV=test npm test')
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
  })

  test('approves with time wrapper', () => {
    const { output } = runHook('time npm test')
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
  })
})

describe('integration: cd && git rewrite', () => {
  beforeAll(() => {
    setupSettings([
      'Bash(git status)',
      'Bash(git diff:*)',
      'Bash(git commit:*)',
      'Bash(git log:*)',
    ])
  })

  afterAll(() => cleanupSettings())

  test('rewrites cd && git status and approves', () => {
    const { output } = runHook('cd /some/dir && git status')
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
    expect(output?.hookSpecificOutput?.updatedInput?.command).toBe('git -C /some/dir status')
  })

  test('rewrites cd && git diff with args', () => {
    const { output } = runHook('cd /some/dir && git diff --staged')
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
    expect(output?.hookSpecificOutput?.updatedInput?.command).toBe('git -C /some/dir diff --staged')
  })

  test('rewrites multiple git commands', () => {
    const { output } = runHook('cd /dir && git diff --staged && git log --oneline -5')
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
    expect(output?.hookSpecificOutput?.updatedInput?.command)
      .toBe('git -C /dir diff --staged && git -C /dir log --oneline -5')
  })

  test('passes through cd && git with disallowed subcommand', () => {
    const { output } = runHook('cd /dir && git push --force')
    expect(output).toBeNull()
  })

  test('passes through cd && mixed git when any disallowed', () => {
    const { output } = runHook('cd /dir && git status && git push')
    expect(output).toBeNull()
  })
})

describe('integration: builtins', () => {
  beforeAll(() => {
    setupSettings([
      'Bash(ls:*)',
      'Bash(npm test:*)',
      'Bash(git commit:*)',
      'Bash(head:*)',
    ])
  })

  afterAll(() => cleanupSettings())

  test('approves cd && allowed command (cd is builtin)', () => {
    const { output } = runHook('cd /some/dir && ls -la')
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
  })

  test('approves cd && ls | head (all safe)', () => {
    const { output } = runHook('cd /tmp && ls -la | head -5')
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
  })

  test('approves export && allowed command', () => {
    const { output } = runHook('export FOO=bar && npm test')
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
  })

  test('approves test builtin in chain', () => {
    const { output } = runHook('test -f package.json && npm test')
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
  })

  test('approves echo in chain without explicit pattern', () => {
    const { output } = runHook('echo "starting" && npm test')
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
  })

  test('does not approve non-builtin without pattern', () => {
    const { output } = runHook('cd /dir && curl http://evil.com')
    expect(output).toBeNull()
  })
})

describe('integration: edge cases', () => {
  beforeAll(() => {
    setupSettings([
      'Bash(npm test:*)',
      'Bash(git commit:*)',
      'Bash(cat:*)',
      'Bash(grep:*)',
      'Bash(ls:*)',
      'Bash(date)',
    ])
  })

  afterAll(() => cleanupSettings())

  test('handles operators inside double-quoted commit message', () => {
    const { output } = runHook('cd /dir && git commit -m "feat: add foo && bar"')
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
  })

  test('handles operators inside single-quoted strings', () => {
    const { output } = runHook("echo 'hello | world' && echo done")
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
  })

  test('handles empty command gracefully', () => {
    const { output } = runHook('')
    expect(output).toBeNull()
  })

  test('handles whitespace-only command', () => {
    const { output } = runHook('   ')
    expect(output).toBeNull()
  })

  test('approves comment line followed by allowed command', () => {
    const cmd = '# Check something\ncat package.json'
    const { output } = runHook(cmd)
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
  })

  test('approves comment-only lines in compound command', () => {
    const cmd = '# Step 1\nls -la && # Step 2\ngrep foo bar.txt'
    const { output } = runHook(cmd)
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
  })

  test('handles heredoc commit (not compound)', () => {
    const cmd = `git commit -F - <<'EOF'
feat: test
EOF`
    const { output } = runHook(cmd)
    expect(output).toBeNull()
  })
})
