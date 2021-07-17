import { Condition, KarabinerComplexModifications, Key, KeyPressTo } from "https://deno.land/x/karabiner@v0.2.0/karabiner.ts";
import type { KeyPressFrom, Manipulator } from "https://deno.land/x/karabiner@v0.2.0/karabiner.ts";

const mods = new KarabinerComplexModifications();
const ultraMods: Key[] = [
  "left_control",
  "left_shift",
  "left_option"
]
const hyperMods: Key[] = [
  "left_control",
  "left_shift",
  "left_option",
  "left_command"
]

function capsBind(from: Key, to?: Key, fromMods?: Key[], toMods?: Key[]): Manipulator {
  return {
    type: 'basic',
    from: {
      key_code: from,
      modifiers: {
        mandatory: fromMods,
      },
    },
    to: [
      {
        key_code: to,
        modifiers: toMods ?? undefined,
      }
    ]
  }
}

function hyperAhk(from: ModdedKey, to: ModdedKey): Manipulator {
  const parsedFrom = parseFrom(from)
  const parsedTo = parseTo(to)
  return capsBind(parsedFrom.key_code, parsedTo.key_code, hyperMods, parsedTo.modifiers)
}
function ultraAhk(from: ModdedKey, to: ModdedKey): Manipulator {
  const parsedFrom = parseFrom(from)
  const parsedTo = parseTo(to)
  return capsBind(parsedFrom.key_code, parsedTo.key_code, ultraMods, parsedTo.modifiers)
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

const ahkMod = ['+', '^', '#', '!'] as const
type AhkMod = typeof ahkMod[number]

type ModdedKey = Key | `${'+' | '^' | '#' | '!' | '+#' | '!#' | '+!#' | '+!'}${Key}`

function formatKey(key: ModdedKey): { key: Key, modifiers: Key[] } {
  const modifiers: Key[] = []
  let stringKey: string = key as string

  type ModMap = Record<AhkMod, Key>
  const modMap: ModMap = {
    '+': 'left_shift',
    '#': 'left_command',
    '^': 'left_control',
    '!': 'left_option',
  }

  ahkMod.forEach(r => {
    if (stringKey.includes(r)) {
      modifiers.push(modMap[r])
      stringKey = stringKey.replace(r, '')
    }
  })

  return {
    key: stringKey as Key,
    modifiers
  }
}

function parseTo(key: ModdedKey): KeyPressTo {
  const { key: stringKey, modifiers } = formatKey(key)

  return {
    key_code: stringKey,
    modifiers
  }
}

function parseFrom(key: ModdedKey): KeyPressFrom {
  const { key: stringKey, modifiers } = formatKey(key)

  return {
    key_code: stringKey,
    modifiers: {
      mandatory: modifiers
    }
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
    ultraAhk("delete_or_backspace", "delete_forward"), // Forward delete
    // hyper("delete_or_backspace", "delete_forward", ["fn", "left_option"]), // Forward delete word
    ultraAhk("a", "^left_arrow"),  // Spaces left
    ultraAhk("d", "^right_arrow"), // Spaces right

    // ultra("s", "mission_control"), // TODO: Needs PR
    hyperAhk("s", "^down_arrow") // App windows
  ]
})

mods.writeToProfile("Deno");