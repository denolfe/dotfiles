#!/usr/bin/env bun

import { renderMermaidAscii } from 'beautiful-mermaid'
import chalk from 'chalk'
import { marked } from 'marked'
// @ts-expect-error no type declarations
import { markedTerminal } from 'marked-terminal'

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type -- markedTerminal returns loosely-typed renderers
type RendererFn = Function
type Extension = { renderer: Record<string, RendererFn | undefined> }

function getRenderer(ext: Extension, key: string): RendererFn {
  const fn = ext.renderer[key]
  if (!fn) throw new Error(`renderer '${key}' not found`)
  return fn
}

export const MERMAID_BLOCK_RE = /```mermaid\s*\n([\s\S]*?)```/g
const INDENT = 2
const TAB = ' '.repeat(INDENT)
const ANSI_RE = /\x1b\[[0-9;]*m/g
const LEADING_TAB_RE = new RegExp(`^${TAB}`)

function visibleLen(s: string): number {
  return s.replace(ANSI_RE, '').length
}

export function replaceMermaidBlocks(markdown: string): string {
  return markdown.replace(MERMAID_BLOCK_RE, (raw, diagram: string) => {
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

export type ListToken = {
  items: { tokens?: { type: string; tokens?: unknown[] }[] }[]
}

/**
 * marked-terminal bug: non-loose list items have `text` tokens with nested
 * inline tokens (strong, codespan, etc), but `parser.parse` doesn't recurse
 * into `text.tokens`. Promoting them to `paragraph` makes the parser handle
 * inline content correctly.
 */
/** marked-terminal's checkbox() returns `[X] ` (trailing space), and listitem
 *  adds another `+ ' '`, causing double space. Fix by collapsing in list output. */
export function fixCheckboxSpacing(ext: Extension): void {
  const orig = getRenderer(ext, 'list')
  ext.renderer.list = function (this: unknown, ...args: [unknown]) {
    const result = orig.apply(this, args) as string
    return result.replace(/] {2,}/g, '] ')
  }
}

export function fixListInlineTokens(ext: Extension): void {
  const orig = getRenderer(ext, 'list')
  ext.renderer.list = function (this: unknown, ...args: [unknown]) {
    const token = args[0] as ListToken
    if (typeof token === 'object' && token.items) {
      for (const item of token.items) {
        for (const t of item.tokens ?? []) {
          if (t.type === 'text' && t.tokens) t.type = 'paragraph'
        }
      }
    }
    return orig.apply(this, args)
  }
}

export function addIndent(ext: Extension): void {
  for (const key of ['paragraph', 'heading'] as const) {
    const orig = getRenderer(ext, key)
    ext.renderer[key] = function (this: unknown, ...args: [unknown]) {
      const result = orig.apply(this, args) as string
      return result
        .split('\n')
        .map(line => (line.trim() ? TAB + line : line))
        .join('\n')
    }
  }
}

export function addBlockquotePipe(ext: Extension): void {
  const orig = getRenderer(ext, 'blockquote')
  const pipe = chalk.hex('#0dbc79')('│')
  ext.renderer.blockquote = function (this: unknown, ...args: [unknown]) {
    const result = (orig.apply(this, args) as string).trim()
    return (
      '\n' +
      result
        .split('\n')
        .map(line => `  ${pipe}  ${line.replace(/^(\x1b\[[0-9;]*m)*\s+/, '$1')}`)
        .join('\n') +
      '\n\n'
    )
  }
}

export function addCodeBlockBox(ext: Extension): void {
  const orig = getRenderer(ext, 'code')
  ext.renderer.code = function (this: unknown, ...args: [unknown]) {
    const result = orig.apply(this, args) as string
    const token = args[0] as { lang?: string }
    const lang = typeof token === 'object' ? token.lang : token
    if (!lang || lang === 'text') return result

    const stripTab = (line: string) => line.replace(LEADING_TAB_RE, '')
    const lines = result.split('\n').filter(l => l.trim())
    const width = Math.max(...lines.map(l => visibleLen(stripTab(l))))
    const pad = 2
    const sp = ' '.repeat(pad)
    const inner = width + pad * 2

    const border = (l: string, r: string) => chalk.dim(`${TAB}${l}${'─'.repeat(inner)}${r}`)
    const row = (content: string, vis: number) =>
      `${chalk.dim(`${TAB}│`)}${sp}${content}${' '.repeat(width - vis)}${sp}${chalk.dim('│')}`
    const empty = row('', 0)

    const boxed = lines.map(l => {
      const content = stripTab(l)
      return row(content, visibleLen(content))
    })

    return `\n${border('┌', '┐')}\n${empty}\n${boxed.join('\n')}\n${empty}\n${border('└', '┘')}\n\n`
  }
}

async function readInput(): Promise<string> {
  const filePath = process.argv[2]

  if (filePath) {
    const file = Bun.file(filePath)
    if (!(await file.exists())) {
      console.error(`File not found: ${filePath}`)
      process.exit(1)
    }
    return await file.text()
  }

  const chunks: Uint8Array[] = []
  const reader = Bun.stdin.stream().getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  if (chunks.length === 0) {
    console.error('Usage: glowm <file.md>')
    console.error('       cat file.md | glowm')
    process.exit(1)
  }

  return Buffer.concat(chunks).toString('utf-8')
}

async function main(): Promise<void> {
  const markdown = await readInput()
  const processed = replaceMermaidBlocks(markdown)

  const ext = markedTerminal({
    width: process.stdout.columns || 80,
    tab: INDENT,
    firstHeading: chalk.hex('#e5e5e5').bold.bgHex('#bc3fbc'),
    heading: chalk.hex('#23d18b').bold,
    codespan: chalk.hex('#f14c4c').bgHex('#303031'),
    code: chalk.hex('#cccccc'),
    blockquote: chalk.hex('#0dbc79').italic,
    link: chalk.hex('#3b8eea'),
    href: chalk.hex('#3b8eea').underline,
    strong: chalk.bold,
    em: chalk.italic,
  })
  fixListInlineTokens(ext)
  addIndent(ext)
  addBlockquotePipe(ext)
  addCodeBlockBox(ext)
  fixCheckboxSpacing(ext)
  marked.use(ext)

  process.stdout.write('\n\n' + (marked(processed) as string))
}

if (import.meta.main) {
  main().catch(err => {
    console.error('Error:', err.message)
    process.exit(1)
  })
}
