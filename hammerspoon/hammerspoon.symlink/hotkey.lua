local module = {}

local fastKeyStroke = function(modifiers, character)
  local event = require("hs.eventtap").event
  event.newKeyEvent(modifiers, string.lower(character), true):post()
  event.newKeyEvent(modifiers, string.lower(character), false):post()
end

local bindKey = function(modifier, hotkey)
	local action = function() fastKeyStroke(hotkey.mod, hotkey.direction) end
	local shouldRepeat = hotkey.shouldRepeat or false
	if shouldRepeat then
    hs.hotkey.bind(modifier, hotkey.key, action, nil, action)
   else
   	hs.hotkey.bind(modifier, hotkey.key, action)
   end
end

module.new = function(modifier, binds)
	hs.fnutils.each(binds, function(hotkey)
    bindKey(modifier, hotkey)
	end)
end

return module