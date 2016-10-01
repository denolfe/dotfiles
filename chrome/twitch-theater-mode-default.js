// ==UserScript==
// @name         Twitch Theater Mode Default
// @namespace    http://twitch.tv/fathom_
// @version      0.2
// @description  Automatically default twitch to theater mode and add viewer count
// @author       fathom
// @match        http://www.twitch.tv/*
// @match        https://www.twitch.tv/*
// @grant        none

// ==/UserScript==
window.addEventListener('load', function() {
  // if stream is live or it is a VOD
  if ($('.cn-metabar__livecount > div').text().trim().split(' ')[0].length > 0 || $(location).attr('href').match(/\/v\//g).length) {
    $("button.player-button--theatre").trigger("click");
    getViewers();
  }
}, false);

function getViewers() {
  var viewers = $('.cn-metabar__livecount > div').text().trim().split(' ')[0];
  if ($('.new-viewers').length === 0)
    $('.chat-buttons-container').append("<p class='new-viewers'></p>");
  $('p.new-viewers').text(viewers + ' viewers');
}
setInterval(getViewers, 30 * 1000);
