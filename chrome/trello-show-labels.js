// ==UserScript==
// @name          Trello: Show label names on front of card
// @namespace     http://userstyles.org
// @description	  Shows label names on front of cards.
// @author        Hamid Palo
// @homepage      https://userstyles.org/styles/107868
// @include       https://trello.com*
// @run-at        document-start
// @version       0.20141203145654
// ==/UserScript==
(function () {
  var css = [
    ".list-card-labels .card-label {",
    "	line-height:20px;",
    "	height:auto;",
    "  	padding:0 4px;",
    "  	width:auto;",
    "  	font-size:11px;",
    "  	font-weight:normal;",
    "  	text-shadow:0px 0px 2px #000;",
    "  	margin:0;",
    "}"
  ].join("\n");
  if (typeof GM_addStyle != "undefined") {
    GM_addStyle(css);
  } else if (typeof PRO_addStyle != "undefined") {
    PRO_addStyle(css);
  } else if (typeof addStyle != "undefined") {
    addStyle(css);
  } else {
    var node = document.createElement("style");
    node.type = "text/css";
    node.appendChild(document.createTextNode(css));
    var heads = document.getElementsByTagName("head");
    if (heads.length > 0) {
      heads[0].appendChild(node);
    } else {
      // no head yet, stick it whereever
      document.documentElement.appendChild(node);
    }
  }
})();
