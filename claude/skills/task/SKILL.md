---
name: task
description: Create a new task file for a specific task or feature development. Use when the user wants to start a new task, plan a feature, or asks to create a task file.
---

# New Task

Compute the task directory path, then run the script. If no argument is provided, use the current conversation to fill in the details.

1. **task-name**: hyphenated, lowercase, 2-4 words summarizing the argument (e.g., `buggy-auth`).
2. **issue-number**: deduce from argument or branch name (e.g., `ECMS-12345`). Omit if not applicable.
3. **task-title**: title-cased task-name, prefixed with issue-number if applicable (e.g., `ECMS-12345: Buggy Auth`).
4. **project-dirname**: basename of the current project directory (e.g., `my-project`).
5. **folder**: `{YYYY-MM-DD}_{project-dirname}_{issue-number}-{task-name}` (omit `{issue-number}-` if none).
6. **task-dir**: `~/.claude/plans/{folder}`

Run `~/.claude/skills/task/task.sh "<task-dir>" "<task-title>"`

The script creates the directory and 1-TASK.md, then outputs the path.

Once created:

1. Read and present 1-TASK.md contents
2. AskUserQuestion with options, also note which is '(recommended)' based upon the details provided and task complexity:
   - Research web
   - Brainstorm design
   - Add more detail
   - Implement directly
3. Handle choice, also note which is '(recommended)' based upon task complexity:
   - Brainstorm → Run `superpowers-extended-cc:brainstorming` (recommended) or `superpowers:brainstorming`, present 1-TASK.md + 2-DESIGN.md
   - Add details → Accept more input, merge into 1-TASK.md, return to step 2
   - Implement directly → Implement directly
   - Research → Ask topic, fetch, return to step 2
