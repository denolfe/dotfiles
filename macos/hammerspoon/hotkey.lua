local module = {}

module.fastKeyStroke = function(modifiers, direction)
  local event = require("hs.eventtap").event
  event.newKeyEvent(modifiers, string.lower(direction), true):post()
  
  event.newKeyEvent(modifiers, string.lower(direction), false):post()
  event.newKeyEvent({}, direction, true):post()
  event.newKeyEvent({}, direction, false):post()
end

local bindKey = function(modifier, hotkey)
	local action = function() module.fastKeyStroke(hotkey.mod, hotkey.direction) end
	local shouldRepeat = hotkey.shouldRepeat or false
	if shouldRepeat then
    hs.hotkey.bind(modifier, hotkey.key, action, nil, action)
   else
   	hs.hotkey.bind(modifier, hotkey.key, action)
   end
end

module.mapbinds = function(modifier, binds)
	hs.fnutils.each(binds, function(hotkey)
    bindKey(modifier, hotkey)
	end)
end

return module