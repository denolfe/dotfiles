import fs from 'node:fs'
import path from 'node:path'

import supportsTerminalGraphics from 'supports-terminal-graphics'
import terminalImage from 'terminal-image'

import { colors } from './colors'

const IMAGE_REGEX = /!\[([^\]]*)\]\(([^)]+)\)/g
const IMAGE_WIDTH = '50%'
const CHUNK_SIZE = 4096
const IMAGE_PLACEHOLDER = '\x00IMG:'
const IMAGE_INDENT = '  '

type ImageMatch = {
  full: string
  alt: string
  src: string
  index: number
}

type ImageData = {
  buffer: Buffer
  alt: string
}

type PreparedImages = {
  markdown: string
  images: Map<string, ImageData>
}

/** Check if we should use Kitty protocol (writes directly to stdout). */
export function useKittyProtocol(): boolean {
  return process.stdout.isTTY === true && supportsTerminalGraphics.stdout.kitty
}

/**
 * Prepare images: replace markdown image syntax with placeholders.
 * Returns modified markdown and map of placeholder -> image data.
 */
export async function prepareImages(
  markdown: string,
  basePath?: string
): Promise<PreparedImages> {
  const matches = parseImageMatches(markdown)
  const images = new Map<string, ImageData>()

  if (matches.length === 0) {
    return { markdown, images }
  }

  let result = markdown
  // Process in reverse to preserve indices
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i]
    const imageData = await loadImage(match, basePath)

    if (imageData) {
      const id = `${IMAGE_PLACEHOLDER}${i}\x00`
      images.set(id, imageData)
      result =
        result.slice(0, match.index) + id + result.slice(match.index + match.full.length)
    } else {
      // Failed to load - use fallback text
      const fallback = formatFallback(match.alt, match.src, 'failed to load')
      result =
        result.slice(0, match.index) +
        fallback +
        result.slice(match.index + match.full.length)
    }
  }

  return { markdown: result, images }
}

/**
 * Output rendered content, replacing placeholders with actual images.
 * For Kitty protocol, writes images directly to stdout.
 * For ANSI fallback, returns string with rendered images inline.
 */
export async function outputWithImages(
  rendered: string,
  images: Map<string, ImageData>
): Promise<void> {
  const useKitty = useKittyProtocol()

  // Find all placeholders and split content
  const placeholderRegex = /\x00IMG:\d+\x00/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = placeholderRegex.exec(rendered)) !== null) {
    // Output text before placeholder
    const textBefore = rendered.slice(lastIndex, match.index)
    if (textBefore) process.stdout.write(textBefore)

    // Output image
    const placeholder = match[0]
    const imageData = images.get(placeholder)
    if (imageData) {
      await outputImage(imageData, useKitty)
    }

    lastIndex = match.index + placeholder.length
  }

  // Output remaining text
  const remaining = rendered.slice(lastIndex)
  if (remaining) process.stdout.write(remaining)
}

async function outputImage(imageData: ImageData, useKitty: boolean): Promise<void> {
  const { buffer, alt } = imageData
  const imageColumns = calculateImageColumns()

  process.stdout.write('\n')

  if (useKitty) {
    process.stdout.write(IMAGE_INDENT)
    writeKittyImage(buffer)
  } else {
    const rendered = await terminalImage.buffer(buffer, {
      width: IMAGE_WIDTH,
      preferNativeRender: false,
    })
    // Indent each line of ANSI block output
    const indented = rendered
      .split('\n')
      .map(line => (line ? IMAGE_INDENT + line : line))
      .join('\n')
    process.stdout.write(indented)
  }

  process.stdout.write(formatCaption(alt, imageColumns))
}

function calculateImageColumns(): number {
  const termWidth = process.stdout.columns || 80
  const percentage = Number.parseFloat(IMAGE_WIDTH) / 100
  return Math.floor((termWidth - 2) * percentage)
}

function formatCaption(alt: string, imageWidth: number): string {
  if (!alt) return '\n'

  // Center the caption within image width
  const padding = Math.max(0, Math.floor((imageWidth - alt.length) / 2))
  const centered = ' '.repeat(padding) + alt
  return `\n${IMAGE_INDENT}${colors.caption(centered)}\n`
}

/** Write image using Kitty graphics protocol directly to stdout. */
function writeKittyImage(buffer: Buffer): void {
  const base64 = buffer.toString('base64')

  // Calculate columns
  const termWidth = process.stdout.columns || 80
  const percentage = Number.parseFloat(IMAGE_WIDTH) / 100
  const columns = Math.floor((termWidth - 2) * percentage)

  // Send in chunks
  for (let i = 0; i < base64.length; i += CHUNK_SIZE) {
    const chunk = base64.slice(i, i + CHUNK_SIZE)
    const isFirst = i === 0
    const isLast = i + CHUNK_SIZE >= base64.length

    if (isFirst) {
      // f=100: PNG, a=T: transmit+display, c: columns
      process.stdout.write(`\x1b_Gf=100,a=T,c=${columns},m=${isLast ? 0 : 1};${chunk}\x1b\\`)
    } else {
      process.stdout.write(`\x1b_Gm=${isLast ? 0 : 1};${chunk}\x1b\\`)
    }
  }
}

// Legacy export for backwards compatibility
export async function replaceImageBlocks(
  markdown: string,
  basePath?: string
): Promise<string> {
  const matches = parseImageMatches(markdown)
  if (matches.length === 0) return markdown

  const replacements = await Promise.all(
    matches.map(match => renderImageReplacement(match, basePath))
  )

  let result = markdown
  for (let i = matches.length - 1; i >= 0; i--) {
    const match = matches[i]
    result =
      result.slice(0, match.index) +
      replacements[i] +
      result.slice(match.index + match.full.length)
  }

  return result
}

function parseImageMatches(markdown: string): ImageMatch[] {
  const matches: ImageMatch[] = []
  let match: RegExpExecArray | null

  while ((match = IMAGE_REGEX.exec(markdown)) !== null) {
    matches.push({
      full: match[0],
      alt: match[1],
      src: match[2],
      index: match.index,
    })
  }

  return matches
}

async function loadImage(
  match: ImageMatch,
  basePath?: string
): Promise<ImageData | null> {
  const { alt, src } = match

  let imagePath = src
  if (basePath && !src.startsWith('/') && !src.startsWith('http')) {
    imagePath = path.resolve(basePath, src)
  }

  try {
    if (imagePath.startsWith('http')) {
      const response = await fetch(imagePath)
      if (!response.ok) return null
      const arrayBuffer = await response.arrayBuffer()
      return { buffer: Buffer.from(arrayBuffer), alt }
    }

    if (!fs.existsSync(imagePath)) return null
    return { buffer: fs.readFileSync(imagePath), alt }
  } catch {
    return null
  }
}

async function renderImageReplacement(
  match: ImageMatch,
  basePath?: string
): Promise<string> {
  const imageData = await loadImage(match, basePath)
  if (!imageData) {
    return formatFallback(match.alt, match.src, 'failed to load')
  }

  const rendered = await terminalImage.buffer(imageData.buffer, {
    width: IMAGE_WIDTH,
    preferNativeRender: false,
  })
  return formatRenderedImage(rendered, imageData.alt)
}

function formatRenderedImage(rendered: string, alt: string): string {
  const caption = alt ? `\n${IMAGE_INDENT}${colors.dim(alt)}` : ''
  // Indent each line
  const indented = rendered
    .split('\n')
    .map(line => (line ? IMAGE_INDENT + line : line))
    .join('\n')
  return `\n${indented}${caption}\n`
}

function formatFallback(alt: string, src: string, reason: string): string {
  const label = colors.imageLabel(`${alt || 'Image'} →`)
  const styledPath = colors.imagePath(src)
  const error = colors.dim(`(${reason})`)
  return `${IMAGE_INDENT}${label} ${styledPath} ${error}`
}
