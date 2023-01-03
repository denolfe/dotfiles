import { log } from './logger'

export function open(target: string) {
  Task.run('/usr/bin/open', [target], task => {
    if (task.output) {
      log('Opening target:', target)
    }
  })
}
