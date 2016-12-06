-- Set up
-----------------------------------------------

local hyper = {"shift", "cmd", "alt", "ctrl"}
hs.window.animationDuration = 0
hs.grid.setGrid('12x12')
hs.grid.MARGINX = 0
hs.grid.MARGINY = 0

local chain = require('ext.application').chain
local grid = require('ext.grid')

-----------------------------------------------
-- Window Grid Binds
-----------------------------------------------

hs.fnutils.each({
  { key='q', positions = { grid.leftHalf, grid.leftTwoThirds, grid.topLeft, grid.bottomLeft }},
  { key='w', positions = { grid.fullScreen, grid.centeredBig }},
  { key='e', positions = { grid.rightHalf, grid.rightTwoThirds, grid.topRight, grid.bottomRight }},
}, function(entry)
  hs.hotkey.bind(hyper, entry.key, chain(entry.positions))
end)

-----------------------------------------------
-- Hotkeys
-----------------------------------------------

hs.fnutils.each({
  -- Movement
  { key='h', mod={}, direction='left'},
  { key='j', mod={}, direction='down'},
  { key='k', mod={}, direction='up'},
  { key='l', mod={}, direction='right'},
  { key='n', mod={'cmd'}, direction='left'},  -- beginning of line
  { key='p', mod={'cmd'}, direction='right'}, -- end of line
  { key='m', mod={'alt'}, direction='left'},  -- back word
  { key='.', mod={'alt'}, direction='right'}, -- forward word

  -- Rebinds
  { key='delete', mod={}, direction='forwarddelete'} -- forward delete
}, function(hotkey)
  hs.hotkey.bind(hyper, hotkey.key, function()
    hs.eventtap.keyStroke(hotkey.mod, hotkey.direction)
  end)
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

-----------------------------------------------
-- Reload config on write
-----------------------------------------------

function reload_config(files)
    hs.reload()
end
hs.pathwatcher.new(os.getenv("HOME") .. "/.hammerspoon/", reload_config):start()
hs.alert.show("Config loaded")

-----------------------------------------------
-- Hyper i to show window hints
-----------------------------------------------

hs.hotkey.bind(hyper, '/', function()
    hs.hints.windowHints()
end)