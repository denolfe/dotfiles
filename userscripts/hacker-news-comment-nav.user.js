// ==UserScript==
// @name         Hacker News Comment Navigator
// @namespace    https://news.ycombinator.com/
// @version      0.0.1
// @description  Keyboard navigation for Hacker News comments (j/k/Enter)
// @author       Elliot DeNolf
// @match        https://news.ycombinator.com/item*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=news.ycombinator.com
// @grant        none
// ==/UserScript==

;(function () {
  'use strict'

  const SCROLL_OFFSET = 100
  const BORDER_COLOR = '#ff6600'

  let focusedComment = null
  let allComments = []

  function init() {
    allComments = Array.from(document.querySelectorAll('tr.athing.comtr'))

    if (allComments.length === 0) return

    addStyles()
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeydown)
  }

  function addStyles() {
    const style = document.createElement('style')
    style.textContent = `
      tr.comtr.hn-nav-focused td.default {
        border-left-color: ${BORDER_COLOR};
      }
    `
    document.head.appendChild(style)
  }

  function setFocus(comment) {
    if (focusedComment) {
      focusedComment.classList.remove('hn-nav-focused')
    }
    focusedComment = comment
    if (comment) {
      comment.classList.add('hn-nav-focused')
      scrollToComment(comment)
    }
  }

  function scrollToComment(comment) {
    const rect = comment.getBoundingClientRect()
    const targetY = window.scrollY + rect.top - SCROLL_OFFSET
    window.scrollTo({ top: targetY, behavior: 'smooth' })
  }

  function handleClick(e) {
    const commentRow = e.target.closest('tr.athing.comtr')
    if (commentRow) {
      setFocus(commentRow)
    } else {
      setFocus(null)
    }
  }

  function handleKeydown(e) {
    if (!focusedComment) return
    if (isTyping()) return

    const key = e.key.toLowerCase()

    if (key === 'j') {
      e.preventDefault()
      navigateNext()
    } else if (key === 'k') {
      e.preventDefault()
      navigatePrev()
    } else if (key === 'enter') {
      e.preventDefault()
      toggleCollapse()
    } else if (key === 'escape') {
      e.preventDefault()
      setFocus(null)
    }
  }

  function isTyping() {
    const tag = document.activeElement?.tagName.toLowerCase()
    return tag === 'input' || tag === 'textarea'
  }

  function isVisible(comment) {
    return comment.offsetHeight > 0 && !comment.classList.contains('noshow')
  }

  function navigateNext() {
    const idx = allComments.indexOf(focusedComment)
    for (let i = idx + 1; i < allComments.length; i++) {
      if (isVisible(allComments[i])) {
        setFocus(allComments[i])
        return
      }
    }
  }

  function navigatePrev() {
    const idx = allComments.indexOf(focusedComment)
    for (let i = idx - 1; i >= 0; i--) {
      if (isVisible(allComments[i])) {
        setFocus(allComments[i])
        return
      }
    }
  }

  function toggleCollapse() {
    const toggle = focusedComment.querySelector('.togg')
    if (toggle) toggle.click()
  }

  init()
})()
