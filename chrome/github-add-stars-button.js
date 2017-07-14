// ==UserScript==
// @name         Add Stars Button to GitHub
// @version      0.1
// @description  Add stars button to github navigation menu
// @author       Elliot DeNolf
// @match        https://github.com/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';
  var menuRoot = document.getElementsByClassName("header-nav")[0];
  var newMenuRoot = document.getElementsByClassName("site-header-nav")[0];
    
  if (menuRoot !== undefined)
  {
    var li = document.createElement("li");
    var link = document.createElement("a");
    link.setAttribute('href','/stars');
    link.innerText = "Stars";
    link.className += " header-nav-link";
    li.appendChild(link);
    li.className += " header-nav-item";
    menuRoot.append(li);
  }

  if (newMenuRoot !== undefined)
  {
    var newLink = document.createElement("a");
    newLink.setAttribute('href','/stars');
    newLink.innerText = "Stars";
    newLink.className = "js-selected-navigation-item nav-item";
    newMenuRoot.appendChild(newLink);
  }
})();
