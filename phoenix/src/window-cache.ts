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
    console.log('EVENT: appDidActivate')
    const win = Window.focused()
    if (!win || !win.isNormal()) return
    cacheWindow(win)
  })

  /**
   * Disabled. This conflicts with appDidActivate.
   * However, if a new app is launched, it will not be cached until clicked.
   * */
  // Event.on('windowDidFocus', () => {
  //   console.log('EVENT: windowDidFocus')
  //   const win = Window.focused()
  //   logCache()
  //   if (!win || !win.isNormal()) return
  //   cacheWindow(win)
  // })

  Event.on('spaceDidChange', () => {
    console.log('EVENT: spaceDidChange')
    cacheWindowsOnScreen()
  })

  Event.on('mouseDidLeftClick', ({ x, y }) => {
    console.log('EVENT: mouseDidLeftClick')
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
    `cache: ${windowCache.length}`,
    windowCache.map(w => `${w.window.app().name()}`).join(', '),
  )
}

export function getPrevWindow(): Window | undefined {
  return windowCache[1]?.window
}

export function cacheWindowsOnScreen(screen?: Screen) {
  windowCache.length = 0
  const screenId = screen ?? Screen.main()
  const [win1, win2] = Window.recent().filter(
    w => w?.screen()?.hash() === screenId.hash() && w.isNormal(),
  )
  if (win2) cacheWindow(win2)
  if (win1) cacheWindow(win1)
}
