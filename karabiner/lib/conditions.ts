import { Condition } from 'https://deno.land/x/karabiner@v0.2.0/karabiner.ts';

export const chromeOnly: Condition = {
  type: 'frontmost_application_if',
  // deno-lint-ignore camelcase
  bundle_identifiers: [
    '^com\\.google\\.Chrome$'
  ]
}

  export const nonAppleDevice: Condition = {
    type: 'device_unless',
    identifiers: [
      {
        vendor_id: 1452
      }
    ]
  }

export const dropAltKeyboard: Condition = {
  type: 'device_if',
  identifiers: [
    {
      vendor_id: 1240,
      product_id: 61139
    }
  ]
}