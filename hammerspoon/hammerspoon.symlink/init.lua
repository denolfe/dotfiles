-- Set up
-----------------------------------------------

local hyper = {"shift", "cmd", "alt", "ctrl"}
hs.window.animationDuration = 0
hs.grid.setGrid('12x12')
hs.grid.MARGINX = 0
hs.grid.MARGINY = 0

local reloader = require('reloader')
local chain = require('application').chain
local grid = require('grid')

-----------------------------------------------
-- Window Grid Binds
-----------------------------------------------

hs.fnutils.each({
  { key='q', positions = { grid.leftHalf, grid.topLeft, grid.bottomLeft }},
  { key='w', positions = { grid.fullScreen, grid.centeredBig }},
  { key='e', positions = { grid.rightHalf, grid.topRight, grid.bottomRight }},
}, function(entry)
  hs.hotkey.bind(hyper, entry.key, chain(entry.positions))
end)

-----------------------------------------------
-- Hotkeys
-----------------------------------------------
local fastKeyStroke = function(modifiers, character)
  local event = require("hs.eventtap").event
  event.newKeyEvent(modifiers, string.lower(character), true):post()
  event.newKeyEvent(modifiers, string.lower(character), false):post()
end

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
    hs.hotkey.bind(hyper, hotkey.key, 
      function() fastKeyStroke(hotkey.mod, hotkey.direction) end,
      nil,
      function() fastKeyStroke(hotkey.mod, hotkey.direction) end
    )
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
