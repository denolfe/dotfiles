// ==UserScript==
// @name         Better Google
// @namespace    google
// @version      0.1.16.10
// @description  Restore google search results to older style with green link below title instead of link above title.  Just tweaks the CSS and does some dynamic JS reordering of the DIVs.
// @author       aligo, adambh, tejaslodaya, drwonky, yut23
// @license      MIT
// @homepageURL   https://github.com/aligo/better-google
// @match        https://*.google.com/search?*
// @include      /^https?://(?:www|encrypted|ipv[46])\.google\.[^/]+/(?:$|[#?]|search|webhp)/
// @grant        none
// @run-at       document-start
// @downloadURL https://update.greasyfork.org/scripts/395257/Better%20Google.user.js
// @updateURL https://update.greasyfork.org/scripts/395257/Better%20Google.meta.js
// ==/UserScript==

;(function () {
  'use strict'

  var betterGoogleRow = function (el) {
    var tbwUpd = el.querySelectorAll('.TbwUpd, .HGLrXd')
    if (tbwUpd.length > 0) {
      /* Google does A/B testing on the search results page, so the
       * structure of the page is not always the same.  This code
       * tries to find the link element in a few different ways.
       * If it can't find it, it just gives up and doesn't do
       * anything.
       */
      var selectors = ['.yuRUbf > a', '.yuRUbf > div > a', '.yuRUbf > div > span > a']
      for (const selector of selectors) {
        var linkEl = el.querySelector(selector)
        if (linkEl) {
          break
        }
      }
      var addEl = linkEl.nextSibling
      if (!addEl) {
        // try the parent's sibling, for the span case
        addEl = linkEl.parentElement.nextSibling
      }
      if (!addEl) {
        // entry isn't fully loaded yet
        return
      }

      var betterAddEl = document.createElement('div')
      betterAddEl.className = 'btrAdd'

      // this loop moves the "More options" button into betterAddEl
      for (var i = 0; i < addEl.children.length; i++) {
        var _el = addEl.children[i]
        if (_el.className.includes('TbwUpd') || _el.className.includes('HGLrXd')) {
          continue
        }
        betterAddEl.appendChild(_el)
      }

      var betterEl = document.createElement('div')
      betterEl.className = 'btrG'
      betterEl.appendChild(betterAddEl)

      el.appendChild(betterEl)

      var urlEl = document.createElement('a')
      urlEl.href = linkEl.href
      urlEl.target = '_blank'
      urlEl.className = 'btrLink'

      var urlCiteEl = document.createElement('cite')
      urlCiteEl.innerText = linkEl.href
      urlCiteEl.className = 'iUh30 bc'
      urlEl.appendChild(urlCiteEl)

      var maxWidth = el.clientWidth - betterAddEl.offsetWidth - 10

      betterEl.insertBefore(urlEl, betterAddEl)
      if (urlEl.offsetWidth > maxWidth) {
        urlEl.style.width = maxWidth.toString() + 'px'
      }

      var aboutResult = el.querySelectorAll('.csDOgf')
      if (aboutResult.length > 0) {
        betterEl.appendChild(aboutResult[0])
      }
      tbwUpd.forEach(function (el) {
        el.remove()
      })

      var brEl = linkEl.querySelector('br:first-child')
      if (brEl) {
        brEl.remove()
      }
    }
  }

  var prevResultCount = 0
  var bettered = false

  var runBetterGoogle = function () {
    if (prevResultCount != document.querySelectorAll('.MjjYud .yuRUbf').length) {
      document.querySelectorAll('.MjjYud .yuRUbf').forEach(betterGoogleRow)
      prevResultCount = document.querySelectorAll('.MjjYud .yuRUbf').length
    }
    if (!bettered) {
      if (MutationObserver != undefined) {
        var searchEl = document.getElementById('rcnt')
        var observer = new MutationObserver(runBetterGoogle)
        observer.observe(searchEl, { childList: true, subtree: true })
      }
      bettered = true
    }
  }

  var prepareStyleSheet = function () {
    // if dark mode is enabled (either manually or by device default),
    // Google adds a meta tag to the document which we can check
    var link_color = '#006621'
    var meta_color_scheme = document.querySelector('meta[name="color-scheme"]')
    if (meta_color_scheme != undefined && meta_color_scheme.content.includes('dark')) {
      // use a lighter green in dark mode
      link_color = '#40965b'
    }
    var style = document.createElement('style')
    style.setAttribute('media', 'screen')
    style.appendChild(document.createTextNode(''))
    document.head.appendChild(style)
    style.sheet.insertRule(`:root { --btrG-link-color: ${link_color}; }`)
    style.sheet.insertRule('.btrG { word-break: normal; line-height: 18px; }')
    style.sheet.insertRule(
      '.btrG .btrAdd { display: inline-block; vertical-align: top; line-height: 0; }',
    )
    style.sheet.insertRule(
      '.btrG .btrLink { display: inline-block; vertical-align: top; line-height: 18px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-decoration: none !important; color: var(--btrG-link-color); }',
    )
    style.sheet.insertRule(
      '.btrG .btrLink cite.iUh30 { color: var(--btrG-link-color); font-size: 16px; }',
    )
    // remove extra space used for new multiline link info card
    style.sheet.insertRule('.yuRUbf h3.DKV0Md { margin-top: 0px; }')
  }

  var checkElementThenRun = function (selector, func) {
    var el = document.querySelector(selector)
    if (el == null) {
      if (window.requestAnimationFrame != undefined) {
        window.requestAnimationFrame(function () {
          checkElementThenRun(selector, func)
        })
      } else {
        document.addEventListener('readystatechange', function (e) {
          if (document.readyState == 'complete') {
            func()
          }
        })
      }
    } else {
      func()
    }
  }

  checkElementThenRun('head', prepareStyleSheet)
  checkElementThenRun('#rcnt', runBetterGoogle)
})()
