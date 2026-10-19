# PR Blocks

The PR body is assembled from a fixed library of blocks. This file is the source
of truth for which sections are allowed. Do NOT invent sections outside this set.

Assembly order: pick a **profile** for the change's quadrant, then add or drop the
`○` blocks using the **include-when rules**. Keep every block succinct.

## Block Library

Blocks appear in the body in the order listed here. Two groups:

- **Overview blocks** render _heading-less_ at the top of the body, forming the opening.
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

### Overview Visual (complex only)

One small visual of the change's shape, directly after the Overview summary. Build
it with the show-me skill. Prefer a `diff` of a file tree, component tree, or call
tree. Keep it under ~15 lines.

````markdown
```diff
 src/
 ├── commands/
+│   └── publish.ts       # retries on transient errors
 └── registry.ts
```
````

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

### Changes

Nested-bullet list of what changed. Each sub-bullet follows the Sentence Structure
rules in [content-guidelines.md](content-guidelines.md): what-first, one idea per
sentence. Cap each sub-bullet at ~2 sentences / ~25 words; over that, split into
two bullets or promote a clause to its own bullet.

```markdown
## Changes

- **[What changed]**
  - [The change, one sentence. Mechanism or consequence as a second short sentence.]
```

Working example (note the short sentences, not one packed clause chain):

```markdown
## Changes

- **Hardened publish path**
  - Publishing now uses a non-throwing subprocess call. Errors return instead of
    aborting, so the retry and post-failure recheck both run.
  - A registry pre-check skips already-published packages. An already-published
    error from npm also counts as success. Together these make a re-run safe on a
    partial publish.
```

### Design Decisions (feature-oriented)

Major architectural decisions and rationale.

```markdown
## Design Decisions

[Architecture and rationale, not implementation specifics.]
```

### Overall Flow

Visual of the changed runtime flow, built with the show-me skill. Pick the smallest
form that shows the flow: call-tree `diff`, pseudocode, or Mermaid sequence diagram.
Note the change from the previous flow.

```markdown
## Overall Flow

[show-me visual of the runtime flow.]
```

### References / Links

External resources only (library docs, blog posts). Never the plan files.

```markdown
## References / Links

- [label](url): description
```

### AI Footer (mandatory, always last)

Fixed attribution line. No heading. Emit verbatim as the final line of the body,
separated from the previous block by a blank line. Exactly one per body.

```markdown
🤖 Written with AI
```

## Profiles

A profile is one column below: the baseline block set for that quadrant. `✓`
always include, `–` omit, `○` decide with the include-when rules.

```
Block                | Simple Fix | Complex Fix | Simple Feat | Complex Feat
Overview             |     ✓      |      ✓      |      ✓      |      ✓
Overview Visual      |     –      |      ○      |      –      |      ○
Root Cause           |     ✓      |      ✓      |      –      |      –
Changes              |     ○      |      ✓      |      ✓      |      ✓
Motivation           |     –      |      ○      |      –      |      ○
Design Decisions     |     –      |      ○      |      –      |      ✓
Overall Flow         |     –      |      ○      |      –      |      ○
Usage / Before-after |     ○      |      ○      |      ○      |      ○
Resolves link        |     ○      |      ○      |      ○      |      ○
References / Links   |     –      |      ○      |      ○      |      ✓
AI Footer            |     ✓      |      ✓      |      ✓      |      ✓
```

## Include-When Rules

Resolve every `○` with these:

- **Overview Visual**: include when the change touches several files or modules and
  its shape is faster to read as a tree than as Changes bullets.
- **Changes**: include unless the diff is a one-liner obvious from Overview.
- **Motivation**: include when the "why" is not self-evident from Overview.
- **Design Decisions**: include when a non-obvious architectural choice was made or an alternative was strongly considered or rejected.
- **Overall Flow**: include when control or data flow changed and a diagram aids
  comprehension; skip pure-local changes.
- **Usage / Before-after**: include when user-facing behavior changes (CLI, API, config).
- **Resolves link**: include when a tracker issue exists.
- **References / Links**: include when external resources were consulted.
