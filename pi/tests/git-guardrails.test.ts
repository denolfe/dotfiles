import { describe, expect, test } from 'bun:test'
import { evaluateGitCommand } from '../extensions/git-guardrails'

function action(command: string) {
  return evaluateGitCommand(command).action
}

describe('git guardrails', () => {
  test('blocks broad git add commands', () => {
    expect(action('git add -A')).toBe('block')
    expect(action('git add --all')).toBe('block')
    expect(action('git add .')).toBe('block')
    expect(action('git add file.txt .')).toBe('block')
  })

  test('allows targeted git add commands', () => {
    expect(action('git add file1.txt file2.txt')).toBe('allow')
    expect(action('git add .gitignore')).toBe('allow')
    expect(action('git add ./src/file.ts')).toBe('allow')
  })

  test('blocks git path override flags', () => {
    expect(action('git -C /some/path status')).toBe('block')
    expect(action('git --git-dir=/other/.git status')).toBe('block')
    expect(action('git --work-tree=/other status')).toBe('block')
  })

  test('requires confirmation for risky git commands', () => {
    expect(action('git commit --amend --no-edit')).toBe('confirm')
    expect(action("git commit --no-verify -m 'skip hooks'")).toBe('confirm')
    expect(action('git push origin main')).toBe('confirm')
  })

  test('rewrites heredoc commit messages', () => {
    const decision = evaluateGitCommand(`git commit -m "$(cat <<'EOF'
feat: message
EOF
)"`)

    expect(decision.action).toBe('rewrite')
    if (decision.action !== 'rewrite') return
    expect(decision.command).toBe(`git commit -F - <<'EOF'
feat: message
EOF`)
    expect(decision.command).not.toContain('$(cat')
  })

  test('allows benign commands', () => {
    expect(action('ls -la')).toBe('allow')
    expect(action('git status')).toBe('allow')
    expect(action('git diff')).toBe('allow')
  })
})
