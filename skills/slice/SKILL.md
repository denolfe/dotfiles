---
name: slice
description: Break an approved spec into vertical-slice tasks with blocking edges in a plan file. Second step of spec -> slice -> build.
disable-model-invocation: true
---

# Slice

Turn the design into an ordered set of tasks. The plan says what each task delivers, not how to code it.

## Process

1. **Load.** Read the spec: a path the user gives, else the one from this conversation. If Open Questions is not empty, stop and send the user back to `/spec`.
2. **Find prefactors.** Explore just enough code to see what would make the change easy. "Make the change easy, then make the easy change." Prefactor tasks go first.
3. **Draft slices.** Each task is a **tracer bullet**:
   - a narrow but complete path through every layer it touches, not one horizontal layer
   - verifiable on its own
   - fits one fresh context window
   - lands as one commit

   Exception: a wide mechanical refactor (rename, retype a shared symbol) is sequenced **expand -> migrate in batches -> contract**, each batch its own task.

   Each task's interface, behavior the user sees, and data shape must come from a spec decision. If a task needs one the spec does not make, settle it with the user and add it to the spec now. `/build` never stops to ask.
4. **Quiz.** Show a numbered list: title, blocked by, what it delivers. Ask whether the granularity is right, the edges are real, and anything should merge or split. Iterate until the user approves.
5. **Write the plan** with the template below, as `plan.md` next to the spec unless the user names another path.
6. **Hand off.** Give the path and say: "Next: `/build`".

## Template

```markdown
# <Feature> Plan

Spec: `<spec path>`
Verify all: `<full typecheck + test command>`

## 1. <Title>

Blocked by: none
Delivers: <behavior that now works, from the user's view>
Acceptance:
- [ ] <observable criterion>
- [ ] <observable criterion>
Verify: `<targeted command>`
Commit: -

## 2. <Title>

Blocked by: 1
...
```

## Rules

- No code, no line numbers. Name modules and seams, not files.
- `Commit:` is the only state. A task is done when it holds a SHA; `/build` writes `FAILED (<reason>)` when a task cannot land. The **frontier** is every task whose blockers are all done.
- An edge exists only if the blocker truly gates the task. False edges kill parallelism.
