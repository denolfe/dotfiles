import { Key, Manipulator } from 'https://deno.land/x/karabiner@v0.2.0/karabiner.ts';
import { AhkKey, parseFrom, parseTo } from './ahk.ts';

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
export function hyper(from: AhkKey, to: AhkKey): Manipulator {
  const parsedFrom = parseFrom(from)
  const parsedTo = parseTo(to)
  return capsBind(parsedFrom.key_code, parsedTo.key_code, hyperMods, parsedTo.modifiers)
}

/**
 * CapsLock + Key
 */
export function ultra(from: AhkKey, to: AhkKey): Manipulator {
  const parsedFrom = parseFrom(from)
  const parsedTo = parseTo(to)
  return capsBind(parsedFrom.key_code, parsedTo.key_code, ultraMods, parsedTo.modifiers)
}