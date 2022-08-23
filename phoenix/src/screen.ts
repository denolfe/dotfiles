const screenCache: Record<string, Screen> = {}
const screenCount: number = Screen.all().length

export const getInternalDisplay = () => screenCache['internal']
export const getMainDisplay = () => screenCache['main']
export const getScreenCount = () => screenCount

export function initScreens() {
  const allScreens = Screen.all()
  screenCache['main'] = allScreens[0]

  allScreens.forEach(screen => {
    if (screen.flippedFrame().width === 1792) {
      screenCache['internal'] = screen
    } else {
      screenCache['secondary'] = screen
    }
  })

  // Debug
  Object.entries(screenCache).forEach(([name, screen]) =>
    console.log(name, screen.flippedVisibleFrame().width),
  )

  console.log('Screen count:', screenCount)
}
