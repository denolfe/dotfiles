/**
 * Utility functions for Claude Code hooks
 */

/**
 * Run a hook handler with automatic stdin/stdout handling
 *
 * Reads JSON input from stdin, parses it, invokes the handler, outputs
 * the result as JSON to stdout (if any), and exits with code 0.
 *
 * @template TInput - Hook input type
 * @template TOutput - Hook output type
 * @param handler - Hook handler function to invoke
 * @returns Never returns (calls process.exit)
 *
 * @example
 * import { runHook } from './utils'
 *
 * const handler: PreToolUseHandler<BashToolInput> = (data) => {
 *   // ... your logic
 * }
 *
 * runHook(handler)
 */
export async function runHook<TInput, TOutput>(
  handler: (input: TInput) => TOutput | void
): Promise<never> {
  const input = await Bun.stdin.text()
  const data = JSON.parse(input) as TInput

  const result = handler(data)
  if (result) {
    console.log(JSON.stringify(result))
  }

  process.exit(0)
}
