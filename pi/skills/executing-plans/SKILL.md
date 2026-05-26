---
name: executing-plans
description: Use when you have a written implementation plan to execute with review checkpoints
---

# Executing Plans

## Overview

Load an existing `3-PLAN.md`, review it critically, execute tasks in small batches, verify each task, and report for review between batches.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

## The Process

### Step 1: Locate and Review Plan

1. Use the plan path provided by the user, or ask for it if none was provided.
2. If no path is provided and an active `~/.pi/plans/...` task folder is known, read `3-PLAN.md` from that folder.
3. If `3-PLAN.md` is missing, stop and ask for the correct plan path.
4. Review the plan for contradictions, missing verification commands, or unclear tasks.
5. Raise blocking concerns with the user before editing files.
6. Confirm you are not on `main` or `master` before implementation. If you are, ask for explicit consent before editing or ask whether to create/switch to a branch or worktree.

### Step 2: Execute a Small Batch

Default batch size is the first unfinished task, or up to three small independent tasks when the plan explicitly marks them independent.

For each task:

1. Mark it in progress using `@tintinweb/pi-tasks` if available, otherwise any generic Pi task tool, otherwise the checkbox in `3-PLAN.md`.
2. Follow the task steps exactly.
3. Run the task's verification command and read the output.
4. Mark the task complete only after verification evidence supports completion.
5. Commit only the files for that task when the plan calls for a commit.

### Step 3: Report

After each batch, report:

- files changed
- verification commands run
- relevant output or failure evidence
- remaining tasks

Then wait for user feedback before continuing.

### Step 4: Continue

Based on feedback:

- Apply changes if needed.
- Execute the next batch.
- Repeat until every task is complete and verified.

### Step 5: Complete Development

After all tasks complete and verified:

1. Run the final verification commands listed in the plan.
2. Read the output and summarize evidence.
3. Check git status and confirm only intended files changed.
4. Ask the user whether they want any final cleanup, commits, or handoff notes.

## Task Tracking

When task tools are available, prefer `@tintinweb/pi-tasks` for statuses and dependencies. If that is unavailable, use generic Pi task tooling. If no task tooling is available, update the checkboxes in the plan file as the source of truth.

When using Markdown checkboxes:

- Change `[ ]` to an in-progress marker only if the plan defines one; otherwise leave it unchecked until verification passes.
- Change `[ ]` to `[x]` only after verification succeeds.
- Preserve the plan's task text unless a correction is required; if you correct the plan, mention it in the batch report.

## When to Stop and Ask for Help

STOP executing immediately when:

- You hit a blocker mid-batch: missing dependency, test failure, unclear instruction, or unavailable command.
- The plan has critical gaps preventing safe implementation.
- You do not understand an instruction.
- Verification fails repeatedly.
- The current branch or worktree situation is unsafe or ambiguous.

Ask for clarification rather than guessing.

## When to Revisit Earlier Steps

Return to review when:

- The user updates the plan based on your feedback.
- The implementation reveals a fundamental gap in the plan.
- The approach needs rethinking before more edits are made.

Do not force through blockers.

## Remember

- Review the plan critically first.
- Follow plan steps exactly.
- Do not skip verifications.
- Ask before creating worktrees, switching branches, or changing execution sessions.
- Between batches: report and wait.
- Stop when blocked; do not guess.
- Never start implementation on `main` or `master` without explicit user consent.
