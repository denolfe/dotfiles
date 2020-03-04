-- Set up
-----------------------------------------------

local reloader = require('reloader')
local windowgrid = require('windowgrid')
local hotkey = require('hotkey')
local appfocus = require('appfocus')

-- Modifiers
local ultra = {'ctrl','alt','shift'} -- Bound to CapsLock in Karabiner-Elements
local hyper = {'shift', 'cmd', 'alt', 'ctrl'} -- CapsLock + cmd

-----------------------------------------------
-- Window Grid Binds
-----------------------------------------------

windowgrid.mapbinds(ultra,
  {
    { key='q', positions = { windowgrid.grid.left50, windowgrid.grid.left66, windowgrid.grid.topLeft, windowgrid.grid.bottomLeft }},
    { key='w', positions = { windowgrid.grid.full, windowgrid.grid.centeredBig }},
    { key='e', positions = { windowgrid.grid.right50, windowgrid.grid.right33, windowgrid.grid.topRight, windowgrid.grid.bottomRight }},
  }
)

hs.hotkey.bind(ultra, 'r', function()
  reloader.reload(true)
end)

-----------------------------------------------
-- App shortcuts
-----------------------------------------------

appfocus.mapbinds(ultra,
  {
    { key = ';', app = 'iTerm' },
    { key = "'", app = 'Google Chrome' },
    { key = "/", app = 'Visual Studio Code' }
  }
)

-- Start Reloader
reloader.init()