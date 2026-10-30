// ==UserScript==
// @name            GitHub - PR List Tweaks
// @namespace       denolfe
// @version         0.0.1
// @description     Port of refined-github PR list features: highlight your own PRs, color review status, dim bot PRs, emphasize draft icons.
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
 * conversation-authors, pr-approvals-count, dim-bots, emphasize-draft-pr-label.
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

  const STYLE_ID = 'rgh-pr-list-style'
  const LIST = '[data-listview-component="items-list"]'

  const ownAuthorCss = login => {
    if (!login) return ''
    const label = CSS.escape(`Filter by author ${login}`)
    return `
/* conversation-authors: PRs opened by you */
[data-testid="author-filter-link"][aria-label="${label}"] {
  &, &:hover {
    color: var(--color-user-mention-fg, var(--fgColor-default)) !important;
    background-color: var(--bgColor-attention-muted, var(--color-attention-subtle));
    border-radius: 3px;
    padding: 0 2px;
  }
  &:hover { text-decoration: underline !important; }
}
`
  }

  const baseCss = `
/* pr-approvals-count: color review decisions */
[data-testid="review-decision-icon"] {
  button[aria-label="Filter by review: Approved"] {
    color: var(--fgColor-success, #1a7f37) !important;
  }
  button[aria-label="Filter by review: Changes requested"] {
    color: var(--fgColor-danger, #cf222e) !important;
  }
  button[aria-label="Filter by review: Review required"] {
    color: var(--fgColor-attention, #c69026) !important;
  }
}

/* dim-bots: fade bot-authored rows until hovered or focused */
${LIST} > li:has(
  [data-testid="author-filter-link"][aria-label$="[bot]"],
  [data-testid="author-filter-link"][href*="author%3Aapp%2F"]
) {
  transition: opacity 100ms;
  &:not(:hover, :focus-within) { opacity: 50%; }
}

/* emphasize-draft-pr-label: hollow draft icon so it reads apart from open PRs on HiDPI */
@media (resolution >= 2x) {
  ${LIST} .octicon-git-pull-request-draft {
    stroke: var(--fgColor-muted, #59636e);
    stroke-width: 1.2px;
    color: var(--bgColor-default, #fff) !important;
    paint-order: stroke;
    overflow: visible !important;
  }
}
`

  if (document.getElementById(STYLE_ID)) return

  const login = document.querySelector('meta[name="user-login"]')?.content
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = baseCss + ownAuthorCss(login)
  // Outside <head>/<body> so Turbo navigations do not drop it
  document.documentElement.appendChild(style)
})()
