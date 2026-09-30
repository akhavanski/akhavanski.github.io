// Renders ```mermaid code blocks as diagrams.
// Turn it on for a post with `custom_js: [mermaid]` in the front matter.
(function () {
  // Without a Rouge lexer the block is a bare <pre><code>; with one it is a div.
  var blocks = document.querySelectorAll("pre > code.language-mermaid, div.language-mermaid");
  if (!blocks.length) return;

  blocks.forEach(function (block) {
    var target = block.tagName === "CODE" ? block.parentElement : block;
    var pre = document.createElement("pre");
    pre.className = "mermaid";
    pre.textContent = block.textContent;
    target.replaceWith(pre);
  });

  import("https://cdn.jsdelivr.net/npm/mermaid@12/dist/mermaid.esm.min.mjs").then(function (m) {
    m.default.initialize({ startOnLoad: false, theme: "neutral", fontFamily: "monospace" });
    m.default.run({ querySelector: "pre.mermaid" });
  });
})();
