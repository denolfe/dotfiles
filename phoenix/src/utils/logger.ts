declare var console: any

function logInternal(...args: any[]): void {
  args = args.map((arg) => stringify(arg))
  Phoenix.log(...args)
  // tslint:disable-next-line:no-console
  console.trace(...args)
}

// tslint:disable-next-line:prefer-object-spread
export const log = Object.assign(logInternal, {
  notify: (...args: any[]): void => {
    args = args.map((arg) => stringify(arg))
    Phoenix.log(...args)
    const message = args.join(' ')
    Phoenix.notify(message)
    // tslint:disable-next-line:no-console
    console.trace(...args)
  },
  noTrace: (...args: any[]): void => {
    args = args.map((arg) => stringify(arg))
    Phoenix.log(...args)
    // tslint:disable-next-line:no-console
    console.log(...args)
  },
})

function stringify(value: any) {
  if (value instanceof Error) {
    let stack = ''
    if (value.stack) {
      const s = value.stack.trim().split('\n')
      s[0] += ` (:${value.line}:${value.column})`
      const indented = s.map((line) => '\t at ' + line).join('\n')
      stack = `\n${indented}`
    }
    return `\n${value.toString()}${stack}`
  }
  switch (typeof value) {
    case 'object':
      return '\n' + JSON.stringify(value, null, 2)
    case 'function':
      return value.toString()
    default:
      return value
  }
}
