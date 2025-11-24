# Create PR Description

Create a concise PR description for the current branch's PR focusing on architecture over implementation details.

Consolidate related details under fewer sections and emphasize high-level decisions rather than exhaustive details.

Reference any design documents or branch commits for deeper context instead of including all details in the description.

**Output the proposed PR description in markdown and use the following structure:**

```markdown
# Overview

[Brief summary of the PR's purpose and scope.]

## Key Changes

- [High-level change 1]
  - [Optional: Brief detail or sub-point about change 1.]

  [Optional additional context or rationale for change 1.]

- [High-level change 2]
  - [Optional: Brief detail or sub-point about change 2.]

  [Optional additional context or rationale for change 2.]

## Design Decisions

[Explanation of major design decisions made in the PR, focusing on architecture and rationale rather than implementation specifics.]

## Overall Flow

[Include any relevant architecture diagrams or flowcharts that illustrate the changes made. Written in mermaid syntax; use sequence diagram unless another format is more appropriate.]
```

- Ask me for feedback on the generated description before finalizing it.
- Once approved, ask me if I'd like to copy in markdown format to my clipboard. Copy to clipboard only if I confirm.
