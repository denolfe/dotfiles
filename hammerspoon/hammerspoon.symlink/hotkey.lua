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

module.new = function(modifier)
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
    bindKey(modifier, hotkey)
	end)
end

return module