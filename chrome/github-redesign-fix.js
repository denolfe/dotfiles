// ==UserScript==
// @name GitHub Redesign Fix
// @version 0.0.1
// @description Fix horrible GitHub Redesign
// @author denolfe (https://github.com/denolfe)
// @match https://github.com/*
// @grant GM_addStyle
// @run-at document-start
// ==/UserScript==

(function () {
  let css = "";

  css += ":root {";
  css += "  --width: 1600px;";
  css += "}";
  css += ".container-xl {";
  css += "  max-width: var(--width);";
  css += "}";
  css += ".pagehead {";
  css += "  padding-left: calc(50% - (var(--width) / 2));";
  css += "  padding-right: calc(65% - (var(--width) / 2));";
  css += "}";
  css += ".Box-row + .Box-row {";
  css += "  border-top: 1px solid #eaecef !important;";
  css += "}";

  if (typeof GM_addStyle !== "undefined") {
    GM_addStyle(css);
  } else {
    let styleNode = document.createElement("style");
    styleNode.appendChild(document.createTextNode(css));
    (document.querySelector("head") || document.documentElement).appendChild(styleNode);
  }
})();
