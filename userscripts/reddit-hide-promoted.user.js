// ==UserScript==
// @name            Reddit - Hide Promoted Posts
// @namespace       denolfe
// @version         0.0.1
// @description     Remove promoted/ad posts from reddit.com feeds
// @icon            https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @match           https://www.reddit.com/*
// @match           https://reddit.com/*
// @author          Elliot DeNolf
// @run-at          document-start
// @noframes
// @grant           none
// ==/UserScript==

;(() => {
  'use strict'

  // Hide at the post/card level so the whole entry disappears, not just the label.
  const style = document.createElement('style')
  style.textContent = `
    shreddit-ad-post,
    shreddit-post[promoted],
    shreddit-post[promoted="true"],
    shreddit-comments-page-ad,
    [data-testid="post-container"]:has(> * [data-promoted="true"]),
    article:has(shreddit-ad-post),
    article:has(shreddit-post[promoted="true"]),
    article:has(shreddit-dynamic-ad-link),
    shreddit-post:has(shreddit-dynamic-ad-link) {
      display: none !important;
    }
  `
  document.documentElement.appendChild(style)

  // Detect by the "Promoted" label for layouts CSS misses,
  // then remove the enclosing post card.
  const POST_ANCESTOR = 'shreddit-post, shreddit-ad-post, article, [data-testid="post-container"]'

  const removePromoted = root => {
    root.querySelectorAll?.(
      'shreddit-ad-post, shreddit-post[promoted], shreddit-post[promoted="true"], shreddit-comments-page-ad, shreddit-dynamic-ad-link',
    ).forEach(el => (el.closest(POST_ANCESTOR) ?? el).remove())

    // Match the visible "Promoted" label as a fallback.
    root.querySelectorAll?.('.promoted-label, [class*="promoted-label"]').forEach(label => {
      label.closest(POST_ANCESTOR)?.remove()
    })
  }

  const start = () => {
    removePromoted(document)

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) removePromoted(node)
        }
      }
    })

    observer.observe(document.documentElement, { childList: true, subtree: true })
  }

  if (document.body) start()
  else document.addEventListener('DOMContentLoaded', start, { once: true })
})()
