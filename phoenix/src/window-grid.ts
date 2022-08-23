import { getInternalDisplay, getMainDisplay, getScreenCount } from './screen'
import { log } from './utils/logger'

const ROWS = 12
const COLS = 12

type GridValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

type GridPosition = {
  x: number
  y: number
  w: GridValue
  h: GridValue
}

const chainResetInterval = 1500

type SplitWindowLayout = { primary: GridPosition; secondary: GridPosition }

type GridKeys = '8x12' | '7x12' | '6x12' | '5x12' | '4x12'

function calcSplitWindowLayout(primary: GridPosition): SplitWindowLayout {
  const secondaryXy =
    primary.x === 0 && primary.y === 0
      ? { x: primary.w, y: primary.y }
      : { x: 0, y: 0 }

  const secondary: GridPosition = {
    ...secondaryXy,
    w: (COLS - primary.w) as GridValue,
    h: ROWS,
  }
  return { primary, secondary }
}

export const splitWindowLayout: Record<
  'left' | 'right',
  Record<GridKeys, SplitWindowLayout>
> = {
  left: {
    '8x12': calcSplitWindowLayout({ x: 0, y: 0, w: 8, h: 12 }),
    '7x12': calcSplitWindowLayout({ x: 0, y: 0, w: 7, h: 12 }),
    '6x12': calcSplitWindowLayout({ x: 0, y: 0, w: 6, h: 12 }),
    '5x12': calcSplitWindowLayout({ x: 0, y: 0, w: 5, h: 12 }),
    '4x12': calcSplitWindowLayout({ x: 0, y: 0, w: 4, h: 12 }),
  },
  right: {
    '4x12': calcSplitWindowLayout({ x: 8, y: 0, w: 4, h: 12 }),
    '5x12': calcSplitWindowLayout({ x: 7, y: 0, w: 5, h: 12 }),
    '6x12': calcSplitWindowLayout({ x: 6, y: 0, w: 6, h: 12 }),
    '7x12': calcSplitWindowLayout({ x: 5, y: 0, w: 7, h: 12 }),
    '8x12': calcSplitWindowLayout({ x: 4, y: 0, w: 8, h: 12 }),
  },
}

// Share cache between cycle functions
const lastSeenCache: { chainId?: string; windowId?: number; timestamp: number } = {
  timestamp: 0,
}

export function cycleWindowPositions(gridPositions: GridPosition[]) {
  const chainId = String(gridPositions[0].w)
  const cycleLength = gridPositions.length
  let sequenceNumber = 0

  return () => {
    const id = Window.focused()?.hash()
    if (!id) return
    const now = Date.now()

    if (
      lastSeenCache.chainId !== chainId || // Different chain aka different bind
      lastSeenCache.timestamp < now - chainResetInterval || // beyond reset interval
      (lastSeenCache.windowId && lastSeenCache.windowId !== id) || // different window
      sequenceNumber > cycleLength - 1 // restart at first position in chain
    ) {
      sequenceNumber = 0
      lastSeenCache.chainId = chainId
    }

    lastSeenCache.timestamp = now
    lastSeenCache.windowId = id

    move(gridPositions[sequenceNumber])
    sequenceNumber += 1
  }
}

export function cycleWindowSplit(gridPositions: SplitWindowLayout[]) {
  const chainId = String(gridPositions[0].primary.w)
  const cycleLength = gridPositions.length
  let sequenceNumber = 0

  return () => {
    const currentScreen = Window.focused()?.screen()
    if (!currentScreen) return
    const [win1, win2] = Window.recent().filter(w => w.screen() === currentScreen)
    const id = win1.hash()
    const now = Date.now()

    if (
      lastSeenCache.chainId !== chainId || // Different chain aka different bind
      lastSeenCache.timestamp < now - chainResetInterval || // beyond reset interval
      (lastSeenCache.windowId && lastSeenCache.windowId !== id) || // different window
      sequenceNumber > cycleLength - 1 // restart at first position in chain
    ) {
      sequenceNumber = 0
      lastSeenCache.chainId = chainId
    }

    lastSeenCache.timestamp = now
    lastSeenCache.windowId = id

    move(gridPositions[sequenceNumber].primary, win1)
    move(gridPositions[sequenceNumber].secondary, win2)
    sequenceNumber += 1
  }
}

export function move(gridPos: GridPosition, currentWindow?: Window) {
  const win = currentWindow ?? Window.focused()
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
  let win = Window.focused()
  if (!win) return

  // Handle Google Chrome's cmd+f
  if (!win.isNormal() && win.app().name() === 'Google Chrome') {
    win = Window.recent()[1]
    // win = win.app().mainWindow()
  }
  const currentScreen = win.screen()
  let newScreen = currentScreen.next()

  if (currentScreen.isEqual(newScreen)) return

  if (getScreenCount() >= 3) {
    // Avoid internal display in triple
    if (newScreen.flippedVisibleFrame().width === 1792) {
      newScreen = newScreen.next()
    }

    // Always move from internal to main
    if (currentScreen.isEqual(getInternalDisplay())) {
      newScreen = getMainDisplay()
    }
  }

  const ratio = frameRatio(
    currentScreen.flippedVisibleFrame(),
    newScreen.flippedVisibleFrame(),
  )
  win.setFrame(ratio(win.frame()))
}

export function moveToInternalDisplay() {
  let win = Window.focused()
  if (!win) return
  if (!win.isNormal()) win = Window.recent()[1]
  const oldScreen = win.screen()
  const newScreen = getInternalDisplay()

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

function frameRatio(a: Rectangle, b: Rectangle): (frame: Rectangle) => Rectangle {
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
