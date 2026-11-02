#!/bin/bash
# Tests for git-guardrails.sh. Pipes PreToolUse JSON into the hook and checks its output.

HOOK="$(cd "$(dirname "$0")" && pwd)/git-guardrails.sh"
pass=0
fail=0

run_hook() {
  jq -n --arg command "$1" \
    '{hook_event_name: "PreToolUse", tool_name: "Bash", tool_input: {command: $command}}' |
    "$HOOK"
}

field() {
  run_hook "$1" | jq -r ".hookSpecificOutput.$2 // empty"
}

# Reads a heredoc into the named variable, trimming the trailing newline
fixture() {
  read -r -d '' "$1" || true
}

# Usage: report <status> <name> <failure detail>
report() {
  if [[ $1 -eq 0 ]]; then
    pass=$((pass + 1))
    return
  fi
  fail=$((fail + 1))
  printf 'FAIL: %s\n%s\n' "$2" "$3"
}

assert_decision() {
  local name=$1 command=$2 expected=$3
  local actual
  actual=$(field "$command" permissionDecision)
  [[ $actual == "$expected" ]]
  report $? "$name" "  expected: $expected, actual: $actual"
}

assert_reason_contains() {
  local name=$1 command=$2 needle=$3
  local reason
  reason=$(field "$command" permissionDecisionReason)
  [[ $reason == *"$needle"* ]]
  report $? "$name" "  reason lacks '$needle': $reason"
}

assert_passthrough() {
  local name=$1 command=$2
  local output
  output=$(run_hook "$command")
  [[ -z $output ]]
  report $? "$name" "  expected no output, got: $output"
}

assert_rewrite() {
  local name=$1 command=$2 expected=$3
  local decision updated
  decision=$(field "$command" permissionDecision)
  updated=$(field "$command" updatedInput.command)
  [[ $decision == allow && $updated == "$expected" ]]
  report $? "$name" "  decision: $decision"$'\n'"  expected: $expected"$'\n'"  actual:   $updated"
}

# Usage: assert_rewrite_text <name> <command> [+include|-exclude]...
assert_rewrite_text() {
  local name=$1 command=$2
  shift 2
  local updated rule
  updated=$(field "$command" updatedInput.command)
  for rule in "$@"; do
    case $rule in
      +*) [[ $updated == *"${rule#+}"* ]] || { report 1 "$name" "  missing '${rule#+}' in: $updated"; return; } ;;
      -*) [[ $updated != *"${rule#-}"* ]] || { report 1 "$name" "  unexpected '${rule#-}' in: $updated"; return; } ;;
    esac
  done
  report 0 "$name"
}

# git add blocking
assert_decision 'blocks git add -A' 'git add -A' deny
assert_reason_contains 'git add -A reason' 'git add -A' 'targeted'
assert_decision 'blocks git add --all' 'git add --all' deny
assert_decision 'blocks git add . -A' 'git add . -A' deny
assert_decision 'blocks git add . --all' 'git add . --all' deny
assert_passthrough 'allows targeted git add' 'git add file1.txt file2.txt'
assert_decision 'blocks git add .' 'git add .' deny
assert_decision 'blocks git add . with trailing space' 'git add . ' deny
assert_decision 'blocks git add . file.txt' 'git add . file.txt' deny
assert_decision 'blocks git add file.txt .' 'git add file.txt .' deny
assert_passthrough 'allows git add .gitignore' 'git add .gitignore'
assert_passthrough 'allows git add ./src' 'git add ./src'
assert_passthrough 'allows git add ./src/file.ts' 'git add ./src/file.ts'
assert_passthrough 'allows git add .env.local' 'git add .env.local'
assert_passthrough 'allows git add with other flags' 'git add -p file.txt'

# git -C/--git-dir/--work-tree blocking
assert_decision 'blocks git -C /path' 'git -C /some/path status' deny
assert_reason_contains 'git -C reason' 'git -C /some/path status' 'repo root'
assert_decision 'blocks git -C with relative path' 'git -C ../other-repo commit -m "test"' deny
assert_decision 'blocks git --git-dir' 'git --git-dir=/other/.git status' deny
assert_decision 'blocks git --work-tree' 'git --work-tree=/other status' deny
assert_passthrough 'allows git without path flags' 'git status'

# no-verify prompting
assert_decision 'prompts for git commit --no-verify' 'git commit --no-verify -m "Skip hooks"' ask
assert_reason_contains 'no-verify reason' 'git commit --no-verify -m "Skip hooks"' 'bypass'
assert_decision 'prompts for --no-verify with other flags' 'git commit -a --no-verify -m "Message"' ask
assert_decision 'prompts for --no-verify without message' 'git commit --no-verify' ask
fixture command <<'CMD'
git commit --no-verify -m "$(cat <<'EOF'
Test commit message
EOF
)"
CMD
assert_decision 'prompts for --no-verify with heredoc' "$command" ask
assert_passthrough 'allows regular git commit' 'git commit -m "Regular commit"'

# push prompting
assert_decision 'prompts for git push' 'git push' ask
assert_reason_contains 'push reason' 'git push' 'Pushing'
assert_decision 'prompts for git push origin main' 'git push origin main' ask
assert_decision 'prompts for git push -u' 'git push -u origin feature-branch' ask
assert_decision 'prompts for git push --force' 'git push --force' ask
assert_decision 'prompts for git push --force-with-lease' 'git push --force-with-lease origin main' ask

# heredoc commit rewrite
fixture command <<'CMD'
git commit -m "$(cat <<'EOF'
feat(scope): subject line

- Detail 1
- Detail 2
EOF
)"
CMD
fixture expected <<'CMD'
git commit -F - <<'EOF'
feat(scope): subject line

- Detail 1
- Detail 2
EOF
CMD
assert_rewrite "rewrites \$(cat <<'EOF'...) to -F -" "$command" "$expected"

fixture command <<'CMD'
git commit -m "$(cat <<'EOF'
feat(scope): subject line

- Detail 1

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
CMD
fixture expected <<'CMD'
git commit -F - <<'EOF'
feat(scope): subject line

- Detail 1
EOF
CMD
assert_rewrite 'strips attribution inside heredoc rewrite' "$command" "$expected"

fixture command <<'CMD'
git commit -m "$(cat <<EOF
feat: message
EOF
)"
CMD
fixture expected <<'CMD'
git commit -F - <<'EOF'
feat: message
EOF
CMD
assert_rewrite 'rewrites without quotes around delimiter' "$command" "$expected"

fixture command <<'CMD'
git commit --allow-empty -m "$(cat <<'EOF'
chore: empty
EOF
)"
CMD
fixture expected <<'CMD'
git commit --allow-empty -F - <<'EOF'
chore: empty
EOF
CMD
assert_rewrite 'preserves flags before -m' "$command" "$expected"

fixture command <<'CMD'
git commit -m "$(cat <<'EOF'
fix: one liner
EOF
)"
CMD
fixture expected <<'CMD'
git commit -F - <<'EOF'
fix: one liner
EOF
CMD
assert_rewrite 'handles single-line message' "$command" "$expected"

fixture command <<'CMD'
git commit -F - <<'EOF'
feat: already correct
EOF
CMD
assert_passthrough 'does not affect git commit -F - <<EOF' "$command"

fixture command <<'CMD'
cd /some/dir && git commit -m "$(cat <<'EOF'
feat: with cd prefix
EOF
)"
CMD
fixture expected <<'CMD'
cd /some/dir && git commit -F - <<'EOF'
feat: with cd prefix
EOF
CMD
assert_rewrite 'rewrites cd && git commit with heredoc' "$command" "$expected"

# attribution stripping
fixture command <<'CMD'
git commit -m "Test commit

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
CMD
assert_decision 'strip decision is allow' "$command" allow
assert_rewrite_text 'strips Generated line' "$command" -Generated '-Claude Code'

fixture command <<'CMD'
git commit -m "Test commit

Co-Authored-By: Claude <noreply@anthropic.com>"
CMD
assert_rewrite_text 'strips Co-Authored-By line' "$command" -Co-Authored-By

fixture command <<'CMD'
git commit -m "Test commit

Some description here.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
CMD
assert_rewrite_text 'strips both attribution lines' "$command" \
  '+Test commit' '+Some description here' -Generated -Co-Authored-By

fixture command <<'CMD'
git commit -m "Test commit

GENERATED with something"
CMD
assert_rewrite_text 'case-insensitive generated' "$command" -GENERATED

fixture command <<'CMD'
git commit -m "Test commit

CO-AUTHORED-BY: Someone"
CMD
assert_rewrite_text 'case-insensitive co-authored-by' "$command" -CO-AUTHORED-BY

fixture command <<'CMD'
git commit -m "Test commit

🤖 Generated with [Claude Code](https://claude.com/claude-code)

"
CMD
assert_rewrite_text 'collapses empty lines after removal' "$command" \
  -Generated '+Test commit' "-"$'\n\n\n'

assert_passthrough 'allows commit without attribution' 'git commit -m "Clean commit message"'

# non-git commands
assert_passthrough 'allows non-git commands' 'ls -la'
assert_passthrough 'allows git status' 'git status'
assert_passthrough 'allows git diff' 'git diff'

printf '%d passed, %d failed\n' "$pass" "$fail"
[[ $fail -eq 0 ]]
