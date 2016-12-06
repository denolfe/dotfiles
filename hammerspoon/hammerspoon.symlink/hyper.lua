local module = {}

local hyper = {"shift", "cmd", "alt", "ctrl"}

fastKeyStroke = function(modifiers, character)
  local event = require("hs.eventtap").event
  event.newKeyEvent(modifiers, string.lower(character), true):post()
  event.newKeyEvent(modifiers, string.lower(character), false):post()
end

module.bind = function(hotkey)
	local action = function() fastKeyStroke(hotkey.mod, hotkey.direction) end
	local shouldRepeat = hotkey.shouldRepeat or false
	if shouldRepeat then
    hs.hotkey.bind(hyper, hotkey.key, action, nil, action)
   else
   	hs.hotkey.bind(hyper, hotkey.key, action)
   end
end

local lastSeenChain = nil
local lastSeenWindow = nil

local chain = function(movements)
  local chainResetInterval = 2 -- seconds
  local cycleLength = #movements
  local sequenceNumber = 1

  return function()
    local win = hs.window.frontmostWindow()
    local id = win:id()
    local now = hs.timer.secondsSinceEpoch()
    local screen = win:screen()

    if
      lastSeenChain ~= movements or
      lastSeenAt < now - chainResetInterval or
      lastSeenWindow ~= id
    then
      sequenceNumber = 1
      lastSeenChain = movements
    elseif (sequenceNumber == 1) then
      -- At end of chain, restart chain on next screen.
      screen = screen:next()
    end
    lastSeenAt = now
    lastSeenWindow = id

    hs.grid.set(win, movements[sequenceNumber], screen)
    sequenceNumber = sequenceNumber % cycleLength + 1
  end
end 

module.chain = function(entry)
  hs.hotkey.bind(hyper, entry.key, chain(entry.positions))
end


return module