import { Manipulator, KeyPressTo, KeyPressFrom, Condition } from './types.ts'
import { nonAppleDevice } from './conditions.ts'

/**
 * Remap 2 keys, optional condition
 */
export function remap(
  from: KeyPressFrom,
  to: KeyPressTo | KeyPressTo[] | undefined,
  conditions: Condition[] = [nonAppleDevice],
  options?: {
    toIfAlone?: Manipulator['to_if_alone']
    toIfHeldDown?: Manipulator['to_if_held_down']
  },
): Manipulator {
  const { toIfAlone, toIfHeldDown } = options || {}
  const mapped: Manipulator = {
    type: 'basic',
    from: {
      key_code: from.key_code,
      modifiers: {
        optional: ['any'],
      },
    },
    ...(to && { to: Array.isArray(to) ? to : [to] }),
    ...(toIfAlone && { to_if_alone: toIfAlone }),
    ...(toIfHeldDown && { to_if_held_down: toIfHeldDown }),
    conditions,
  }

  if (from.modifiers) {
    mapped.from.modifiers = { mandatory: from.modifiers.mandatory }
  }

  return mapped
}

export function unmap(from: KeyPressFrom, conditions: Condition[] = [nonAppleDevice]): Manipulator {
  return remap(from, undefined, conditions)
}
