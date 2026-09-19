---
name: standards
description: Check current work against the shared user-level coding standards
argument-hint: "[optional: files/scope to check]"
disable-model-invocation: true
---

# Standards Check

Verify the current work follows the coding standards in `~/.agents/AGENTS.md`.

The scope is whatever the user passed when invoking this skill.

## Step 1: Load Standards

Read the Coding Patterns and Best Practices section of `~/.agents/AGENTS.md`. That is the source of truth — do not re-derive or assume rules from memory. If the file is missing, say so and stop.

## Step 2: Determine Scope

- If the user named files or paths, check those.
- Otherwise, check the current work: `git diff HEAD` plus staged and untracked changes (`git status --short`). Focus on changed lines, not whole files.

## Step 3: Audit

For each changed file, check it against the rules from Step 1 that apply to its language/content (skip TS rules for shell files, etc.).

## Step 4: Report

Group findings by file. For each:

```
path/to/file.ts:LINE — <rule violated>
  <one-line why + suggested fix>
```

- Lead with a verdict: ✅ compliant, or ⚠️ N issues.
- Rank by severity. Skip praise; only report gaps.
- If clean, say so in one line.
- Offer to apply fixes — do NOT edit unless asked.
