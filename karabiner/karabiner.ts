import { KarabinerComplexModifications } from 'https://raw.githubusercontent.com/esamattis/deno_karabiner/master/lib/karabiner.ts'
import { hyper, ultra } from './lib/hyper.ts'
import { chromeOnly, notChrome, slack } from './lib/conditions.ts'
import { remap } from './lib/remap.ts'

const mods = new KarabinerComplexModifications()

mods.addRule({
  description: 'Hyper Key',
  manipulators: [
    {
      from: { key_code: 'caps_lock', modifiers: { optional: ['any'] } },
      to: [{ key_code: 'left_shift', modifiers: ['left_control', 'left_option'] }],
      to_if_alone: [{ key_code: 'escape' }],
      type: 'basic',
    },
  ],
})

mods.addRule({
  description: 'Swap Command and Option on non-Apple keyboards',
  manipulators: [
    remap({ key_code: 'left_command' }, { key_code: 'left_option' }),
    remap({ key_code: 'left_option' }, { key_code: 'left_command' }),
  ],
})

mods.addRule({
  description: 'Hyper/Ultra Directional Bindings',
  manipulators: [
    // Arrows
    hyper({ key_code: 'h' }, { key_code: 'left_arrow' }),
    hyper({ key_code: 'j' }, { key_code: 'down_arrow' }),
    hyper({ key_code: 'k' }, { key_code: 'up_arrow' }),
    hyper({ key_code: 'l' }, { key_code: 'right_arrow' }),

    // Arrows + Shift
    ultra({ key_code: 'h' }, { key_code: 'left_arrow', modifiers: ['left_shift'] }),
    ultra({ key_code: 'j' }, { key_code: 'down_arrow', modifiers: ['left_shift'] }),
    ultra({ key_code: 'k' }, { key_code: 'up_arrow', modifiers: ['left_shift'] }),
    ultra({ key_code: 'l' }, { key_code: 'right_arrow', modifiers: ['left_shift'] }),

    hyper({ key_code: 'n' }, { key_code: 'left_arrow', modifiers: ['left_command'] }), // Home
    hyper({ key_code: 'p' }, { key_code: 'right_arrow', modifiers: ['left_command'] }), // End
    hyper({ key_code: 'm' }, { key_code: 'left_arrow', modifiers: ['left_option'] }), // Left one word
    hyper({ key_code: 'period' }, { key_code: 'right_arrow', modifiers: ['left_option'] }), // Right one word

    // Home/End + Shift
    ultra({ key_code: 'n' }, { key_code: 'left_arrow', modifiers: ['left_shift', 'left_command'] }),
    ultra(
      { key_code: 'p' },
      { key_code: 'right_arrow', modifiers: ['left_shift', 'left_command'] },
    ),

    // Left/Right one word + Shift
    ultra({ key_code: 'm' }, { key_code: 'left_arrow', modifiers: ['left_shift', 'left_option'] }),
    ultra(
      { key_code: 'period' },
      { key_code: 'right_arrow', modifiers: ['left_shift', 'left_option'] },
    ),

    hyper({ key_code: 'u' }, { key_code: 'page_down' }),
    hyper({ key_code: 'i' }, { key_code: 'page_up' }),
    ultra({ key_code: 'u' }, { key_code: 'down_arrow', modifiers: ['left_command'] }), // End of page
    ultra({ key_code: 'i' }, { key_code: 'up_arrow', modifiers: ['left_command'] }), // Top of page
  ],
})

mods.addRule({
  description: 'Disable Specific macOS Shortcuts',
  manipulators: [
    // Disable Cmd+H
    {
      from: { key_code: 'h', modifiers: { mandatory: ['left_command'] }},
      type: 'basic',
      conditions: [notChrome],
    },
    // Disable Cmd+M
    {
      from: { key_code: 'm', modifiers: { mandatory: ['left_command'] }},
      type: 'basic'
    }
  ]
})

mods.addRule({
  description: 'Hyper/Ultra Remaps (forward delete, spaces, mission control)',
  manipulators: [
    hyper({ key_code: 'delete_or_backspace' }, { key_code: 'delete_forward' }), // Forward delete

    // Forward delete word
    ultra(
      { key_code: 'delete_or_backspace' },
      { key_code: 'delete_forward', modifiers: ['fn', 'left_option'] },
    ),
    hyper({ key_code: 'a' }, { key_code: 'left_arrow', modifiers: ['left_control'] }), // Spaces left
    hyper({ key_code: 'd' }, { key_code: 'right_arrow', modifiers: ['left_control'] }), // Spaces right

    hyper({ key_code: 's' }, { key_code: 'mission_control' }), // Mission Control
    ultra({ key_code: 's' }, { key_code: 'down_arrow', modifiers: ['left_control'] }), // App windows
  ],
})

mods.addRule({
  description: 'Chrome Remappings',
  manipulators: [
    // Cmd+K Omnibar Google Search
    remap(
      { key_code: 'k', modifiers: { mandatory: ['left_command'] } },
      [
        { key_code: 'l', modifiers: ['left_command'] },
        { key_code: 'slash', modifiers: ['left_shift'] },
      ],
      [chromeOnly],
    ),
    // Cmd+H History
    remap(
      { key_code: 'h', modifiers: { mandatory: ['left_command'] } },
      { key_code: 'y', modifiers: ['left_command'] },
      [chromeOnly],
    ),
    // Cmd+J Downloads
    remap(
      { key_code: 'j', modifiers: { mandatory: ['left_command'] } },
      { key_code: 'l', modifiers: ['left_command', 'left_option'] },
      [chromeOnly],
    ),
  ],
})

mods.addRule({
  description: 'Slack Remappings',
  manipulators: [
    // Back
    remap(
      { key_code: 'hyphen', modifiers: { mandatory: ['left_option'] } },
      { key_code: 'open_bracket', modifiers: ['left_command'] },
      [slack],
    ),
    // Forward
    remap(
      { key_code: 'equal_sign', modifiers: { mandatory: ['left_option'] } },
      { key_code: 'close_bracket', modifiers: ['left_command'] },
      [slack],
    ),
    remap(
      { key_code: 'p', modifiers: { mandatory: ['left_command'] } },
      { key_code: 'k', modifiers: ['left_command'] },
      [slack],
    ),
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
    ),
    remap(
      { key_code: 'right_arrow', modifiers: { mandatory: ['left_control'] } },
      { key_code: 'right_arrow', modifiers: ['left_option'] },
    ),
    remap(
      { key_code: 'down_arrow', modifiers: { mandatory: ['left_control'] } },
      { key_code: 'down_arrow', modifiers: ['left_command'] },
    ),
    remap(
      { key_code: 'up_arrow', modifiers: { mandatory: ['left_control'] } },
      { key_code: 'up_arrow', modifiers: ['left_command'] },
    ),

    // Ctrl + Arrows + Shift
    remap(
      {
        key_code: 'left_arrow',
        modifiers: { mandatory: ['left_control', 'left_shift'] },
      },
      { key_code: 'left_arrow', modifiers: ['left_option', 'left_shift'] },
    ),
    remap(
      {
        key_code: 'right_arrow',
        modifiers: { mandatory: ['left_control', 'left_shift'] },
      },
      { key_code: 'right_arrow', modifiers: ['left_option', 'left_shift'] },
    ),
    remap(
      {
        key_code: 'down_arrow',
        modifiers: { mandatory: ['left_control', 'left_shift'] },
      },
      { key_code: 'down_arrow', modifiers: ['left_command', 'left_shift'] },
    ),
    remap(
      {
        key_code: 'up_arrow',
        modifiers: { mandatory: ['left_control', 'left_shift'] },
      },
      { key_code: 'up_arrow', modifiers: ['left_command', 'left_shift'] },
    ),
  ],
})

mods.writeToProfile('Deno')
