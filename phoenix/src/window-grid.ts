import { arrEquals } from './utils'

const ROWS = 12
const COLS = 12

type GridPosition = {
  x: number
  y: number
  w: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  h: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
}

const chainResetInterval = 1500
let lastSeenChain: GridPosition[] | undefined
let lastSeenWindow: number
let lastSeenAt: number

export function chainWindowPositions(gridPositions: GridPosition[]) {
  const cycleLength = gridPositions.length
  let sequenceNumber = 0

  return () => {
    const win = Window.focused()
    if (!win) return
    const id = win?.hash()
    const now = Date.now()

    if (
      (!!lastSeenChain && !arrEquals(lastSeenChain, gridPositions)) || // Different chain aka different bind
      lastSeenAt < now - chainResetInterval || // beyond reset interval
      lastSeenWindow !== id || // different window
      sequenceNumber > cycleLength - 1 // restart at first position in chain
    ) {
      sequenceNumber = 0
      lastSeenChain = gridPositions
    }

    lastSeenAt = now
    lastSeenWindow = id

    move(gridPositions[sequenceNumber])
    sequenceNumber += 1
  }
}

export function move(gridPos: GridPosition) {
  const win = Window.focused()
  if (!win) return

  const screen = win.screen()
  var newFrame = computeNewFrameFromGrid(screen, gridPos)
  if (!newFrame) return

  win.setFrame({
    x: newFrame.x,
    y: newFrame.y,
    width: newFrame.width,
    height: newFrame.height,
  })
}

export function moveToNextScreen() {
  const win = Window.focused()
  if (!win) return
  const oldScreen = win.screen()
  const newScreen = oldScreen.next()

  if (oldScreen.isEqual(newScreen)) return

  const ratio = frameRatio(
    oldScreen.flippedVisibleFrame(),
    newScreen.flippedVisibleFrame(),
  )
  win.setFrame(ratio(win.frame()))
}

function computeNewFrameFromGrid(
  screen: Screen,
  gridPos: GridPosition,
): Rectangle | undefined {
  const screenRect = screen.flippedVisibleFrame()

  if (!screenRect) return
  var unitX = screenRect.width / COLS
  var unitY = screenRect.height / ROWS
  var newFrame = {
    x: screenRect.x + gridPos.x * unitX,
    y: screenRect.y + gridPos.y * unitY,
    width: gridPos.w * unitX,
    height: gridPos.h * unitY,
  }
  return newFrame
}

type FrameRatio = (frame: Rectangle) => Rectangle

function frameRatio(a: Rectangle, b: Rectangle): FrameRatio {
  const widthRatio = b.width / a.width
  const heightRatio = b.height / a.height

  return ({ width, height, x, y }) => {
    width = Math.round(width * widthRatio)
    height = Math.round(height * heightRatio)
    x = Math.round(b.x + (x - a.x) * widthRatio)
    y = Math.round(b.y + (y - a.y) * heightRatio)

    return { width, height, x, y }
  }
}
