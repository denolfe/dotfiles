export function initWindowCaching() {
  const [win1, win2] = Screen.main()
    .windows()
    .filter(w => w.isNormal())

  cacheWindow(win1)
  if (win2 && win1 !== win2) {
    cacheWindow(win2)
  }
  logCache()

  Event.on('appDidActivate', () => {
    const win = Window.focused()
    if (!win || !win.isNormal()) return
    cacheWindow(win)
  })

  Event.on('windowDidFocus', () => {
    const win = Window.focused()
    if (!win || !win.isNormal()) return
    cacheWindow(win)
  })

  Event.on('spaceDidChange', () => {
    cacheWindowsOnScreen()
  })
}

type CachedWindow = { window: Window; screenId: number }
export const windowCache: CachedWindow[] = []

export function cacheWindow(win: Window) {
  // Clear cache if new screen
  const screenId = Screen.main().hash()
  if (screenId !== windowCache[0]?.screenId) {
    console.log('Clearing cache')
    windowCache.length = 0
  }
  // Insert at beginning of array
  windowCache.unshift({ window: win, screenId: Screen.main().hash() })
  if (windowCache.length > 2) windowCache.pop()
  logCache()
}

export function logCache() {
  console.log(
    'cache',
    windowCache.map(w => w.window.title()),
  )
}

export function getPrevWindow(): Window | undefined {
  return windowCache[1]?.window
}

export function cacheWindowsOnScreen() {
  windowCache.length = 0
  const screenId = Screen.main()
  const [win1, win2] = Window.recent().filter(
    w => w.screen().hash() === screenId.hash() && w.isNormal(),
  )
  if (win2) cacheWindow(win2)
  if (win1) cacheWindow(win1)
}
