# Phoenix Configuration (deprecated)
TypeScript window manager config compiled with `@vercel/ncc` to single-file `~/.phoenix.js`.

## Key files

- `src/phoenix.ts`: Main config with all keybindings
- `src/window-grid.ts`: Window positioning system (GridPosition 0-1 based)
- `src/window-cache.ts`: Window history tracking
- `src/screen.ts`: Multi-display management
- `src/hyper.ts`: Key binding helpers matching Karabiner's hyper key
- `src/utils/yabai.ts`: Yabai integration helpers

## Grid system

- All window positions defined as `GridPosition` with x/y/w/h on 0-1 scale. Supports split layouts (left66, right50, etc.) and centered positions (full, big, med, sm, xs).
- Dual Window splitting, resize other window to fit
  - <kbd>CapsLock</kbd>+<kbd>q</kbd> - Chained: 60%, 50%, 40%, 33%, 66%
  - <kbd>CapsLock</kbd>+<kbd>e</kbd> - Chained: 40%, 50%, 60%, 66%, 33%
  - <kbd>CapsLock</kbd>+<kbd>w</kbd> - Chained: full, centeredBig, centeredMedium, centeredSmall
- <kbd>CapsLock</kbd>+<kbd>tab</kbd> - Move window to next screen
