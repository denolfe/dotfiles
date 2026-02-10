type ChalkInstance = import('chalk').ChalkInstance
type MarkedExtension = import('marked').MarkedExtension

type TerminalRendererOptions = {
  width?: number
  tab?: number
  firstHeading?: ChalkInstance
  heading?: ChalkInstance
  codespan?: ChalkInstance
  code?: ChalkInstance
  blockquote?: ChalkInstance
  link?: ChalkInstance
  href?: ChalkInstance
  strong?: ChalkInstance
  em?: ChalkInstance
  del?: ChalkInstance
}

type TerminalExtension = MarkedExtension & {
  renderer: NonNullable<MarkedExtension['renderer']>
}

declare module 'marked-terminal' {
  export { TerminalExtension, TerminalRendererOptions }
  export function markedTerminal(options?: TerminalRendererOptions): TerminalExtension
}
