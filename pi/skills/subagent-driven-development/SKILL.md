---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks in the current Pi session using fresh subagents and review loops
---

# Subagent-Driven Development

Execute an existing `3-PLAN.md` by dispatching a fresh subagent for each task, then running two review loops after each task: spec compliance first, code quality second.

**Announce at start:** "I'm using the subagent-driven-development skill to implement this plan."

**Core principle:** fresh subagent per task + spec review + quality review = focused implementation with verification before progress.

## When to Use

Use this skill when:

- A `3-PLAN.md` implementation plan already exists.
- Tasks are mostly independent or clearly sequenced.
- You want to stay in this Pi session as coordinator.
- Subagent tools are available.

Use the Pi-adapted `executing-plans` skill instead when:

- Subagent tools are unavailable.
- Tasks are tightly coupled and need one continuous implementation context.
- The user wants batch execution with manual checkpoints instead of per-task delegation.

## The Process

### Step 1: Locate and Review the Plan

1. Use the plan path provided by the user, or ask for it if none was provided.
2. If no path is provided and an active `~/.pi/plans/...` task folder is known, read `3-PLAN.md` from that folder.
3. If `3-PLAN.md` is missing, stop and ask for the correct plan path.
4. Review the plan for contradictions, missing verification commands, unclear tasks, or unsafe commit instructions.
5. Raise blocking concerns with the user before editing files or dispatching subagents.
6. Confirm you are not on `main` or `master` before implementation. If you are, ask for explicit consent before editing, or ask whether to create/switch to a branch or worktree.

### Step 2: Extract and Track Tasks

Extract every task from the plan with its full text:

- goal
- files
- acceptance criteria
- verification command
- dependencies
- steps
- commit instructions

When task tools are available, prefer `@tintinweb/pi-tasks`. If unavailable, use generic Pi task tools. If no task tools are available, use the plan's Markdown checkboxes as the source of truth.

For every task, preserve enough context that implementer subagents do not need to read the whole plan file. The coordinator should provide task text, relevant plan context, dependency notes, and exact verification commands.

### Step 3: Dispatch One Implementer Subagent

Dispatch only one implementation subagent at a time unless the plan explicitly states that tasks are independent and safe to run in parallel. Sequential dispatch is the default because most implementation tasks touch shared files.

Use `implementer-prompt.md` as the prompt template. Fill in:

- task name and number
- full task description
- acceptance criteria
- files to create or modify
- verification command
- relevant architecture context from the plan
- current working directory
- branch/worktree constraints

The implementer must:

1. Ask questions before starting if requirements are unclear.
2. Implement exactly the assigned task.
3. Run the task's verification command and read the output.
4. Commit only the files for that task when the plan calls for a commit.
5. Self-review before reporting.
6. Report status as `DONE`, `DONE_WITH_CONCERNS`, `NEEDS_CONTEXT`, or `BLOCKED`.

### Step 4: Handle Implementer Status

**DONE:** Proceed to spec compliance review.

**DONE_WITH_CONCERNS:** Read the concerns before proceeding. If they affect correctness or scope, address them before review. If they are observations, note them and continue to review.

**NEEDS_CONTEXT:** Provide the missing context and re-dispatch. Do not tell the implementer to guess.

**BLOCKED:** Assess the blocker:

1. If context is missing, provide more context and re-dispatch.
2. If the task requires more reasoning, re-dispatch with a more capable model if available.
3. If the task is too large, stop and ask the user whether to split it.
4. If the plan is wrong, stop and ask the user how to revise it.

Never ignore an escalation or force the same retry without changing context, scope, or model.

### Step 5: Run Spec Compliance Review

After implementation, dispatch a fresh reviewer using `spec-reviewer-prompt.md`.

The spec reviewer must inspect the actual code and compare it against the task requirements. They should look for:

- missing requirements
- extra unrequested work
- misunderstood requirements
- claims in the implementer report that are not supported by code

If the reviewer finds issues, send the issue list back to an implementer subagent for fixes, then run spec compliance review again. Do not proceed to code quality review until spec compliance passes.

### Step 6: Run Code Quality Review

Only after spec compliance passes, dispatch a fresh reviewer using `code-quality-reviewer-prompt.md`.

The code quality reviewer should inspect the task diff and evaluate maintainability, tests, decomposition, naming, integration risk, and fit with repository patterns.

If the reviewer finds critical or important issues, send them to an implementer subagent for fixes, then run code quality review again. Minor issues may be fixed or explicitly deferred, but do not move on while important review issues remain open.

### Step 7: Mark Task Complete

Mark the task complete only after:

- implementation status is `DONE` or acceptable `DONE_WITH_CONCERNS`
- spec compliance review passes
- code quality review passes or only explicitly accepted minor issues remain
- verification evidence supports completion
- any required task commit exists

Update status using `@tintinweb/pi-tasks` if available, otherwise generic Pi task tools, otherwise the Markdown checkbox in `3-PLAN.md`.

### Step 8: Repeat for Remaining Tasks

Repeat the implementation and review loop for each remaining task in dependency order.

After each task, keep a brief coordinator log:

- task completed
- files changed
- verification command and result
- review outcomes
- commit SHA if committed
- concerns or follow-ups

### Step 9: Final Review and Handoff

After all tasks are complete:

1. Run the final verification commands listed in the plan.
2. Read and summarize the output.
3. Dispatch a final code quality reviewer for the overall implementation if subagent capacity allows.
4. Check git status and confirm the diff is scoped to the plan.
5. Report the implementation summary, verification evidence, commits, and remaining risks to the user.
6. Ask what they want next: cleanup, more verification, PR preparation, or handoff notes.

## Model Selection

Use the least powerful model that can handle each role safely.

- Mechanical tasks touching 1-2 files with complete instructions: fast/cheap model.
- Integration tasks touching multiple files or requiring debugging: standard model.
- Architecture-sensitive work and review: strongest available model.

Escalate model capability when a subagent reports uncertainty, repeated failure, or broad reasoning needs.

## Prompt Templates

- `skills/subagent-driven-development/implementer-prompt.md` — implementer subagent prompt
- `skills/subagent-driven-development/spec-reviewer-prompt.md` — spec compliance reviewer prompt
- `skills/subagent-driven-development/code-quality-reviewer-prompt.md` — code quality reviewer prompt

Resolve these paths relative to this skill directory when reading templates.

## Red Flags

Never:

- Start implementation on `main` or `master` without explicit user consent.
- Skip spec compliance review.
- Skip code quality review.
- Start code quality review before spec compliance passes.
- Proceed with unresolved critical or important review issues.
- Dispatch multiple implementation subagents in parallel unless the plan explicitly says the tasks are independent and file-safe.
- Make implementer subagents read the whole plan when you can provide curated task text.
- Skip scene-setting context.
- Ignore subagent questions or concerns.
- Treat an implementer's self-review as a substitute for independent review.
- Move to the next task while review issues remain open.

If a subagent asks questions, answer clearly and provide additional context before work continues.

If a reviewer finds issues, send them to an implementer, then re-review. Do not skip the re-review.

If a subagent fails a task, dispatch a focused fix subagent with specific instructions or stop and ask the user for direction. Do not silently patch around the failure as coordinator unless the user asks you to switch to direct implementation.

## Pi Task Integration

When task tools are available, prefer `@tintinweb/pi-tasks`.

During execution:

1. Use `@tintinweb/pi-tasks` task tools when available to track statuses, dependencies, acceptance criteria, and verification evidence.
2. If `@tintinweb/pi-tasks` is unavailable, use any generic Pi task tools available in the session.
3. If no task tools are available, update Markdown checkboxes in `3-PLAN.md` and include status in coordinator reports.

Do not require platform-specific task tools from other coding agents.

## Advantages

- Fresh context per task keeps implementers focused.
- Coordinator preserves plan-level context and sequencing.
- Independent spec review prevents under-building and over-building.
- Independent quality review catches maintainability and test issues.
- Verification evidence is collected before progress claims.

## Cost and Trade-offs

- More subagent invocations than direct execution.
- More coordinator effort to curate prompts and context.
- Review loops add iterations.
- The trade-off is higher confidence and earlier issue detection.
