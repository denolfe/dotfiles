// ==UserScript==
// @name        Jira Copy Story Details
// @version     0.3
// @description Add options to the Export dropdown to copy story details as text or markdown
// @namespace   Violentmonkey Scripts
// @author      Elliot DeNolf
// @match       *://jira.nordstrom.net/browse/*
// @grant       GM_setClipboard
// @grant       GM_notification
// ==/UserScript==

(function () {
  'use strict';

  var createLi = function (text) {
    var li = document.createElement('li');
    li.className = "aui-list-item";
    var a = document.createElement('a');
    a.innerHTML = text;
    li.append(a);
    return li;
  }

  var setClipAndNotify = function (text) {
    GM_setClipboard(text);
    GM_notification("Text Copied:\n" + text);
  }

  var exportDropdown = document.querySelector("#viewissue-export_drop > ul");

  if (exportDropdown !== undefined) {
    var currentUrl = window.location.href;
    var title = document.getElementById('summary-val').innerText;
    var urlSplit = currentUrl.split(/\//);
    var storyNumber = urlSplit[urlSplit.length - 1]


    var detailsButton = createLi('Copy Details');
    detailsButton.onclick = function () {
      var textToCopy = storyNumber + ": " + title;
      setClipAndNotify(textToCopy);
      return false;
    };

    var mdButton = createLi('Copy Markdown');
    mdButton.onclick = function () {
      var urlSplit = currentUrl.split(/\//);
      var md = "[" + storyNumber + ": " + title + "](" + currentUrl + ")";
      setClipAndNotify(md);
      return false;
    };

    exportDropdown.append(detailsButton);
    exportDropdown.append(mdButton);
  }
})();
