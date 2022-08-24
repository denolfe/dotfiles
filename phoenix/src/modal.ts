/**
 * Show modal in title position
 */
export function titleModal(text: string, duration: number = 1, icon?: Image) {
  const m = new Modal()
  m.text = text
  m.duration = duration
  if (icon) {
    m.icon = icon
  }
  showTitleOn(m, Screen.main())
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

function showAt(modal: Modal, screen: Screen, widthDiv: number, heightDiv: number) {
  const { height, width, x, y } = modal.frame()
  const sf = screen.visibleFrame()
  modal.origin = {
    x: sf.x + (sf.width / widthDiv - width / 2),
    y: sf.y + (sf.height / heightDiv - height / 2),
  }
  modal.show()
}
