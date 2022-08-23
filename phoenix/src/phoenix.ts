import { log } from './utils/logger'
import * as spotify from './spotify'
import {
  cycleWindowSplit,
  cycleWindowPositions,
  splitWindowLayout,
  moveToNextScreen,
  moveToInternalDisplay,
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
Key.on('t', HYPER, () => log.notify('error test'))

Key.on(
  'w',
  HYPER,
  cycleWindowPositions([
    { x: 0, y: 0, w: 12, h: 12 },
    { x: 0.5, y: 0.5, w: 11, h: 11 },
    { x: 2, y: 1, w: 8, h: 10 },
    { x: 2.5, y: 1.5, w: 7, h: 9 },
  ]),
)

/**
 * Cycle 2-window split, left side primary
 */
Key.on(
  'q',
  HYPER,
  cycleWindowSplit([
    splitWindowLayout.left['7x12'],
    splitWindowLayout.left['6x12'],
    splitWindowLayout.left['5x12'],
    splitWindowLayout.left['4x12'],
    splitWindowLayout.left['8x12'],
  ]),
)

/**
 * Cycle 2-window split, right side primary
 */
Key.on(
  'e',
  HYPER,
  cycleWindowSplit([
    splitWindowLayout.right['5x12'],
    splitWindowLayout.right['6x12'],
    splitWindowLayout.right['7x12'],
    splitWindowLayout.right['8x12'],
    splitWindowLayout.right['4x12'],
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
      // focus second to last window
      app.windows()[1].focus() // TODO: Make this cycle all app windows
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
