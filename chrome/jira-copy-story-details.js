// ==UserScript==
// @name        Jira Copy Story Details
// @version     0.5
// @description Add options to the Export dropdown to copy story details as text or markdown
// @namespace   Violentmonkey Scripts
// @author      Elliot DeNolf
// @include     *://jira.*/browse/*
// @grant       GM_setClipboard
// @grant       GM_notification
// @run-at      document-idle
// ==/UserScript==

(function () {
  'use strict';
  var createItemLink = function (text) {
    var itemLink = document.createElement('aui-item-link');
    var sp = document.createElement('span');
    sp.innerHTML = text;
    itemLink.append(sp);
    return itemLink;
  }

  var setClipAndNotify = function (text) {
    GM_setClipboard(text);
    GM_notification("Text Copied:\n" + text);
  }

  var exportMenu = document.querySelector("#viewissue-export_drop > div > ul");

  if (exportMenu !== undefined) {
    console.log('menu found');
    var currentUrl = window.location.href;
    var title = document.getElementById('summary-val').innerText;
    var urlSplit = currentUrl.split(/\//);
    var storyNumber = urlSplit[urlSplit.length - 1]

    var detailsButton = createItemLink('Text');
    detailsButton.onclick = function () {
      var textToCopy = storyNumber + ": " + title;
      setClipAndNotify(textToCopy);
      return false;
    };

    var mdButton = createItemLink('Markdown');
    mdButton.onclick = function () {
      var urlSplit = currentUrl.split(/\//);
      var md = "[" + storyNumber + ": " + title + "](" + currentUrl + ")";
      setClipAndNotify(md);
      return false;
    };

    exportMenu.append(detailsButton);
    exportMenu.append(mdButton);
  }
})();
