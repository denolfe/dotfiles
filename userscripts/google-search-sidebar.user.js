// ==UserScript==
// @name            Google Search Sidebar (Updated)
// @namespace       jmln.tw
// @version         0.5.1
// @description     Move Google search tools (time, verbatim filters) to a persistent left sidebar
// @icon            https://www.google.com/s2/favicons?sz=64&domain=google.com
// @author          Jimmy Lin (original), Updated 2026
// @license         MIT
// @homepageURL     https://github.com/jmlntw/google-search-sidebar
// @supportURL      https://github.com/jmlntw/google-search-sidebar/issues
// @match           *://www.google.com/search*
// @match           *://www.google.co.*/search*
// @match           *://www.google.com.*/search*
// @exclude         *://www.google.*/search*tbm=*
// @exclude         *://www.google.*/search*udm=*
// @run-at          document-start
// @grant           none
// ==/UserScript==

;(() => {
  'use strict'

  const style = document.createElement('style')
  style.textContent = `
    /** CSS Variables **/
    :root {
      --sidebar-width: 140px;
      --sidebar-padding: 16px;
      --sidebar-bg: #202124;
      --sidebar-top: 150px;
      --sidebar-primary: #ff6a34;
    }

    /** Hide the "Tools" toggle button - we're showing tools permanently **/
    #hdtb-tls {
      display: none !important;
    }

    /** Tools container - make it a fixed sidebar **/
    #top_nav #hdtb {
      position: fixed !important;
      left: 0 !important;
      top: var(--sidebar-top) !important;
      width: var(--sidebar-width) !important;
      height: auto !important;
      max-height: calc(100vh - var(--sidebar-top) - 20px) !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      background: transparent !important;
      padding: var(--sidebar-padding) !important;
      z-index: 100 !important;
    }

    /** Filter menus container - vertical layout **/
    #hdtb .pZvJc {
      display: flex !important;
      flex-direction: column !important;
      gap: 16px !important;
    }

    /** Hide the collapsed toggle buttons, show expanded menus **/
    #hdtb .pZvJc .HPvrce {
      display: none !important;
    }

    /** Dropdown wrapper - always show **/
    #hdtb .R0DW9c {
      display: block !important;
      position: static !important;
    }

    /** Dropdown menu container - always visible **/
    #hdtb .vH6rvf.FJCJfd {
      all: unset !important;
      display: block !important;
      position: static !important;
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;
      max-width: none !important;
      width: 100% !important;
    }

    /** Menu section headers **/
    #hdtb .UsmT1 {
      display: block !important;
      margin-top: 20px !important;
      margin-bottom: 4px !important;
    }
    #hdtb .UsmT1:first-child {
      margin-top: 0 !important;
    }

    /** Individual menu toggle (shows current selection) - style as header **/
    #hdtb .UsmT1 > .XhWQv.sjVJQd {
      font-weight: 700 !important;
      color: #9aa0a6 !important;
      font-size: 11px !important;
      text-transform: uppercase !important;
      letter-spacing: 0.5px !important;
      padding: 4px 0 !important;
      pointer-events: none !important;
    }

    /** Hide dropdown arrow on menu toggles **/
    #hdtb .UsmT1 > .XhWQv.sjVJQd::after {
      display: none !important;
    }

    /** Menu items **/
    #hdtb .XhWQv.sjVJQd {
      display: block !important;
      padding: 2px 8px !important;
      margin: 0 !important;
      border-radius: 4px !important;
      color: #e8eaed !important;
      text-decoration: none !important;
      font-size: 13px !important;
      line-height: 1.3 !important;
      cursor: pointer !important;
    }

    #hdtb .XhWQv.sjVJQd:hover {
      background: rgba(255, 255, 255, 0.1) !important;
    }

    /** Active/selected menu item **/
    #hdtb .XhWQv.sjVJQd.Wf7Nsf,
    #hdtb .XhWQv.sjVJQd a[aria-current="page"] {
      color: var(--sidebar-primary) !important;
      font-weight: 700 !important;
      background: transparent !important;
      background-color: transparent !important;
    }

    /** Links inside menu items **/
    #hdtb .XhWQv a,
    #hdtb .XhWQv span[jsaction] {
      color: inherit !important;
      text-decoration: none !important;
    }

    /** "Clear" and "Advanced Search" links **/
    #hdtb .UbBYac,
    #hdtb span[jscontroller="TmFfhf"] {
      color: #8ab4f8 !important;
      display: block !important;
      padding: 6px 8px !important;
      margin-top: 8px !important;
    }

    /** Results count - move into sidebar **/
    #hdtb .qd6zO {
      margin-top: 16px !important;
      padding-top: 12px !important;
      border-top: 1px solid #3c4043 !important;
      font-size: 12px !important;
      color: #9aa0a6 !important;
    }

    /** Divider **/
    #hdtb .btCOFd {
      display: none !important;
    }

    /** Hide search time on sidebar (it's shown elsewhere) **/
    #result-stats > nobr {
      display: none !important;
    }

    /** Highlight search terms in results **/
    em {
      color: var(--sidebar-primary) !important;
    }

    /** At narrow widths, shift content to make room for sidebar **/
    @media (max-width: 1400px) {
      #center_col,
      #appbar,
      .n6owBd {
        margin-left: calc(var(--sidebar-width) + var(--sidebar-padding)) !important;
      }
    }

    /** Custom date range dialog - keep it functional **/
    #hdtb g-dialog .qk7LXc {
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      background: #303134 !important;
      z-index: 9999 !important;
    }

  `
  document.documentElement.appendChild(style)
})()
