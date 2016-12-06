-- Set up
-----------------------------------------------

local hyper = {"shift", "cmd", "alt", "ctrl"}
hs.window.animationDuration = 0
hs.grid.setGrid('12x12')
hs.grid.MARGINX = 0
hs.grid.MARGINY = 0

local reloader = require('reloader')
local grid = require('grid')
local hyperKey = require('hyper')

-----------------------------------------------
-- Window Grid Binds
-----------------------------------------------

hs.fnutils.each({
  { key='q', positions = { grid.leftHalf, grid.topLeft, grid.bottomLeft }},
  { key='w', positions = { grid.fullScreen, grid.centeredBig }},
  { key='e', positions = { grid.rightHalf, grid.topRight, grid.bottomRight }},
}, function(entry)
  hs.hotkey.bind(hyper, entry.key, hyperKey.chain(entry.positions))
end)

-----------------------------------------------
-- Hotkeys
-----------------------------------------------

hs.fnutils.each({
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
}, function(hotkey)
    hyperKey.bind(hotkey)
end)

hs.hotkey.bind(hyper, 'escape', function() 
  reloader.reload(true)
end)

-----------------------------------------------
-- App shortcuts
-----------------------------------------------

hs.fnutils.each({
  { key = ';', app = 'iTerm' },
  { key = "'", app = 'Google Chrome' }
}, function(appBind)
  hs.hotkey.bind(hyper, appBind.key, function() 
    hs.application.launchOrFocus(appBind.app) 
  end)
end)

-- Start Reloader
reloader.init()
