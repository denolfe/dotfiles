---
name: build
description: Implement a plan file task by task with one implementer subagent per task, then run one code review at the end. Runs to the end without stopping. Third step of spec -> slice -> build.
disable-model-invocation: true
---

# Build

Implement the plan without stopping. You are the orchestrator: keep your context to the plan, the spec path, and one short report per task. The plan file is the single source of state, and only you edit it.

Never stop to ask the user. Make a best-effort choice, record it, and continue. Every change stays in local commits, so the user can undo any choice after the run.

## Process

1. **Load.** Read the plan (a path the user gives, else the one from this conversation) and the spec it links. Record concerns for the final report. Follow the project's git flow; if it is unclear, create a branch `build/<slug>`. If the working tree is not clean, commit nothing of it: stash it and record the stash in the report.
2. **Loop** until no frontier task remains:
   1. Pick the first frontier task (all blockers have a `Commit:` SHA).
   2. Dispatch an implementer subagent with the brief below. Run one at a time in this tree.
   3. **Check the commit.** `git log -1` is a new commit that matches the reported SHA, and `git status --porcelain -- <reported files>` is empty. If not, send the subagent back to commit once; if it still fails, stash the reported files as `build-task-<N>` and treat the task as `FAILED`. Never commit its work yourself.
   4. Write the SHA into `Commit:` and check the acceptance boxes the report marks PASS.
   5. Append each reported decision to the spec under `## Build Decisions`, so later subagents build on the same choices.
   6. On `FAILED`, set `Commit: FAILED (<reason>)`. Its dependents leave the frontier; continue with the other tasks.
3. **Verify all.** Run the plan's `Verify all` command.
4. **Review.** Call the Skill tool with `code-review` on the full diff of this work. Send all findings to one implementer subagent, which fixes and commits them. Check the commit as in step 2.3.
5. **Report**, in this order:
   1. Build Decisions, for the user to review first
   2. failed and skipped tasks, with reasons
   3. tasks with SHAs, verify output, review fixes, concerns, all stashes
   Do not push, merge, or open a PR.

For a plan of 1-2 small tasks, you may do the work yourself under the same rules.

## Implementer Brief

Send pointers, not pasted content:

```
Implement task <N> of <plan path>. The spec is <spec path>.
Follow "Test Rules" and "Decision Rules" in <path of this SKILL.md>.
Do only this task. Run the task's Verify command before you finish.
Commit your work using the project's conventions; do not edit the plan or spec.
Stage only files you changed (`git add <paths>`); never `git add -A` or `git add .`.

Report in under 150 words:
- Status: DONE | FAILED
- Commit: <SHA> (required for DONE)
- Files: <paths you changed>, or none
- Acceptance: <criterion>: PASS/FAIL, one per line
- Verify: last lines of output
- Decisions: <choice> (why; alternative), one per line, or none
- Concerns: <or none>
```

## Test Rules

- One failing test, then the least code to pass it, then the next test. Never write all the tests first.
- Test behavior through the public interface. Never mock internal collaborators or assert through a side channel.
- Expected values come from an independent source (literal, worked example, spec), never recomputed the way the code does.
- No test fits config, docs, or prose changes. Say so in the report.

## Decision Rules

- When the spec and plan do not decide something, choose the option most consistent with the spec, the existing code, and `## Build Decisions`. Report each design-level choice (interface, behavior the user sees, data shape, dependency); local choices need no report.
- Prefer the option that is easiest to undo: additive over destructive, no new dependency over a new one.
- Never cause effects outside the working tree: no migrations against shared databases, no global installs, no deploys, no pushes.
- If the task cannot land (verify fails twice for the same reason, or a required resource is missing), commit nothing broken, stash only the files you changed (`git stash push -m build-task-<N> -- <paths>`; never restore or discard them), and report `FAILED` with the reason.
