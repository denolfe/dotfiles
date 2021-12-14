import {
  Key,
  Manipulator,
  KeyPressTo,
  KeyPressFrom,
} from 'https://raw.githubusercontent.com/esamattis/deno_karabiner/master/lib/karabiner.ts'

const hyperMods: Key[] = ['left_control', 'left_shift', 'left_option']
const hyperCmdMods: Key[] = ['left_control', 'left_shift', 'left_option', 'left_command']

/**
 * CapsLock + Key
 */
export function hyper(from: Key, to: Key, options?: { modifiers: Key[] }): Manipulator {
  return bind(
    { key_code: from },
    {
      key_code: to,
      ...(options?.modifiers && { modifiers: options?.modifiers }),
    },
    hyperMods,
  )
}

/**
 * CapsLock + Cmd + Key
 */
export function hyperCmd(from: Key, to: Key, options?: { modifiers: Key[] }): Manipulator {
  return bind(
    { key_code: from },
    {
      key_code: to,
      ...(options?.modifiers && { modifiers: options?.modifiers }),
    },
    hyperCmdMods,
  )
}

function bind(from: KeyPressFrom, to: KeyPressTo, mods: Key[]): Manipulator {
  return {
    type: 'basic',
    from: {
      key_code: from.key_code,
      modifiers: {
        mandatory: mods,
      },
    },
    to: [
      {
        key_code: to.key_code,
        modifiers: to?.modifiers,
      },
    ],
  }
}
