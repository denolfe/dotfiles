---
description: Create a new PR for the current branch from template
argument-hint: draft
allowed-tools: Bash
---

# Create PR

- Create a PR for the current branch focusing on architecture over implementation details. If "draft" is specified in the argument, create a draft PR.
- Consolidate related details under fewer sections and emphasize high-level decisions rather than exhaustive details.
- Reference any design/plan documents or branch commits for deeper context instead of including all details in the description.

## PR Content Guidelines

- Follow the Template provided below _as a guideline_ for structuring the PR description, but adapt it as needed to fit the specific changes being made.
- DO NOT include anything related to test coverage
- DO NOT reference specific lines numbers
- Wording rules
  - No AI vocabulary: avoid "leverage", "enhance", "crucial", "pivotal", "comprehensive", "streamline", "robust", "seamless", "facilitate", "utilize" — use plain equivalents
  - No significance inflation: don't puff up changes with "key", "vital", "critical", "fundamental" — just describe what changed
  - No filler: cut "in order to" → "to", "it is important to note that" → (delete), "due to the fact that" → "because"
  - No hedging: avoid "potentially", "might possibly", "it could be argued" — state facts directly
  - No -ing padding: don't append "ensuring consistency", "highlighting the need for", "improving maintainability" as filler justifications - if the reason matters, give it its own sentence
  - No copula avoidance: use "is/are/has" instead of "serves as", "stands as", "acts as"
  - No negative parallelisms: avoid "not only X but also Y", "it's not just X, it's Y"
  - No rule of three: don't force triads like "faster, safer, and more maintainable" — include only what's true and relevant
  - No `**Bold Header:** description` list pattern: write prose or plain bullets instead
  - No em dash abuse: prefer commas, parentheses, or separate sentences
  - No chatbot artifacts: no "Let me know if...", "Here's an overview of...", "This PR aims to..."

After PR is created, say "PR Created: [PR URL]".

## Template

```markdown
# Overview

[Brief summary of the PR's purpose and scope.]

["Resolves PREFIX-1234" if an issue is being addressed.]

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

[Include any relevant architecture diagrams or flowcharts that illustrate the changes made. Written in mermaid syntax; use sequence diagram unless another format is more appropriate. Clearly note the changes from the previous flow if any.]

## References / Links

[Links to any _external_ resources provided during the brainstorming, design, or implementation phases, such as external library docs, blog posts, etc. If none, omit this section. DO NOT reference the plan files themselves.]
```
