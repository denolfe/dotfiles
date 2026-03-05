---
name: userscripts
description: Use when writing Tampermonkey/Violentmonkey/Greasemonkey userscripts, modifying website behavior or appearance, or working with .user.js files.
---

# Userscript Development

Guide for writing Tampermonkey/Violentmonkey userscripts.

## Workflow

### Phase 1: Requirements
Ask one at a time:
1. **Target site** - URL pattern (e.g., `https://example.com/*`)
2. **Goal** - CSS styling, add feature, remove element, keyboard shortcut, etc.
3. **Output location** - Where to save the `.user.js` file

### Phase 2: DOM Inspection

**Option A: Fetch URL directly (try first for public sites)**
- Use WebFetch to retrieve page HTML
- Search for relevant selectors, CSS variables, data attributes
- Works for public sites not behind login

**Option B: User provides MHTML/HTML file**
- If fetch fails (login required, dynamic content), instruct: "Save the page (Cmd+S / Ctrl+S) as MHTML or 'Webpage, Complete'"
- Grep for patterns: `class=`, `data-`, `id=`, `--` (CSS variables)
- Prefer stable selectors: `data-testid`, `data-*`, semantic IDs over generated class names

**Option C: User provides selectors**
- Guide user to inspect element in browser devtools
- Ask for: element selector, parent structure, relevant CSS variables

### Phase 3: Implementation
1. Choose `@run-at` timing based on task type
2. Choose `@grant` level (start with `none`)
3. Write script using metadata template below
4. Save to user-specified location

### Phase 4: Testing
- Instruct: "Install in Tampermonkey/Violentmonkey and reload the page"
- If issues: iterate on selectors or timing

---

## Metadata Template

```javascript
// ==UserScript==
// @name            Script Name
// @namespace       your-namespace
// @version         0.0.1
// @description     Brief description
// @icon            https://www.google.com/s2/favicons?sz=64&domain=example.com
// @homepage        https://github.com/username/repo
// @match           https://example.com/*
// @exclude         https://example.com/admin/*
// @author          Author Name
// @run-at          document-end
// @noframes
// @grant           none
// ==/UserScript==
```

---

## Full Templates

### CSS Override (copy-paste ready)
```javascript
// ==UserScript==
// @name            Site Name - Custom Styles
// @namespace       your-namespace
// @version         0.0.1
// @description     Override styles on example.com
// @icon            https://www.google.com/s2/favicons?sz=64&domain=example.com
// @match           https://example.com/*
// @author          Your Name
// @run-at          document-start
// @grant           none
// ==/UserScript==

;(() => {
  'use strict'

  const style = document.createElement('style')
  style.textContent = `
    /* Hide element */
    .annoying-banner {
      display: none !important;
    }

    /* Override CSS variable */
    :root {
      --site-font: -apple-system, BlinkMacSystemFont, system-ui, sans-serif !important;
    }
  `
  document.documentElement.appendChild(style)
})()
```

### DOM Manipulation (copy-paste ready)
```javascript
// ==UserScript==
// @name            Site Name - DOM Tweaks
// @namespace       your-namespace
// @version         0.0.1
// @description     Modify DOM on example.com
// @icon            https://www.google.com/s2/favicons?sz=64&domain=example.com
// @match           https://example.com/*
// @author          Your Name
// @run-at          document-end
// @noframes
// @grant           none
// ==/UserScript==

;(() => {
  'use strict'

  // Remove elements
  document.querySelectorAll('.unwanted').forEach(el => el.remove())

  // Modify elements
  document.querySelectorAll('a.external').forEach(link => {
    link.setAttribute('target', '_blank')
  })

  // Add keyboard shortcut
  document.addEventListener('keydown', e => {
    if (e.target.matches('input, textarea, [contenteditable]')) return

    if (e.key === 'j' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      // action here
    }
  })
})()
```

### Dynamic Content (copy-paste ready)
```javascript
// ==UserScript==
// @name            Site Name - Dynamic Handler
// @namespace       your-namespace
// @version         0.0.1
// @description     Handle dynamically loaded content on example.com
// @icon            https://www.google.com/s2/favicons?sz=64&domain=example.com
// @match           https://example.com/*
// @author          Your Name
// @run-at          document-end
// @noframes
// @grant           none
// ==/UserScript==

;(() => {
  'use strict'

  const processElement = el => {
    // modify element
  }

  // Process existing elements
  document.querySelectorAll('.target').forEach(processElement)

  // Watch for new elements
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue
        if (node.matches('.target')) processElement(node)
        node.querySelectorAll?.('.target').forEach(processElement)
      }
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
})()
```

---

## @run-at Timing

| Value | Use Case |
|-------|----------|
| `document-start` | CSS injection, intercept before render |
| `document-end` | DOM manipulation (DOM ready, images loading) |
| `document-idle` | Non-critical, after page fully loads |

---

## @grant Options

| Value | When to Use |
|-------|-------------|
| `none` | Simple scripts, no sandbox, direct page access |
| `GM_addStyle` | CSS injection helper function |
| `GM_getValue` / `GM_setValue` | Persistent storage across sessions |
| `GM_xmlhttpRequest` | Cross-origin requests (also needs `@connect`) |
| `GM_registerMenuCommand` | Add items to extension popup menu |
| `GM_setClipboard` | Copy to clipboard |
| `unsafeWindow` | Access page's JavaScript context |

---

## Common Patterns

### CSS Injection
```javascript
// @run-at document-start
// @grant none

const style = document.createElement('style')
style.textContent = `
  .selector {
    display: none !important;
  }
`
document.documentElement.appendChild(style)
```

### CSS Variable Override
```javascript
// @run-at document-start

const style = document.createElement('style')
style.textContent = `
  :root {
    --custom-property: value !important;
  }
`
document.documentElement.appendChild(style)
```

### DOM Query + Modify
```javascript
// @run-at document-end

document.querySelectorAll('.selector').forEach(el => {
  el.style.display = 'none'
})
```

### Keyboard Shortcut
```javascript
// @run-at document-end

document.addEventListener('keydown', e => {
  // Skip if typing in input/textarea
  if (e.target.matches('input, textarea, [contenteditable]')) return

  if (e.key === 'j' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    e.preventDefault()
    // action here
  }
})
```

### MutationObserver (Dynamic Content)
```javascript
// @run-at document-end

const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (node.matches?.('.target-selector')) {
        // handle new element
      }
    }
  }
})

observer.observe(document.body, { childList: true, subtree: true })
```

### GM_addStyle (with grant)
```javascript
// @grant GM_addStyle

GM_addStyle(`
  .selector {
    display: none !important;
  }
`)
```

---

## Advanced Patterns

See `@references/advanced-patterns.md` for full implementations:

| Pattern | Use Case |
|---------|----------|
| Wait for element | Poll with `requestAnimationFrame` until element exists |
| isTyping helper | Skip shortcuts when user is in input/textarea |
| Scroll with offset | Smooth scroll accounting for fixed headers |
| Dark mode | CSS media query, meta tag, or CSS variables |
| URL parsing | Extract domain/path with `new URL()` |
| GM_addElement | Bypass CSP for images/scripts |
| SPA navigation | Handle YouTube events, History API |
| Debug logging | Toggleable console output |
| Focus management | Track selection with keyboard nav |
| TreeWalker | Iterate text nodes for search/highlight |
| CSS Highlight API | Highlight without DOM modification |
| Canvas overlay | Draw scroll position markers |

---

## Selector Strategy

**Prefer (stable):**
- `data-testid="value"` - test IDs rarely change
- `data-*` attributes - semantic, intentional
- Semantic IDs - `#main-content`, `#sidebar`
- Tag + role - `button[role="tab"]`

**Avoid (fragile):**
- Generated classes - `.css-1a2b3c`, `.sc-abc123`
- Deep nesting - `div > div > div > span`
- Index-based - `:nth-child(3)`

---

## Debugging Tips

1. **Test selectors in console first** - `document.querySelectorAll('.selector')`
2. **Check timing** - if elements missing, try `document-idle` or MutationObserver
3. **Inspect network** - for dynamic content, elements may load after initial render
4. **CSS specificity** - use `!important` to override site styles
5. **Console errors** - check devtools console for script errors

---

## Reference

- `@references/api-reference.md` - All metadata headers, @match patterns, GM_* functions
- `@references/advanced-patterns.md` - SPA handling, dark mode, scroll markers, TreeWalker, etc.
