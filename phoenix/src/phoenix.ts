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
} from './window-grid'
import { initScreens } from './screen'
import { titleModal } from './modal'

console.log('Phoenix Started')
titleModal('Config Loaded!', undefined, App.get('Phoenix')?.icon())

const HYPER: Phoenix.ModifierKey[] = ['ctrl', 'shift', 'option']
const HYPER_CMD: Phoenix.ModifierKey[] = [...HYPER, 'cmd']

initScreens()

Event.on('screensDidChange', () => {
  Phoenix.reload()
})

Key.on('r', HYPER_CMD, () => Phoenix.reload())

bindApp(';', HYPER, 'iTerm')
bindApp('g', HYPER, 'Google Chrome')
bindApp('c', HYPER, 'Visual Studio Code')
bindApp('r', HYPER, 'Notion')
bindApp('v', HYPER, 'Spotify')
bindCycleApps('f', HYPER, ['Slack', 'Discord'])

Key.on('\\', HYPER, () => spotify.playOrPause())
Key.on(']', HYPER, () => spotify.nextTrack())
Key.on('[', HYPER, () => spotify.previousTrack())

Key.on('t', HYPER, () => swapAllWindowsBetweenDisplays())
Key.on('t', HYPER_CMD, () => gatherAllWindows())

Key.on(
  'w',
  HYPER,
  cycleWindowPositions([
    centered.full,
    centered.centeredBig,
    centered.centeredMedium,
    centered.centeredSmall,
  ]),
)

/**
 * Cycle 2-window split, left side primary
 */
Key.on(
  'q',
  HYPER,
  cycleWindowSplit([
    layout.left60,
    layout.left50,
    layout.left40,
    layout.left33,
    layout.left66,
  ]),
)

/**
 * Cycle 2-window split, right side primary
 */
Key.on(
  'e',
  HYPER,
  cycleWindowSplit([
    layout.right40,
    layout.right50,
    layout.right60,
    layout.right66,
    layout.right33,
  ]),
)

Key.on('tab', HYPER, () => {
  moveToNextScreen()
})

Key.on('tab', HYPER_CMD, () => {
  moveToInternalDisplay()
})

/**
 * Launch or focus last app window
 */
function bindApp(key: string, mods: Phoenix.ModifierKey[], appName: string) {
  Key.on(key, mods, () => {
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
function bindCycleApps(
  key: string,
  mods: Phoenix.ModifierKey[],
  appNames: string[],
) {
  Key.on(key, mods, () => {
    const apps = appNames.map(a => App.get(a)).filter(Boolean)
    const currentApp = App.focused().name()
    if (currentApp === apps[0]?.name()) {
      apps[1]?.focus() || App.launch(appNames[1], { focus: true })
    } else {
      apps[0]?.focus() || App.launch(appNames[0], { focus: true })
    }
  })
}
