// ==UserScript==
// @name        Jira Copy Details
// @version      0.1
// @description Add buttons to copy link and also markdown text
// @namespace   Violentmonkey Scripts
// @author      Elliot DeNolf
// @match       *://jira.nordstrom.net/browse/*
// @grant       GM_setClipboard
// ==/UserScript==

(function() {
  'use strict';

  var breadcrumbs = document.getElementsByClassName("aui-nav-breadcrumbs")[0];

  if (breadcrumbs !== undefined)
  {
    var currentUrl = window.location.href;
    var title = document.getElementById('summary-val').innerText;
    var urlSplit = currentUrl.split(/\//);
    var storyNumber = urlSplit[urlSplit.length - 1]

    var li = document.createElement("li");
    var button = document.createElement('button');
    button.innerHTML = 'Copy Details';
    button.onclick = function(){
      GM_setClipboard(storyNumber + ": " + title);
      return false;
    };
    button.className += " aui-button";
    button.className += " aui-button-primary";
    button.className += " aui-style";
    li.appendChild(button);

    var li2 = document.createElement("li");
    var mdButton = document.createElement('button');
    mdButton.innerHTML = 'Copy md';
    mdButton.onclick = function(){
      var urlSplit = currentUrl.split(/\//);
      var md = "["+ storyNumber + ": " + title +"]("+ currentUrl +")";
      GM_setClipboard(md);
      return false;
    };
    mdButton.className += " aui-button";
    mdButton.className += " aui-button-primary";
    mdButton.className += " aui-style";
    li2.appendChild(mdButton);

    breadcrumbs.append(li);
    breadcrumbs.append(li2);
  }
})();
