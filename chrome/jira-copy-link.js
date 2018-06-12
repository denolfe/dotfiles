// ==UserScript==
// @name        Jira Copy Details
// @version      0.2
// @description Add buttons to copy story details as text or markdown
// @namespace   Violentmonkey Scripts
// @author      Elliot DeNolf
// @match       *://jira.nordstrom.net/browse/*
// @grant       GM_setClipboard
// @grant       GM_notification
// ==/UserScript==

(function () {
  'use strict';

  var createButton = function (buttonText) {
    var button = document.createElement('button');
    button.innerHTML = buttonText;
    button.className += " aui-button";
    button.className += " aui-button-primary";
    button.className += " aui-style";
    button.setAttribute("style", "margin:5px 10px 0 -5px;");
    return button;
  }

  var setClipAndNotify = function (text) {
    GM_setClipboard(text);
    GM_notification("Text Copied:\n" + text);
  }

  var breadcrumbs = document.getElementsByClassName("aui-nav")[0];

  if (breadcrumbs !== undefined) {
    var currentUrl = window.location.href;
    var title = document.getElementById('summary-val').innerText;
    var urlSplit = currentUrl.split(/\//);
    var storyNumber = urlSplit[urlSplit.length - 1]

    var li = document.createElement('li');
    var button = createButton('Copy');
    button.onclick = function () {
      var textToCopy = storyNumber + ": " + title;
      setClipAndNotify(textToCopy);
      return false;
    };
    li.appendChild(button);

    var li2 = document.createElement("li");
    var mdButton = createButton('Copy md');
    mdButton.onclick = function () {
      var urlSplit = currentUrl.split(/\//);
      var md = "[" + storyNumber + ": " + title + "](" + currentUrl + ")";
      setClipAndNotify(md);
      return false;
    };
    li2.appendChild(mdButton);

    breadcrumbs.append(li);
    breadcrumbs.append(li2);
  }
})();
