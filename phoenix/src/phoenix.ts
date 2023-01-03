import { log } from './utils/logger'
import * as spotify from './spotify'
import {
  cycleWindowSplit,
  cycleWindowPositions,
  splitWindowLayout as layout,
  moveToNextScreen,
  moveToInternalDisplay,
  swapAllWindowsBetweenDisplays,
  gatherAllWindows,
  centeredWindowPositions as centered,
  gridPositions,
} from './window-grid'
import { getMainDisplay, initScreens } from './screen'
import { titleModal } from './modal'
import { hyperCmd, hyper, HYPER } from './hyper'
import { getClipboard, setClipboard } from './utils/clipboard'
import { initWindowCaching } from './window-cache'

console.log('Phoenix Started')
titleModal('Config Loaded', { icon: App.get('Phoenix')?.icon() })

initScreens()
initWindowCaching()

Event.on('screensDidChange', () => {
  initScreens()
})

hyperCmd('r', () => Phoenix.reload())

// App binds

bindApp(';', 'iTerm')
bindApp('g', 'Google Chrome')
bindApp('c', 'Visual Studio Code')
bindApp('r', 'Notion')
bindApp('v', 'Spotify')
bindCycleApps('f', ['Slack', 'Discord'])

// Spotify Controls

hyper('\\', () => spotify.playOrPause())
hyper(']', () => spotify.nextTrack())
hyper('[', () => spotify.previousTrack())

// Window Manipulation

// Cycle centered position sizes
hyper(
  'w',
  cycleWindowPositions([
    centered.full,
    centered.big,
    centered.med,
    centered.sm,
    centered.xs,
  ]),
)

// 50 split, swap sides on subsequent presses
hyperCmd('w', cycleWindowSplit([layout.left50, layout.right50]))

// Cycle 2-window split, left side primary
hyper(
  'q',
  cycleWindowSplit([
    layout.left66,
    layout.left60,
    layout.left50,
    layout.left40,
    layout.left33,
  ]),
)

// Cycle 2-window split, right side primary
hyper(
  'e',
  cycleWindowSplit([
    layout.right33,
    layout.right40,
    layout.right50,
    layout.right60,
    layout.right66,
  ]),
)

// Cycle left side sizes
hyperCmd(
  'q',
  cycleWindowPositions([
    gridPositions.left66,
    gridPositions.left60,
    gridPositions.left50,
    gridPositions.left40,
    gridPositions.left33,
  ]),
)

// Cycle right side sizes
hyperCmd(
  'e',
  cycleWindowPositions([
    gridPositions.right33,
    gridPositions.right40,
    gridPositions.right50,
    gridPositions.right60,
    gridPositions.right66,
  ]),
)

hyper('tab', () => {
  moveToNextScreen()
})

hyperCmd('tab', () => {
  moveToInternalDisplay()
})

// TODO: Add chording and bind to HYPER_CMD + w
hyper('t', () => {
  swapAllWindowsBetweenDisplays()
  titleModal('All windows swapped', { screen: getMainDisplay() })
})

hyperCmd('t', () => {
  gatherAllWindows()
  titleModal('Gathered all windows')
})

/**
 * Open https link from clipboard with proper protocol for desktop apps
 * Supports: Discord, Notion
 */
hyper('o', async () => {
  let link = await getClipboard()
  log('clipboard:', link)

  const linkReplacements = [
    { includes: 'discord.com/channels/', replaceProtocol: 'discord://' },
    { includes: 'notion.so/', replaceProtocol: 'notion://' },
  ]

  if (link.startsWith('https://')) {
    linkReplacements.forEach(({ includes, replaceProtocol }) => {
      if (link.includes(includes)) {
        link = link.replace('https://', replaceProtocol)
        log('Opening link:', link)
        Task.run('/usr/bin/open', [link], task => {
          if (task.output) {
            // showToast(`Link opened: ${link}`)
            log('Opening link:', link)
          }
        })
      }
    })
    setClipboard(link)
  }
})

// TODO: Gather all windows from single app

/**
 * Launch or focus last app window
 */
function bindApp(key: string, appName: string) {
  Key.on(key, HYPER, () => {
    const app = App.get(appName)
    if (!app || !app.windows().length) {
      App.launch(appName, { focus: true })
    } else if (
      Window.focused()?.app().bundleIdentifier() === app.bundleIdentifier()
    ) {
      // focus second to last window if it exists
      app.windows()[1]?.focus() // TODO: Make this cycle all app windows
    } else {
      app.mainWindow()?.focus() // last used window
    }
  })
}

/**
 * Cycle between 2 apps
 */
function bindCycleApps(key: string, appNames: string[]) {
  Key.on(key, HYPER, () => {
    const apps = appNames.map(a => App.get(a)).filter(Boolean)
    const currentApp = App.focused().name()
    if (currentApp === apps[0]?.name()) {
      apps[1]?.focus() || App.launch(appNames[1], { focus: true })
    } else {
      apps[0]?.focus() || App.launch(appNames[0], { focus: true })
    }
  })
}
