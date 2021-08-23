-- Modifiers
hyper = {'ctrl','alt','shift'} -- Bound to CapsLock in Karabiner-Elements
hyperCmd = {'shift', 'cmd', 'alt', 'ctrl'} -- CapsLock + cmd

-- Chained binds for window resizing and movement
require('windowmanager')

-- App shortcuts
local bindApp = function(appName)
  return function()
    hs.application.launchOrFocus(appName)
  end
end

hs.hotkey.bind(hyper, ';', bindApp('iTerm'))
hs.hotkey.bind(hyper, 'g', bindApp('Google Chrome'))
hs.hotkey.bind(hyper, 'c', bindApp('Visual Studio Code'))
hs.hotkey.bind(hyper, 'r', bindApp('Notion'))
hs.hotkey.bind(hyper, 'f', bindApp('Slack'))
hs.hotkey.bind(hyper, 'v', bindApp('Spotify'))
hs.hotkey.bind(hyper, 't', bindApp('Microsoft Outlook'))

-- Spotify shortcuts
hs.hotkey.bind(hyper, '\\', hs.spotify.playpause)
hs.hotkey.bind(hyper, ']',  hs.spotify.next)
hs.hotkey.bind(hyper, '[',  hs.spotify.previous)
hs.hotkey.bind(hyperCmd, '\\', hs.spotify.displayCurrentTrack)

-- Reload shortcut
hs.hotkey.bind(hyperCmd, 'r', hs.reload)

hs.alert.show('Config loaded')
