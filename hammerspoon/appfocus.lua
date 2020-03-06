local module = {}

module.mapbinds = function(modifier, binds)
  hs.fnutils.each(binds, function(appBind)
    hs.hotkey.bind(modifier, appBind.key, function()
      hs.application.launchOrFocus(appBind.app)
    end)
  end)
end

return module