-- Modifiers
hyper = {'ctrl','alt','shift'} -- Bound to CapsLock in Karabiner-Elements
hyperCmd = {'shift', 'cmd', 'alt', 'ctrl'} -- CapsLock + cmd

-- Chained binds for window resizing and movement
require('windowmanager')

local launchOrFocus = function(appName)
  return function()
    hs.application.launchOrFocus(appName)
  end
end

-- Launch or focus app, hide if already frontmost
local launchOrFocusToggle = function(appName)
  return function()
    local appInstance = hs.application.find(appName)
    local isFrontmost = appInstance and appInstance:isFrontmost()
    if isFrontmost then
      appInstance:hide()
    else
      hs.application.launchOrFocus(appName)
    end
  end
end

hs.hotkey.bind(hyper, ';', launchOrFocus('iTerm'))
hs.hotkey.bind(hyper, 'g', launchOrFocus('Google Chrome'))
hs.hotkey.bind(hyper, 'c', launchOrFocus('Visual Studio Code'))
hs.hotkey.bind(hyper, 'r', launchOrFocus('Notion'))
hs.hotkey.bind(hyper, 'f', launchOrFocus('Slack'))
hs.hotkey.bind(hyper, 'v', launchOrFocus('Spotify'))
hs.hotkey.bind(hyper, 't', launchOrFocus('Microsoft Outlook'))

-- Spotify shortcuts
hs.hotkey.bind(hyper, '\\', hs.spotify.playpause)
hs.hotkey.bind(hyper, ']',  hs.spotify.next)
hs.hotkey.bind(hyper, '[',  hs.spotify.previous)

-- Reload shortcut
hs.hotkey.bind(hyperCmd, 'r', hs.reload)

hs.alert.show('Config loaded')
