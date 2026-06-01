// ==UserScript==
// @name            Graphite - Render Mermaid Diagrams
// @namespace       denolfe
// @version         0.0.1
// @description     Render ```mermaid code blocks as diagrams in Graphite PR descriptions and comments
// @icon            https://www.google.com/s2/favicons?sz=64&domain=graphite.com
// @match           https://app.graphite.com/github/pr/*
// @author          Elliot DeNolf
// @run-at          document-idle
// @noframes
// @grant           none
// @require         https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js
// ==/UserScript==

// Pinned to mermaid@10: its dist is a UMD wrapper that assigns globalThis.mermaid
// correctly inside a userscript-manager closure. v11 is an esbuild IIFE that relies
// on a top-level `var` becoming global, which breaks under @require and throws.

;(() => {
  'use strict'

  if (typeof mermaid === 'undefined' || typeof mermaid.render !== 'function') {
    console.warn('[graphite-mermaid] mermaid failed to load via @require')
    return
  }

  // CSS-module class hashes change between builds, so match by stable prefix.
  const WRAPPER_SELECTOR = '[class*="CodeBlock_codeBlockWrapper"]'
  const LANG_SELECTOR = '[class*="CodeBlock_languageSelector"]'
  const RENDER_CLASS = 'gm-mermaid-render'

  // First non-empty line of a mermaid block starts with one of these declarations.
  const MERMAID_START =
    /^(sequenceDiagram|graph\b|flowchart\b|classDiagram\b|stateDiagram(-v2)?\b|erDiagram\b|gantt\b|pie\b|journey\b|gitGraph\b|mindmap\b|timeline\b|quadrantChart\b|requirementDiagram\b|C4Context\b|sankey(-beta)?\b|xychart(-beta)?\b|block-beta\b|zenuml\b|packet(-beta)?\b|architecture(-beta)?\b|kanban\b|radar\b)/

  const rendered = new WeakMap() // wrapper -> last rendered source
  const inFlight = new WeakSet()
  let counter = 0

  main()

  function main() {
    mermaid.initialize({ startOnLoad: false, theme: detectTheme() })
    injectStyles()
    scan()
    observe()
  }

  function scan() {
    document.querySelectorAll(WRAPPER_SELECTOR).forEach(renderWrapper)
  }

  function observe() {
    let queued = false
    const observer = new MutationObserver(() => {
      if (queued) return
      queued = true
      requestAnimationFrame(() => {
        queued = false
        scan()
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })
  }

  async function renderWrapper(wrapper) {
    const codeEl = wrapper.querySelector('pre code')
    if (!codeEl) return

    const source = codeEl.textContent.trim()
    if (!source || !isMermaidBlock(wrapper, source)) return
    if (inFlight.has(wrapper) || rendered.get(wrapper) === source) return

    inFlight.add(wrapper)
    try {
      const { svg } = await mermaid.render(`gm-mermaid-${++counter}`, source)

      const container = buildContainer(svg)
      const pre = wrapper.querySelector('pre')
      wrapper.querySelectorAll(`:scope > .${RENDER_CLASS}`).forEach(n => n.remove())
      pre.style.display = 'none'
      pre.insertAdjacentElement('afterend', container)
      rendered.set(wrapper, source)
    } catch (err) {
      // Invalid syntax: leave the original code block visible as the fallback.
      console.warn('[graphite-mermaid] render failed, showing source', err)
    } finally {
      inFlight.delete(wrapper)
    }
  }

  function buildContainer(svg) {
    const container = document.createElement('div')
    container.className = RENDER_CLASS
    container.innerHTML = svg

    const toggle = document.createElement('button')
    toggle.type = 'button'
    toggle.className = `${RENDER_CLASS}__toggle`
    toggle.textContent = 'Source'
    toggle.addEventListener('click', () => {
      const wrapper = container.closest(WRAPPER_SELECTOR)
      const pre = wrapper?.querySelector('pre')
      if (!pre) return
      const showingSource = pre.style.display !== 'none'
      pre.style.display = showingSource ? 'none' : ''
      container.querySelector('svg')?.style.setProperty('display', showingSource ? '' : 'none')
      toggle.textContent = showingSource ? 'Source' : 'Diagram'
    })
    container.appendChild(toggle)

    return container
  }

  function isMermaidBlock(wrapper, source) {
    const lang = wrapper.querySelector(LANG_SELECTOR)?.textContent.trim().toLowerCase()
    if (lang === 'mermaid') return true
    const firstLine = source.split('\n').find(line => line.trim().length > 0)
    return firstLine ? MERMAID_START.test(firstLine.trim()) : false
  }

  function detectTheme() {
    const bg = getComputedStyle(document.body).backgroundColor
    const channels = bg.match(/\d+/g)?.map(Number)
    if (!channels || channels.length < 3) return 'default'
    const [r, g, b] = channels
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b
    return luminance < 128 ? 'dark' : 'default'
  }

  function injectStyles() {
    const style = document.createElement('style')
    style.textContent = `
      .${RENDER_CLASS} {
        position: relative;
        display: flex;
        justify-content: center;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
      }
      .${RENDER_CLASS} svg {
        max-width: 100%;
        height: auto;
      }
      .${RENDER_CLASS}__toggle {
        position: absolute;
        top: 6px;
        right: 6px;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 4px;
        border: 1px solid currentColor;
        background: transparent;
        color: inherit;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.15s ease;
      }
      .${RENDER_CLASS}:hover .${RENDER_CLASS}__toggle {
        opacity: 0.6;
      }
      .${RENDER_CLASS}__toggle:hover {
        opacity: 1 !important;
      }
    `
    document.documentElement.appendChild(style)
  }
})()
