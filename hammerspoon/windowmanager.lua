hs.window.animationDuration = 0
hs.grid.setGrid('12x12')
hs.grid.MARGINX = 0
hs.grid.MARGINY = 0

local chainResetInterval = 1.5 -- seconds

-- Cycle through positions on multiple presses
local lastSeenChain = nil
local lastSeenWindow = nil
local lastSeenAt = nil
local chain = (function(gridPositions)
  local cycleLength = #gridPositions
  local sequenceNumber = 1

  return function()
    local win = hs.window.frontmostWindow()
    local id = win:id()
    local now = hs.timer.secondsSinceEpoch()

    if
      lastSeenChain ~= gridPositions or
      lastSeenAt < now - chainResetInterval or
      lastSeenWindow ~= id
    then
      sequenceNumber = 1
      lastSeenChain = gridPositions
    end
    lastSeenAt = now
    lastSeenWindow = id

    hs.grid.set(win, gridPositions[sequenceNumber], win:screen())
    sequenceNumber = sequenceNumber % cycleLength + 1
  end
end)

-- Cycle through side-by-side positions for 2 more recent windows
local lastSeenSideBySide = nil
local lastSeenWindowSideBySide = nil
local lastSeenAtSideBySide = nil
local chainSideBySide = (function(gridPositions)
  local cycleLength = #gridPositions
  local sequenceNumber = 1

  return function()
    local filter = hs.window.filter.new():setScreens(hs.window.frontmostWindow():screen():id())
    local allWindows = filter:getWindows(hs.window.filter.sortByFocusedLast)
    local win1 = allWindows[1]
    local win2 = allWindows[2]
    local id = win1:id()
    local now = hs.timer.secondsSinceEpoch()

    if
      lastSeenSideBySide ~= gridPositions or
      lastSeenAtSideBySide < now - chainResetInterval or
      lastSeenWindowSideBySide ~= id
    then
      sequenceNumber = 1
      lastSeenSideBySide = gridPositions
    end
    lastSeenAtSideBySide = now
    lastSeenWindowSideBySide = id

    hs.grid.set(win1, gridPositions[sequenceNumber][1], win1:screen())
    if win1:screen() == win2:screen() then
      hs.grid.set(win2, gridPositions[sequenceNumber][2], win2:screen())
    end
    sequenceNumber = sequenceNumber % cycleLength + 1
  end
end)

local grid = {

  left66 = '0,0 8x12',
  left60 = '0,0 7x12',
  left50 = '0,0 6x12',
  left40 = '0,0 5x12',
  left33 = '0,0 4x12',

  right66 = '4,0 8x12',
  right60 = '5,0 7x12',
  right50 = '6,0 6x12',
  right40 = '7,0 5x12',
  right33 = '8,0 4x12',

  full = '0,0 12x12',
  centeredBig = '0.5,0.5 11x11',
  centeredMedium = '2,1 8x10',
  centeredSmall = '2.5,1.5 7x9'
}

local leftSideBySideGrid = {
  { grid.left60, grid.right40 },
  { grid.left50, grid.right50 },
  { grid.left40, grid.right60 },
  { grid.left33, grid.right66 },
  { grid.left66, grid.right33 },
}
local rightSideBySideGrid = {
  { grid.right40, grid.left60 },
  { grid.right50, grid.left50 },
  { grid.right60, grid.left40 },
  { grid.right66, grid.left33 },
  { grid.right33, grid.left66 },
}

-- Source: https://stackoverflow.com/a/58662204/1717697
function moveToNextScreen()
  local win = hs.window.focusedWindow()
  local currentScreen = win:screen()
  -- Compute current window size then move to new screen with same relative dimensions
  win:move(win:frame():toUnitRect(currentScreen:frame()), currentScreen:next(), true, 0)
end

-- Binds
hs.hotkey.bind(hyperCmd, 'q', chain({ grid.left60, grid.left50, grid.left40, grid.left33, grid.left66 }))
hs.hotkey.bind(hyper, 'w', chain({ grid.full, grid.centeredBig, grid.centeredMedium, grid.centeredSmall }))
hs.hotkey.bind(hyperCmd, 'e', chain({ grid.right40, grid.right50, grid.right60, grid.right66, grid.right33 }))
hs.hotkey.bind(hyper, 'tab', moveToNextScreen)

hs.hotkey.bind(hyper, 'q', chainSideBySide(leftSideBySideGrid))
hs.hotkey.bind(hyper, 'e', chainSideBySide(rightSideBySideGrid))
