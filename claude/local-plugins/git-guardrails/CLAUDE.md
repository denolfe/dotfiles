# Git Guardrails Plugin

PreToolUse hook that enforces git workflow preferences by intercepting Bash commands.

## Runtime

Uses **Bun** — no compilation needed, TypeScript executed directly.

```bash
bun run typecheck # typecheck
bun test # run tests
```

## What It Does

| Action  | Commands                                                           | Decision         |
| ------- | ------------------------------------------------------------------ | ---------------- |
| Block   | `git add -A`, `git add .`, `git add --all`                         | `deny`           |
| Block   | `git -C`, `--git-dir`, `--work-tree` (avoids permission prompts)   | `deny`           |
| Prompt  | `git commit --amend`, `--no-verify`, `git push`                    | `ask`            |
| Rewrite | `git commit -m "$(cat <<'EOF'...)"` → `git commit -F - <<'EOF'...` | `allow` + modify |
| Clean   | Lines with "generated" or "co-authored-by"                         | `allow` + modify |

## Structure

```
scripts/
├── git-guardrails.ts       # main handler
├── git-guardrails.test.ts  # test suite
├── types.ts                # shared hook type definitions
└── utils.ts                # stdin/stdout helpers
```

- `types.ts` is the canonical hook types file, also used by other plugins
- Handler reads JSON from stdin, outputs JSON to stdout
- Entry point configured in `hooks/hooks.json` via `${CLAUDE_PLUGIN_ROOT}`
