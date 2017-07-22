// ==UserScript==
// @name         Toggle for Indeed Sponsored and Visited postings
// @version      0.1
// @description  Add Toggle for sponsored and visited postings from Indeed search results
// @author       Elliot DeNolf
// @match        https://www.indeed.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var listingsRoot = document.getElementById("jobPostingsAnchor");
    
    // Create Toggle Sponsored Button
    var sponsoredButton = document.createElement("button");
    sponsoredButton.onclick = function() {
        var sponsoredLines = document.getElementsByClassName("sponsoredGray");
        Array.prototype.forEach.call(sponsoredLines, function(el) {
            var post = el.parentNode.parentNode.parentNode.parentNode;
            if (post.style.display === 'none') {
                post.style.display = 'block';
            }
            else {
                post.style.display = 'none';
            }
        });
    };
    sponsoredButton.innerText = "Toggle Sponsored";

    // Create Toggle Visited Button
    var visitedButton = document.createElement("button");
    visitedButton.onclick = function() {
      var visitedLines = document.getElementsByClassName("myjobs-serp-link");
      if (visitedLines === undefined) return;
        Array.prototype.forEach.call(visitedLines, function(el) {
          var post = el.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
            if (post.style.display === 'none') {
                post.style.display = 'block';
            }
            else {
                post.style.display = 'none';
            }
        });
    };
    visitedButton.innerText = "Toggle Visited";
    
    // Add buttons to page
    listingsRoot.append(sponsoredButton);
    sponsoredButton.style.marginRight = "8px";
    listingsRoot.append(visitedButton);
})();
