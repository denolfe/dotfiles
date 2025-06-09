// ==UserScript==
// @name            Hacker News Tweaks
// @namespace       denolfe
// @version         0.0.3
// @description     Misc HN tweaks
// @icon            https://www.google.com/s2/favicons?sz=64&domain=news.ycombinator.com
// @homepage        https://github.com/denolfe/dotfiles
// @include         https://news.ycombinator.com/*
// @author          Elliot DeNolf
// @run-at          document-end
// @grant           none
// ==/UserScript==

// Open article links in new window
document.querySelectorAll('.titleline > a').forEach(link => {
  link.setAttribute('target', '_blank')
})

// Set the zoom level
const zoomLevel = 1.1
document.body.style.zoom = zoomLevel

function GM_addStyle(css) {
  const style = document.createElement('style')
  style.type = 'text/css'
  style.textContent = css
  document.head.appendChild(style)
  return style
}

GM_addStyle(`

body > center {
  background-color: #f6f6ef;
}

body > center > table {
  max-width: 796px;
}

#hnes-comments .replies {
  margin: 8px 0 0 15px;
}

.hnes-comment section.body {
  margin-left: 10px;
}

.default {
    border-left: 2px solid #ccc; /* Adjust the width and color as needed */
    padding-left: 10px; /* Optional: Add padding for better spacing */
}

`)
