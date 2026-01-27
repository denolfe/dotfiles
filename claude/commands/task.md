---
description: Create a new task file for a specific task or feature development
argument-hint: <task-name-or-desc>
allowed-tools: Bash(~/.claude/commands/task.sh:*), Read
---

# New Task

Run `~/.claude/commands/task.sh <task-name> "<task-title>"` where:

- `task-name`: hyphenated, lowercase, 2-4 words summarizing the argument. Prefixed with issue number if applicable, e.g. `PREFIX-1234-add-user-authentication`.
- `task-title`: the original argument text (for the H1 header).

The script outputs the created directory path.

Once created:

1. Read and present 1-TASK.md contents
2. AskUserQuestion with options:
   - Research web
   - Brainstorm design
   - Add details manually
   - Implement directly
3. Handle choice:
   - Research → Ask topic, fetch, return to step 2
   - Brainstorm → Run `superpowers:brainstorming`, present 1-TASK.md + 2-DESIGN.md
   - Add details → User edits, return to step 2
   - Implement → Skip to step 4
