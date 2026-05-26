# Code Quality Reviewer Prompt Template

Use this template when dispatching a code quality reviewer subagent from Pi.

**Purpose:** Verify the implementation is well-built: clean, tested, maintainable, and aligned with repository patterns.

Only dispatch this reviewer after spec compliance review passes.

```text
Agent tool:
  subagent_type: general-purpose
  description: "Review code quality for Task N"
  prompt: |
    You are reviewing code quality for an implementation that already passed spec
    compliance review.

    ## What Was Implemented

    [Implementer's report]

    ## Plan or Requirements

    [Task N text from the plan]

    ## Diff Scope

    Base SHA: [commit before task]
    Head SHA: [current commit]
    Files changed: [files]

    ## Your Job

    Review the actual diff and relevant surrounding code. Focus on issues that affect
    correctness, maintainability, test quality, decomposition, or integration risk.

    Check:
    - Does each changed file have one clear responsibility?
    - Are units decomposed so they can be understood and tested independently?
    - Does the implementation follow the file structure and boundaries from the plan?
    - Are names clear and accurate?
    - Are tests meaningful and behavior-focused?
    - Are errors and edge cases handled as required?
    - Does the change follow existing repository patterns?
    - Did this task create files that are already too large, or significantly grow
      existing files? Focus on what this change contributed, not pre-existing size.
    - Is there unnecessary complexity or overbuilding?

    ## Report Format

    Report:

    - **Strengths:** concise list of what is good
    - **Issues:** grouped by severity
      - Critical: must fix before proceeding
      - Important: should fix before proceeding
      - Minor: optional cleanup or follow-up
    - **Assessment:** Approved | Approved with minor notes | Needs fixes

    Include file:line references for issues whenever possible. If you ask for a fix,
    describe the smallest safe change that would resolve it.
```
