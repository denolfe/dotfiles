// deno-lint-ignore-file camelcase
import { Condition } from './types.ts'

import { AppName, appMap } from './apps.ts'

export function ifApp(app: AppName): Condition {
  return {
    type: 'frontmost_application_if',
    bundle_identifiers: [appMap[app].bundle],
  }
}

export function notApp(app: AppName): Condition {
  return {
    type: 'frontmost_application_unless',
    bundle_identifiers: [appMap[app].bundle],
  }
}

export const nonAppleDevice: Condition = {
  type: 'device_unless',
  identifiers: [
    {
      vendor_id: 1452,
    },
    {
      vendor_id: 0, // M1 macbooks and beyond
    },
  ],
}

export const isDropAltKeyboard: Condition = {
  type: 'device_if',
  identifiers: [
    {
      vendor_id: 1240,
      product_id: 61139,
    },
  ],
}
