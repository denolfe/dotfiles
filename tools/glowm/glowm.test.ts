import { describe, expect, test } from 'bun:test'
import chalk from 'chalk'
import { Marked } from 'marked'
import { markedTerminal } from 'marked-terminal'

// Force colors in test environment (chalk auto-detects no TTY)
chalk.level = 3

import {
  addBlockquotePipe,
  addCodeBlockBox,
  addIndent,
  collapseNestedListBlanks,
  fixCheckboxSpacing,
  fixListInlineTokens,
  replaceMermaidBlocks,
  styleImage,
} from './glowm'

// Styling options for tests (subset of terminalColors)
const testColors = {
  strong: chalk.bold,
  codespan: chalk.red,
}

function hasAnsiBold(s: string): boolean {
  return s.includes('\x1b[1m')
}

function hasAnsiColor(s: string): boolean {
  return /\x1b\[3[0-9]m/.test(s)
}

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, '')
}

function renderMarkdown(md: string): string {
  const instance = new Marked()
  const extension = markedTerminal({ width: 80, tab: 2, ...testColors })
  fixListInlineTokens(extension)
  addIndent(extension)
  addBlockquotePipe(extension)
  addCodeBlockBox(extension)
  instance.use(extension)
  return instance.parse(md) as string
}

function renderMarkdownWithoutFix(md: string): string {
  const instance = new Marked()
  const extension = markedTerminal({ width: 80 })
  instance.use(extension)
  return instance.parse(md) as string
}

function renderMarkdownWithCheckboxFix(md: string): string {
  const instance = new Marked()
  const extension = markedTerminal({ width: 80, tab: 2 })
  fixCheckboxSpacing(extension)
  instance.use(extension)
  return instance.parse(md) as string
}

function renderMarkdownWithImageStyle(md: string): string {
  const instance = new Marked()
  const extension = markedTerminal({ width: 80, tab: 2 })
  styleImage(extension)
  instance.use(extension)
  return instance.parse(md) as string
}

function renderMarkdownWithNestedListFix(md: string): string {
  const instance = new Marked()
  const extension = markedTerminal({ width: 80, tab: 2 })
  collapseNestedListBlanks(extension)
  instance.use(extension)
  return instance.parse(md) as string
}

function countBlankLines(output: string): number {
  const lines = output.split('\n')
  return lines.filter(l => !l.replace(/\x1b\[[0-9;]*m/g, '').trim()).length
}

function countBlankLinesBetween(output: string, textA: string, textB: string): number {
  const lines = output.split('\n')
  const idxA = lines.findIndex(l => stripAnsi(l).includes(textA))
  const idxB = lines.findIndex(l => stripAnsi(l).includes(textB))
  if (idxA === -1 || idxB === -1) return -1
  let blanks = 0
  for (let i = idxA + 1; i < idxB; i++) {
    if (!lines[i]!.replace(/\x1b\[[0-9;]*m/g, '').trim()) blanks++
  }
  return blanks
}

describe('replaceMermaidBlocks', () => {
  test('replaces a single mermaid block with ASCII art', () => {
    const input = '```mermaid\ngraph LR\n  A --> B\n```'
    const result = replaceMermaidBlocks(input)

    expect(result).not.toContain('```mermaid')
    expect(result).toContain('```text')
    expect(result).toContain('A')
    expect(result).toContain('B')
    expect(result).toMatch(/[┌─┐▌└┘►]/)
  })

  test('replaces multiple mermaid blocks', () => {
    const input = [
      '# Title',
      '',
      '```mermaid',
      'graph LR',
      '  A --> B',
      '```',
      '',
      'Middle text',
      '',
      '```mermaid',
      'graph TD',
      '  C --> D',
      '```',
    ].join('\n')
    const result = replaceMermaidBlocks(input)

    expect(result).not.toContain('```mermaid')
    expect(result.match(/```text/g)?.length).toBe(2)
  })

  test('preserves non-mermaid code blocks unchanged', () => {
    const input = '```javascript\nconst x = 1\n```'
    const result = replaceMermaidBlocks(input)

    expect(result).toBe(input)
  })

  test('falls back to raw source for invalid diagrams', () => {
    const input = '```mermaid\nthis is not valid mermaid\n```'
    const result = replaceMermaidBlocks(input)

    expect(result).toBe(input)
  })

  test('trims trailing whitespace from each ASCII line', () => {
    const input = '```mermaid\ngraph LR\n  A --> B\n```'
    const result = replaceMermaidBlocks(input)

    const fenceMatch = result.match(/```text\n([\s\S]+)\n```/)
    expect(fenceMatch).toBeTruthy()
    const lines = fenceMatch![1]!.split('\n')
    for (const line of lines) {
      expect(line).toBe(line.trimEnd())
    }
  })

  test('wraps output in ```text fence', () => {
    const input = '```mermaid\ngraph LR\n  A --> B\n```'
    const result = replaceMermaidBlocks(input)

    expect(result).toMatch(/^```text\n[\s\S]+\n```$/)
  })

  test('handles extra whitespace after ```mermaid', () => {
    const input = '```mermaid   \ngraph LR\n  A --> B\n```'
    const result = replaceMermaidBlocks(input)

    expect(result).not.toContain('```mermaid')
    expect(result).toContain('```text')
  })

  test('mixed content: text + mermaid + code + text', () => {
    const input = [
      '# Title',
      '',
      'Some text',
      '',
      '```mermaid',
      'graph LR',
      '  A --> B',
      '```',
      '',
      '```js',
      'code()',
      '```',
      '',
      'More text',
    ].join('\n')
    const result = replaceMermaidBlocks(input)

    expect(result).toContain('# Title')
    expect(result).toContain('Some text')
    expect(result).toContain('More text')
    expect(result).toContain('```js')
    expect(result).not.toContain('```mermaid')
    expect(result).toContain('```text')
  })

  test('empty mermaid block falls back to raw source', () => {
    const input = '```mermaid\n\n```'
    const result = replaceMermaidBlocks(input)

    expect(result).toBe(input)
  })

  test('unclosed mermaid fence is not matched', () => {
    const input = '```mermaid\ngraph LR\n  A --> B'
    const result = replaceMermaidBlocks(input)

    expect(result).toBe(input)
  })
})

describe('fixListInlineTokens', () => {
  test('bold in list items produces ANSI bold', () => {
    const output = renderMarkdown('- **bold** text')

    expect(hasAnsiBold(output)).toBe(true)
    expect(stripAnsi(output)).toContain('bold')
  })

  test('inline code in list items produces ANSI color', () => {
    const output = renderMarkdown('- uses `code` here')

    expect(hasAnsiColor(output)).toBe(true)
    expect(stripAnsi(output)).toContain('code')
  })

  test('mixed bold and code together', () => {
    const output = renderMarkdown('- **bold** and `code` together')

    expect(hasAnsiBold(output)).toBe(true)
    expect(hasAnsiColor(output)).toBe(true)
    expect(stripAnsi(output)).toContain('bold')
    expect(stripAnsi(output)).toContain('code')
  })

  test('ordered lists with inline formatting', () => {
    const output = renderMarkdown('1. **first** item\n2. `second` item')

    expect(hasAnsiBold(output)).toBe(true)
    expect(hasAnsiColor(output)).toBe(true)
  })

  test('nested lists with inline formatting', () => {
    const output = renderMarkdown('- outer **bold**\n  - inner `code`')

    expect(hasAnsiBold(output)).toBe(true)
    expect(hasAnsiColor(output)).toBe(true)
  })

  test('loose list items still work', () => {
    const output = renderMarkdown('- **first** item\n\n- **second** item')

    expect(hasAnsiBold(output)).toBe(true)
    expect(stripAnsi(output)).toContain('first')
    expect(stripAnsi(output)).toContain('second')
  })

  test('task list items with inline formatting', () => {
    const output = renderMarkdown('- [x] **done** task\n- [ ] pending task')

    expect(hasAnsiBold(output)).toBe(true)
    expect(stripAnsi(output)).toContain('done')
  })

  test('plain list items without formatting still work', () => {
    const output = renderMarkdown('- plain item one\n- plain item two')
    const plain = stripAnsi(output)

    expect(plain).toContain('plain item one')
    expect(plain).toContain('plain item two')
  })

  test('list items with links', () => {
    const output = renderMarkdown('- [click here](https://example.com)')
    const plain = stripAnsi(output)

    expect(plain).toContain('click here')
  })

  test('without fix: bold in non-loose list items is NOT rendered', () => {
    const output = renderMarkdownWithoutFix('- **bold** text')

    expect(hasAnsiBold(output)).toBe(false)
    expect(stripAnsi(output)).toContain('**bold**')
  })
})

describe('addIndent', () => {
  test('paragraphs are indented', () => {
    const output = renderMarkdown('Hello world')
    const plain = stripAnsi(output)

    for (const line of plain.split('\n')) {
      if (line.trim()) expect(line).toMatch(/^\s{2}/)
    }
  })

  test('headings are indented', () => {
    const output = renderMarkdown('## My Heading')
    const plain = stripAnsi(output)

    for (const line of plain.split('\n')) {
      if (line.trim()) expect(line).toMatch(/^\s{2}/)
    }
  })
})

describe('addBlockquotePipe', () => {
  test('blockquote lines have a pipe character', () => {
    const output = renderMarkdown('> Quote text')
    const plain = stripAnsi(output)

    const quoteLine = plain.split('\n').find(l => l.includes('Quote text'))
    expect(quoteLine).toBeTruthy()
    expect(quoteLine).toContain('▌')
  })

  test('multiline blockquote has pipe on each line', () => {
    const output = renderMarkdown('> Line one\n> Line two')
    const plain = stripAnsi(output)

    const pipeLines = plain.split('\n').filter(l => l.includes('▌'))
    expect(pipeLines.length).toBeGreaterThanOrEqual(2)
  })

  test('blockquote strips library indent', () => {
    const output = renderMarkdown('> Short')
    const plain = stripAnsi(output)

    const quoteLine = plain.split('\n').find(l => l.includes('Short'))
    // Should not have excessive whitespace (library's 4-space indent removed)
    expect(quoteLine).toMatch(/▌\s{1,3}\S/)
  })
})

describe('addCodeBlockBox', () => {
  test('code block is wrapped in box-drawing characters', () => {
    const output = renderMarkdown('```ts\nconst x = 1\n```')
    const plain = stripAnsi(output)

    expect(plain).toContain('┌')
    expect(plain).toContain('┐')
    expect(plain).toContain('└')
    expect(plain).toContain('┘')
    expect(plain).toContain('│')
  })

  test('text code blocks are not boxed', () => {
    const output = renderMarkdown('```text\nplain text\n```')
    const plain = stripAnsi(output)

    expect(plain).not.toContain('┌')
    expect(plain).not.toContain('└')
  })

  test('box width matches longest line', () => {
    const output = renderMarkdown('```ts\nshort\nthis is a longer line\n```')
    const plain = stripAnsi(output)

    const topLine = plain.split('\n').find(l => l.includes('┌'))
    const bottomLine = plain.split('\n').find(l => l.includes('└'))
    expect(topLine).toBeTruthy()
    expect(bottomLine).toBeTruthy()
    // Top and bottom borders should be the same width
    expect(stripAnsi(topLine!).length).toBe(stripAnsi(bottomLine!).length)
  })

  test('box has vertical padding lines', () => {
    const output = renderMarkdown('```ts\nconst x = 1\n```')
    const plain = stripAnsi(output)

    const lines = plain.split('\n')
    const topIdx = lines.findIndex(l => l.includes('┌'))
    const bottomIdx = lines.findIndex(l => l.includes('└'))
    // Line after top border and line before bottom border should be empty padding
    const afterTop = lines[topIdx + 1]
    const beforeBottom = lines[bottomIdx - 1]
    expect(afterTop).toMatch(/│\s+│/)
    expect(beforeBottom).toMatch(/│\s+│/)
  })
})

describe('fixCheckboxSpacing', () => {
  test('collapses double space after checkbox to single space', () => {
    const output = renderMarkdownWithCheckboxFix('- [x] done task')
    const plain = stripAnsi(output)

    // Should have single space after bracket, not double
    expect(plain).toMatch(/\] \S/)
    expect(plain).not.toMatch(/\] {2,}/)
  })

  test('works with unchecked checkboxes', () => {
    const output = renderMarkdownWithCheckboxFix('- [ ] pending task')
    const plain = stripAnsi(output)

    expect(plain).toMatch(/\] \S/)
    expect(plain).not.toMatch(/\] {2,}/)
  })

  test('works with multiple task items', () => {
    const output = renderMarkdownWithCheckboxFix('- [x] first\n- [ ] second\n- [x] third')
    const plain = stripAnsi(output)

    // Count occurrences of "] " followed by non-space
    const matches = plain.match(/\] \S/g)
    expect(matches?.length).toBe(3)
  })
})

describe('styleImage', () => {
  test('renders image with alt text', () => {
    const output = renderMarkdownWithImageStyle('![Screenshot](./shot.png)')
    const plain = stripAnsi(output)

    expect(plain).toContain('Screenshot →')
    expect(plain).toContain('./shot.png')
    expect(plain).not.toContain('![')
  })

  test('uses "Image" as default when alt is empty', () => {
    const output = renderMarkdownWithImageStyle('![](./image.png)')
    const plain = stripAnsi(output)

    expect(plain).toContain('Image →')
    expect(plain).toContain('./image.png')
  })

  test('handles URL paths', () => {
    const output = renderMarkdownWithImageStyle('![Badge](https://example.com/badge.svg)')
    const plain = stripAnsi(output)

    expect(plain).toContain('Badge →')
    expect(plain).toContain('https://example.com/badge.svg')
  })
})

describe('collapseNestedListBlanks', () => {
  test('no blank lines between parent and sub-items', () => {
    const output = renderMarkdownWithNestedListFix('- Parent\n  - Child one\n  - Child two')
    const blanks = countBlankLinesBetween(output, 'Parent', 'Child one')

    expect(blanks).toBe(0)
  })

  test('no blank lines between sibling sub-items', () => {
    const output = renderMarkdownWithNestedListFix('- Parent\n  - Child one\n  - Child two')
    const blanks = countBlankLinesBetween(output, 'Child one', 'Child two')

    expect(blanks).toBe(0)
  })

  test('no blank lines with deeply nested lists', () => {
    const md = '- A\n  - B\n    - C'
    const output = renderMarkdownWithNestedListFix(md)

    expect(countBlankLinesBetween(output, 'A', 'B')).toBe(0)
    expect(countBlankLinesBetween(output, 'B', 'C')).toBe(0)
  })

  test('fewer blank lines than unfixed output', () => {
    const md = '- Parent\n  - Child one\n  - Child two\n- Another\n  - Sub A'
    const instance = new Marked()
    const ext = markedTerminal({ width: 80, tab: 2 })
    instance.use(ext)
    const unfixed = instance.parse(md) as string
    const fixed = renderMarkdownWithNestedListFix(md)

    expect(countBlankLines(fixed)).toBeLessThan(countBlankLines(unfixed))
  })

  test('flat lists are unaffected', () => {
    const md = '- One\n- Two\n- Three'
    const fixed = renderMarkdownWithNestedListFix(md)
    const plain = stripAnsi(fixed)

    expect(plain).toContain('One')
    expect(plain).toContain('Two')
    expect(plain).toContain('Three')
    expect(countBlankLinesBetween(fixed, 'One', 'Two')).toBe(0)
  })

  test('preserves trailing newlines for inter-block spacing', () => {
    const md = '- Item one\n- Item two'
    const output = renderMarkdownWithNestedListFix(md)

    // List output should end with \n\n for block separation
    expect(output).toMatch(/\n\n$/)
  })

  test('all list content is preserved', () => {
    const md = '- Parent\n  - Child A\n  - Child B\n    - Deep\n- Sibling'
    const output = renderMarkdownWithNestedListFix(md)
    const plain = stripAnsi(output)

    expect(plain).toContain('Parent')
    expect(plain).toContain('Child A')
    expect(plain).toContain('Child B')
    expect(plain).toContain('Deep')
    expect(plain).toContain('Sibling')
  })
})
