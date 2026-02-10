/** Reads markdown from file path argument or stdin. */
export async function readInput(): Promise<string> {
  const filePath = process.argv[2]

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
