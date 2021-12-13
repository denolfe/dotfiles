import {
  Key,
  Manipulator,
  KeyPressTo,
  KeyPressFrom,
} from 'https://raw.githubusercontent.com/esamattis/deno_karabiner/master/lib/karabiner.ts'

const hyperMods: Key[] = ['left_control', 'left_shift', 'left_option']
const hyperCmdMods: Key[] = ['left_control', 'left_shift', 'left_option', 'left_command']

function bind(from: KeyPressFrom, to: KeyPressTo): Manipulator {
  return {
    type: 'basic',
    from: {
      key_code: from.key_code,
      modifiers: {
        mandatory: from.modifiers?.mandatory,
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

/**
 * CapsLock + Key
 */
export function hyper(from: KeyPressFrom, to: KeyPressTo): Manipulator {
  from.modifiers = {
    mandatory: hyperMods,
  }
  return bind(from, to)
}

/**
 * CapsLock + Cmd + Key
 */
export function hyperCmd(from: KeyPressFrom, to: KeyPressTo): Manipulator {
  from.modifiers = {
    mandatory: hyperCmdMods,
  }
  return bind(from, to)
}
