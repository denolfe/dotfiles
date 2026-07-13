# PR Blocks

The PR body is assembled from a fixed library of blocks. This file is the source
of truth for which sections are allowed. Do NOT invent sections outside this set.

Assembly order: pick a **profile** for the change's quadrant, then add or drop the
`○` blocks using the **include-when rules**. Keep every block succinct.

## Block Library

Blocks appear in the body in the order listed here. Two groups:

- **Overview blocks** render heading-less at the top of the body, forming the opening.
- **Section blocks** each carry their own `##` heading and follow the overview.

## Overview Blocks

### Overview (mandatory, always first)

1-2 sentence summary of the PR's purpose and scope. No heading at all; the body opens
directly with the summary text.

```markdown
[Brief summary of purpose and scope. 1-2 sentences.]
```

When a change is not backward-compatible, add a bold callout inside Overview (this
is the ONLY place breaking-change info goes; there is no standing section for it):

```markdown
**Breaking change:** [what breaks and the upgrade step, one or two sentences.]
```

### Motivation / Context

Why the change is happening now; background a reviewer needs.

```markdown
[1-2 sentences of motivation or context.]
```

### Usage / Before-after

Snippet showing changed user-facing behavior (CLI, API, config).

```markdown
[Before/after snippet or short example of the new usage.]
```

### Resolves link

Tracker reference, placed at the end of Overview.

```markdown
Resolves [PREFIX-1234](https://tracker.example.com/PREFIX-1234)
```

## Section Blocks

### Root Cause (fixes only)

What was actually broken and why. Use instead of Design Decisions on a bugfix.

```markdown
## Root Cause

[What was broken and the underlying cause. Keep to the mechanism, not a narrative.]
```

### Key Changes

Nested-bullet list of what changed.

```markdown
## Key Changes

- **[What changed]**
  - [What changed and why, without excessive detail.]
```

### Design Decisions (feature-oriented)

Major architectural decisions and rationale.

```markdown
## Design Decisions

[Architecture and rationale, not implementation specifics.]
```

### Overall Flow

Mermaid diagram of the changed flow. Sequence diagram unless another fits better.
Note the change from the previous flow.

```markdown
## Overall Flow

[Mermaid diagram.]
```

### References / Links

External resources only (library docs, blog posts). Never the plan files.

```markdown
## References / Links

- [label](url): description
```

## Profiles

Baseline block set per quadrant. `✓` always, `–` omit, `○` decide by rule.

### Simple Fix

`✓` Overview, Root Cause. `○` Key Changes, Usage, Resolves link.

### Complex Fix

`✓` Overview, Root Cause, Key Changes. `○` Motivation, Design Decisions, Overall
Flow, Usage, Resolves link, References.

### Simple Feature

`✓` Overview, Key Changes. `○` Usage, Resolves link, References.

### Complex Feature

`✓` Overview, Key Changes, Design Decisions, References. `○` Motivation, Overall
Flow, Usage, Resolves link.

## Decision Table

```
Block                | Simple Fix | Complex Fix | Simple Feat | Complex Feat
Overview             |     ✓      |      ✓      |      ✓      |      ✓
Root Cause           |     ✓      |      ✓      |      –      |      –
Key Changes          |     ○      |      ✓      |      ✓      |      ✓
Motivation           |     –      |      ○      |      –      |      ○
Design Decisions     |     –      |      ○      |      –      |      ✓
Overall Flow         |     –      |      ○      |      –      |      ○
Usage / Before-after |     ○      |      ○      |      ○      |      ○
Resolves link        |     ○      |      ○      |      ○      |      ○
References / Links   |     –      |      ○      |      ○      |      ✓
```

## Include-When Rules

Resolve every `○` with these:

- **Key Changes**: include unless the diff is a one-liner obvious from Overview.
- **Motivation**: include when the "why" is not self-evident from Overview.
- **Design Decisions**: include when a non-obvious architectural choice was made or an alternative was strongly considered or rejected.
- **Overall Flow**: include when control or data flow changed and a diagram aids
  comprehension; skip pure-local changes.
- **Usage / Before-after**: include when user-facing behavior changes (CLI, API, config).
- **Resolves link**: include when a tracker issue exists.
- **References / Links**: include when external resources were consulted.
