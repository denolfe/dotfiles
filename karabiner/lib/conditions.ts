import { Condition } from 'https://raw.githubusercontent.com/esamattis/deno_karabiner/master/lib/karabiner.ts'

export const chromeOnly: Condition = {
  type: 'frontmost_application_if',
  // deno-lint-ignore camelcase
  bundle_identifiers: ['^com\\.google\\.Chrome$'],
}

export const nonAppleDevice: Condition = {
  type: 'device_unless',
  identifiers: [
    {
      vendor_id: 1452,
    },
  ],
}

export const dropAltKeyboard: Condition = {
  type: 'device_if',
  identifiers: [
    {
      vendor_id: 1240,
      product_id: 61139,
    },
  ],
}
