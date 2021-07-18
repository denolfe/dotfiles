import {
  Manipulator,
  KeyPressTo,
  KeyPressFrom,
  Condition,
} from 'https://raw.githubusercontent.com/esamattis/deno_karabiner/master/lib/karabiner.ts'
import { nonAppleDevice } from './conditions.ts'

export function remap(
  from: KeyPressFrom,
  to: KeyPressTo,
  conditions: Condition[] = [nonAppleDevice],
): Manipulator {
  const mapped: Manipulator = {
    type: 'basic',
    from: {
      key_code: from.key_code,
    },
    to: [
      {
        key_code: to.key_code,
        modifiers: to.modifiers ?? undefined,
      },
    ],
    conditions: conditions ? [...conditions] : undefined,
  }

  if (from.modifiers) {
    mapped.from.modifiers = { mandatory: from.modifiers.mandatory }
  }

  return mapped
}
