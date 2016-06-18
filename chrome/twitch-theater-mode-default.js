// ==UserScript==
// @name         Twitch Theater Mode Default
// @namespace    http://twitch.tv/fathom_
// @version      0.1
// @description  Automatically default twitch to theather mode
// @author       fathom
// @match        http://www.twitch.tv/*
// @match        https://www.twitch.tv/*
// @grant        none

// ==/UserScript==
window.addEventListener('load', function() {
  $("button.player-button--theatre").trigger("click");
}, false);
