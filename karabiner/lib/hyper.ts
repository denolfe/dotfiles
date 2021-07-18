import {
  Key,
  Manipulator,
  KeyPressTo,
  KeyPressFrom,
} from 'https://raw.githubusercontent.com/esamattis/deno_karabiner/master/lib/karabiner.ts'

const ultraMods: Key[] = ['left_control', 'left_shift', 'left_option']
const hyperMods: Key[] = ['left_control', 'left_shift', 'left_option', 'left_command']

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
 * CapsLock + Cmd + Key
 */
export function ultra(from: KeyPressFrom, to: KeyPressTo): Manipulator {
  from.modifiers = {
    mandatory: ultraMods,
  }
  return bind(from, to)
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
