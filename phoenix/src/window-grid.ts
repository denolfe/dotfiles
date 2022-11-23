import { getInternalDisplay, getMainDisplay, getScreenCount } from './screen'
import { log } from './utils/logger'
import { cacheWindowsOnScreen, getPrevWindow } from './window-cache'

/**
 * Window position and size on 0-1 grid
 */
type GridPosition = {
  x: number
  y: number
  w: number
  h: number
}

const CHAIN_RESET_INTERVAL = 1500

type SplitWindowLayout = { primary: GridPosition; secondary: GridPosition }

type SplitWindowGridPositions =
  | 'left66'
  | 'left60'
  | 'left50'
  | 'left40'
  | 'left33'
  | 'right33'
  | 'right40'
  | 'right50'
  | 'right60'
  | 'right66'

type CenteredGridPositions = 'full' | 'big' | 'med' | 'sm' | 'xs'

function calcSplitWindowLayout(primary: GridPosition): SplitWindowLayout {
  const secondaryXy =
    primary.x === 0 && primary.y === 0
      ? { x: primary.w, y: primary.y }
      : { x: 0, y: 0 }

  const secondary: GridPosition = {
    ...secondaryXy,
    w: 1 - primary.w,
    h: 1,
  }
  return { primary, secondary }
}

/**
 * Side-by-side split window layouts
 * 12x12 grid turned into 0-1 values
 */
export const splitWindowLayout: Record<SplitWindowGridPositions, SplitWindowLayout> =
  {
    left66: calcSplitWindowLayout({ x: 0, y: 0, w: 0.67, h: 1 }),
    left60: calcSplitWindowLayout({ x: 0, y: 0, w: 0.58, h: 1 }),
    left50: calcSplitWindowLayout({ x: 0, y: 0, w: 0.5, h: 1 }),
    left40: calcSplitWindowLayout({ x: 0, y: 0, w: 0.42, h: 1 }),
    left33: calcSplitWindowLayout({ x: 0, y: 0, w: 0.33, h: 1 }),
    right33: calcSplitWindowLayout({ x: 0.67, y: 0, w: 0.33, h: 1 }),
    right40: calcSplitWindowLayout({ x: 0.58, y: 0, w: 0.42, h: 1 }),
    right50: calcSplitWindowLayout({ x: 0.5, y: 0, w: 0.5, h: 1 }),
    right60: calcSplitWindowLayout({ x: 0.42, y: 0, w: 0.58, h: 1 }),
    right66: calcSplitWindowLayout({ x: 0.33, y: 0, w: 0.67, h: 1 }),
  }

export const centeredWindowPositions: Record<CenteredGridPositions, GridPosition> = {
  full: centeredWindow16x9(1),
  big: centeredWindow16x9(0.92),
  med: centeredWindow16x9(0.83),
  sm: { x: 0.21, y: 0.125, w: 0.58, h: 0.75 },
  xs: { x: 0.29, y: 0.21, w: 0.42, h: 0.58 },
}

// Share cache between cycle functions
const lastSeenCache: {
  chainId?: string
  windowId?: number
  timestamp: number
  screenId?: number
} = {
  timestamp: 0,
}

export function cycleWindowPositions(gridPositions: GridPosition[]) {
  const chainId = String(gridPositions[0].w)
  const cycleLength = gridPositions.length
  let sequenceNumber = 0

  return () => {
    const win = Window.focused()
    if (!win) return

    const winId = win.hash()
    const screenId = win.screen().hash()
    const now = Date.now()

    // Check if should reset sequence
    if (
      lastSeenCache.chainId !== chainId || // Different chain aka different bind
      lastSeenCache.timestamp < now - CHAIN_RESET_INTERVAL || // Beyond reset interval
      lastSeenCache.windowId !== winId || // Different window
      lastSeenCache.screenId !== screenId || // Different screen
      sequenceNumber > cycleLength - 1 // Beyond cycle length
    ) {
      sequenceNumber = 0
      lastSeenCache.chainId = chainId
    }

    lastSeenCache.timestamp = now
    lastSeenCache.windowId = winId
    lastSeenCache.screenId = screenId

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
    const win1 = Window.focused()
    if (!win1) return

    const win2 = getPrevWindow()

    const winId = win1.hash()
    const screenId = win1.screen().hash()
    const now = Date.now()

    if (
      lastSeenCache.chainId !== chainId || // Different chain aka different bind
      lastSeenCache.timestamp < now - CHAIN_RESET_INTERVAL || // Beyond reset interval
      lastSeenCache.windowId !== winId || // Different window
      lastSeenCache.screenId !== screenId || // Different screen
      sequenceNumber > cycleLength - 1 // Restart at first position in chain
    ) {
      sequenceNumber = 0
      lastSeenCache.chainId = chainId
    }

    lastSeenCache.timestamp = now
    lastSeenCache.windowId = winId
    lastSeenCache.screenId = screenId

    move(gridPositions[sequenceNumber].primary)
    if (win2) move(gridPositions[sequenceNumber].secondary, win2)
    sequenceNumber += 1
  }
}

export function move(gridPos: GridPosition, currentWindow?: Window) {
  const win = currentWindow ?? Window.focused()
  if (!win) return

  const screen = win.screen()
  const newFrame = computeNewFrameFromGrid(screen, gridPos)
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
  cacheWindowsOnScreen()
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
  cacheWindowsOnScreen()
}

export function swapAllWindowsBetweenDisplays() {
  let screen1 = Screen.main()
  if (getScreenCount() === 1) return

  let allScreens = Screen.all()

  let otherScreens = allScreens.filter(s => !s.isEqual(screen1))
  let screen2 =
    getScreenCount() === 2
      ? otherScreens?.[0]
      : otherScreens.filter(s => !s.isEqual(getInternalDisplay()))?.[0]

  if (!screen2) return

  const screen1Windows = screen1.windows()
  const screen2Windows = screen2.windows()

  screen1Windows.forEach(w => moveToSpecificScreen(screen1, screen2, w))
  screen2Windows.forEach(w => moveToSpecificScreen(screen2, screen1, w))
}

export function gatherAllWindows() {
  const allWindows = Screen.all().flatMap(s => {
    return s.windows().filter(w => w.isNormal())
  })

  allWindows.forEach(w => w.setFrame(Screen.main().flippedVisibleFrame()))
}

// Internal Functions

function moveToSpecificScreen(oldScreen: Screen, newScreen: Screen, win: Window) {
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

  const unitX = screenRect.width / 1
  const unitY = screenRect.height / 1
  const newFrame = {
    x: Math.round(screenRect.x + gridPos.x * unitX),
    y: Math.round(screenRect.y + gridPos.y * unitY),
    width: Math.round(gridPos.w * unitX),
    height: Math.round(gridPos.h * unitY),
  }
  return newFrame
}

/** Creates function for maintaining ratio between 2 frames */
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

function winIsInGridPos(win: Window, newGridPos: GridPosition): boolean {
  const screen = win.screen()
  const currentFrame = win.frame()

  if (!newGridPos) return false

  const newFrame = computeNewFrameFromGrid(screen, newGridPos)
  if (!newFrame) return false

  console.log('currentFrame', JSON.stringify(currentFrame))
  console.log('newFrame', JSON.stringify(newFrame))

  // Compare current with proposed
  if (
    currentFrame.x === newFrame.x &&
    currentFrame.y === newFrame.y &&
    currentFrame.height === newFrame.height &&
    currentFrame.width === newFrame.width
  ) {
    return true
  }

  return false
}

/** Get 16:9 window grid position */
function centeredWindow16x9(percent: number): GridPosition {
  const leftXy = (1 - percent) / 2
  return { x: leftXy, y: leftXy, w: percent, h: percent }
}
