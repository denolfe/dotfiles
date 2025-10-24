# Markdown Rules Reference

Comprehensive reference for all markdownlint rules with examples and fixes.

## Headings

### MD001 - Heading Levels Increment

**Rule**: Headings should increment by one level at a time
**Fix**: Adjust heading hierarchy (# → ## → ### not # → ###)

```markdown
<!-- Bad -->
# Title
### Subheading

<!-- Good -->
# Title
## Subheading
```

### MD003 - Heading Style

**Rule**: Consistent heading style (ATX or Setext)
**Fix**: Use one style throughout

```markdown
<!-- ATX style (preferred) -->
# Heading 1
## Heading 2

<!-- Setext style -->
Heading 1
=========
Heading 2
---------
```

### MD018 - Space After Hash

**Rule**: Require space after hash in ATX headings
**Fix**: Add space after #

```markdown
<!-- Bad -->
#Heading

<!-- Good -->
# Heading
```

### MD019 - Multiple Spaces After Hash

**Rule**: No multiple spaces after hash
**Fix**: Use single space

```markdown
<!-- Bad -->
#  Heading

<!-- Good -->
# Heading
```

### MD020 - Space Inside Hash on Closed ATX

**Rule**: No space inside hashes on closed headings
**Fix**: Remove inner spaces

```markdown
<!-- Bad -->
# Heading #

<!-- Good -->
# Heading
```

### MD021 - Multiple Spaces Inside Hash

**Rule**: No multiple spaces inside hashes
**Fix**: Use single spaces

### MD022 - Headings Surrounded by Blank Lines

**Rule**: Headings should be surrounded by blank lines
**Fix**: Add blank lines before/after headings

```markdown
<!-- Bad -->
Text here
## Heading
More text

<!-- Good -->
Text here

## Heading

More text
```

### MD023 - Headings Start at Beginning of Line

**Rule**: Headings must start at line beginning
**Fix**: Remove leading spaces

```markdown
<!-- Bad -->
  ## Heading

<!-- Good -->
## Heading
```

### MD024 - No Duplicate Headings

**Rule**: No multiple headings with same content
**Fix**: Make headings unique or use siblings_only config

```markdown
<!-- Bad -->
## Introduction
## Introduction

<!-- Good -->
## Introduction
## Overview
```

### MD025 - Single Top-Level Heading

**Rule**: Only one H1 per document
**Fix**: Ensure single H1, convert others to H2+

```markdown
<!-- Bad -->
# Title
# Another Title

<!-- Good -->
# Title
## Subtitle
```

### MD026 - No Trailing Punctuation in Headings

**Rule**: No trailing punctuation in headings
**Fix**: Remove .,;:!? from heading endings

```markdown
<!-- Bad -->
## Section Title.

<!-- Good -->
## Section Title
```

### MD041 - First Line Should Be H1

**Rule**: First line should be top-level heading
**Fix**: Add H1 at document start

```markdown
<!-- Good -->
# Document Title

Content here...
```

### MD043 - Required Heading Structure

**Rule**: Enforce specific heading structure
**Fix**: Match configured heading structure

## Lists

### MD004 - Unordered List Style

**Rule**: Consistent marker style (*, -, +)
**Fix**: Use same marker throughout

```markdown
<!-- Bad -->
- Item 1
* Item 2
+ Item 3

<!-- Good -->
- Item 1
- Item 2
- Item 3
```

### MD005 - List Item Indentation

**Rule**: Consistent indentation for list items
**Fix**: Align items at same level

```markdown
<!-- Bad -->
- Item 1
 - Item 2

<!-- Good -->
- Item 1
- Item 2
```

### MD006 - List Start Left Aligned

**Rule**: First level lists should be left aligned
**Fix**: Remove leading spaces from top-level lists

```markdown
<!-- Bad -->
  - Item

<!-- Good -->
- Item
```

### MD007 - List Indentation

**Rule**: Consistent spaces for nested lists
**Fix**: Use configured indentation (default 2 spaces)

```markdown
<!-- Good (2 spaces) -->
- Item 1
  - Nested 1
  - Nested 2
- Item 2
```

### MD029 - Ordered List Item Prefix

**Rule**: Consistent numbering style
**Fix**: Use one_or_ordered or ordered style

```markdown
<!-- one_or_ordered -->
1. Item 1
1. Item 2
1. Item 3

<!-- ordered -->
1. Item 1
2. Item 2
3. Item 3
```

### MD030 - Spaces After List Markers

**Rule**: Consistent spaces after list markers
**Fix**: Adjust spacing (default 1 space)

```markdown
<!-- Bad -->
*Item 1
-  Item 2

<!-- Good -->
- Item 1
- Item 2
```

### MD032 - Lists Surrounded by Blank Lines

**Rule**: Lists should be surrounded by blank lines
**Fix**: Add blank lines before/after lists

```markdown
<!-- Bad -->
Text here
- Item 1
- Item 2
More text

<!-- Good -->
Text here

- Item 1
- Item 2

More text
```

## Whitespace & Formatting

### MD009 - Trailing Spaces

**Rule**: No trailing spaces
**Fix**: Remove spaces at line endings

```markdown
<!-- Bad -->
Line with trailing spaces

<!-- Good -->
Line with no trailing spaces
```

### MD010 - Hard Tabs

**Rule**: No hard tab characters
**Fix**: Replace tabs with spaces

```markdown
<!-- Bad -->
	Indented with tab

<!-- Good -->
    Indented with spaces
```

### MD012 - No Multiple Blank Lines

**Rule**: No multiple consecutive blank lines
**Fix**: Reduce to single blank line

```markdown
<!-- Bad -->
Text


Text

<!-- Good -->
Text

Text
```

### MD027 - No Multiple Spaces After Blockquote

**Rule**: Single space after blockquote symbol
**Fix**: Remove extra spaces

```markdown
<!-- Bad -->
>  Quote

<!-- Good -->
> Quote
```

### MD028 - No Blank Lines Inside Blockquote

**Rule**: No blank lines inside blockquotes
**Fix**: Remove blank lines or separate blockquotes

```markdown
<!-- Bad -->
> Quote line 1

> Quote line 2

<!-- Good -->
> Quote line 1
> Quote line 2
```

### MD031 - Fenced Code Blocks Surrounded by Blank Lines

**Rule**: Code blocks need blank lines around them
**Fix**: Add blank lines before/after

````markdown
<!-- Bad -->
Text here
```code
code
```
More text

<!-- Good -->
Text here

```code
code
```

More text
````

### MD037 - No Spaces Inside Emphasis Markers

**Rule**: No spaces inside emphasis markers
**Fix**: Remove internal spaces

```markdown
<!-- Bad -->
* bold text *
_ italic text _

<!-- Good -->
*bold text*
_italic text_
```

### MD038 - No Spaces Inside Code Spans

**Rule**: No spaces inside code span markers
**Fix**: Remove internal spaces

```markdown
<!-- Bad -->
` code `

<!-- Good -->
`code`
```

### MD039 - No Spaces Inside Link Text

**Rule**: No spaces inside link text brackets
**Fix**: Remove internal spaces

```markdown
<!-- Bad -->
[ link ](url)

<!-- Good -->
[link](url)
```

## Links & Images

### MD011 - Reversed Link Syntax

**Rule**: Correct link syntax order
**Fix**: Swap brackets and parentheses

```markdown
<!-- Bad -->
(text)[url]

<!-- Good -->
[text](url)
```

### MD034 - No Bare URLs

**Rule**: URLs should be wrapped in angle brackets
**Fix**: Add <> around URLs

```markdown
<!-- Bad -->
Visit http://example.com

<!-- Good -->
Visit <http://example.com>
```

### MD042 - No Empty Links

**Rule**: Links must have non-empty text
**Fix**: Add descriptive link text

```markdown
<!-- Bad -->
[](url)

<!-- Good -->
[Link Text](url)
```

### MD044 - Proper Names Capitalization

**Rule**: Proper names should use correct capitalization
**Fix**: Match configured proper names

```markdown
<!-- Example config -->
{
  "proper-names": ["JavaScript", "GitHub", "TypeScript"]
}

<!-- Bad -->
Learn javascript on github

<!-- Good -->
Learn JavaScript on GitHub
```

### MD045 - Image Alt Text

**Rule**: Images must have alt text
**Fix**: Add descriptive alt text

```markdown
<!-- Bad -->
![](image.png)

<!-- Good -->
![Descriptive alt text](image.png)
```

### MD051 - Link Fragments Must Match Heading

**Rule**: Link fragments should match actual headings
**Fix**: Update fragment to match heading

```markdown
<!-- Document has heading: ## My Section -->

<!-- Bad -->
[Link](#mysection)

<!-- Good -->
[Link](#my-section)
```

### MD052 - Reference Links Must Be Defined

**Rule**: Reference links need definitions
**Fix**: Add link definition or use direct link

```markdown
<!-- Bad -->
[link text][ref]

<!-- Good -->
[link text][ref]

[ref]: https://example.com
```

### MD053 - Reference Link Label Must Be Defined

**Rule**: Link labels must be defined
**Fix**: Add matching definition

### MD054 - Link Image Style

**Rule**: Consistent link/image reference style
**Fix**: Use shortcut, full, or collapsed consistently

```markdown
<!-- Shortcut -->
[link]

<!-- Full -->
[link][ref]

<!-- Collapsed -->
[link][]
```

## Code

### MD014 - Dollar Signs in Code Blocks

**Rule**: No dollar signs for command examples
**Fix**: Remove $ from code blocks showing commands

````markdown
<!-- Bad -->
```bash
$ npm install
```

<!-- Good -->
```bash
npm install
```
````

### MD040 - Language Specified for Code Blocks

**Rule**: Fenced code blocks should specify language
**Fix**: Add language identifier

````markdown
<!-- Bad -->
```
code here
```

<!-- Good -->
```javascript
code here
```
````

### MD046 - Code Block Style

**Rule**: Consistent code block style
**Fix**: Use fenced or indented consistently

````markdown
<!-- Fenced (preferred) -->
```js
code
```

<!-- Indented -->
    code
````

### MD048 - Code Fence Style

**Rule**: Consistent fence style (backticks or tildes)
**Fix**: Use same style throughout

````markdown
<!-- Backticks (preferred) -->
```js
code
```

<!-- Tildes -->
~~~js
code
~~~
````

### MD049 - Emphasis Style

**Rule**: Consistent emphasis style
**Fix**: Use * or _ consistently

```markdown
<!-- Asterisk style -->
*italic* and **bold**

<!-- Underscore style -->
_italic_ and __bold__
```

### MD050 - Strong Style

**Rule**: Consistent strong style
**Fix**: Use ** or __ consistently

## HTML & Special

### MD033 - No Inline HTML

**Rule**: No inline HTML allowed
**Fix**: Use markdown syntax or configure allowed elements

```markdown
<!-- Bad -->
<div>Content</div>

<!-- Good -->
**Content** (use markdown)

<!-- Or configure allowed_elements -->
{
  "MD033": {
    "allowed_elements": ["div", "span"]
  }
}
```

### MD035 - Horizontal Rule Style

**Rule**: Consistent horizontal rule style
**Fix**: Use same style (---, ***, ___)

```markdown
<!-- Consistent -->
Content

---

More content

---
```

### MD036 - No Emphasis Instead of Heading

**Rule**: Don't use emphasis as heading substitute
**Fix**: Use proper heading syntax

```markdown
<!-- Bad -->
**Section Title**

<!-- Good -->
## Section Title
```

### MD047 - Files Should End with Newline

**Rule**: Files should end with single newline
**Fix**: Add newline at file end

## Line Length

### MD013 - Line Length

**Rule**: Line length limit (default 80)
**Fix**: Break long lines
**Note**: Often disabled for code blocks and tables

```json
{
  "MD013": {
    "line_length": 80,
    "code_blocks": false,
    "tables": false
  }
}
```

## Common Configurations

### Relaxed Config

```json
{
  "default": true,
  "MD013": false,
  "MD033": {
    "allowed_elements": ["br", "details", "summary"]
  },
  "MD041": false
}
```

### Strict Config

```json
{
  "default": true,
  "MD013": {
    "line_length": 80,
    "code_blocks": false
  },
  "MD004": {
    "style": "asterisk"
  },
  "MD046": {
    "style": "fenced"
  }
}
```
