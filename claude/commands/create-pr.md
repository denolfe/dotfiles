# Create PR

- Create a PR for the current branch focusing on architecture over implementation details.
- Consolidate related details under fewer sections and emphasize high-level decisions rather than exhaustive details.
- Reference any design/plan documents or branch commits for deeper context instead of including all details in the description.
- DO NOT include anything related to test coverage

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

[Include any relevant architecture diagrams or flowcharts that illustrate the changes made. Written in mermaid syntax; use sequence diagram unless another format is more appropriate.]

## References / Links

[Links to any _external_ resources provided during the brainstorming, design, or implementation phases, such as external library docs, blog posts, etc. If none, omit this section. DO NOT reference the plan files themselves.]
```
