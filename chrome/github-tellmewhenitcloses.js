// ==UserScript==
// @name         TellMeWhenItCloses Button to issues on GitHub
// @version      0.1
// @description  Add extra button to github for subscribing with TellMeWhenItCloses
// @author       Elliot DeNolf
// @match        https://github.com/*/issues/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  var notificationSidebar = document.getElementsByClassName("sidebar-notifications")[0];

  if (notificationSidebar === undefined) {
    console.error('VIOLENTMONKEY: Unable to locate notification sidebar');
    return;
  }

  var button = document.createElement("button");
  button.style.cssText = "width: 100%; margin-top: 8px";
  button.className += "btn btn-sm";
  button.id = "tmwic";
  button.innerHTML = "Tell Me When It Closes";

  button.onclick = function () {
    window.open("https://tellmewhenitcloses.com?url=" + location.href);
  };
  notificationSidebar.append(button);
})();
