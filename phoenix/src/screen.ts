import { osascript } from './utils/osascript'

const screenCache: Record<string, Screen> = {}
const screenCount: number = Screen.all().length

export const getInternalDisplay = () => screenCache['internal']
export const getMainDisplay = () => screenCache['main']
export const getScreenCount = () => screenCount

export function initScreens() {
  const allScreens = Screen.all()
  screenCache['main'] = allScreens[0]

  allScreens.forEach(screen => {
    if (screen.flippedFrame().width === 1728) {
      screenCache['internal'] = screen
    } else {
      screenCache['secondary'] = screen
    }
  })

  // Debug
  Object.entries(screenCache).forEach(([name, screen]) =>
    console.log(name + ':', screen.flippedVisibleFrame().width),
  )

  console.log('Screen count:', screenCount)
}

export function setMaxBrightnessOnDocking() {
  if (getScreenCount() < 2) return

  osascript([
    'tell application "System Events"',
    'repeat 10 times',
    'key code 144',
    'end repeat',
    'end tell',
  ])
}
