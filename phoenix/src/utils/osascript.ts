import { log } from './logger'

export function osascript(script: string | string[]) {
  log(`Executing osascript: ${script}`)

  let args: string[] = []

  if (Array.isArray(script)) {
    script.forEach(s => {
      args.push('-e', s)
    })
  } else {
    args.push('-e', script)
  }

  Task.run('/usr/bin/osascript', args, task => {
    if (task.status) log.notify('osascript status:', task.status)
    if (task.output) log('osascript output:', task.output)
  })
}
