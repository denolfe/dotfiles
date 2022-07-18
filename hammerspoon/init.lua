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

local cycleApps = function(appName, appName2)
  return function()
    local currentApp = hs.application.frontmostApplication():name()
    if (currentApp ~= appName) then
      hs.application.launchOrFocus(appName)
    else
      hs.application.launchOrFocus(appName2)
    end
  end
end

hs.hotkey.bind(hyper, ';', bindApp('iTerm'))
hs.hotkey.bind(hyper, 'g', bindApp('Google Chrome'))
hs.hotkey.bind(hyper, 'c', bindApp('Visual Studio Code'))
hs.hotkey.bind(hyper, 'r', bindApp('Notion'))
hs.hotkey.bind(hyper, 'f', cycleApps('Slack', 'Discord'))
hs.hotkey.bind(hyper, 'v', bindApp('Spotify'))
-- hs.hotkey.bind(hyper, 't', bindApp(''))

-- Spotify shortcuts
hs.hotkey.bind(hyper, '\\', hs.spotify.playpause)
hs.hotkey.bind(hyper, ']',  hs.spotify.next)
hs.hotkey.bind(hyper, '[',  hs.spotify.previous)

-- Reload shortcut
hs.hotkey.bind(hyperCmd, 'r', hs.reload)

hs.alert.show('Config loaded')
