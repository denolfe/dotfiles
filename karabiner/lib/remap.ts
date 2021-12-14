import {
  Manipulator,
  KeyPressTo,
  KeyPressFrom,
  Condition,
} from 'https://raw.githubusercontent.com/esamattis/deno_karabiner/master/lib/karabiner.ts'
import { nonAppleDevice } from './conditions.ts'

/**
 * Remap 2 keys, optional condition
 */
export function remap(
  from: KeyPressFrom,
  to: KeyPressTo | KeyPressTo[] | undefined,
  conditions: Condition[] = [nonAppleDevice],
): Manipulator {
  const mapped: Manipulator = {
    type: 'basic',
    from: {
      key_code: from.key_code,
      modifiers: {
        optional: ['any'],
      },
    },
    ...(to && { to: Array.isArray(to) ? to : [to] }),
    conditions,
  }

  if (from.modifiers) {
    mapped.from.modifiers = { mandatory: from.modifiers.mandatory }
  }

  return mapped
}
