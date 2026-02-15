import { renderMermaidAscii } from 'beautiful-mermaid'
import type { RendererObject, Tokens } from 'marked'
import type { TerminalExtension } from 'marked-terminal'

import { colors } from './colors'

export type { TerminalExtension }

type RendererKey = keyof RendererObject
type RendererFn<K extends RendererKey> = NonNullable<RendererObject[K]>

const INDENT = 2
const TAB = ' '.repeat(INDENT)
const ANSI_REGEX = /\x1b\[[0-9;]*m/g
const LEADING_TAB_REGEX = new RegExp(`^${TAB}`)

/** Marker prepended to heading lines for pager detection. */
export const HEADING_MARKER = '\x01'

export { INDENT }

export const MERMAID_BLOCK_REGEX = /```mermaid\s*\n([\s\S]*?)```/g

/** Converts mermaid code blocks to ASCII art using beautiful-mermaid. */
export function replaceMermaidBlocks(markdown: string): string {
  return markdown.replace(MERMAID_BLOCK_REGEX, (raw, diagram: string) => {
    try {
      const ascii = renderMermaidAscii(diagram.trim())
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n')
      return '```text\n' + ascii + '\n```'
    } catch {
      return raw
    }
  })
}

/**
 * marked-terminal bug: non-loose list items have `text` tokens with nested
 * inline tokens (strong, codespan, etc), but `parser.parse` doesn't recurse
 * into `text.tokens`. Promoting them to `paragraph` makes the parser handle
 * inline content correctly.
 */
export function fixListInlineTokens(ext: TerminalExtension): void {
  const orig = getRenderer(ext, 'list')
  ext.renderer.list = function (token: Tokens.List) {
    for (const item of token.items) {
      for (const t of item.tokens) {
        if (t.type === 'text' && 'tokens' in t && t.tokens) {
          ;(t as { type: string }).type = 'paragraph'
        }
      }
    }
    return orig.call(this, token)
  }
}

/**
 * marked-terminal's checkbox() returns `[X] ` (trailing space), and listitem
 * adds another `+ ' '`, causing double space. Fix by collapsing in list output.
 */
export function fixCheckboxSpacing(ext: TerminalExtension): void {
  const orig = getRenderer(ext, 'list')
  ext.renderer.list = function (token: Tokens.List) {
    const result = orig.call(this, token)
    return result ? result.replace(/] {2,}/g, '] ') : result
  }
}

/**
 * Collapses extra blank lines in nested list output. marked-terminal's
 * section() appends \n\n after each block, including nested sub-lists.
 * Lines with only whitespace + ANSI codes survive bulletPointLines'
 * filter(identity) since they're truthy strings.
 */
export function collapseNestedListBlanks(ext: TerminalExtension): void {
  const orig = getRenderer(ext, 'list')
  ext.renderer.list = function (token: Tokens.List) {
    const result = orig.call(this, token)
    if (!result) return result
    return result
      .split('\n')
      .filter(line => !!line.replace(ANSI_REGEX, '').trim())
      .join('\n') + '\n\n'
  }
}

/** Replaces [X] with [✓] for completed checkboxes. */
export function useCheckmark(ext: TerminalExtension): void {
  const orig = getRenderer(ext, 'list')
  ext.renderer.list = function (token: Tokens.List) {
    const result = orig.call(this, token)
    return result ? result.replace(/\[X\]/g, '[✓]') : result
  }
}

/** Adds left indent to paragraphs and headings. */
export function addIndent(ext: TerminalExtension): void {
  const origParagraph = getRenderer(ext, 'paragraph')
  ext.renderer.paragraph = function (token: Tokens.Paragraph) {
    const result = origParagraph.call(this, token)
    if (!result) return result
    return result
      .split('\n')
      .map(line => (line.trim() ? TAB + line : line))
      .join('\n')
  }

  const origHeading = getRenderer(ext, 'heading')
  ext.renderer.heading = function (token: Tokens.Heading) {
    const result = origHeading.call(this, token)
    if (!result) return result
    return result
      .split('\n')
      .map(line => (line.trim() ? HEADING_MARKER + TAB + line : line))
      .join('\n')
  }
}

/** Styles h1: removes "# " prefix and adds themed padding. */
export function styleH1(ext: TerminalExtension): void {
  const orig = getRenderer(ext, 'heading')
  ext.renderer.heading = function (token: Tokens.Heading) {
    const result = orig.call(this, token)
    if (!result || token.depth !== 1) return result

    // Remove "# " prefix (may have ANSI codes before it)
    const withoutHash = result.replace(/^(\s*(?:\x1b\[[0-9;]*m)*)#\s+/, '$1')

    // Add themed spaces around the text
    return withoutHash.replace(/((?:\x1b\[[0-9;]*m)+)(\S.*?\S|\S)((?:\x1b\[[0-9;]*m)+)/, '$1 $2 $3')
  }
}

/** Adds a colored vertical pipe to blockquote lines. */
export function addBlockquotePipe(ext: TerminalExtension): void {
  const orig = getRenderer(ext, 'blockquote')
  const pipe = colors.blockquotePipe('▌')
  ext.renderer.blockquote = function (token: Tokens.Blockquote) {
    const result = orig.call(this, token)
    if (!result) return result
    return (
      '\n' +
      result
        .trim()
        .split('\n')
        .map(line => {
          const stripped = line.replace(/^(\x1b\[[0-9;]*m)*\s+/, '').replace(ANSI_REGEX, '')
          return `  ${pipe}  ${colors.blockquoteText(stripped)}`
        })
        .join('\n') +
      '\n\n'
    )
  }
}

/** Wraps code blocks (except `text`) in a box-drawing border with language label. */
export function addCodeBlockBox(ext: TerminalExtension): void {
  const orig = getRenderer(ext, 'code')
  ext.renderer.code = function (token: Tokens.Code) {
    const result = orig.call(this, token)
    if (!result || !token.lang || token.lang === 'text') return result

    const stripTab = (line: string) => line.replace(LEADING_TAB_REGEX, '')
    const lines = result.split('\n').filter(l => l.trim())
    const width = Math.max(...lines.map(l => visibleLen(stripTab(l))))
    const pad = 2
    const sp = ' '.repeat(pad)
    const inner = width + pad * 2

    const lang = token.lang
    const labelLen = lang.length + 2 // space before and after
    const remaining = Math.max(0, inner - labelLen - 1) // -1 for the ─ after ┌
    const topBorder = colors.dim(`${TAB}┌─ ${lang} ${'─'.repeat(remaining)}┐`)
    const bottomBorder = colors.dim(`${TAB}└${'─'.repeat(inner)}┘`)

    const row = (content: string, vis: number) =>
      `${colors.dim(`${TAB}│`)}${sp}${content}${' '.repeat(width - vis)}${sp}${colors.dim('│')}`
    const empty = row('', 0)

    const boxed = lines.map(l => {
      const content = stripTab(l)
      return row(content, visibleLen(content))
    })

    return `\n${topBorder}\n${empty}\n${boxed.join('\n')}\n${empty}\n${bottomBorder}\n\n`
  }
}


// --- Helpers ---

function getRenderer<K extends RendererKey>(ext: TerminalExtension, key: K): RendererFn<K> {
  const fn = ext.renderer[key]
  if (!fn) throw new Error(`renderer '${key}' not found`)
  return fn as RendererFn<K>
}

function visibleLen(s: string): number {
  return s.replace(ANSI_REGEX, '').length
}
