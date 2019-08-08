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
    { key='q', positions = { windowgrid.grid.leftHalf, windowgrid.grid.topLeft, windowgrid.grid.bottomLeft }},
    { key='w', positions = { windowgrid.grid.fullScreen, windowgrid.grid.centeredBig }},
    { key='e', positions = { windowgrid.grid.rightHalf, windowgrid.grid.topRight, windowgrid.grid.bottomRight }},
  }
)

-----------------------------------------------
-- Hotkeys
-----------------------------------------------

-- Vim-style movement
hotkey.mapbinds(ultra,
  {
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
-- Text Selection
hotkey.mapbinds(hyper,
  {
    -- Highlight
    { key='h', mod={'shift'}, direction='left', shouldRepeat=true },
    { key='j', mod={'shift'}, direction='down', shouldRepeat=true },
    { key='k', mod={'shift'}, direction='up', shouldRepeat=true },
    { key='l', mod={'shift'}, direction='right', shouldRepeat=true },
    { key='n', mod={'shift','cmd'}, direction='left' },  -- beginning of line
    { key='p', mod={'shift','cmd'}, direction='right' }, -- end of line
    { key='m', mod={'shift','alt'}, direction='left' },  -- back word
    { key='.', mod={'shift','alt'}, direction='right' }, -- forward word
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
    { key = "'", app = 'Google Chrome' },
    { key = "/", app = 'Visual Studio Code' }
  }
)

-- Start Reloader
reloader.init()
