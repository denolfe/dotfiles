/**
 * Show modal in title position
 */
export function titleModal(
  text: string,
  options?: {
    duration?: number
    icon?: Image
    screen?: Screen
  },
) {
  const m = new Modal()
  options = options || {}
  const { duration, icon, screen } = options
  m.text = text
  m.duration = duration ?? 1
  m.icon = icon
  showTitleOn(m, screen ?? Screen.main())
}

/**
 * Show modal in title position on screen.
 */
export function showTitleOn(modal: Modal, screen: Screen) {
  showAt(modal, screen, 2, 1 + 1 / 3)
}

/**
 * Show modal in center position on screen.
 */
export function showCenterOn(modal: Modal, screen: Screen) {
  showAt(modal, screen, 2, 2)
}

/**
 * Show modal in toast position on screen.
 */
export function showToast(
  text: string,
  options?: {
    duration?: number
    icon?: Image
    screen?: Screen
  },
) {
  const m = new Modal()
  options = options || {}
  const { duration, icon, screen } = options
  m.text = text
  m.duration = duration ?? 1
  m.icon = icon
  showAt(m, screen ?? Screen.main(), 1.05, 1.05)
}

function showAt(modal: Modal, screen: Screen, widthDiv: number, heightDiv: number) {
  const { height, width, x, y } = modal.frame()
  const sf = screen.visibleFrame()
  modal.origin = {
    x: sf.x + (sf.width / widthDiv - width / 2),
    y: sf.y + (sf.height / heightDiv - height / 2),
  }
  modal.show()
}
