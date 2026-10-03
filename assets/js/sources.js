// Links the numbers in square brackets in a post, [1], to its sources: the numbered
// list under the heading "Sources" at the end, each item “Title”, — Author. URL: <link>.
// A number becomes a small superscript, a link to its source; the source links back
// to each place it is cited from (a, b, c…).
// The post layout loads this script only when the post has the heading "Sources".
(function () {
  var head = document.getElementById("sources");
  var list = head && head.nextElementSibling;
  if (!list || list.tagName !== "OL") return;
  var article = head.parentNode;

  var sources = [].map.call(list.children, function (li, i) {
    var link = li.querySelector('a[href^="http"]');
    var text = li.textContent.replace(/\s*URL:[\s\S]*$/, "").trim();
    var m = text.match(/^“([^”]+)”,?\s*—\s*(.+?)\.?$/);
    return {
      n: i + 1, li: li, cites: [],
      title: m ? m[1] : text, author: m ? m[2] : "",
      url: link && link.href
    };
  });

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  // The numbers in the text, with the space before them: [1] and [3, 4].
  var re = /\s*\[(\d+(?:,\s*\d+)*)\]/g;
  var walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
  var found = [];
  while (walker.nextNode()) {
    var node = walker.currentNode;
    if (list.contains(node) || node.parentNode.closest("a, code, pre, .toc")) continue;
    re.lastIndex = 0;
    if (re.test(node.nodeValue)) found.push(node);
  }

  found.forEach(function (node) {
    var text = node.nodeValue, at = 0, m, frag = document.createDocumentFragment();
    re.lastIndex = 0;
    while ((m = re.exec(text))) {
      var nums = m[1].split(/,\s*/).map(Number).filter(function (n) { return sources[n - 1]; });
      if (!nums.length) continue;
      frag.append(text.slice(at, m.index));
      var sup = el("sup", "cite");
      nums.forEach(function (n, i) {
        var s = sources[n - 1];
        var a = el("a", "", String(n));
        a.href = "#source-" + n;
        a.id = "cite-" + n + "-" + (s.cites.length + 1);
        s.cites.push(a);
        if (i) sup.append(",");
        sup.append(a);
      });
      frag.append(sup);
      at = re.lastIndex;
    }
    frag.append(text.slice(at));
    node.replaceWith(frag);
  });

  // The list at the end: the number, Author. Title. site.com ↗,
  // and under it the way back to each citation.
  list.className = "sources";
  sources.forEach(function (s) {
    var li = s.li;
    li.id = "source-" + s.n;
    li.textContent = "";
    var ref = el("span", "source-ref");
    if (s.author) ref.append(el("span", "source-author", s.author), ". ");
    ref.append(el("cite", "", s.title), ".");
    if (s.url) {
      var a = el("a", "source-url", new URL(s.url).hostname.replace(/^www\./, "") + " ↗");
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener";
      ref.append(" ", a);
    }
    li.append(el("span", "source-n", String(s.n)), ref);
    if (s.cites.length) {
      var back = el("span", "source-back", "↑ ");
      s.cites.forEach(function (c, i) {
        var b = el("a", "", s.cites.length > 1 ? String.fromCharCode(97 + i) : "back");
        b.href = "#" + c.id;
        back.append(b, " ");
      });
      li.append(back);
    }
  });
})();
