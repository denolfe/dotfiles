# Git Guardrails Plugin

PreToolUse hook that enforces git workflow preferences by intercepting Bash commands.

## Runtime

Bash + jq. All rule logic is one jq program inside `scripts/git-guardrails.sh`.

```bash
scripts/git-guardrails.test.sh # run tests
shellcheck scripts/*.sh        # lint
```

jq regexes use Oniguruma (Perl syntax): `$` also matches before a trailing newline, so use `\z` for a strict end anchor.

## What It Does

| Action  | Commands                                                           | Decision         |
| ------- | ------------------------------------------------------------------ | ---------------- |
| Block   | `git add -A`, `git add .`, `git add --all`                         | `deny`           |
| Block   | `git -C`, `--git-dir`, `--work-tree` (avoids permission prompts)   | `deny`           |
| Prompt  | `git commit --no-verify`, `git push`                               | `ask`            |
| Rewrite | `git commit -m "$(cat <<'EOF'...)"` → `git commit -F - <<'EOF'...` | `allow` + modify |
| Clean   | Lines with "generated" or "co-authored-by"                         | `allow` + modify |

## Structure

```
scripts/
├── git-guardrails.sh       # hook: reads JSON on stdin, writes JSON decision on stdout (or nothing)
└── git-guardrails.test.sh  # pipes fixture commands through the hook
```

- Entry point configured in `hooks/hooks.json` via `${CLAUDE_PLUGIN_ROOT}`
