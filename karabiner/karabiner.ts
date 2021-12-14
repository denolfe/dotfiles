import { KarabinerComplexModifications } from 'https://raw.githubusercontent.com/esamattis/deno_karabiner/master/lib/karabiner.ts'
import { hyper, hyperCmd } from './lib/hyper.ts'
import { ifApp, notApp } from './lib/conditions.ts'
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
  description: 'Hyper/Hyper+Cmd Directional Bindings',
  manipulators: [
    // Arrows
    hyper('h', 'left_arrow'),
    hyper('j', 'down_arrow'),
    hyper('k', 'up_arrow'),
    hyper('l', 'right_arrow'),

    // Arrows + Shift
    hyperCmd('h', 'left_arrow', { modifiers: ['left_shift'] }),
    hyperCmd('j', 'down_arrow', { modifiers: ['left_shift'] }),
    hyperCmd('k', 'up_arrow', { modifiers: ['left_shift'] }),
    hyperCmd('l', 'right_arrow', { modifiers: ['left_shift'] }),

    // Home/End
    hyper('n', 'left_arrow', { modifiers: ['left_command'] }),
    hyper('p', 'right_arrow', { modifiers: ['left_command'] }),

    // Left/Right one word
    hyper('m', 'left_arrow', { modifiers: ['left_option'] }),
    hyper('period', 'right_arrow', { modifiers: ['left_option'] }),

    // Home/End + Shift
    hyperCmd('n', 'left_arrow', { modifiers: ['left_shift', 'left_command'] }),
    hyperCmd('p', 'right_arrow', { modifiers: ['left_shift', 'left_command'] }),

    // Left/Right one word + Shift
    hyperCmd('m', 'left_arrow', { modifiers: ['left_shift', 'left_option'] }),
    hyperCmd('period', 'right_arrow', { modifiers: ['left_shift', 'left_option'] }),

    // Page Up/Down
    hyper('u', 'page_down'),
    hyper('i', 'page_up'),

    // Start/End of page
    hyperCmd('u', 'down_arrow', { modifiers: ['left_command'] }),
    hyperCmd('i', 'up_arrow', { modifiers: ['left_command'] }),
  ],
})

mods.addRule({
  description: 'Disable Specific macOS Shortcuts',
  manipulators: [
    // Disable Cmd+H
    remap(
      { key_code: 'h', modifiers: { mandatory: ['left_command'] } },
      undefined,
      [notApp('chrome')], // Allow for Cmd+H to be remapped in Chrome
    ),

    // Disable Cmd+M
    remap({ key_code: 'm', modifiers: { mandatory: ['left_command'] } }, undefined),
  ],
})

mods.addRule({
  description: 'Hyper/Hyper+Cmd Remaps (forward delete, spaces, mission control)',
  manipulators: [
    hyper('delete_or_backspace', 'delete_forward'), // Forward delete

    // Forward delete word
    hyperCmd('delete_or_backspace', 'delete_forward', { modifiers: ['fn', 'left_option'] }),

    // Spaces Left/Right
    hyper('a', 'left_arrow', { modifiers: ['left_control'] }),
    hyper('d', 'right_arrow', { modifiers: ['left_control'] }),

    hyper('s', 'mission_control'), // Mission Control
    hyperCmd('s', 'down_arrow', { modifiers: ['left_control'] }), // App windows
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
      [ifApp('chrome')],
    ),
    // Cmd+H History
    remap(
      { key_code: 'h', modifiers: { mandatory: ['left_command'] } },
      { key_code: 'y', modifiers: ['left_command'] },
      [ifApp('chrome')],
    ),
    // Cmd+J Downloads
    remap(
      { key_code: 'j', modifiers: { mandatory: ['left_command'] } },
      { key_code: 'l', modifiers: ['left_command', 'left_option'] },
      [ifApp('chrome')],
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
      [ifApp('slack')],
    ),
    // Forward
    remap(
      { key_code: 'equal_sign', modifiers: { mandatory: ['left_option'] } },
      { key_code: 'close_bracket', modifiers: ['left_command'] },
      [ifApp('slack')],
    ),
    remap(
      { key_code: 'p', modifiers: { mandatory: ['left_command'] } },
      { key_code: 'k', modifiers: ['left_command'] },
      [ifApp('slack')],
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

mods.writeToProfile('Default profile')
