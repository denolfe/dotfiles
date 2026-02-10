#!/usr/bin/env bun

import { marked } from 'marked'
import { markedTerminal } from 'marked-terminal'

import { terminalColors } from './lib/colors'
import {
  addBlockquotePipe,
  addCodeBlockBox,
  addIndent,
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

export { MERMAID_BLOCK_REGEX, replaceMermaidBlocks }
export {
  addBlockquotePipe,
  addCodeBlockBox,
  addIndent,
  fixCheckboxSpacing,
  fixListInlineTokens,
  styleH1,
  useCheckmark,
}
export type { TerminalExtension }

async function main(): Promise<void> {
  const markdown = await readInput()
  const processed = replaceMermaidBlocks(markdown)

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
  marked.use(ext)

  process.stdout.write('\n\n' + (marked(processed) as string))
}

if (import.meta.main) {
  main().catch(err => {
    console.error('Error:', err.message)
    process.exit(1)
  })
}
