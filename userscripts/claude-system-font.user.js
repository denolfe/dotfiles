// ==UserScript==
// @name            Claude System Font
// @namespace       denolfe
// @version         0.0.1
// @description     Use macOS system font for chat messages instead of serif
// @icon            https://www.google.com/s2/favicons?sz=64&domain=claude.ai
// @homepage        https://github.com/denolfe/dotfiles
// @match           https://claude.ai/*
// @author          Elliot DeNolf
// @run-at          document-start
// @grant           none
// ==/UserScript==

const systemFontStack = '-apple-system, BlinkMacSystemFont, system-ui, sans-serif'

const style = document.createElement('style')
style.textContent = `
  :root {
    --font-claude-response: ${systemFontStack} !important;
    --font-user-message: ${systemFontStack} !important;
  }
`
document.documentElement.appendChild(style)
