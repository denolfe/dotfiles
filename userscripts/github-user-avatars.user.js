// ==UserScript==
// @name            GitHub - User Avatars
// @namespace       denolfe
// @version         0.0.3
// @description     Show user avatars next to usernames across GitHub (PR/issue lists, headers, mentions, notifications, releases) and on emoji reaction buttons. Port of refined-github's small-user-avatars.
// @icon            https://www.google.com/s2/favicons?sz=64&domain=github.com
// @match           https://github.com/*
// @author          Elliot DeNolf
// @license         MIT
// @run-at          document-end
// @noframes
// @grant           none
// ==/UserScript==

/*
 * Adapted from refined-github (https://github.com/refined-github/refined-github):
 * small-user-avatars.
 *
 * MIT License
 *
 * Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (https://sindresorhus.com)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

;(() => {
  'use strict'

  const MARK = 'data-rgh-avatar'
  const AVATAR_SIZE = 16
  const REACTION_AVATAR_SIZE = 18
  const MAX_REACTION_AVATARS = 4

  // Reaction summary buttons (👍, ❤️, 🚀, …) on issues/PRs/discussions.
  const REACTION_SELECTOR = `button.js-reaction-group-button:not([${MARK}])`

  // Places where we prepend a real <img>. `[data-hovercard-type="user"]` filters out bots.
  const IMG_SELECTORS = [
    '.opened-by a.Link--muted[data-hovercard-type="user"]', // legacy PR/issue list
    '.js-issue-row a[data-hovercard-type="user"]', // newer PR/issue list rows
    '.notification-thread-subscription a[data-hovercard-type="user"]', // /notifications/subscriptions
    '[data-testid="created-at"] a[data-hovercard-url*="/users"]', // issue/PR detail header
    '[data-testid="closed-at"] a[data-hovercard-url*="/users"]',
  ]
    .map(s => `${s}:not([${MARK}])`)
    .join(',')

  // React PR/issue lists: author links carry no hovercard URL, only an aria-label.
  const LIST_AUTHOR_SELECTOR = [
    '[aria-label^="Filter by author "]:is(a, button)', // repo PR lists, /pulls/*
    'button[data-testid="author-filter-link"][data-hovercard-type="user"]', // /issues/*
  ]
    .map(s => `${s}:not([${MARK}])`)
    .join(',')

  // `.user-mention` covers @-mentions in comments, discussions, releases.
  // Exclude merge-queue `.opened-by > *` and commit author lines (they already have avatars).
  const MENTION_SELECTOR = `a.user-mention[data-hovercard-type="user"]:not([${MARK}]):not(.opened-by > *):not(.commit-author)`

  const getUsername = link => {
    const hovercard = link.getAttribute('data-hovercard-url') || ''
    const m = hovercard.match(/^\/users\/([^/]+)\/hovercard/)
    if (m) return m[1]
    const href = link.getAttribute('href') || ''
    const m2 = href.match(/github\.com\/([^/?#]+)$/) || href.match(/^\/([^/?#]+)$/)
    return m2 ? m2[1] : null
  }

  const avatarUrl = username =>
    `https://avatars.githubusercontent.com/${username}?size=${AVATAR_SIZE * 2}`

  const getListAuthor = el => {
    const fromLabel = (el.getAttribute('aria-label') || '').match(/^Filter by author (\S+)$/)
    if (fromLabel) return fromLabel[1]
    return getUsername(el) || el.lastChild?.textContent.trim() || null
  }

  // Bots (`foo[bot]`, `app/foo`) have no /<login> avatar URL
  const isBot = username => /^app\/|\[bot\]$/.test(username)

  const createAvatarImg = username => {
    const img = document.createElement('img')
    img.src = avatarUrl(username)
    img.alt = ''
    img.width = AVATAR_SIZE
    img.height = AVATAR_SIZE
    img.loading = 'lazy'
    img.style.cssText = 'border-radius:50%;vertical-align:text-bottom;margin-right:4px;'
    return img
  }

  const addImgAvatar = link => {
    const username = getUsername(link)
    if (!username) return
    link.setAttribute(MARK, '')
    link.parentNode.insertBefore(createAvatarImg(username), link)
  }

  // Inside the link so the own-author highlight in github-pr-list wraps the avatar too
  const addListAuthorAvatar = el => {
    el.setAttribute(MARK, '')
    const username = getListAuthor(el)
    if (!username || isBot(username)) return
    el.prepend(createAvatarImg(username))
  }

  const addMentionAvatar = link => {
    const username = getUsername(link)
    if (!username) return
    link.setAttribute(MARK, '')
    link.classList.add('rgh-mention-avatar')
    link.style.setProperty('--avatar-url', `url(${avatarUrl(username)})`)
  }

  // Tooltip text reads "a, b, and c reacted with <emoji> emoji". Extract the
  // logins, dropping the unnamed "and N others" GitHub appends for big counts.
  const parseReactors = tooltipText => {
    const m = tooltipText.match(/^(.*?)\s+reacted with\b/)
    if (!m) return []
    return m[1]
      .split(/,\s*and\s+|,\s*|\s+and\s+/)
      .map(name => name.trim())
      .filter(name => name && !/^\d+\s+others?$/.test(name))
  }

  const addReactionAvatars = button => {
    const tooltip = document.getElementById(button.getAttribute('aria-describedby') || '')
    if (!tooltip) return
    const usernames = parseReactors(tooltip.textContent || '')
    if (!usernames.length) return
    button.setAttribute(MARK, '')

    const stack = document.createElement('span')
    stack.className = 'rgh-reaction-avatars'
    for (const username of usernames.slice(0, MAX_REACTION_AVATARS)) {
      const img = document.createElement('img')
      img.src = avatarUrl(username)
      img.alt = ''
      img.title = username
      img.width = REACTION_AVATAR_SIZE
      img.height = REACTION_AVATAR_SIZE
      img.loading = 'lazy'
      stack.appendChild(img)
    }
    button.appendChild(stack)
  }

  const injectStyles = () => {
    if (document.getElementById('rgh-small-user-avatars-style')) return
    const style = document.createElement('style')
    style.id = 'rgh-small-user-avatars-style'
    style.textContent = `
.rgh-mention-avatar::before {
  content: '';
  display: inline-block;
  width: 1em;
  height: 1em;
  min-width: 16px;
  min-height: 16px;
  margin-right: 0.2em;
  border-radius: 50%;
  background-image: var(--avatar-url);
  background-size: cover;
  background-position: center;
  vertical-align: middle;
}
.user-mention { margin-left: 0 !important; margin-right: 0 !important; }
.rgh-reaction-avatars {
  display: inline-flex;
  align-items: center;
  margin-left: 5px;
  align-self: center;
}
.rgh-reaction-avatars img {
  width: ${REACTION_AVATAR_SIZE}px;
  height: ${REACTION_AVATAR_SIZE}px;
  border-radius: 50%;
  margin-left: -4px;
  box-shadow: 0 0 0 1px var(--avatar-borderColor);
}
.rgh-reaction-avatars img:first-child { margin-left: 0; }
`
    document.head.appendChild(style)
  }

  const run = () => {
    document.querySelectorAll(IMG_SELECTORS).forEach(addImgAvatar)
    document.querySelectorAll(LIST_AUTHOR_SELECTOR).forEach(addListAuthorAvatar)
    document.querySelectorAll(MENTION_SELECTOR).forEach(addMentionAvatar)
    document.querySelectorAll(REACTION_SELECTOR).forEach(addReactionAvatars)
  }

  injectStyles()
  run()

  const observer = new MutationObserver(run)
  observer.observe(document.body, { childList: true, subtree: true })

  document.addEventListener('turbo:load', run)
  document.addEventListener('pjax:end', run)
})()
