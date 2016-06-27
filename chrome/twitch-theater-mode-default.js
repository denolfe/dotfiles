// ==UserScript==
// @name         Twitch Theater Mode Default
// @namespace    http://twitch.tv/fathom_
// @version      0.2
// @description  Automatically default twitch to theater mode
// @author       fathom
// @match        http://www.twitch.tv/*
// @match        https://www.twitch.tv/*
// @grant        none

// ==/UserScript==
window.addEventListener('load', function() {
  if ($(".live-count").length > 0)
    $("button.player-button--theatre").trigger("click");
}, false);
