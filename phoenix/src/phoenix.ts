import { log } from './logger'
import {
  cycleWindowSplit,
  cycleWindowPositions,
  splitWindowLayout,
  moveToNextScreen,
} from './window-grid'

console.log('Phoenix Started')

const HYPER: Phoenix.ModifierKey[] = ['ctrl', 'shift', 'option']
const HYPER_CMD: Phoenix.ModifierKey[] = [...HYPER, 'cmd']

Key.on(
  'w',
  HYPER,
  cycleWindowPositions([
    { x: 0, y: 0, w: 12, h: 12 },
    { x: 0.5, y: 0.5, w: 11, h: 11 },
    { x: 2, y: 1, w: 8, h: 10 },
    { x: 2.5, y: 1.5, w: 7, h: 9 },
  ]),
)

Key.on('tab', HYPER, () => {
  moveToNextScreen()
})

// Cycle 2-window split, left side primary
Key.on(
  'q',
  HYPER,
  cycleWindowSplit([
    splitWindowLayout.left['7x12'],
    splitWindowLayout.left['6x12'],
    splitWindowLayout.left['5x12'],
    splitWindowLayout.left['4x12'],
    splitWindowLayout.left['8x12'],
  ]),
)

// Cycle 2-window split, right side primary
Key.on(
  'e',
  HYPER,
  cycleWindowSplit([
    splitWindowLayout.right['5x12'],
    splitWindowLayout.right['6x12'],
    splitWindowLayout.right['7x12'],
    splitWindowLayout.right['8x12'],
    splitWindowLayout.right['4x12'],
  ]),
)
