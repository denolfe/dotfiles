import { Key, Manipulator, KeyPressTo, KeyPressFrom } from 'https://deno.land/x/karabiner@v0.2.0/karabiner.ts';

const ultraMods: Key[] = [
  'left_control',
  'left_shift',
  'left_option'
]
const hyperMods: Key[] = [
  'left_control',
  'left_shift',
  'left_option',
  'left_command'
]

function capsBind(from: Key, to?: Key, fromMods?: Key[], toMods?: Key[]): Manipulator {
  return {
    type: 'basic',
    from: {
      key_code: from,
      modifiers: {
        mandatory: fromMods,
      },
    },
    to: [
      {
        key_code: to,
        modifiers: toMods ?? undefined,
      }
    ]
  }
}

/**
 * CapsLock + Cmd + Key
 */
export function ultra(from: KeyPressFrom, to: KeyPressTo): Manipulator {
  return capsBind(from.key_code, to.key_code, ultraMods, to.modifiers)
}

/**
 * CapsLock + Key
 */
export function hyper(from: KeyPressFrom, to: KeyPressTo): Manipulator {
  return capsBind(from.key_code, to.key_code, hyperMods, to.modifiers)
}