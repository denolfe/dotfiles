# Advanced Userscript Patterns

## Wait for Element (requestAnimationFrame)

Poll for element existence before running code. Useful when DOM isn't ready.

```javascript
function waitForElement(selector, callback) {
  const el = document.querySelector(selector)
  if (el) {
    callback(el)
  } else {
    requestAnimationFrame(() => waitForElement(selector, callback))
  }
}

waitForElement('#target', el => {
  // element exists, do something
})
```

---

## isTyping Helper

Reusable check for keyboard shortcuts.

```javascript
function isTyping() {
  const tag = document.activeElement?.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' ||
         document.activeElement?.isContentEditable
}

document.addEventListener('keydown', e => {
  if (isTyping()) return
  // handle shortcut
})
```

---

## Scroll with Offset

Smooth scroll to element with fixed header offset.

```javascript
const SCROLL_OFFSET = 100 // pixels from top

function scrollToElement(el) {
  const rect = el.getBoundingClientRect()
  const targetY = window.scrollY + rect.top - SCROLL_OFFSET
  window.scrollTo({ top: targetY, behavior: 'smooth' })
}
```

---

## Dark Mode Detection

### Via CSS Media Query
```javascript
const style = document.createElement('style')
style.textContent = `
  .my-element {
    background: white;
    color: black;
  }
  @media (prefers-color-scheme: dark) {
    .my-element {
      background: #1a1a1a;
      color: white;
    }
  }
`
document.head.appendChild(style)
```

### Via Meta Tag (Google-style)
```javascript
function isDarkMode() {
  const meta = document.querySelector('meta[name="color-scheme"]')
  return meta?.content.includes('dark')
}

const linkColor = isDarkMode() ? '#40965b' : '#006621'
```

### Via CSS Variable
```javascript
const style = document.createElement('style')
style.textContent = `
  :root {
    --my-bg: white;
    --my-text: black;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --my-bg: #1a1a1a;
      --my-text: white;
    }
  }
  .my-element {
    background: var(--my-bg);
    color: var(--my-text);
  }
`
```

---

## URL/Domain Parsing

Extract domain from links for favicons, filtering, etc.

```javascript
const link = document.querySelector('a')
const url = new URL(link.href)

url.hostname    // "www.example.com"
url.origin      // "https://www.example.com"
url.pathname    // "/path/to/page"
url.searchParams.get('q')  // query param

// Favicon from Google
const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${url.hostname}`
```

---

## GM_addElement (Programmatic Element Creation)

Add elements programmatically. Can bypass CSP when needed.

```javascript
// @grant GM_addElement

// Add image
GM_addElement('img', {
  src: 'https://example.com/image.png',
  width: 16,
  height: 16
})

// Add to specific parent
GM_addElement(document.body, 'div', {
  id: 'my-container',
  textContent: 'Hello'
})

// Add external script (useful for CSP bypass)
GM_addElement('script', {
  src: 'https://example.com/lib.js'
})
```

---

## SPA Navigation Handling

### YouTube Custom Events
```javascript
// YouTube fires custom events for SPA navigation
document.addEventListener('yt-page-data-fetched', evt => {
  const url = evt.detail.pageData.url
  const response = evt.detail.pageData.response
  // Handle navigation, modify data before render
})

// Also available: yt-navigate-finish (fires later)
```

### Generic SPA (History API)
```javascript
// Intercept pushState/replaceState
const originalPushState = history.pushState
const originalReplaceState = history.replaceState

history.pushState = function(...args) {
  originalPushState.apply(this, args)
  onUrlChange()
}

history.replaceState = function(...args) {
  originalReplaceState.apply(this, args)
  onUrlChange()
}

window.addEventListener('popstate', onUrlChange)

function onUrlChange() {
  // Re-run script logic for new page
}
```

---

## Debug Logging Toggle

Conditional logging that can be disabled in production.

```javascript
const DEBUG = false
const LOG_PREFIX = '[My Script]'

const debug = DEBUG
  ? (...args) => console.debug(LOG_PREFIX, ...args)
  : () => {}

const log = (...args) => console.log(LOG_PREFIX, ...args)

debug('verbose info')  // only if DEBUG=true
log('important info')  // always
```

---

## Focus/Selection State Management

Track focused element with visual indicator.

```javascript
let focusedElement = null
const allElements = []

function setFocus(el) {
  if (focusedElement) {
    focusedElement.classList.remove('focused')
  }
  focusedElement = el
  if (el) {
    el.classList.add('focused')
    scrollToElement(el)
  }
}

// Click to focus
document.addEventListener('click', e => {
  const target = e.target.closest('.item')
  setFocus(target || null)
})

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (!focusedElement || isTyping()) return

  if (e.key === 'j') {
    const idx = allElements.indexOf(focusedElement)
    if (idx < allElements.length - 1) {
      setFocus(allElements[idx + 1])
    }
  }
})
```

---

## TreeWalker (Text Node Iteration)

Efficiently iterate all text nodes for highlighting, search, etc.

```javascript
const walker = document.createTreeWalker(
  document.body,
  NodeFilter.SHOW_TEXT,
  null
)

while (walker.nextNode()) {
  const textNode = walker.currentNode
  if (textNode.data.includes('search term')) {
    // Found match in text node
  }
}
```

---

## CSS Highlight API

Modern highlighting without DOM modification.

```javascript
const highlights = new Highlight()
CSS.highlights.set('my-highlight', highlights)

// Add style for highlight
const style = document.createElement('style')
style.textContent = `
  ::highlight(my-highlight) {
    background-color: yellow;
    color: black;
  }
`
document.head.appendChild(style)

// Highlight a range
const range = new Range()
range.setStart(textNode, startIndex)
range.setEnd(textNode, endIndex)
highlights.add(range)

// Clear highlights
highlights.clear()
```

---

## Inline GM_addStyle (when @grant none)

Define helper when not using GM API.

```javascript
// @grant none

function GM_addStyle(css) {
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
  return style
}

GM_addStyle(`
  .selector { color: red; }
`)
```

---

## Element Visibility Check

Check if element is visible (not hidden/collapsed).

```javascript
function isVisible(el) {
  if (!el.offsetHeight) return false
  const style = getComputedStyle(el)
  return style.display !== 'none' &&
         style.visibility !== 'hidden' &&
         style.opacity !== '0'
}

// Filter to visible elements only
const visibleItems = allItems.filter(isVisible)

// Site-specific: may also need to check for site's hide classes
// e.g., !el.classList.contains('noshow')
```

---

## Modifying Site Internal Data

Intercept and modify data before render (advanced).

```javascript
// YouTube example: modify liveChatRenderer before display
document.addEventListener('yt-page-data-fetched', evt => {
  const data = evt.detail.pageData.response
  const chatRenderer = data?.contents?.twoColumnWatchNextResults?.conversationBar?.liveChatRenderer

  if (chatRenderer) {
    // Modify internal state
    chatRenderer.initialDisplayState = 'LIVE_CHAT_DISPLAY_STATE_COLLAPSED'
  }
})
```

---

## Canvas Overlay (Scroll Markers)

Draw indicators on page edge.

```javascript
const canvas = document.createElement('canvas')
canvas.style.cssText = `
  pointer-events: none;
  position: fixed;
  z-index: 2147483647;
  top: 0;
  right: 0;
  width: 16px;
  height: 100vh;
`
document.body.appendChild(canvas)

const ctx = canvas.getContext('2d')
const dpr = devicePixelRatio || 1
canvas.width = 16 * dpr
canvas.height = window.innerHeight * dpr

function drawMarker(yPercent) {
  const y = canvas.height * yPercent
  ctx.fillStyle = 'yellow'
  ctx.fillRect(0, y, canvas.width, 3 * dpr)
}
```
