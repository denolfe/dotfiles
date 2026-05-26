---
name: writing-plans
description: Use when you have an approved design or requirements for a multi-step task, before touching code
---

# Writing Plans

## Overview

Write a comprehensive implementation plan from an approved design. Assume the implementer understands software development but has little context for this repository. Include exact files, steps, verification commands, acceptance criteria, dependencies, and commit points.

**Announce at start:** "I'm using the writing-plans skill to create the implementation plan."

**Plan location:** Read `2-DESIGN.md` from the active `~/.pi/plans/<YYYY-MM-DD>_<project>_<task>/` folder and write `3-PLAN.md` in the same folder. If no active task folder is known, ask the user for the folder or design file path before proceeding.

## Scope Check

If the design covers multiple independent subsystems, suggest breaking it into separate plans — one per subsystem. Each plan should produce working, testable software on its own.

## File Structure

Before defining tasks, map out which files will be created or modified and what each one is responsible for.

- Design units with clear boundaries and well-defined interfaces.
- Prefer smaller, focused files over large files that do too much.
- Files that change together should live together.
- In existing codebases, follow established patterns.
- Include targeted cleanup only when it directly supports the task.

This structure informs task decomposition. Each task should produce self-contained changes that make sense independently.

## Pi Task Integration

For each implementation task in the plan:

1. Prefer `@tintinweb/pi-tasks` task tools when available.
2. If `@tintinweb/pi-tasks` is unavailable, use any generic Pi task tools available in the session.
3. If no task tools are available, rely on the checkbox tasks in `3-PLAN.md`.

Each task should include:

- goal
- files to create or modify
- acceptance criteria
- verification command
- dependency information
- concise execution steps

## Task Granularity

Each task is a coherent unit of work that produces a testable, committable outcome.

Scope test:

1. Can it be verified independently? If not, it may be too small.
2. Does it touch more than one concern? If so, it may be too big.
3. Would it get its own commit? If not, merge it with an adjacent task.

TDD cycles happen within tasks, not as separate tasks. A task is "Implement X with tests"; red-green-refactor steps are execution details inside that task.

## Plan Document Header

Every plan MUST start with this header:

```markdown
# [Feature Name] Implementation Plan

> **For agentic workers:** Use the Pi-adapted `executing-plans` skill after this plan exists. Execute task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Prefer `@tintinweb/pi-tasks` task tools when available; otherwise use generic Pi task tooling or the Markdown checkboxes in this file.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences about approach]

**Tech Stack:** [Key technologies/libraries]

---
```

## Task Structure

````markdown
### Task N: [Component Name]

**Goal:** [One sentence — what this task produces]

**Files:**
- Create: `exact/path/to/file.py`
- Modify: `exact/path/to/existing.py:123-145`
- Test: `tests/exact/path/to/test.py`

**Acceptance Criteria:**
- [ ] [Concrete, testable criterion]
- [ ] [Another criterion]

**Verify:** `exact test command` → expected output

**Steps:**

- [ ] **Step 1: Write the failing test**

```python
def test_specific_behavior():
    result = function(input)
    assert result == expected
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pytest tests/path/test.py::test_name -v`
Expected: FAIL with "function not defined"

- [ ] **Step 3: Write minimal implementation**

```python
def function(input):
    return expected
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pytest tests/path/test.py::test_name -v`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add tests/path/test.py src/path/file.py
git commit -m "feat: add specific feature"
```
````

## No Placeholders

Every step must contain the actual content an implementer needs. These are plan failures:

- "TBD", "TODO", "implement later", "fill in details"
- "Add appropriate error handling" without specifying cases and behavior
- "Write tests for the above" without concrete test cases
- "Similar to Task N" instead of repeating necessary details
- Steps that describe what to do without showing how
- References to types, functions, or methods not defined in any task

## Self-Review

After writing the complete plan, review it against the design.

1. **Design coverage:** Can you point to a task for every design requirement? List and fix any gaps.
2. **Placeholder scan:** Search for the red flags in the "No Placeholders" section and fix them.
3. **Type consistency:** Check names, methods, signatures, and paths across tasks.
4. **Verification quality:** Every task must have an exact verification command and expected result.
5. **Dependency clarity:** Dependencies must be explicit in task order or task notes.

If you find issues, fix them inline. If a design requirement has no task, add the task.

## Execution Handoff

After writing and self-reviewing `3-PLAN.md`, stop and ask the user how they want to execute it.

Offer these choices in plain text:

1. Use the Pi-adapted `executing-plans` skill in this session.
2. Open a separate Pi session and run `/skill:executing-plans <path-to-3-PLAN.md>`.

Do not begin implementation until the user chooses an execution path.

## Remember

- Use exact file paths.
- Include complete code in every step when a step changes code.
- Include exact commands with expected output.
- Keep tasks independently verifiable.
- Prefer DRY, YAGNI, TDD, and frequent focused commits.
