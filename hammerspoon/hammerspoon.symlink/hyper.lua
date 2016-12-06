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

return module