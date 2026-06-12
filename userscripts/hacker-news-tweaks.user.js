// ==UserScript==
// @name            Hacker News Tweaks
// @namespace       denolfe
// @version         0.0.6
// @description     Misc HN tweaks
// @icon            https://www.google.com/s2/favicons?sz=64&domain=news.ycombinator.com
// @homepage        https://github.com/denolfe/dotfiles
// @include         https://news.ycombinator.com/*
// @author          Elliot DeNolf
// @run-at          document-start
// @grant           none
// ==/UserScript==

/**
 * Tweaks:
 * - Open article links in a new tab
 * - Zoom the page to 1.1x
 * - Widen + tint the main column and indent/border comment threads
 * - Style comment links as standard blue (keeps underline)
 * - Render '>' comment lines as markdown-style blockquotes
 * - Add a rounded identicon avatar (hashed from username) next to each username
 */

function GM_addStyle(css) {
  const style = document.createElement('style')
  style.textContent = css
  // document-start: <head> may not exist yet, so fall back to documentElement
  ;(document.head || document.documentElement).appendChild(style)
  return style
}

// Inject styles (including zoom) at document-start so the page paints zoomed
// from the first frame instead of reflowing after load (avoids the jump).
const zoomLevel = 1.1
GM_addStyle(`

html,
body {
  background-color: #f6f6ef;
}

body {
  zoom: ${zoomLevel};
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

/* Style links within comments as standard blue (keep underline) */
.commtext a:link,
.commtext a:visited {
  color: #3366cc;
}

/* Markdown-style blockquotes for '>' comment lines */
.commtext .hn-quote {
  display: block;
  border-left: 3px solid #b0b0b0;
  padding-left: 8px;
  margin: 6px 0;
  color: #555;
  font-style: italic;
}

/* Rounded identicon avatar next to usernames */
.hn-avatar {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-right: 4px;
  vertical-align: middle;
}

.hn-avatar svg {
  display: block;
  width: 100%;
  height: 100%;
}

`)

// DOM tweaks need a parsed document; defer them since we run at document-start.
function applyDomTweaks() {
  // Open article links in new window
  document.querySelectorAll('.titleline > a').forEach(link => {
    link.setAttribute('target', '_blank')
  })

  addAvatars()
  styleQuotes()
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', applyDomTweaks)
} else {
  applyDomTweaks()
}

// Deterministic 32-bit string hash (xfnv1a-style)
function hashString(str) {
  let h = 1779033703 ^ str.length
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return h >>> 0
}

// Seeded PRNG so a username always yields the same avatar
function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// GitHub-style symmetric 5x5 identicon as inline SVG markup.
// Inline SVG (not a data-URI <img>) avoids HN's strict img-src CSP.
function generateAvatarSvg(username) {
  const rand = mulberry32(hashString(username))
  const color = `hsl(${Math.floor(rand() * 360)}, 60%, 50%)`
  const size = 5
  let rects = ''
  for (let x = 0; x < Math.ceil(size / 2); x++) {
    for (let y = 0; y < size; y++) {
      if (rand() > 0.5) {
        rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`
        const mirror = size - 1 - x
        if (mirror !== x) rects += `<rect x="${mirror}" y="${y}" width="1" height="1"/>`
      }
    }
  }
  // viewBox padded by 1 cell on each side so edge blocks aren't clipped by the circular crop
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -1 7 7" shape-rendering="crispEdges"><rect x="-1" y="-1" width="7" height="7" fill="#f0f0f0"/><g fill="${color}">${rects}</g></svg>`
}

// Add a rounded avatar before each username
function addAvatars() {
  document.querySelectorAll('a.hnuser').forEach(userLink => {
    if (userLink.dataset.avatarAdded) return
    const username = userLink.textContent.trim()
    if (!username) return
    const wrapper = document.createElement('span')
    wrapper.className = 'hn-avatar'
    wrapper.innerHTML = generateAvatarSvg(username)
    userLink.parentNode.insertBefore(wrapper, userLink)
    userLink.dataset.avatarAdded = '1'
  })
}

// Strip the leading '> ' marker from the first text node of a quote block
function stripLeadingMarker(container) {
  const node = document.createTreeWalker(container, NodeFilter.SHOW_TEXT).nextNode()
  if (node) node.nodeValue = node.nodeValue.replace(/^\s*>\s?/, '')
}

// Render '>' comment lines as styled blockquotes
function styleQuotes() {
  document.querySelectorAll('.commtext').forEach(commtext => {
    if (commtext.dataset.quotesStyled) return
    commtext.dataset.quotesStyled = '1'

    // Paragraph quotes
    commtext.querySelectorAll('p').forEach(p => {
      if (p.textContent.trimStart().startsWith('>')) {
        p.classList.add('hn-quote')
        stripLeadingMarker(p)
      }
    })

    // Leading text before the first <p> is a direct child of .commtext
    const firstP = commtext.querySelector('p')
    const leadingNodes = []
    for (const node of commtext.childNodes) {
      if (node === firstP) break
      leadingNodes.push(node)
    }
    const leadingText = leadingNodes.map(n => n.textContent).join('')
    if (leadingText.trimStart().startsWith('>')) {
      const wrapper = document.createElement('span')
      wrapper.className = 'hn-quote'
      leadingNodes.forEach(n => wrapper.appendChild(n))
      commtext.insertBefore(wrapper, commtext.firstChild)
      stripLeadingMarker(wrapper)
    }
  })
}
