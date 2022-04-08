// ==UserScript==
// @name            Hacker News Tweaks
// @version         0.0.1
// @description     Misc HN tweaks
// @homepage        https://github.com/denolfe/dotfiles
// @include         https://news.ycombinator.com/*
// @author       Elliot DeNolf
// @run-at          document-end
// @grant           none
// ==/UserScript==

function GM_addStyle (css) {
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
  max-width: 1280px;
}

#hnes-comments .replies {
  margin: 8px 0 0 15px;
}

.hnes-comment section.body {
  margin-left: 10px;
}

`)
