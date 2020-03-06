-- Set up
local reloader = require('reloader')
local wm = require('windowmanager')
local hotkey = require('hotkey')
local appfocus = require('appfocus')

-- Modifiers
local ultra = {'ctrl','alt','shift'} -- Bound to CapsLock in Karabiner-Elements
local hyper = {'shift', 'cmd', 'alt', 'ctrl'} -- CapsLock + cmd

-- Window Manager
wm.mapbinds(ultra,
  {
    { key='q', positions = { wm.grid.left50, wm.grid.left60, wm.grid.topLeft, wm.grid.bottomLeft }},
    { key='w', positions = { wm.grid.full, wm.grid.centeredBig }},
    { key='e', positions = { wm.grid.right50, wm.grid.right40, wm.grid.topRight, wm.grid.bottomRight }},
  }
)

hs.hotkey.bind(ultra, 'tab', wm.moveToNextScreen)

-- App shortcuts
appfocus.mapbinds(ultra,
  {
    { key = ';', app = 'iTerm' },
    { key = "'", app = 'Google Chrome' },
    { key = "/", app = 'Visual Studio Code' },
    { key = "f", app = 'Slack' },
    { key = "g", app = 'Spotify' },
    { key = "t", app = 'Microsoft Outlook' }
  }
)

-- Spotify shortcuts
hs.hotkey.bind(ultra, '\\', hs.spotify.playpause)
hs.hotkey.bind(ultra, ']',  hs.spotify.next)
hs.hotkey.bind(ultra, '[',  hs.spotify.previous)
hs.hotkey.bind(hyper, '\\', hs.spotify.displayCurrentTrack)

-- Reload shortcut
hs.hotkey.bind(ultra, 'r', hs.reload)

-- Start Reloader
reloader.init()
