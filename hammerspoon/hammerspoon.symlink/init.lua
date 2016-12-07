-- Set up
-----------------------------------------------

local hyper = {"shift", "cmd", "alt", "ctrl"}
local reloader = require('reloader')
local windowgrid = require('windowgrid')
local hotkey = require('hotkey')

-----------------------------------------------
-- Window Grid Binds
-----------------------------------------------

windowgrid.new(hyper)

-----------------------------------------------
-- Hotkeys
-----------------------------------------------

hotkey.new(hyper)

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
