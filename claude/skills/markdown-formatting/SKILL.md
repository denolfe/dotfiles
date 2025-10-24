---
name: markdown-formatting
description: Format and lint markdown files using markdownlint with comprehensive rule knowledge for automated and manual fixes. Use when working with .md files, formatting documentation, linting markdown, or when user mentions markdown issues, formatting problems, or documentation standards.
allowed-tools:
  - Read
  - Edit
  - Bash
  - Grep
  - Glob
---

# Markdown Formatting & Linting

Format and lint markdown files using markdownlint CLI tools with comprehensive understanding of all markdown rules.

## Quick Start

```bash
# Check if markdownlint is available
which markdownlint-cli2 || which markdownlint

# Install if needed
pnpm add -D markdownlint-cli2
# or
npm install -g markdownlint-cli

# Auto-fix files
markdownlint --fix "**/*.md"
markdownlint-cli2 --fix "**/*.md"

# Check specific files
markdownlint README.md docs/**/*.md
```

## Configuration Detection

Check for config files in this order:

1. `.markdownlint.json`
2. `.markdownlint.jsonc`
3. `.markdownlint.yaml`
4. `.markdownlintrc`
5. `markdownlint` key in `package.json`

## Common Workflow

1. **Detect environment**: Check for markdownlint CLI
2. **Find config**: Look for config files
3. **Run linter**: Identify issues
4. **Apply fixes**: Auto-fix or manual
5. **Verify**: Re-run to confirm

## Most Common Issues & Quick Fixes

### Headings

- **MD001**: Heading levels increment (# → ## → ### not # → ###)
- **MD018/MD019**: Single space after hash (`# Heading` not `#Heading`)
- **MD022**: Blank lines around headings
- **MD025**: Single H1 per document
- **MD041**: First line should be H1

```markdown
<!-- Good heading structure -->
# Main Title

## Section

### Subsection

Content here...
```

### Lists

- **MD004**: Consistent list markers (all `-` or all `*`)
- **MD007**: Nested lists indent 2 spaces
- **MD030**: Single space after list marker
- **MD032**: Blank lines around lists

```markdown
<!-- Good list structure -->
- Item 1
  - Nested item
  - Another nested
- Item 2
```

### Whitespace

- **MD009**: No trailing spaces
- **MD010**: Use spaces not tabs
- **MD012**: Single blank lines (not multiple)
- **MD047**: File ends with newline

### Links & Images

- **MD034**: Wrap bare URLs in `<>`: `<http://example.com>`
- **MD042**: Links need text: `[Link Text](url)` not `[](url)`
- **MD045**: Images need alt text: `![Description](image.png)`

### Code Blocks

- **MD031**: Blank lines around code blocks
- **MD040**: Specify language for code blocks

````markdown
<!-- Good code block -->
Text before

```javascript
const code = 'here';
```

Text after
````

## CLI Commands

```bash
# Fix all markdown files
markdownlint --fix "**/*.md"

# Fix specific files
markdownlint --fix README.md CHANGELOG.md

# Check without fixing
markdownlint "**/*.md"

# Use specific config
markdownlint --config .markdownlint.json "**/*.md"

# Ignore specific rules
markdownlint --disable MD013 MD033 "**/*.md"

# Output JSON for parsing
markdownlint --json "**/*.md"
```

## Common Patterns

### Fix Multiple Issues at Once

```markdown
<!-- Before -->
#Title
Some text with trailing spaces
	Tab indented line

- Item 1
* Item 2
Visit http://example.com

<!-- After -->
# Title

Some text with trailing spaces
    Space indented line

- Item 1
- Item 2

Visit <http://example.com>
```

### Add to package.json

```json
{
  "scripts": {
    "lint:md": "markdownlint \"**/*.md\" --ignore node_modules",
    "lint:md:fix": "markdownlint \"**/*.md\" --ignore node_modules --fix"
  }
}
```

## Detailed Rules Reference

For comprehensive documentation of all markdown rules with examples and fixes, see [rules-reference.md](./rules-reference.md).

## Resources

- [markdownlint GitHub](https://github.com/DavidAnson/markdownlint)
- [markdownlint Rules](https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md)
- [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)
