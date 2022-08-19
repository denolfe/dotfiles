import { log } from './logger'

export function osascript(script: string) {
  log(`Executing osascript: ${script}`)
  Task.run('/usr/bin/osascript', ['-e', script], (task) => {
    if (task.status) log.notify('osascript status:', task.status)
    if (task.output) log('osascript output:', task.output)
  })
}
