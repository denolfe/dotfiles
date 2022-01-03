import {
  Key,
  Manipulator,
} from 'https://raw.githubusercontent.com/esamattis/deno_karabiner/master/lib/karabiner.ts'

const hyperMods: Key[] = ['left_control', 'left_shift', 'left_option']
const hyperCmdMods: Key[] = ['left_control', 'left_shift', 'left_option', 'left_command']

/**
 * CapsLock + Key
 */
export function hyper(from: Key, to: Key, options?: { modifiers: Key[] }): Manipulator {
  return bind(from, to, hyperMods, options)
}

/**
 * CapsLock + Cmd + Key
 */
export function hyperCmd(from: Key, to: Key, options?: { modifiers: Key[] }): Manipulator {
  return bind(from, to, hyperCmdMods, options)
}

function bind(from: Key, to: Key, mods: Key[], options?: { modifiers: Key[] }): Manipulator {
  return {
    type: 'basic',
    from: {
      key_code: from,
      modifiers: {
        mandatory: mods,
      },
    },
    to: [
      {
        key_code: to,
        ...(options?.modifiers && { modifiers: options?.modifiers }),
      },
    ],
  }
}
