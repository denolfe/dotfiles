#!/bin/bash
# PreToolUse hook: enforces git workflow preferences on Bash commands.
# Denies broad adds, path flags, and --no-verify; rewrites heredoc
# commits to `-F -` (avoids $() permission prompts), strips AI attribution.
# Regexes end with \z because jq's $ also matches before a trailing newline.

read -r -d '' program <<'JQ'
def decide($decision; $reason):
  {hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: $decision, permissionDecisionReason: $reason}};

def rewrite($input):
  {hookSpecificOutput: {hookEventName: "PreToolUse", permissionDecision: "allow", updatedInput: ($input + {command: .})}};

# [^;&|\n]* keeps the flag match inside the same command segment as `git add`
def is_broad_add: test("git\\s+add\\b[^;&|\\n]*\\s(-A|--all|\\.(\\s|\\z))");
def is_path_override: test("git\\s+(-C|--git-dir|--work-tree)\\b");
def is_commit: test("git\\s+commit(\\s|\\z)");

# Strip attribution regardless of which agent generated the commit message.
def is_attribution: test("co-authored-by:|generated with"; "i");

# Line 1 holds the command or subject, never attribution. A removed line keeps
# its trailing quote, which can close the -m string.
def strip_attribution:
  split("\n")
  | [.[0]] + (.[1:] | map(if is_attribution then capture("(?<quote>[\"']?)\\z").quote else . end))
  | join("\n")
  | gsub("\n{3,}"; "\n\n")
  | sub("\n+(?<quote>[\"']?)\\z"; "\(.quote)");

def heredoc_to_stdin:
  capture("\\A(?<prefix>.*?)(?<commit>git\\s+commit\\b.*?)\\s+-m\\s+\"?\\$\\(cat\\s+<<'?(?<delimiter>\\w+)'?\\n(?<message>[\\s\\S]*?)\\n\\k<delimiter>\\n\\)\"?\\z")
  | "\(.prefix)\(.commit) -F - <<'\(.delimiter)'\n\(.message | strip_attribution)\n\(.delimiter)";

def rewrite_commit($input):
  . as $command
  | (heredoc_to_stdin // strip_attribution)
  | select(. != $command)
  | rewrite($input);

# Codex normalizes shell and unified exec calls to Bash + tool_input.command.
# Never return ask: Codex currently treats it as a hook error and runs the tool.
select(.hook_event_name == "PreToolUse" and .tool_name == "Bash")
| .tool_input as $input
| $input.command
| select(type == "string")
| if is_broad_add then
    decide("deny"; "Use targeted 'git add <files>' instead of 'git add -A', '--all', or '.' for more intentional commits.")
  elif is_path_override then
    decide("deny"; "Run git commands from repo root instead of using -C/--git-dir/--work-tree.")
  elif is_commit and test("--no-verify") then
    decide("deny"; "Using --no-verify would bypass repository git hooks. Run the commit without --no-verify, or run it manually in your terminal if you intend to skip checks.")
  elif is_commit then
    rewrite_commit($input)
  else
    empty
  end
JQ

jq -c "$program"
