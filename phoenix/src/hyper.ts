export const HYPER: Phoenix.ModifierKey[] = ['ctrl', 'shift', 'option']
export const HYPER_CMD: Phoenix.ModifierKey[] = [...HYPER, 'cmd']

export function hyper(
  key: Phoenix.KeyIdentifier,
  callback: (handler: Key, repeated: boolean) => void,
) {
  return Key.on(key, HYPER, callback)
}

export function hyperCmd(
  key: Phoenix.KeyIdentifier,
  callback: (handler: Key, repeated: boolean) => void,
) {
  return Key.on(key, HYPER_CMD, callback)
}
