#!/usr/bin/env bun

import path from 'node:path'

import { marked } from 'marked'
import { markedTerminal } from 'marked-terminal'

import { terminalColors } from './lib/colors'
import { outputWithImages, prepareImages, replaceImageBlocks } from './lib/images'
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

export {
  MERMAID_BLOCK_REGEX,
  replaceMermaidBlocks,
  replaceImageBlocks,
  prepareImages,
  outputWithImages,
}
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

async function main(): Promise<void> {
  const filePath = process.argv[2]
  const basePath = filePath ? path.dirname(path.resolve(filePath)) : undefined

  const markdown = await readInput()
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
  await outputWithImages(rendered, images)
}

if (import.meta.main) {
  main().catch(err => {
    console.error('Error:', err.message)
    process.exit(1)
  })
}
