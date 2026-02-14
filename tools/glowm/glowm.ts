#!/usr/bin/env bun

import path from 'node:path'

import { marked } from 'marked'
import { markedTerminal } from 'marked-terminal'

import { terminalColors } from './lib/colors'
import { outputWithImages, prepareImages } from './lib/images'
import { splitIntoLines } from './lib/lines'
import { runPager } from './lib/pager'
import {
  addBlockquotePipe,
  addCodeBlockBox,
  addIndent,
  collapseNestedListBlanks,
  fixCheckboxSpacing,
  fixListInlineTokens,
  INDENT,
  MERMAID_BLOCK_REGEX,
  replaceMermaidBlocks,
  styleH1,
  useCheckmark,
} from './lib/renderers'
import type { TerminalExtension } from './lib/renderers'
import { readInput } from './lib/utils'

export { MERMAID_BLOCK_REGEX, replaceMermaidBlocks, prepareImages, outputWithImages }
export {
  addBlockquotePipe,
  addCodeBlockBox,
  addIndent,
  collapseNestedListBlanks,
  fixCheckboxSpacing,
  fixListInlineTokens,
  styleH1,
  useCheckmark,
}
export type { TerminalExtension }

type ImageData = {
  buffer: Buffer
  alt: string
}

/** Check if we should use the pager. */
function shouldPaginate(
  content: string,
  images: Map<string, ImageData>,
  noPager: boolean
): boolean {
  // Respect --no-pager flag
  if (noPager) return false

  // Don't paginate if not a TTY (allows piping)
  if (!process.stdout.isTTY) return false

  // Calculate total visual lines
  const termWidth = process.stdout.columns || 80
  const termHeight = process.stdout.rows || 24
  const lines = splitIntoLines(content, termWidth)

  // TODO: Account for image heights
  return lines.length > termHeight
}

/** Parse CLI arguments. */
function parseArgs(): { filePath?: string; noPager: boolean } {
  const args = process.argv.slice(2)
  let filePath: string | undefined
  let noPager = false

  for (const arg of args) {
    if (arg === '--no-pager') {
      noPager = true
    } else if (!arg.startsWith('-')) {
      filePath = arg
    }
  }

  return { filePath, noPager }
}

async function main(): Promise<void> {
  const { filePath, noPager } = parseArgs()
  const basePath = filePath ? path.dirname(path.resolve(filePath)) : undefined

  const markdown = await readInput(filePath)
  const withMermaid = replaceMermaidBlocks(markdown)
  const { markdown: withPlaceholders, images } = await prepareImages(withMermaid, basePath)

  const ext = markedTerminal({
    width: process.stdout.columns || 80,
    tab: INDENT,
    ...terminalColors,
  })
  fixListInlineTokens(ext)
  addIndent(ext)
  styleH1(ext)
  addBlockquotePipe(ext)
  addCodeBlockBox(ext)
  fixCheckboxSpacing(ext)
  useCheckmark(ext)
  collapseNestedListBlanks(ext)
  marked.use(ext)

  const rendered = '\n\n' + (marked(withPlaceholders) as string)

  if (shouldPaginate(rendered, images, noPager)) {
    await runPager(rendered, images)
  } else {
    await outputWithImages(rendered, images)
  }
}

if (import.meta.main) {
  main().catch(err => {
    console.error('Error:', err.message)
    process.exit(1)
  })
}
