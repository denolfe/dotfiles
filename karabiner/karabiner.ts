import { Condition, KarabinerComplexModifications, Key, KeyPressTo } from "https://deno.land/x/karabiner@v0.2.0/karabiner.ts";
import type { KeyPressFrom, Manipulator } from "https://deno.land/x/karabiner@v0.2.0/karabiner.ts";

const mods = new KarabinerComplexModifications();
const ultraMods: KeyPressFrom['modifiers'] = {
  mandatory: [
    "left_control",
    "left_shift",
    "left_option"
  ]
}
const hyperMods: KeyPressFrom['modifiers'] = {
  mandatory: [
    "left_control",
    "left_shift",
    "left_option",
    "left_command"
  ]
}

function capsBind(modifiers: KeyPressFrom['modifiers'], fromKeyCode: Key, to: Key, toMods?: Key[]): Manipulator {
  return {
    type: 'basic',
    from: {
      key_code: fromKeyCode,
      modifiers: modifiers,
    },
    to: [
      {
        key_code: to,
        modifiers: toMods ?? undefined,
      }
    ]
  }
}

function ultra(fromKeyCode: Key, to: Key, toMods?: Key[]): Manipulator { return capsBind(ultraMods, fromKeyCode, to, toMods) }

function hyper(fromKeyCode: Key, to: Key, toMods?: Key[]): Manipulator { return capsBind(hyperMods, fromKeyCode, to, toMods) }

function hyperAhk(fromKeyCode: Key, to: ModdedKey): Manipulator {
  const parsed = parseKey(to)
  return capsBind(hyperMods, fromKeyCode, parsed.key_code!, parsed.modifiers)
}
function ultraAhk(fromKeyCode: Key, to: ModdedKey | Key): Manipulator {
  const parsed = parseKey(to)
  return capsBind(ultraMods, fromKeyCode, parsed.key_code!, parsed.modifiers)
}


const conditions: Record<'chromeOnly' | 'nonAppleDevice' | 'dropAltKeyboard', Condition> = {
  chromeOnly: {
    type: "frontmost_application_if",
    bundle_identifiers: [
      "^com\\.google\\.Chrome$"
    ]
  },
  nonAppleDevice: {
    type: "device_unless",
    identifiers: [
      {
        vendor_id: 1452
      }
    ]
  },
  dropAltKeyboard: {
    type: "device_if",
    identifiers: [
      {
        vendor_id: 1240,
        product_id: 61139
      }
    ]
  }
};

mods.addRule({
  description: 'Hyper Key',
  manipulators: [
    {
      from: {
        key_code: "caps_lock",
        modifiers: {
          optional: ["any"]
        }
      },
      to: [
        {
          key_code: 'left_shift',
          modifiers: [
            'left_control',
            'left_option'
          ]
        }
      ],
      to_if_alone: [
        {
          key_code: 'escape'
        }
      ],
      type: "basic"
    }
  ]
})

mods.addRule(
  {
    description: "Swap Command and Option on non-Apple keyboards",
    manipulators:
      ([{ from: 'left_command', to: 'left_option' }, { from: 'left_option', to: 'left_command' }] as { from: Key, to: Key }[])
        .map((pair) => {
          return {
            from: {
              key_code: pair.from,
              modifiers: {
                optional: ["any"]
              }
            },
            to: [
              {
                key_code: pair.to,
              }
            ],
            type: "basic",
            conditions: [conditions.nonAppleDevice],
          }
        })
  }
)


type AhkMod = '+' | '^' | '#' | '!'
type ModdedKey = `${'+' | '^' | '#' | '!' | '+#' | '!#' | '+!#' | '+!'}${Key}`
// const k: ModdedKey = ""

function parseKey(key: ModdedKey | Key): KeyPressTo {
  const modifiers: Key[] = []
  let stringKey: string = key as string

  type ModMap = Record<AhkMod, Key>
  const modMap: ModMap = {
    '+': 'left_shift',
    '#': 'left_command',
    '^': 'left_control',
    '!': 'left_option',
  }

  const replacements: AhkMod[] = ['+', '^', '#', '!']

  replacements.forEach(r => {
    if (stringKey.includes(r)) {
      modifiers.push(modMap[r])
      stringKey = stringKey.replace(r, '')
    }
  })

  return {
    key_code: stringKey as Key,
    modifiers
  }
}

mods.addRule({
  description: "Ultra Directional Bindings",
  manipulators: [
    // Arrows
    ultraAhk("h", "left_arrow"),
    ultraAhk("j", "down_arrow"),
    ultraAhk("k", "up_arrow"),
    ultraAhk("l", "right_arrow"),

    // Arrows + Shift
    // hyper("h", "left_arrow", ["left_shift"]),
    hyperAhk("h", "+left_arrow"),
    hyperAhk("j", "+down_arrow"),
    hyperAhk("k", "+up_arrow"),
    hyperAhk("l", "+right_arrow"),

    ultraAhk("n", "#left_arrow"), // Home
    ultraAhk("p", "#right_arrow"), // End
    ultraAhk("m", "!left_arrow"), // Left one word
    ultraAhk("period", "!right_arrow"), // Right one word

    hyperAhk("n", "+#left_arrow"), // Home + Shift
    hyperAhk("p", "+#right_arrow"), // End + Shift
    hyperAhk("m", "+!left_arrow"), // Left one word + Shift
    hyperAhk("period", "+!right_arrow"), // Right one word + Shift

    // ultra("u", "page_down"), // TODO: Needs PR
    // ultra("i", "page_up"), // TODO: Needs PR
    hyperAhk("u", "#down_arrow"), // End of page
    hyperAhk("i", "#up_arrow"), // Top of page
  ],
});

mods.addRule({
  description: "Ultra Remaps (forward delete, spaces, mission control)",
  manipulators: [
    ultra("delete_or_backspace", "delete_forward"), // Forward delete
    // hyper("delete_or_backspace", "delete_forward", ["fn", "left_option"]), // Forward delete word
    ultra("a", "left_arrow", ["left_control"]),  // Spaces left
    ultra("d", "right_arrow", ["left_control"]), // Spaces right

    // ultra("s", "mission_control"), // Mission Control
    hyper("s", "down_arrow", ["left_control"]) // App windows
  ]
})

mods.writeToProfile("Deno");