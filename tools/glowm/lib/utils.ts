/** Reads markdown from file path or stdin. */
export async function readInput(filePath?: string): Promise<string> {
  if (filePath) {
    const file = Bun.file(filePath)
    if (!(await file.exists())) {
      throw new Error(`File not found: ${filePath}`)
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
    throw new Error('Usage: glowm <file.md>\n       cat file.md | glowm')
  }

  return Buffer.concat(chunks).toString('utf-8')
}
