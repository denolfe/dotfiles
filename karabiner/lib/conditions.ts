// deno-lint-ignore-file camelcase
import { Condition } from './types.ts'

type FrontmostApp = 'chrome' | 'vscode' | 'slack' | 'spotify'

const bundleMap: Record<FrontmostApp, string> = {
  chrome: 'com.google.Chrome',
  vscode: 'com.microsoft.VSCode',
  slack: 'com.tinyspeck.slackmacgap',
  spotify: 'com.spotify.client',
}

export function ifApp(app: FrontmostApp): Condition {
  return {
    type: 'frontmost_application_if',
    bundle_identifiers: [bundleMap[app]],
  }
}

export function notApp(app: FrontmostApp): Condition {
  return {
    type: 'frontmost_application_unless',
    bundle_identifiers: [bundleMap[app]],
  }
}

export const nonAppleDevice: Condition = {
  type: 'device_unless',
  identifiers: [
    {
      vendor_id: 1452,
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
