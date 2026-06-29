// ==UserScript==
// @name         HackerNews Favicons
// @namespace    denolfe
// @version      1.0.1
// @icon         https://www.google.com/s2/favicons?sz=64&domain=news.ycombinator.com
// @description  Shows favicon on HackerNews links
// @author       PoKeRGT
// @match        https://news.ycombinator.com/*
// @grant        GM_addElement
// @run-at       document-end
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/493967/HackerNews%20FavIcons.user.js
// @updateURL https://update.greasyfork.org/scripts/493967/HackerNews%20FavIcons.meta.js
// ==/UserScript==

;(function () {
  'use strict'

  for (let item of document.querySelectorAll('.titleline')) {
    item.style.display = 'flex'
    item.style.alignItems = 'center'
    item.style.gap = '0.25em'
    const link = item.querySelector('a')
    const domain = new URL(link.href).hostname
    const imageUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${domain}`

    const container = document.createElement('span')
    container.style.paddingRight = '0.25em'
    container.style.paddingLeft = '0.25em'
    item.prepend(container)

    const newTabLink = document.createElement('a')
    newTabLink.href = link.href
    newTabLink.target = '_blank'

    container.appendChild(newTabLink)

    GM_addElement(newTabLink, 'img', {
      src: imageUrl,
      width: 16,
      height: 16,
    })
  }
})()
