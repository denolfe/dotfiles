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
  // if stream is live or it is a VOD
  if ($(".live-count").length > 0 || $(location).attr('href').match(/\/v\//g).length)
    $("button.player-button--theatre").trigger("click");
}, false);
