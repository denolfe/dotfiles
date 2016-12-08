-- Set up
-----------------------------------------------

local hyper = {'shift', 'cmd', 'alt', 'ctrl'}
local ultra = {'ctrl','alt','shift'}
local reloader = require('reloader')
local windowgrid = require('windowgrid')
local hotkey = require('hotkey')
local appfocus = require('appfocus')

-----------------------------------------------
-- Window Grid Binds
-----------------------------------------------

windowgrid.mapbinds(ultra,
  {
    { key='q', positions = { windowgrid.grid.leftHalf, windowgrid.grid.topLeft, windowgrid.grid.bottomLeft }},
    { key='w', positions = { windowgrid.grid.fullScreen, windowgrid.grid.centeredBig }},
    { key='e', positions = { windowgrid.grid.rightHalf, windowgrid.grid.topRight, windowgrid.grid.bottomRight }},
  }
)

-----------------------------------------------
-- Hotkeys
-----------------------------------------------

hotkey.mapbinds(ultra,
  {
    -- Movement
    { key='h', mod={}, direction='left', shouldRepeat=true },
    { key='j', mod={}, direction='down', shouldRepeat=true },
    { key='k', mod={}, direction='up', shouldRepeat=true },
    { key='l', mod={}, direction='right', shouldRepeat=true },
    { key='n', mod={'cmd'}, direction='left' },  -- beginning of line
    { key='p', mod={'cmd'}, direction='right' }, -- end of line
    { key='m', mod={'alt'}, direction='left' },  -- back word
    { key='.', mod={'alt'}, direction='right' }, -- forward word
    -- Rebinds
    { key='delete', mod={}, direction='forwarddelete', shouldRepeat=true } -- forward delete
  }
)

hs.hotkey.bind(ultra, 'escape', function() 
  reloader.reload(true)
end)

-----------------------------------------------
-- App shortcuts
-----------------------------------------------

appfocus.mapbinds(ultra,
  {
    { key = ';', app = 'iTerm' },
    { key = "'", app = 'Google Chrome' }
  }
)

-- Start Reloader
reloader.init()
