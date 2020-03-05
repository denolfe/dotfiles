-----------------------------------------------
-- Auto-reload config on change.
-----------------------------------------------

local reloadFiles = function(files)
  local shouldReload = false
  for _, file in pairs(files) do
    if file:sub(-4) == '.lua' then
      shouldReload = true
    end
  end
  if shouldReload then
    reload(false)
  end
end

local reload = function(notify)
  if notify then
    hs.notify.show(
      'Hammerspoon',
      'Reloaded in the background',
      ''
    )
  end
  hs.reload()
end

local init = function()
  local watcher = hs.pathwatcher.new(
    os.getenv('HOME') .. '/.hammerspoon/',
    reloadFiles
  )
  watcher:start()
  hs.alert.show("Config loaded")
end

return {
  init = init,
  reload  = reload
}