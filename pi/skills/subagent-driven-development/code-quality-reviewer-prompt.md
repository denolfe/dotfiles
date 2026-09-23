# Code Quality Reviewer Prompt Template

Use this template when dispatching a code quality reviewer subagent.

**Purpose:** Verify implementation is well-built (clean, tested, maintainable)

**Only dispatch after spec compliance review passes.**

```
Agent tool (code-reviewer):
  Use template at requesting-code-review/code-reviewer.md

  WHAT_WAS_IMPLEMENTED: [from implementer's report]
  PLAN_OR_REQUIREMENTS: Task N from [plan-file]
  BASE_SHA: [commit before task]
  HEAD_SHA: [current commit]
  DESCRIPTION: [task summary]
```

**In addition to standard code quality concerns, the reviewer should check:**
- Is each module deep — a lot of behavior behind a small interface?
- Can the module be tested through its interface, without reaching past it?
- Is the implementation following the file structure from the plan?
- Did this implementation add a pass-through module, or sprawl an existing interface? (Judge the interface, not the file length — a deep module is allowed to be big inside.)

**Code reviewer returns:** Strengths, Issues (Critical/Important/Minor), Assessment
