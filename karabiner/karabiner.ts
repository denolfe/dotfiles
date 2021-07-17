import { KarabinerComplexModifications, Key } from 'https://deno.land/x/karabiner@v0.2.0/karabiner.ts';
import { hyper, ultra } from './lib/bind.ts';
import { nonAppleDevice } from './lib/conditions.ts';

const mods = new KarabinerComplexModifications();

mods.addRule({
  description: 'Hyper Key',
  manipulators: [
    {
      from: {
        key_code: 'caps_lock',
        modifiers: {
          optional: ['any']
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
      type: 'basic'
    }
  ]
})

mods.addRule(
  {
    description: 'Swap Command and Option on non-Apple keyboards',
    manipulators:
      ([{ from: 'left_command', to: 'left_option' }, { from: 'left_option', to: 'left_command' }] as { from: Key, to: Key }[])
        .map((pair) => {
          return {
            from: {
              key_code: pair.from,
              modifiers: {
                optional: ['any']
              }
            },
            to: [
              {
                key_code: pair.to,
              }
            ],
            type: 'basic',
            conditions: [nonAppleDevice],
          }
        })
  }
)

mods.addRule({
  description: 'Ultra Directional Bindings',
  manipulators: [
    // Arrows
    ultra('h', 'left_arrow'),
    ultra('j', 'down_arrow'),
    ultra('k', 'up_arrow'),
    ultra('l', 'right_arrow'),

    // Arrows + Shift
    hyper('h', '+left_arrow'),
    hyper('j', '+down_arrow'),
    hyper('k', '+up_arrow'),
    hyper('l', '+right_arrow'),

    ultra('n', '#left_arrow'), // Home
    ultra('p', '#right_arrow'), // End
    ultra('m', '!left_arrow'), // Left one word
    ultra('period', '!right_arrow'), // Right one word

    hyper('n', '+#left_arrow'), // Home + Shift
    hyper('p', '+#right_arrow'), // End + Shift
    hyper('m', '+!left_arrow'), // Left one word + Shift
    hyper('period', '+!right_arrow'), // Right one word + Shift

    // ultra('u', 'page_down'), // TODO: Needs PR
    // ultra('i', 'page_up'), // TODO: Needs PR
    hyper('u', '#down_arrow'), // End of page
    hyper('i', '#up_arrow'), // Top of page
  ],
});

mods.addRule({
  description: 'Ultra Remaps (forward delete, spaces, mission control)',
  manipulators: [
    ultra('delete_or_backspace', 'delete_forward'), // Forward delete
    // hyper('delete_or_backspace', 'delete_forward', ['fn', 'left_option']), // Forward delete word
    ultra('a', '^left_arrow'),  // Spaces left
    ultra('d', '^right_arrow'), // Spaces right

    // ultra('s', 'mission_control'), // TODO: Needs PR
    hyper('s', '^down_arrow') // App windows
  ]
})

mods.writeToProfile('Deno');