-- Set up
-----------------------------------------------

local hyper = {"shift", "cmd", "alt", "ctrl"}
hs.window.animationDuration = 0
hs.grid.setGrid('12x12')
hs.grid.MARGINX = 0
hs.grid.MARGINY = 0

local chain = require('ext.application').chain

-----------------------------------------------
-- Window Grid
-----------------------------------------------

local grid = {
  topHalf = '0,0 12x6',
  topThird = '0,0 12x4',
  topTwoThirds = '0,0 12x8',
  rightHalf = '6,0 6x12',
  rightThird = '8,0 4x12',
  rightTwoThirds = '4,0 8x12',
  bottomHalf = '0,6 12x6',
  bottomThird = '0,8 12x4',
  bottomTwoThirds = '0,4 12x8',
  leftHalf = '0,0 6x12',
  leftThird = '0,0 4x12',
  leftTwoThirds = '0,0 8x12',
  topLeft = '0,0 6x6',
  topRight = '6,0 6x6',
  bottomRight = '6,6 6x6',
  bottomLeft = '0,6 6x6',
  fullScreen = '0,0 12x12',
  centeredBig = '0.5,0.5 11x11',
  centeredSmall = '4,4 4x4',
}

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