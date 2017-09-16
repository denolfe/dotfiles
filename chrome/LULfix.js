// ==UserScript==
// @name         LUL Fix
// @namespace    https://www.twitch.tv/
// @version      0.1
// @description  Because no one wants the 'new' LUL
// @author       fathom
// @match        https://www.twitch.tv/*
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    GM_addStyle ( "img[alt='LUL'] { content: url('https://cdn.betterttv.net/emote/567b00c61ddbe1786688a633/1x'); !important; }");
})();
