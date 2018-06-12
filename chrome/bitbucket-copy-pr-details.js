// ==UserScript==
// @name        BitBucket Copy PR
// @version     0.1
// @description Add button to copy PR details
// @namespace   Violentmonkey Scripts
// @author      Elliot DeNolf
// @match       *://git.nordstrom.net/projects/*
// @grant       GM_setClipboard
// @grant       GM_notification
// ==/UserScript==

(function () {
  'use strict';

  var createDiv = function (divText) {
    var div = document.createElement('div');
    div.innerHTML = divText;
    div.className = "status aui-lozenge"
    div.setAttribute("style", "cursor: pointer;margin-left: 10px;");
    return div;
  }

  var setClipAndNotify = function(text) {
    GM_setClipboard(text);
    GM_notification("Text Copied:\n" + text);
  }

  var prMetadata = document.getElementsByClassName("pull-request-metadata")[0];

  if (prMetadata !== undefined) {
    var currentUrl = window.location.href;
    var prText = document.querySelector('#pull-request-header > div > h2').innerText;

    var div = createDiv('Copy Details');
    div.onclick = function() {
      var textToCopy = "["+ prText + "]("+ currentUrl + ")";
      setClipAndNotify(textToCopy);
      return false;
    };
    prMetadata.appendChild(div);
  }
})();
