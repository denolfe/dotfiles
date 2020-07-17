hs.window.animationDuration = 0
hs.grid.setGrid('12x12')
hs.grid.MARGINX = 0
hs.grid.MARGINY = 0

-- Cycle through positions on multiple presses
local lastSeenChain = nil
local lastSeenWindow = nil
local chain = (function(movements)
  local chainResetInterval = 1.5 -- seconds
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
end)

local grid = {
  top50 = '0,0 12x6',
  top33 = '0,0 12x4',
  top66 = '0,0 12x8',
  right50 = '6,0 6x12',
  right40 = '7,0 5x12',
  right33 = '8,0 4x12',
  right66 = '4,0 8x12',
  bottom50 = '0,6 12x6',
  bottom33 = '0,8 12x4',
  bottom66 = '0,4 12x8',
  left50 = '0,0 6x12',
  left33 = '0,0 4x12',
  left60 = '0,0 7x12',
  left66 = '0,0 8x12',
  topLeft = '0,0 6x6',
  topLeft60 = '0,0 7x6',
  topRight = '6,0 6x6',
  topRight40 = '7,0 5x6',
  bottomRight = '6,6 6x6',
  bottomRight40 = '7,6 6x6',
  bottomLeft = '0,6 6x6',
  bottomLeft60 = '0,6 7x6',
  full = '0,0 12x12',
  centeredBig = '0.5,0.5 11x11',
  centeredMedium = '2,1 8x10',
  centeredSmall = '2.5,1.5 7x9'
}

-- Source: https://stackoverflow.com/a/58662204/1717697
function moveToNextScreen()
  local win = hs.window.focusedWindow()
  local currentScreen = win:screen()
  -- Compute current window size then move to new screen with same relative dimensions
  win:move(win:frame():toUnitRect(currentScreen:frame()), currentScreen:next(), true, 0)
end

-- Binds
hs.hotkey.bind(ultra, 'q', chain({ grid.left60, grid.topLeft60, grid.bottomLeft60, grid.left50, grid.topLeft, grid.bottomLeft }))
hs.hotkey.bind(ultra, 'w', chain({ grid.full, grid.centeredBig, grid.centeredMedium, grid.centeredSmall }))
hs.hotkey.bind(ultra, 'e', chain({ grid.right40, grid.topRight40, grid.bottomRight40, grid.right50, grid.topRight, grid.bottomRight }))
hs.hotkey.bind(ultra, 'tab', moveToNextScreen)
