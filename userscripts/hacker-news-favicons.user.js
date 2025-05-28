// ==UserScript==
// @name         HackerNews FavIcons
// @namespace    PoKeRGT
// @version      1.00
// @icon         https://www.google.com/s2/favicons?sz=64&domain=news.ycombinator.com
// @description  Shows favicon for every link in hackernews
// @author       PoKeRGT
// @match        https://news.ycombinator.com/*
// @grant        GM_addElement
// @run-at       document-end
// @homepageURL  https://github.com/PoKeRGT/userscripts
// @license      MIT
// @downloadURL https://update.greasyfork.org/scripts/493967/HackerNews%20FavIcons.user.js
// @updateURL https://update.greasyfork.org/scripts/493967/HackerNews%20FavIcons.meta.js
// ==/UserScript==

;(function () {
  'use strict'

  for (let item of document.querySelectorAll('.titleline')) {
    item.style.display = 'flex'
    item.style.alignItems = 'center'
    const link = item.querySelector('a')
    const domain = new URL(link.href).hostname
    const imageUrl = `https://www.google.com/s2/favicons?sz=16&domain_url=${domain}`

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
