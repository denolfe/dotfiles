// ==UserScript==
// @name            GitHub - Copy PR Title
// @namespace       denolfe
// @version         0.0.1
// @description     Add a copy button next to Edit Title on GitHub Pull Requests
// @icon            https://www.google.com/s2/favicons?sz=64&domain=github.com
// @match           https://github.com/*/*/pull/*
// @author          Elliot DeNolf
// @run-at          document-end
// @noframes
// @grant           none
// ==/UserScript==

;(() => {
  'use strict'

  const BUTTON_ID = 'copy-pr-title-btn'
  const TOOLTIP_ID = 'copy-pr-title-tooltip'

  const COPY_ICON = `<svg data-component="Octicon" aria-hidden="true" focusable="false" class="octicon octicon-copy" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" display="inline-block" overflow="visible" style="vertical-align:text-bottom"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>`

  const CHECK_ICON = `<svg data-component="Octicon" aria-hidden="true" focusable="false" class="octicon octicon-check color-fg-success" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" display="inline-block" overflow="visible" style="vertical-align:text-bottom;color:#1a7f37"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg>`

  const copyTitle = () => {
    const titleEl = document.querySelector('h1[data-component="PH_Title"] .markdown-title')
    if (!titleEl) return

    const title = titleEl.textContent.trim()
    navigator.clipboard.writeText(title).then(() => {
      const btn = document.getElementById(BUTTON_ID)
      const tooltip = document.getElementById(TOOLTIP_ID)
      if (btn) {
        btn.innerHTML = CHECK_ICON
        if (tooltip) tooltip.textContent = 'Copied!'
        setTimeout(() => {
          btn.innerHTML = COPY_ICON
          if (tooltip) tooltip.textContent = 'Copy title'
        }, 1500)
      }
    })
  }

  const addCopyButton = () => {
    if (document.getElementById(BUTTON_ID)) return

    const editBtn = document.querySelector('h1[data-component="PH_Title"] button[data-component="IconButton"]')
    if (!editBtn) return

    const btn = document.createElement('button')
    btn.id = BUTTON_ID
    btn.type = 'button'
    btn.className = editBtn.className
    btn.setAttribute('data-component', 'IconButton')
    btn.setAttribute('data-loading', 'false')
    btn.setAttribute('data-no-visuals', 'true')
    btn.setAttribute('data-size', 'medium')
    btn.setAttribute('data-variant', 'invisible')
    btn.setAttribute('aria-labelledby', TOOLTIP_ID)
    btn.innerHTML = COPY_ICON
    btn.addEventListener('click', copyTitle)

    const tooltip = document.createElement('span')
    tooltip.id = TOOLTIP_ID
    tooltip.className = 'prc-TooltipV2-Tooltip-tLeuB'
    tooltip.setAttribute('data-direction', 's')
    tooltip.setAttribute('data-component', 'Tooltip')
    tooltip.setAttribute('aria-hidden', 'true')
    tooltip.setAttribute('popover', 'auto')
    tooltip.textContent = 'Copy title'

    editBtn.after(btn, tooltip)
  }

  addCopyButton()

  const observer = new MutationObserver(() => addCopyButton())
  observer.observe(document.body, { childList: true, subtree: true })
})()
