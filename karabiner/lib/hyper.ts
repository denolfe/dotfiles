import { appMap, AppName } from './apps.ts'
import { ifApp, notApp } from './conditions.ts'
import { Condition, Key, KeyPressTo, Manipulator } from './types.ts'

const HYPER_MODS: Key[] = ['left_control', 'left_shift', 'left_option']
const HYPER_CMD_MODS: Key[] = ['left_control', 'left_shift', 'left_option', 'left_command']

type HyperBindOptions = {
  modifiers?: Key[]
  conditions?: Condition[]
}

/**
 * CapsLock + Key
 */
export function hyper(from: Key, to: Key, options?: HyperBindOptions): Manipulator {
  return bind(from, to, HYPER_MODS, options)
}

/**
 * CapsLock + Cmd + Key
 */
export function hyperCmd(from: Key, to: Key, options?: HyperBindOptions): Manipulator {
  return bind(from, to, HYPER_CMD_MODS, options)
}

/**
 * Launch, focus, or cycle windows of an app with Hyper + Key
 *
 * Executes shell command:
 *    open -a "App Name"
 * If the app is already focused:
 *   send Cmd + ` to cycle windows
 */
export function hyperFocusApp(from: Key, appName: AppName): Manipulator[] {
  const fromWithMods = { key_code: from, modifiers: { mandatory: HYPER_MODS } }
  return [
    {
      type: 'basic',
      from: fromWithMods,
      to: [
        {
          shell_command: `open -a "${appMap[appName].name}"`,
        },
      ],
      conditions: [notApp(appName)],
    },
    {
      type: 'basic',
      from: fromWithMods,
      to: [
        {
          key_code: 'grave_accent_and_tilde',
          modifiers: ['left_command'],
        },
      ],
      conditions: [ifApp(appName)],
    },
  ]
}

function bind(from: Key, to: Key, mods: Key[], options?: HyperBindOptions): Manipulator {
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
    ...(options?.conditions && { conditions: options?.conditions }),
  }
}
