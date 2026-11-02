#!/bin/bash
# PreToolUse hook: enforces git workflow preferences on Bash commands.
# Denies broad adds and path flags, asks before push/--no-verify, rewrites heredoc
# commits to `-F -` (avoids $() permission prompts), strips Claude attribution.
# Regexes end with \z because jq's $ also matches before a trailing newline.

read -r -d '' program <<'JQ'
def decide($decision; $reason):
  {hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: $decision, permissionDecisionReason: $reason}};

def rewrite:
  {hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "allow", updatedInput: {command: .}}};

# Caught Claude ignoring `includeCoAuthoredBy: false`
def strip_attribution:
  split("\n")
  | map(select(test("generated|co-authored-by"; "i") | not))
  | join("\n")
  | gsub("\n{3,}"; "\n\n")
  | sub("\n+\\z"; "");

def heredoc_to_stdin:
  capture("\\A(?<prefix>.*?)(?<commit>git\\s+commit\\b.*?)\\s+-m\\s+\"?\\$\\(cat\\s+<<'?(?<delimiter>\\w+)'?\\n(?<message>[\\s\\S]*?)\\n\\k<delimiter>\\n\\)\"?\\z")
  | "\(.prefix)\(.commit) -F - <<'\(.delimiter)'\n\(.message | strip_attribution)\n\(.delimiter)";

.tool_input.command as $command
| if ($command | test("git\\s+add\\b.*(\\s|\\A)(-A|--all)")) or ($command | test("git\\s+add\\b(\\s+\\S+)*\\s+\\.(\\s|\\z)")) then
    decide("deny"; "Use targeted 'git add <files>' instead of 'git add -A', '--all', or '.' for more intentional commits.")
  elif $command | test("git\\s+(-C|--git-dir|--work-tree)\\b") then
    decide("deny"; "Run git commands from repo root instead of using -C/--git-dir/--work-tree.")
  elif ($command | test("git\\s+commit")) and ($command | test("--no-verify")) then
    decide("ask"; "Using --no-verify to bypass repository git hooks. Confirm you want to skip pre-commit checks?")
  elif $command | test("git\\s+push\\b") then
    decide("ask"; "Pushing to remote. Confirm?")
  elif $command | test("git\\s+commit") then
    (first($command | heredoc_to_stdin) // ($command | strip_attribution | select(. != $command))) | rewrite
  else
    empty
  end
JQ

jq -c "$program"
