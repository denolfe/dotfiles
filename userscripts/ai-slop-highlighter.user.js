// ==UserScript==
// @name            AI Slop Highlighter
// @namespace       denolfe
// @version         0.1
// @description     Highlight AI-generated text patterns with severity levels
// @icon            https://www.google.com/s2/favicons?sz=64&domain=github.com
// @homepage        https://github.com/denolfe/dotfiles
// @match           *://*/*
// @author          Elliot DeNolf
// @run-at          document-idle
// @grant           GM_registerMenuCommand
// ==/UserScript==

// Pattern sources:
// - https://github.com/awnist/slop-cop
// - https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing
// - https://git.eeqj.de/sneak/prompts/src/branch/main/prompts/LLM_PROSE_TELLS.md
// - https://tropes.fyi/tropes-md
// - https://ai-text-humanizer.com/ai-words/
// - https://www.twixify.com/post/most-overused-words-by-chatgpt

;(() => {
  'use strict'

  const PATTERNS = {
    high: {
      intensifiers: [
        'delve', 'tapestry', 'multifaceted', 'nuanced', 'paradigm', 'holistic',
        'interplay', 'intricate', 'intricacies', 'meticulous', 'meticulously',
        'vibrant', 'synergy', 'transformative', 'cutting-edge', 'enduring',
        'realm', 'landscape', 'straightforward', 'ecosystem', 'framework',
        'nestled', 'boasts', 'ever-evolving', 'bustling', 'metropolis',
        'labyrinth', 'gossamer', 'enigma', 'indelible', 'unveil', 'unleash',
        'revolutionize', 'groundbreaking', 'renowned', 'showcasing',
        'exemplifies', 'deeply rooted', 'focal point', 'diverse array',
      ],
      metaphors: [
        'double-edged sword', 'north star', 'game changer', 'deep dive',
        'paradigm shift', 'tip of the iceberg', 'perfect storm',
        'elephant in the room', 'silver bullet', 'low hanging fruit',
        'move the needle', 'think outside the box', 'hit the ground running',
        'building blocks', 'at the end of the day', 'circle back', 'level up',
        'on the same page', 'touch base', 'bandwidth', 'bleeding edge',
        'reinvent the wheel', 'boiling the ocean', 'best of breed',
        'drinking the kool aid', 'the devil is in the details',
        'setting the stage', 'in the heart of',
      ],
      falseConclusions: [
        'in conclusion', 'to conclude', 'in summary', 'to summarize',
        'to sum up', 'in closing', 'all in all', 'when all is said and done',
        'taking everything into account', 'all things considered',
      ],
      clickbait: [
        "here's why", "here's the thing", "here's what you need to know",
        'the reason is simple', 'what does this mean', "so what's the takeaway",
        "here's the kicker", "here's where it gets interesting",
        "here's what most people miss", "here's the deal",
        "the real story is", "the reality is simpler",
        "in today's fast-paced world", "in today's digital age",
        "when it comes to", "in the realm of", "the world of",
        "designed to enhance", "aims to explore", "unlock the secrets",
      ],
      enthusiasm: [
        "let's dive in", 'excited to share', "can't wait to show you",
        "let's get started", 'without further ado', "let's jump right in",
        "ready? let's go", "let's break this down", "let's unpack",
        "let's explore", "let's examine",
      ],
      sycophantic: [
        'great question', "that's a really insightful", "that's an excellent point",
        'your feelings are valid', 'this can be a deeply challenging',
      ],
      dramaticFragments: [
        'full stop', 'let that sink in', 'think about that',
        'which raises an uncomfortable truth',
      ],
    },
    medium: {
      verbIntensifiers: [
        'leverage', 'navigate', 'foster', 'underscore', 'resonate', 'embark',
        'streamline', 'spearhead', 'harness', 'bolster', 'emphasize', 'enhance', 'garner',
        'elevate', 'unlock', 'mastering', 'excels', 'tailored',
      ],
      intensifiers: [
        'crucial', 'vital', 'robust', 'pivotal', 'unprecedented', 'comprehensive',
        'fundamental', 'noteworthy', 'valuable', 'innovative', 'dynamic',
      ],
      elevated: [
        'utilize', 'commence', 'facilitate', 'endeavor', 'demonstrate',
        'ascertain', 'elucidate', 'cognizant', 'craft', 'transform',
        'ameliorate', 'promulgate', 'pertaining to', 'in regards to',
        'at this juncture', 'in terms of', 'one must consider',
        'going forward', 'moving forward', 'in light of',
        'align with', 'testament to', 'whereas', 'as opposed to',
        'think of it as', "it's like a", 'pivotal moment',
        'rich heritage', 'despite its challenges',
      ],
      vagueAttribution: [
        'experts argue', 'experts say', 'experts suggest', 'experts believe',
        'industry analysts', 'observers have noted', 'many experts',
        'studies show', 'research suggests', 'observers have cited',
        'it has been noted', 'some have argued', 'some critics argue',
        'experts note', 'analysts note', 'analysts suggest',
        'according to experts', "it's important to note",
        "it's worth noting", "it's critical to", 'you may want to',
        'it bears mentioning', 'it should be noted', 'broader implications',
        'this is, of course', 'there are, to be fair', 'moving forward, we must',
      ],
      parentheticalQualifiers: [
        'to be sure', 'to be clear', 'to be fair', 'of course',
      ],
    },
    low: {
      connectors: [
        'furthermore', 'moreover', 'additionally', 'nevertheless', 'nonetheless',
        'consequently', 'hence', 'therefore', 'thus', 'however', 'conversely',
        'in addition', 'as a result', 'for instance', 'for example',
        'in contrast', 'on the other hand', 'that said', 'having said that',
        'with that in mind', 'interestingly', 'notably', 'significantly',
        'specifically', 'indeed', 'alternatively', 'given that', 'due to',
        'as previously mentioned', 'firstly', 'admittedly', 'after all',
        'needless to say', 'as we know',
      ],
      fillerAdverbs: [
        'importantly', 'essentially', 'fundamentally', 'ultimately', 'inherently',
        'particularly', 'increasingly', 'undoubtedly', 'obviously', 'clearly',
        'simply', 'basically', 'deeply', 'remarkably', 'genuinely', 'truly',
        'certainly', 'quietly',
      ],
      hedges: [
        'perhaps', 'arguably', 'seemingly', 'apparently', 'ostensibly', 'possibly',
        'potentially', 'conceivably', 'presumably', 'supposedly', 'in some ways',
        'to some extent', 'in a sense', 'it seems', 'it appears',
        'it could be argued', 'sort of',
      ],
    },
  }

  const REGEX_PATTERNS = [
    { pattern: /\balmost\s+(always|never|certainly|exclusively|entirely)\b/gi, category: 'hedge', severity: 'medium' },
    { pattern: /\b(serves|stands|acts|functions)\s+as\b/gi, category: 'elevated', severity: 'medium' },
    { pattern: /\bin\s+an?\s+era\s+(of|where|when)\b/gi, category: 'opener', severity: 'low' },
    { pattern: /\bImagine\s+(a world|if you|what would|a future)\b/gi, category: 'opener', severity: 'low' },
    { pattern: /\b(highlights?|highlighted|highlighting)\s+the\s+\w+/gi, category: 'elevated', severity: 'medium' },
    { pattern: /\brather\s+than\b/gi, category: 'contrast', severity: 'low' },
    { pattern: /\bit\s+(is\s+worth|bears)\s+(noting|mentioning)\b/gi, category: 'filler', severity: 'medium' },
    { pattern: /\bnot\s+just\b.{1,30}\bbut\s+(also|additionally)\b/gi, category: 'structure', severity: 'medium' },
    { pattern: /\bmarks\s+a\s+(shift|turning point|new era|milestone)\b/gi, category: 'elevated', severity: 'high' },
    { pattern: /\bnot\s+\w+[\s\w]*—[\s\w]*but\b/gi, category: 'emDashPivot', severity: 'medium' },
    { pattern: /—/g, category: 'emDash', severity: 'low' },
    { pattern: /\bwhile\s+.{5,40}\s+also\b/gi, category: 'balancedTake', severity: 'medium' },
    { pattern: /\bthe\s+answer\s+is\s+(simple|clear|obvious):/gi, category: 'colonElab', severity: 'high' },
    { pattern: /\bthis\s+(matters|is important)\.\s*(it\s+)?(always\s+)?(has|will)\b/gi, category: 'staccato', severity: 'high' },
    { pattern: /\breflecting\s+broader\s+(trends|patterns|shifts)\b/gi, category: 'shallowAnalysis', severity: 'medium' },
    { pattern: /\bcontributing\s+to\s+the\s+(development|growth|evolution)\s+of\b/gi, category: 'shallowAnalysis', severity: 'medium' },
    { pattern: /\bfundamentally\s+(reshape|transform|change|alter)\b/gi, category: 'stakesInflation', severity: 'high' },
    { pattern: /\bdefine\s+the\s+next\s+(era|generation|decade)\b/gi, category: 'stakesInflation', severity: 'high' },
    { pattern: /\b(is\s+a\s+)?testament\s+to\b/gi, category: 'elevated', severity: 'medium' },
    { pattern: /\bunderscores?\s+(the\s+)?(importance|need|significance)\b/gi, category: 'shallowAnalysis', severity: 'medium' },
  ]

  const highlightHigh = new Highlight()
  const highlightMedium = new Highlight()
  const highlightLow = new Highlight()
  const matches = []
  let statsPanel = null
  let tooltip = null
  let scrollCanvas = null
  let scrollCtx = null
  let isActive = false

  function buildWordRegex(words) {
    const escaped = words.map(w => {
      const esc = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return esc.replace(/\s+/g, '\\s+')
    })
    return new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')
  }

  const COMPILED_PATTERNS = {}
  for (const [severity, categories] of Object.entries(PATTERNS)) {
    COMPILED_PATTERNS[severity] = {}
    for (const [category, words] of Object.entries(categories)) {
      COMPILED_PATTERNS[severity][category] = buildWordRegex(words)
    }
  }

  function getCategoryLabel(category) {
    const labels = {
      intensifiers: 'Intensifier',
      verbIntensifiers: 'Verb Intensifier',
      metaphors: 'Metaphor Crutch',
      falseConclusions: 'False Conclusion',
      clickbait: 'Clickbait Phrase',
      enthusiasm: 'Forced Enthusiasm',
      elevated: 'Elevated Register',
      vagueAttribution: 'Vague Attribution',
      connectors: 'Connector Word',
      fillerAdverbs: 'Filler Adverb',
      hedges: 'Hedge Word',
      hedge: 'Hedge Phrase',
      opener: 'AI Opener',
      contrast: 'Unnecessary Contrast',
      filler: 'Filler Phrase',
      structure: 'AI Structure Pattern',
      emDash: 'Em-Dash',
      emDashPivot: 'Em-Dash Pivot',
      balancedTake: 'Balanced Take',
      colonElab: 'Colon Elaboration',
      staccato: 'Staccato Burst',
      sycophantic: 'Sycophantic',
      dramaticFragments: 'Dramatic Fragment',
      parentheticalQualifiers: 'Parenthetical Qualifier',
      shallowAnalysis: 'Shallow Analysis',
      stakesInflation: 'Stakes Inflation',
    }
    return labels[category] || category
  }

  function analyze() {
    clearHighlights()
    matches.length = 0
    isActive = true

    const stats = { high: 0, medium: 0, low: 0 }
    const treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)

    while (treeWalker.nextNode()) {
      const textNode = treeWalker.currentNode
      if (!textNode.data.trim()) continue
      if (textNode.parentElement?.closest('script, style, noscript')) continue

      for (const [severity, categories] of Object.entries(COMPILED_PATTERNS)) {
        for (const [category, regex] of Object.entries(categories)) {
          for (const match of textNode.data.matchAll(regex)) {
            const range = document.createRange()
            range.setStart(textNode, match.index)
            range.setEnd(textNode, match.index + match[0].length)

            if (severity === 'high') highlightHigh.add(range)
            else if (severity === 'medium') highlightMedium.add(range)
            else highlightLow.add(range)

            matches.push({ range, category, severity, text: match[0] })
            stats[severity]++
          }
        }
      }

      for (const { pattern, category, severity } of REGEX_PATTERNS) {
        for (const match of textNode.data.matchAll(pattern)) {
          const range = document.createRange()
          range.setStart(textNode, match.index)
          range.setEnd(textNode, match.index + match[0].length)

          if (severity === 'high') highlightHigh.add(range)
          else if (severity === 'medium') highlightMedium.add(range)
          else highlightLow.add(range)

          matches.push({ range, category, severity, text: match[0] })
          stats[severity]++
        }
      }
    }

    CSS.highlights.set('slop-high', highlightHigh)
    CSS.highlights.set('slop-medium', highlightMedium)
    CSS.highlights.set('slop-low', highlightLow)

    showStatsPanel(stats)
    drawScrollMarkers()
    console.log('[AI Slop] Analysis complete:', stats)
  }

  function createScrollCanvas() {
    if (scrollCanvas) return scrollCtx

    scrollCanvas = document.createElement('canvas')
    scrollCanvas.id = 'slop-scroll-markers'
    const dpr = devicePixelRatio || 1
    scrollCanvas.width = 16 * dpr
    scrollCanvas.height = window.innerHeight * dpr
    document.body.appendChild(scrollCanvas)
    scrollCtx = scrollCanvas.getContext('2d')
    return scrollCtx
  }

  function drawScrollMarkers() {
    const ctx = createScrollCanvas()
    const dpr = devicePixelRatio || 1
    const { width, height } = scrollCanvas

    ctx.clearRect(0, 0, width, height)

    const docHeight = document.documentElement.scrollHeight
    const viewHeight = window.innerHeight

    const severityColors = {
      high: { fill: '#dc3545', stroke: '#a71d2a' },
      medium: { fill: '#fd7e14', stroke: '#c25e0d' },
      low: { fill: '#ffc107', stroke: '#c79a06' },
    }

    for (const { range, severity } of matches) {
      const rect = range.getBoundingClientRect()
      if (!rect.width || !rect.height) continue

      const absoluteTop = window.scrollY + rect.top + rect.height / 2
      const markerY = (viewHeight * absoluteTop) / docHeight

      const colors = severityColors[severity]
      ctx.beginPath()
      ctx.lineWidth = 1 * dpr
      ctx.strokeStyle = colors.stroke
      ctx.fillStyle = colors.fill
      ctx.fillRect(1 * dpr, (markerY + 0.5) * dpr, 14 * dpr, 2 * dpr)
      ctx.strokeRect(0.5 * dpr, markerY * dpr, 15 * dpr, 3 * dpr)
    }
  }

  function clearHighlights() {
    highlightHigh.clear()
    highlightMedium.clear()
    highlightLow.clear()
    CSS.highlights.delete('slop-high')
    CSS.highlights.delete('slop-medium')
    CSS.highlights.delete('slop-low')
    matches.length = 0
    isActive = false
    hideStatsPanel()
    hideTooltip()
    clearScrollMarkers()
  }

  function clearScrollMarkers() {
    if (scrollCtx && scrollCanvas) {
      scrollCtx.clearRect(0, 0, scrollCanvas.width, scrollCanvas.height)
    }
  }

  function showStatsPanel(stats) {
    if (statsPanel) statsPanel.remove()

    const total = stats.high + stats.medium + stats.low
    statsPanel = document.createElement('div')
    statsPanel.id = 'slop-stats-panel'
    statsPanel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <strong>AI Slop Detector</strong>
        <button id="slop-close" style="background:none;border:none;cursor:pointer;font-size:16px;color:#666;">&times;</button>
      </div>
      <div style="color:#dc3545;">High: ${stats.high}</div>
      <div style="color:#fd7e14;">Medium: ${stats.medium}</div>
      <div style="color:#ffc107;">Low: ${stats.low}</div>
      <div style="margin-top:8px;padding-top:8px;border-top:1px solid #ddd;"><strong>Total: ${total}</strong></div>
    `
    document.body.appendChild(statsPanel)
    document.getElementById('slop-close').addEventListener('click', hideStatsPanel)
  }

  function hideStatsPanel() {
    if (statsPanel) {
      statsPanel.remove()
      statsPanel = null
    }
  }

  function showTooltip(text, x, y) {
    if (!tooltip) {
      tooltip = document.createElement('div')
      tooltip.id = 'slop-tooltip'
      document.body.appendChild(tooltip)
    }
    tooltip.textContent = text
    tooltip.style.left = `${x + 10}px`
    tooltip.style.top = `${y + 10}px`
    tooltip.style.display = 'block'
  }

  function hideTooltip() {
    if (tooltip) tooltip.style.display = 'none'
  }

  function handleMouseMove(e) {
    if (!isActive || matches.length === 0) {
      hideTooltip()
      return
    }

    for (const { range, category, severity } of matches) {
      const rects = range.getClientRects()
      for (const rect of rects) {
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          showTooltip(`${getCategoryLabel(category)} (${severity})`, e.clientX, e.clientY)
          return
        }
      }
    }
    hideTooltip()
  }

  function addStyles() {
    const style = document.createElement('style')
    style.textContent = `
      ::highlight(slop-high) { background: rgba(255, 100, 100, 0.4); }
      ::highlight(slop-medium) { background: rgba(255, 180, 100, 0.4); }
      ::highlight(slop-low) { background: rgba(255, 255, 100, 0.4); }

      @media (prefers-color-scheme: dark) {
        ::highlight(slop-high) { background: rgba(255, 80, 80, 0.5); }
        ::highlight(slop-medium) { background: rgba(255, 160, 80, 0.5); }
        ::highlight(slop-low) { background: rgba(200, 200, 80, 0.5); }
      }

      #slop-stats-panel {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 2147483647;
        background: rgba(255, 255, 255, 0.95);
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 12px 16px;
        font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        min-width: 160px;
      }

      @media (prefers-color-scheme: dark) {
        #slop-stats-panel {
          background: rgba(40, 40, 40, 0.95);
          border-color: #555;
          color: #eee;
        }
        #slop-stats-panel button { color: #aaa; }
      }

      #slop-tooltip {
        position: fixed;
        z-index: 2147483647;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-family: -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
        font-size: 12px;
        pointer-events: none;
        display: none;
      }

      #slop-scroll-markers {
        position: fixed;
        top: 0;
        right: 0;
        width: 16px;
        height: 100vh;
        z-index: 2147483646;
        pointer-events: none;
      }
    `
    document.head.appendChild(style)
  }

  function init() {
    addStyles()
    document.addEventListener('mousemove', handleMouseMove)

    if (typeof GM_registerMenuCommand !== 'undefined') {
      GM_registerMenuCommand('Analyze Page', analyze)
      GM_registerMenuCommand('Clear Highlights', clearHighlights)
    }

    console.log('[AI Slop] Highlighter loaded. Use userscript menu to analyze.')
  }

  init()
})()
