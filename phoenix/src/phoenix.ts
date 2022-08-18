import { chainWindowPositions, moveToNextScreen } from './window-grid'

console.log('Phoenix Started')

const hyper: Phoenix.ModifierKey[] = ['ctrl', 'shift', 'option']
const hyperCmd: Phoenix.ModifierKey[] = [...hyper, 'cmd']

Key.on(
  '1',
  hyper,
  chainWindowPositions([
    { x: 0, y: 0, w: 7, h: 12 },
    { x: 0, y: 0, w: 5, h: 12 },
    { x: 0, y: 0, w: 4, h: 12 },
    { x: 0, y: 0, w: 8, h: 12 },
  ]),
)

Key.on(
  '3',
  hyper,
  chainWindowPositions([
    { x: 7, y: 0, w: 5, h: 12 },
    { x: 6, y: 0, w: 6, h: 12 },
    { x: 5, y: 0, w: 7, h: 12 },
    { x: 4, y: 0, w: 8, h: 12 },
    { x: 8, y: 0, w: 4, h: 12 },
  ]),
)

Key.on(
  '2',
  hyper,
  chainWindowPositions([
    { x: 0, y: 0, w: 12, h: 12 },
    { x: 0.5, y: 0.5, w: 11, h: 11 },
    { x: 2, y: 1, w: 8, h: 10 },
    { x: 2.5, y: 1.5, w: 7, h: 9 },
  ]),
)

Key.on('4', hyper, () => {
  moveToNextScreen()
})
