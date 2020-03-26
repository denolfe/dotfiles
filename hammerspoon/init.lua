-- Modifiers
ultra = {'ctrl','alt','shift'} -- Bound to CapsLock in Karabiner-Elements
hyper = {'shift', 'cmd', 'alt', 'ctrl'} -- CapsLock + cmd

-- Chained binds for window resizing and movement
require('windowmanager')

-- App shortcuts
local bindApp = function(appName)
  return function()
    hs.application.launchOrFocus(appName)
  end
end

hs.hotkey.bind(ultra, ';', bindApp('iTerm'))
hs.hotkey.bind(ultra, "'", bindApp('Google Chrome'))
hs.hotkey.bind(ultra, '/', bindApp('Visual Studio Code'))
hs.hotkey.bind(ultra, 'f', bindApp('Slack'))
hs.hotkey.bind(ultra, 'g', bindApp('Spotify'))
hs.hotkey.bind(ultra, 't', bindApp('Microsoft Outlook'))

-- Spotify shortcuts
hs.hotkey.bind(ultra, '\\', hs.spotify.playpause)
hs.hotkey.bind(ultra, ']',  hs.spotify.next)
hs.hotkey.bind(ultra, '[',  hs.spotify.previous)
hs.hotkey.bind(hyper, '\\', hs.spotify.displayCurrentTrack)

-- Reload shortcut
hs.hotkey.bind(ultra, 'r', hs.reload)

hs.alert.show('Config loaded')
