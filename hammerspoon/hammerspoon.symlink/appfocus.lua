local module = {}

module.new = function(hotkey, binds)
  hs.fnutils.each(binds, function(appBind)
    hs.hotkey.bind(hotkey, appBind.key, function() 
      hs.application.launchOrFocus(appBind.app) 
    end)
  end)
end

return module