// ==UserScript==
// @name            Google Search Sidebar
// @namespace       jmln.tw
// @version         0.4.3
// @description     A user script and user style to move Google search tools to sidebar.
// @icon            https://www.google.com/s2/favicons?sz=64&domain=google.com
// @author          Jimmy Lin
// @license         MIT
// @homepageURL     https://github.com/jmlntw/google-search-sidebar
// @supportURL      https://github.com/jmlntw/google-search-sidebar/issues
// @include         /^https:\/\/(?:ipv4|ipv6|www)\.google\.(?:[a-z\.]+)\/search\?(?:.+&)?q=[^&]+(?:&.+)?$/
// @exclude         /^https:\/\/(?:ipv4|ipv6|www)\.google\.(?:[a-z\.]+)\/search\?(?:.+&)?tbm=lcl(?:&.+)?$/
// @run-at          document-end
// @grant           none
// ==/UserScript==

function GM_addStyle(css) {
  const style = document.createElement('style')
  style.type = 'text/css'
  style.textContent = css
  document.head.appendChild(style)
  return style
}

GM_addStyle(`
  /** CSS Variables **/

  :root {
    --user-sidebar-width: 180px;
    --user-sidebar-spacer: 20px;
    --user-sidebar-primary-color: #dd4b39;
    --user-action-menu-spacer: 2px;
    --user-action-menu-background: rgba(0, 0, 0, 0.1);
    --user-action-menu-font-size: 85%;
  }

  /** Navigation Bar **/

  /**
   * 1. Hide "Tools" toggle button on the navigation bar.
   */
  #hdtb-tls {
    display: none !important; /* 1. */
  }

  /** Search Menu **/

  /**
   * 1. Reset all CSS properties of the search menu wrapper.
   * 2. Show the search menu wrapper in the proper position.
   */
  #hdtbMenus {
    all: unset !important; /* 1. */
    display: block !important; /* 2. */
    position: absolute !important; /* 2. */
  }

  /**
   * 1. Reset all CSS properties of the search menu parent.
   * 2. Place search menus vertically.
   * 3. Set the gap space between each search menu.
   */
  #hdtbMenus div[id^="tn_"][id$="_1"] {
    all: unset !important; /* 1. */
    display: flex !important; /* 2. */
    flex-direction: column !important; /* 2. */
    gap: var(--user-sidebar-spacer) !important; /* 3. */
  }

  /**
   * 1. Remove the leading space of the search menu wrapper.
   */
  #hdtbMenus div[id^="tn_"][id$="_1"] > div:nth-child(1) {
    display: none !important; /* 1. */
  }

  /**
   * 1. Hide the menu toggle button.
   * 2. Reset all CSS properties of the dropdown menu.
   * 3. Show the dropdown menu in the proper position.
   * 4. Set the sidebar width with paddings.
   */
  #hdtbMenus div[id^="tn_"][id$="_1"] g-popup > div:nth-child(1) {
    display: none !important; /* 1. */
  }
  #hdtbMenus div[id^="tn_"][id$="_1"] g-popup > div:nth-child(2) {
    all: unset !important; /* 2. */
    display: block !important; /* 3. */
    position: static !important; /* 3. */
    width: calc(var(--user-sidebar-width) - 20px) !important; /* 4. */
    max-width: calc(var(--user-sidebar-width) - 20px) !important; /* 4. */
  }

  /**
   * 1. Remove the check image on the active menu item.
   * 2. Set the styles of the active menu item.
   */
  #hdtbMenus div[id^="tn_"][id$="_1"] g-menu-item.nvELY {
    background-image: unset !important; /* 1. */
    color: var(--user-sidebar-primary-color) !important; /* 2. */
    font-weight: bolder !important; /* 2. */
  }

  /**
   * 1. Set the styles of "Clear" menu item on the sidebar.
   */
  #hdtbMenus div[id^="tn_"][id$="_1"] > a.hdtb-mn-hd {
    padding: 4px 32px !important; /* 1. */
  }
  #hdtbMenus div[id^="tn_"][id$="_1"] > a.hdtb-mn-hd:hover {
    background-color: rgba(0, 0, 0, 0.1) !important; /* 1. */
    text-decoration: unset !important; /* 1. */
  }

  /**
   * 1. Fix the position of the label showing "About ***,*** results...".
   */
  #appbar div.LHJvCe {
    top: unset !important; /* 1. */
    opacity: unset !important; /* 1. */
  }

  /** Main Page Content **/

  /**
   * 1. Set the proper position of the main page content.
   *    (No "!important" here to make Shopping search display correctly.)
   */
  #appbar,
  #center_col,
  #rcnt div.M8OgIe {
    margin-left: var(--user-sidebar-width); /* 1. */
  }

  /**
   * 1. Set the proper position of the right information block.
   *    ("--rhs-margin" is the CSS variable defined by Google.)
   */
  #rhs {
    margin-left: var(--rhs-margin); /* 1. */
  }

  /**
   * Do not move the right block to the bottom of the page if there's not enough
   * space.
   */
  @supports (selector(:has(p))) {
    #rcnt:has(#center_col:first-child + #rhs) {
      flex-wrap: nowrap !important;
    }
  }

  /** Action Menu **/

  /**
   * 1. Hide the dropdown arrow.
   */
  div.g g-popup > div {
    display: none !important; /* 1. */
  }

  /**
   * 1. Reset all CSS properties of the dropdown menu.
   * 2. Show the dropdown menu in the proper position.
   */
  div.g div.pkWBse {
    all: unset !important; /* 1. */
    display: inline-block !important; /* 2. */
  }

  /**
   * 1. Reset all CSS properties of the dropdown menu.
   * 2. Place the menu item horizontally.
   * 3. Set the gap space between each menu item.
   */
  div.g div.pkWBse g-menu {
    all: unset !important; /* 1. */
    display: flex !important; /* 2. */
    flex-direction: row !important; /* 2. */
    gap: var(--user-action-menu-spacer) !important; /* 3. */
  }
  div.g div.pkWBse g-menu-item {
    all: unset !important; /* 1. */
  }
  div.g div.pkWBse g-menu-item > div {
    all: unset !important; /* 1. */
  }

  /**
   * 1. Set the styles of the dropdown menu item.
   */
  div.g div.pkWBse g-menu-item a {
    padding: 0 5px !important; /* 1. */
    background-color: var(--user-action-menu-background) !important; /* 1. */
    font-size: var(--user-action-menu-font-size) !important; /* 1. */
  }

  /**
   * Hide search time on sidebar
   */
  #result-stats > nobr {
    display: none;
  }

  /**
   * Colorize bolded words in search results
   */

  em {
    color: var(--user-sidebar-primary-color) !important;
  }

  /**
   * Change search result margin left
   * From: https://github.com/mnghsn/google-search-sidebar/pull/63
   */
  #center_col {
    margin-left: 0;
  }
`)
