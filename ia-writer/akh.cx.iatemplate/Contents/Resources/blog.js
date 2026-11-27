// Does in iA Writer's Preview what the blog's Markdown and scripts do on the site:
// sets the post's language for hyphens (ru when the text is mostly Cyrillic, else en),
// turns a quote with {: .callout} under it into a callout, marks the list under
// ## Sources or ## Источники and greys the [n] that point at it.
// iA Writer replaces the document's HTML as you type and then sends ia-writer-change;
// a pass over a long post takes about a millisecond.
(function () {
  var REF = /\[\d+(?:,\s*\d+)*\]/g;

  function tidy() {
    var doc = document.querySelector("[data-document]");
    if (!doc) return;

    var sample = doc.textContent.slice(0, 3000);
    var cyr = (sample.match(/[а-яё]/gi) || []).length;
    var lat = (sample.match(/[a-z]/gi) || []).length;
    doc.lang = cyr > lat ? "ru" : "en";

    doc.querySelectorAll("blockquote + p").forEach(function (p) {
      if (p.textContent.trim() !== "{: .callout}") return;
      p.previousElementSibling.classList.add("callout");
      p.remove();
    });

    var sources = null;
    doc.querySelectorAll("h2").forEach(function (h) {
      var next = h.nextElementSibling;
      if (/^(sources|источники)$/i.test(h.textContent.trim()) && next && next.tagName === "OL") sources = next;
    });
    if (!sources) return;
    sources.classList.add("sources");

    var walker = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        REF.lastIndex = 0;
        return REF.test(n.data) && !n.parentElement.closest("code, pre, .cite, ol.sources")
          ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var found = [];
    while (walker.nextNode()) found.push(walker.currentNode);
    found.forEach(function (node) {
      var parts = node.data.split(/(\[\d+(?:,\s*\d+)*\])/);
      var frag = document.createDocumentFragment();
      parts.forEach(function (part, i) {
        if (!part) return;
        if (i % 2) {
          var span = frag.appendChild(document.createElement("span"));
          span.className = "cite";
          span.textContent = part;
        } else {
          frag.appendChild(document.createTextNode(part));
        }
      });
      node.parentNode.replaceChild(frag, node);
    });
  }

  // Capture: the event reaches the document whether or not it bubbles.
  document.addEventListener("ia-writer-change", tidy, true);
  tidy();
})();
