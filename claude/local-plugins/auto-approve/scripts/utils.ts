/**
 * Run a hook handler with automatic stdin/stdout handling
 *
 * Reads JSON from stdin, invokes handler, outputs result as JSON to stdout.
 */
export async function runHook<TInput, TOutput>(
  handler: (input: TInput) => TOutput | void,
): Promise<never> {
  const input = await Bun.stdin.text()
  const data = JSON.parse(input) as TInput

  const result = handler(data)
  if (result) {
    console.log(JSON.stringify(result))
  }

  process.exit(0)
}
