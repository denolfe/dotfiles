-- Set up
-----------------------------------------------

local hyper = {"shift", "cmd", "alt", "ctrl"}
hs.window.animationDuration = 0

require("hs.application")
require("hs.window")

-----------------------------------------------
-- Window Grid
-----------------------------------------------

positions = {
  maximized = hs.layout.maximized,
  centered = {x=0.025, y=0.025, w=0.95, h=0.95},

  left34 = {x=0, y=0, w=0.34, h=1},
  left50 = hs.layout.left50,
  left66 = {x=0, y=0, w=0.66, h=1},
  left70 = hs.layout.left70,

  right30 = hs.layout.right30,
  right34 = {x=0.66, y=0, w=0.34, h=1},
  right50 = hs.layout.right50,
  right66 = {x=0.34, y=0, w=0.66, h=1},

  upper50 = {x=0, y=0, w=1, h=0.5},
  upper50Left50 = {x=0, y=0, w=0.5, h=0.5},
  upper50Right15 = {x=0.85, y=0, w=0.15, h=0.5},
  upper50Right30 = {x=0.7, y=0, w=0.3, h=0.5},
  upper50Right50 = {x=0.5, y=0, w=0.5, h=0.5},

  lower50 = {x=0, y=0.5, w=1, h=0.5},
  lower50Left50 = {x=0, y=0.5, w=0.5, h=0.5},
  lower50Right50 = {x=0.5, y=0.5, w=0.5, h=0.5},

  chat = {x=0.5, y=0, w=0.35, h=0.5}
}

grid = {
  {key='q', units={positions.upper50Left50}},
  {key='w', units={positions.maximized}},
  {key='e', units={positions.upper50Right50}},

  {key='a', units={positions.left50, positions.left66, positions.left34}},
  {key='s', units={positions.centered}},
  {key='d', units={positions.right50, positions.right66, positions.right34}},

  {key='z', units={positions.lower50Left50}},
  -- {key='x', units={positions.lower50}},
  {key='c', units={positions.lower50Right50}}
}
hs.fnutils.each(grid, function(entry)
  hs.hotkey.bind(hyper, entry.key, function()
    local units = entry.units
    local screen = hs.screen.mainScreen()
    local window = hs.window.focusedWindow()
    local windowGeo = window:frame()

    local index = 0
    hs.fnutils.find(units, function(unit)
      index = index + 1

      local geo = hs.geometry.new(unit):fromUnitRect(screen:frame()):floor()
      return windowGeo:equals(geo)
    end)
    if index == #units then index = 0 end

    currentLayout = null
    window:moveToUnit(units[index + 1])
  end)
end)

-----------------------------------------------
-- Hotkeys
-----------------------------------------------

hotkeys = {
  -- Movement
  { 'h', {}, 'left'},
  { 'j', {}, 'down'},
  { 'k', {}, 'up'},
  { 'l', {}, 'right'},
  { 'n', {'cmd'}, 'left'},  -- beginning of line
  { 'p', {'cmd'}, 'right'}, -- end of line
  { 'm', {'alt'}, 'left'},  -- back word
  { '.', {'alt'}, 'right'}, -- forward word

  -- Rebinds
  { 'delete', {}, 'forwarddelete'} -- forward delete
}
for i,bnd in ipairs(hotkeys) do
  hs.hotkey.bind(hyper, bnd[1], function()
    hs.eventtap.keyStroke(bnd[2],bnd[3])
  end)
end

-----------------------------------------------
-- App shortcuts
-----------------------------------------------
apps = {
  { ';', 'iTerm'}
}
for i,app in ipairs(apps) do
  hs.hotkey.bind(hyper, app[1], function()
    hs.application.launchOrFocus(app[2])
  end)
end

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