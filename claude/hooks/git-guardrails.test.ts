import { test, expect, describe } from 'bun:test'
import { spawnSync } from 'child_process'
import type { PreToolUseInput, PreToolUseOutput, BashToolInput } from './types'

const hookPath = new URL('./git-guardrails.ts', import.meta.url).pathname

function runHook(input: PreToolUseInput<BashToolInput>): {
  output: PreToolUseOutput | null
  exitCode: number
} {
  const result = spawnSync(hookPath, {
    input: JSON.stringify(input),
    encoding: 'utf-8',
  })

  let output: PreToolUseOutput | null = null
  if (result.stdout) {
    try {
      output = JSON.parse(result.stdout)
    } catch {
      // No JSON output
    }
  }

  return {
    output,
    exitCode: result.status ?? 1,
  }
}

function createInput(command: string): PreToolUseInput<BashToolInput> {
  return {
    session_id: 'test-session',
    transcript_path: '/tmp/transcript.jsonl',
    cwd: '/tmp',
    hook_event_name: 'PreToolUse',
    tool_name: 'Bash',
    tool_input: { command },
  }
}

describe('git add blocking', () => {
  test('blocks git add -A', () => {
    const { output, exitCode } = runHook(createInput('git add -A'))

    expect(exitCode).toBe(0)
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('deny')
    expect(output?.hookSpecificOutput?.permissionDecisionReason).toContain('targeted')
  })

  test('blocks git add --all', () => {
    const { output, exitCode } = runHook(createInput('git add --all'))

    expect(exitCode).toBe(0)
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('deny')
  })

  test('blocks git add . -A', () => {
    const { output, exitCode } = runHook(createInput('git add . -A'))

    expect(exitCode).toBe(0)
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('deny')
  })

  test('blocks git add . --all', () => {
    const { output, exitCode } = runHook(createInput('git add . --all'))

    expect(exitCode).toBe(0)
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('deny')
  })

  test('allows targeted git add', () => {
    const { output, exitCode } = runHook(createInput('git add file1.txt file2.txt'))

    expect(exitCode).toBe(0)
    expect(output).toBeNull()
  })

  test('blocks git add .', () => {
    const { output, exitCode } = runHook(createInput('git add .'))

    expect(exitCode).toBe(0)
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('deny')
  })

  test('blocks git add . with trailing space', () => {
    const { output, exitCode } = runHook(createInput('git add . '))

    expect(exitCode).toBe(0)
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('deny')
  })

  test('blocks git add . file.txt', () => {
    const { output, exitCode } = runHook(createInput('git add . file.txt'))

    expect(exitCode).toBe(0)
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('deny')
  })

  test('blocks git add file.txt .', () => {
    const { output, exitCode } = runHook(createInput('git add file.txt .'))

    expect(exitCode).toBe(0)
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('deny')
  })

  test('allows git add .gitignore', () => {
    const { output, exitCode } = runHook(createInput('git add .gitignore'))

    expect(exitCode).toBe(0)
    expect(output).toBeNull()
  })

  test('allows git add ./src', () => {
    const { output, exitCode } = runHook(createInput('git add ./src'))

    expect(exitCode).toBe(0)
    expect(output).toBeNull()
  })

  test('allows git add ./src/file.ts', () => {
    const { output, exitCode } = runHook(createInput('git add ./src/file.ts'))

    expect(exitCode).toBe(0)
    expect(output).toBeNull()
  })

  test('allows git add .env.local', () => {
    const { output, exitCode } = runHook(createInput('git add .env.local'))

    expect(exitCode).toBe(0)
    expect(output).toBeNull()
  })

  test('allows git add with other flags', () => {
    const { output, exitCode } = runHook(createInput('git add -p file.txt'))

    expect(exitCode).toBe(0)
    expect(output).toBeNull()
  })
})

describe('amend prompting', () => {
  test('prompts for git commit --amend --no-edit', () => {
    const { output, exitCode } = runHook(createInput('git commit --amend --no-edit'))

    expect(exitCode).toBe(0)
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('ask')
    expect(output?.hookSpecificOutput?.permissionDecisionReason).toContain('Amending')
  })

  test('prompts for git commit --no-edit --amend (reversed order)', () => {
    const { output, exitCode } = runHook(createInput('git commit --no-edit --amend'))

    expect(exitCode).toBe(0)
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('ask')
  })

  test('prompts for git commit with other flags and --amend', () => {
    const { output, exitCode } = runHook(createInput('git commit -a --amend --no-edit'))

    expect(exitCode).toBe(0)
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('ask')
  })

  test('prompts for git commit --amend with message', () => {
    const { output, exitCode } = runHook(createInput('git commit --amend -m "Updated message"'))

    expect(exitCode).toBe(0)
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('ask')
  })

  test('allows git commit --no-edit without --amend', () => {
    const { output, exitCode } = runHook(createInput('git commit --no-edit'))

    expect(exitCode).toBe(0)
    expect(output?.hookSpecificOutput?.permissionDecision).not.toBe('ask')
  })

  test('allows regular git commit', () => {
    const { output, exitCode } = runHook(createInput('git commit -m "Regular commit"'))

    expect(exitCode).toBe(0)
    expect(output).toBeNull()
  })
})

describe('attribution stripping', () => {
  test('strips "Generated with Claude Code" line', () => {
    const command = `git commit -m "Test commit

🤖 Generated with [Claude Code](https://claude.com/claude-code)"`

    const { output, exitCode } = runHook(createInput(command))

    expect(exitCode).toBe(0)
    expect(output?.hookSpecificOutput?.permissionDecision).toBe('allow')
    const updatedCommand = (output?.hookSpecificOutput?.updatedInput as any)?.command
    expect(updatedCommand).not.toContain('Generated')
    expect(updatedCommand).not.toContain('Claude Code')
  })

  test('strips "Co-Authored-By: Claude" line', () => {
    const command = `git commit -m "Test commit

Co-Authored-By: Claude <noreply@anthropic.com>"`

    const { output, exitCode } = runHook(createInput(command))

    expect(exitCode).toBe(0)
    const updatedCommand = (output?.hookSpecificOutput?.updatedInput as any)?.command
    expect(updatedCommand).not.toContain('Co-Authored-By')
  })

  test('strips both attribution lines', () => {
    const command = `git commit -m "Test commit

Some description here.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"`

    const { output, exitCode } = runHook(createInput(command))

    expect(exitCode).toBe(0)
    const updatedCommand = (output?.hookSpecificOutput?.updatedInput as any)?.command
    expect(updatedCommand).toContain('Test commit')
    expect(updatedCommand).toContain('Some description here')
    expect(updatedCommand).not.toContain('Generated')
    expect(updatedCommand).not.toContain('Co-Authored-By')
  })

  test('case-insensitive matching for "generated"', () => {
    const command = `git commit -m "Test commit

GENERATED with something"`

    const { output, exitCode } = runHook(createInput(command))

    expect(exitCode).toBe(0)
    const updatedCommand = (output?.hookSpecificOutput?.updatedInput as any)?.command
    expect(updatedCommand).not.toContain('GENERATED')
  })

  test('case-insensitive matching for "co-authored-by"', () => {
    const command = `git commit -m "Test commit

CO-AUTHORED-BY: Someone"`

    const { output, exitCode } = runHook(createInput(command))

    expect(exitCode).toBe(0)
    const updatedCommand = (output?.hookSpecificOutput?.updatedInput as any)?.command
    expect(updatedCommand).not.toContain('CO-AUTHORED-BY')
  })

  test('collapses excessive empty lines after attribution removal', () => {
    const command = `git commit -m "Test commit

🤖 Generated with [Claude Code](https://claude.com/claude-code)

"`

    const { output, exitCode } = runHook(createInput(command))

    expect(exitCode).toBe(0)
    const updatedCommand = (output?.hookSpecificOutput?.updatedInput as any)?.command
    // Should remove the Generated line and collapse multiple newlines
    expect(updatedCommand).not.toContain('Generated')
    expect(updatedCommand).toContain('Test commit')
    // Should not have 3+ consecutive newlines
    expect(updatedCommand).not.toMatch(/\n{3,}/)
  })

  test('allows commit without attribution', () => {
    const command = 'git commit -m "Clean commit message"'

    const { output, exitCode } = runHook(createInput(command))

    expect(exitCode).toBe(0)
    expect(output).toBeNull()
  })
})

describe('non-git commands', () => {
  test('allows non-git Bash commands', () => {
    const { output, exitCode } = runHook(createInput('ls -la'))

    expect(exitCode).toBe(0)
    expect(output).toBeNull()
  })

  test('allows git status', () => {
    const { output, exitCode } = runHook(createInput('git status'))

    expect(exitCode).toBe(0)
    expect(output).toBeNull()
  })

  test('allows git diff', () => {
    const { output, exitCode } = runHook(createInput('git diff'))

    expect(exitCode).toBe(0)
    expect(output).toBeNull()
  })

  test('allows git push', () => {
    const { output, exitCode } = runHook(createInput('git push origin main'))

    expect(exitCode).toBe(0)
    expect(output).toBeNull()
  })
})
