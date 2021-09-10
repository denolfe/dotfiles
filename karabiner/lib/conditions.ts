// deno-lint-ignore-file camelcase
import { Condition } from 'https://raw.githubusercontent.com/esamattis/deno_karabiner/master/lib/karabiner.ts'

export const chromeOnly: Condition = {
  type: 'frontmost_application_if',
  bundle_identifiers: ['com.google.Chrome'],
}

export const notChrome: Condition = {
  type: 'frontmost_application_unless',
  bundle_identifiers: ['com.google.Chrome'],
}

export const nonAppleDevice: Condition = {
  type: 'device_unless',
  identifiers: [
    {
      vendor_id: 1452,
    },
  ],
}

export const vsCode: Condition = {
  type: 'frontmost_application_if',
  bundle_identifiers: ['com.microsoft.VSCode'],
}

export const slack: Condition = {
  type: 'frontmost_application_if',
  bundle_identifiers: ['com.tinyspeck.slackmacgap'],
}
