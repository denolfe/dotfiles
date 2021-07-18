import {
  KarabinerComplexModifications,
  Key,
} from 'https://raw.githubusercontent.com/esamattis/deno_karabiner/master/lib/karabiner.ts'
import { hyper, ultra } from './lib/hyper.ts'
import { chromeOnly, nonAppleDevice } from './lib/conditions.ts'
import { remap } from './lib/remap.ts'

const mods = new KarabinerComplexModifications()

mods.addRule({
  description: 'Hyper Key',
  manipulators: [
    {
      from: {
        key_code: 'caps_lock',
        modifiers: {
          optional: ['any'],
        },
      },
      to: [
        {
          key_code: 'left_shift',
          modifiers: ['left_control', 'left_option'],
        },
      ],
      to_if_alone: [
        {
          key_code: 'escape',
        },
      ],
      type: 'basic',
    },
  ],
})

mods.addRule({
  description: 'Swap Command and Option on non-Apple keyboards',
  manipulators: (
    [
      { from: 'left_command', to: 'left_option' },
      { from: 'left_option', to: 'left_command' },
    ] as { from: Key; to: Key }[]
  ).map(pair => {
    return {
      from: {
        key_code: pair.from,
        modifiers: {
          optional: ['any'],
        },
      },
      to: [
        {
          key_code: pair.to,
        },
      ],
      type: 'basic',
      conditions: [nonAppleDevice],
    }
  }),
})

mods.addRule({
  description: 'Ultra Directional Bindings',
  manipulators: [
    // Arrows
    ultra({ key_code: 'h' }, { key_code: 'left_arrow' }),
    ultra({ key_code: 'j' }, { key_code: 'down_arrow' }),
    ultra({ key_code: 'k' }, { key_code: 'up_arrow' }),
    ultra({ key_code: 'l' }, { key_code: 'right_arrow' }),

    // Arrows + Shift
    hyper({ key_code: 'h' }, { key_code: 'left_arrow', modifiers: ['left_shift'] }),
    hyper({ key_code: 'j' }, { key_code: 'down_arrow', modifiers: ['left_shift'] }),
    hyper({ key_code: 'k' }, { key_code: 'up_arrow', modifiers: ['left_shift'] }),
    hyper({ key_code: 'l' }, { key_code: 'right_arrow', modifiers: ['left_shift'] }),

    ultra({ key_code: 'n' }, { key_code: 'left_arrow', modifiers: ['left_command'] }), // Home
    ultra({ key_code: 'p' }, { key_code: 'right_arrow', modifiers: ['left_command'] }), // End
    ultra({ key_code: 'm' }, { key_code: 'left_arrow', modifiers: ['left_option'] }), // Left one word
    ultra({ key_code: 'period' }, { key_code: 'right_arrow', modifiers: ['left_option'] }), // Right one word

    hyper({ key_code: 'n' }, { key_code: 'left_arrow', modifiers: ['left_shift', 'left_command'] }), // Home + Shift
    hyper(
      { key_code: 'p' },
      { key_code: 'right_arrow', modifiers: ['left_shift', 'left_command'] },
    ), // End + Shift
    hyper({ key_code: 'm' }, { key_code: 'left_arrow', modifiers: ['left_shift', 'left_option'] }), // Left one word + Shift
    hyper(
      { key_code: 'period' },
      { key_code: 'right_arrow', modifiers: ['left_shift', 'left_option'] },
    ), // Right one word + Shift

    ultra({ key_code: 'u' }, { key_code: 'page_down' }), // TODO: Needs PR
    ultra({ key_code: 'i' }, { key_code: 'page_up' }), // TODO: Needs PR
    hyper({ key_code: 'u' }, { key_code: 'down_arrow', modifiers: ['left_command'] }), // End of page
    hyper({ key_code: 'i' }, { key_code: 'up_arrow', modifiers: ['left_command'] }), // Top of page
  ],
})

mods.addRule({
  description: 'Ultra Remaps (forward delete, spaces, mission control)',
  manipulators: [
    ultra({ key_code: 'delete_or_backspace' }, { key_code: 'delete_forward' }), // Forward delete

    // Forward delete word
    hyper(
      { key_code: 'delete_or_backspace' },
      { key_code: 'delete_forward', modifiers: ['fn', 'left_option'] },
    ),
    ultra({ key_code: 'a' }, { key_code: 'left_arrow', modifiers: ['left_control'] }), // Spaces left
    ultra({ key_code: 'd' }, { key_code: 'right_arrow', modifiers: ['left_control'] }), // Spaces right

    ultra({ key_code: 's' }, { key_code: 'mission_control' }), // Mission Control
    hyper({ key_code: 's' }, { key_code: 'down_arrow', modifiers: ['left_control'] }), // App windows
  ],
})

mods.addRule({
  description: 'Chrome Remappings',
  manipulators: [
    {
      // Cmd+K Mapping
      from: {
        key_code: 'k',
        modifiers: {
          mandatory: ['left_command'],
        },
      },
      to: [
        {
          key_code: 'l',
          modifiers: ['left_command'],
        },
        {
          key_code: 'slash',
          modifiers: ['left_shift'],
        },
      ],
      conditions: [chromeOnly],
      type: 'basic',
    },
    {
      // Ctrl+K Mapping for non-Apple keyboards
      from: {
        key_code: 'k',
        modifiers: {
          mandatory: ['left_control'],
        },
      },
      to: [
        {
          key_code: 'l',
          modifiers: ['left_command'],
        },
        {
          key_code: 'slash',
          modifiers: ['left_shift'],
        },
      ],
      conditions: [chromeOnly, nonAppleDevice],
      type: 'basic',
    },
    {
      // Ctrl+H History for non-Apple keyboards
      from: {
        key_code: 'h',
        modifiers: {
          mandatory: ['left_control'],
        },
      },
      to: [
        {
          key_code: 'y',
          modifiers: ['left_command'],
        },
      ],
      conditions: [chromeOnly, nonAppleDevice],
      type: 'basic',
    },
    {
      // Cmd+H History
      from: {
        key_code: 'h',
        modifiers: {
          mandatory: ['left_command'],
        },
      },
      to: [
        {
          key_code: 'y',
          modifiers: ['left_command'],
        },
      ],
      conditions: [chromeOnly],
      type: 'basic',
    },
  ],
})

mods.addRule({
  description: 'PC-Style Remaps (home, end, arrows)',
  manipulators: [
    // Home/End
    remap({ key_code: 'home' }, { key_code: 'left_arrow', modifiers: ['left_command'] }),
    remap(
      { key_code: 'home', modifiers: { mandatory: ['left_shift'] } },
      { key_code: 'left_arrow', modifiers: ['left_command', 'left_shift'] },
    ),
    remap({ key_code: 'end' }, { key_code: 'right_arrow', modifiers: ['left_command'] }),
    remap(
      { key_code: 'end', modifiers: { mandatory: ['left_shift'] } },
      { key_code: 'right_arrow', modifiers: ['left_command', 'left_shift'] },
    ),

    // Ctrl + Arrows
    remap(
      { key_code: 'left_arrow', modifiers: { mandatory: ['left_control'] } },
      { key_code: 'left_arrow', modifiers: ['left_option'] },
      [nonAppleDevice],
    ),
    remap(
      { key_code: 'right_arrow', modifiers: { mandatory: ['left_control'] } },
      { key_code: 'right_arrow', modifiers: ['left_option'] },
      [nonAppleDevice],
    ),
    remap(
      { key_code: 'down_arrow', modifiers: { mandatory: ['left_control'] } },
      { key_code: 'down_arrow', modifiers: ['left_command'] },
      [nonAppleDevice],
    ),
    remap(
      { key_code: 'up_arrow', modifiers: { mandatory: ['left_control'] } },
      { key_code: 'up_arrow', modifiers: ['left_command'] },
      [nonAppleDevice],
    ),

    // Ctrl + Arrows + Shift
    remap(
      {
        key_code: 'left_arrow',
        modifiers: { mandatory: ['left_control', 'left_shift'] },
      },
      { key_code: 'left_arrow', modifiers: ['left_option', 'left_shift'] },
      [nonAppleDevice],
    ),
    remap(
      {
        key_code: 'right_arrow',
        modifiers: { mandatory: ['left_control', 'left_shift'] },
      },
      { key_code: 'right_arrow', modifiers: ['left_option', 'left_shift'] },
      [nonAppleDevice],
    ),
    remap(
      {
        key_code: 'down_arrow',
        modifiers: { mandatory: ['left_control', 'left_shift'] },
      },
      { key_code: 'down_arrow', modifiers: ['left_command', 'left_shift'] },
      [nonAppleDevice],
    ),
    remap(
      {
        key_code: 'up_arrow',
        modifiers: { mandatory: ['left_control', 'left_shift'] },
      },
      { key_code: 'up_arrow', modifiers: ['left_command', 'left_shift'] },
      [nonAppleDevice],
    ),
  ],
})

mods.writeToProfile('Deno')
