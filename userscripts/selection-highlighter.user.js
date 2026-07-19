// ==UserScript==
// @name         Selection Highlighter
// @namespace    neaumusic
// @version      0.2
// @description  Highlight all instances of a selected word on the page. Port of https://github.com/neaumusic/selection-highlighter
// @author       Elliot DeNolf
// @match        *://*/*
// @grant        none
// @run-at       document-body
// ==/UserScript==

;(function () {
  'use strict'

  // Default options
  const defaultOptions = {
    minSelectionString: 1,
    denyListedHosts: ['foo.com', 'bar.com'],
    matchWholeWord: false,
    matchCaseSensitive: false,
    highlightStylesObject: {
      'background-color': 'rgba(255,255,0,1)', // yellow 100%
      color: 'rgba(0,0,0,1)', // black 100%
    },
    highlightStylesDarkModeObject: {
      'background-color': 'rgba(255,0,255,0.8)', // purple 80%
      color: 'rgba(255,255,255,1)', // white 100%
    },
    enableScrollMarkers: true,
    scrollMarkersDebounce: 0,
  }

  // Cap total highlights per run to bound memory/layout cost on huge match counts
  const MAX_HIGHLIGHTS = 5000

  let options = defaultOptions
  let isNewSelection = false
  let lastSelectionString = ''
  let latestRunNumber = 0
  const highlights = new Highlight()
  CSS.highlights.set('highlight', highlights)

  console.log('Initializing Selection Highlighter script')

  // initOptions()
  addStyleElement()
  const scrollMarkersCanvasContext = addScrollMarkersCanvas()

  // Coalesce the flood of selectionchange events into at most one run per frame.
  // rAF (not a timeout) keeps highlighting near-instant while still collapsing the
  // multiple events that fire within a single frame during a drag.
  let selectionFrame = null

  document.addEventListener('selectstart', onSelectStart)
  document.addEventListener('selectionchange', onSelectionChange)

  function onSelectStart() {
    isNewSelection = true
  }

  function onSelectionChange() {
    if (selectionFrame !== null) return
    selectionFrame = requestAnimationFrame(runHighlight)
  }

  function runHighlight() {
    selectionFrame = null

    const selectionString = window.getSelection().toString()
    if (!isNewSelection && selectionString === lastSelectionString) return

    isNewSelection = false
    lastSelectionString = selectionString
    const runNumber = ++latestRunNumber

    highlight(runNumber)
    drawScrollMarkers(runNumber)
  }

  function highlight(runNumber) {
    highlights.clear()

    const selection = document.getSelection()
    if (!selection || !selection.anchorNode || !selection.focusNode) return

    const selectionString = selection.toString().trim()
    if (selectionString.length < options.minSelectionString) return

    const regex = occurrenceRegex(selectionString)

    const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null)

    let match
    let matchCount = 0
    while (treeWalker.nextNode() && runNumber === latestRunNumber) {
      if (!(treeWalker.currentNode instanceof Text)) continue
      while ((match = regex.exec(treeWalker.currentNode.data))) {
        // Zero-width matches never advance lastIndex; force progress to avoid a hang
        if (match[0].length === 0) {
          regex.lastIndex++
          continue
        }
        highlightOccurrences(treeWalker.currentNode, match)
        if (++matchCount >= MAX_HIGHLIGHTS) return
      }
    }
  }

  function highlightOccurrences(textNode, match) {
    const matchIndex = match.index
    const range = new Range()
    range.setStart(textNode, matchIndex)
    range.setEnd(textNode, matchIndex + match[0].length)
    highlights.add(range)
  }

  function drawScrollMarkers(runNumber) {
    // One rAF for the whole run: batching all getBoundingClientRect reads into a
    // single frame avoids the layout-thrash storm of one rAF per match.
    requestAnimationFrame(() => {
      if (runNumber !== latestRunNumber) return

      const dpr = devicePixelRatio || 1
      const { width, height } = scrollMarkersCanvasContext.canvas
      scrollMarkersCanvasContext.clearRect(0, 0, width, height)
      scrollMarkersCanvasContext.lineWidth = 1 * dpr
      scrollMarkersCanvasContext.strokeStyle = 'grey'
      scrollMarkersCanvasContext.fillStyle = 'yellow'

      const scrollHeight = document.documentElement.scrollHeight
      const scrollTop = document.documentElement.scrollTop

      for (const range of highlights.values()) {
        const clientRect = range.getBoundingClientRect()
        if (!clientRect.width || !clientRect.height) continue

        const top =
          (window.innerHeight *
            (scrollTop + clientRect.top + 0.5 * (clientRect.top - clientRect.bottom))) /
          scrollHeight

        scrollMarkersCanvasContext.beginPath()
        scrollMarkersCanvasContext.strokeRect(0.5 * dpr, (top + 0.5) * dpr, 15 * dpr, 3 * dpr)
        scrollMarkersCanvasContext.fillRect(1 * dpr, (top + 1) * dpr, 14 * dpr, 2 * dpr)
      }
    })
  }

  function addStyleElement() {
    const styleElement = document.createElement('style')
    styleElement.textContent = `
            ::highlight(highlight) {
                background-color: ${options.highlightStylesObject['background-color']};
                color: ${options.highlightStylesObject.color};
            }
            @media (prefers-color-scheme: dark) {
                ::highlight(highlight) {
                    background-color: ${options.highlightStylesDarkModeObject['background-color']};
                    color: ${options.highlightStylesDarkModeObject.color};
                }
            }
            .scroll-markers-canvas {
                pointer-events: none;
                position: fixed;
                z-index: 2147483647;
                top: 0;
                right: 0;
                width: 16px;
                height: 100vh;
            }
        `
    document.head.appendChild(styleElement)
  }

  function addScrollMarkersCanvas() {
    const scrollMarkersCanvas = document.createElement('canvas')
    scrollMarkersCanvas.className = 'scroll-markers-canvas'
    scrollMarkersCanvas.width = 16 * (devicePixelRatio || 1)
    scrollMarkersCanvas.height = window.innerHeight * (devicePixelRatio || 1)
    document.body.appendChild(scrollMarkersCanvas)
    return scrollMarkersCanvas.getContext('2d')
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  function occurrenceRegex(selectionString) {
    const escaped = escapeRegExp(selectionString)
    return new RegExp(
      options.matchWholeWord ? `\\b${escaped}\\b` : escaped,
      options.matchCaseSensitive ? 'g' : 'ig',
    )
  }
})()
