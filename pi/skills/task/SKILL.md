---
name: task
description: Create a new Pi task folder for a specific task or feature development. Use when the user wants to start a new task, plan a feature, or asks to create a task file.
---

# New Task

Compute the task directory path, then run the script. If no argument is provided, use the current conversation to fill in the details.

1. **task-name**: hyphenated, lowercase, 2-4 words summarizing the argument (e.g., `buggy-auth`).
2. **issue-number**: deduce from argument or branch name (e.g., `ECMS-12345`). Omit if not applicable.
3. **task-title**: title-cased task-name, prefixed with issue-number if applicable (e.g., `ECMS-12345: Buggy Auth`).
4. **project-dirname**: basename of the current project directory (e.g., `my-project`).
5. **folder**: `{YYYY-MM-DD}_{project-dirname}_{issue-number}-{task-name}` (omit `{issue-number}-` if none).
6. **task-dir**: `~/.pi/plans/{folder}`.

Run:

```bash
~/.pi/agent/skills/task/task.sh "<task-dir>" "<task-title>"
```

The script creates the directory and `1-TASK.md`, then outputs the path.

Once created:

1. Read and present the `1-TASK.md` contents.
2. Ask the user how they want to proceed. Recommend an option based on the details provided and task complexity:
   - Research web
   - Brainstorm design
   - Add more detail
   - Implement directly
3. Handle the choice:
   - **Brainstorm design** → Use the Pi-adapted `brainstorming` skill, using `1-TASK.md` as input and writing `2-DESIGN.md` in the same task folder.
   - **Add more detail** → Accept more input, merge it into `1-TASK.md`, then ask again how to proceed.
   - **Implement directly** → Implement directly only if the task is small, clear, and does not require design.
   - **Research web** → Ask for the research topic or sources, gather findings if web access is available, update `1-TASK.md`, then ask again how to proceed.

Prefer the full workflow for non-trivial changes:

`1-TASK.md` → Pi-adapted `brainstorming` → `2-DESIGN.md` → Pi-adapted `writing-plans` → `3-PLAN.md` → Pi-adapted `executing-plans` or `subagent-driven-development`.
