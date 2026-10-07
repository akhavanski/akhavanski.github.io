// Russian word breaks for justified text. Chrome on a computer does not
// break Russian words by itself, so the lines get wide gaps. Hyphenopoly
// (assets/js/hyphenopoly, version 6.1.0, MIT) checks the browser first and
// only where it cannot break Russian inserts soft hyphens by Russian rules.
// Loaded by _includes/hyphenate.html: in Russian posts and on the Blog page
// (titles and excerpts of Russian posts).
(function () {
  var dir = document.currentScript.src.replace(/hyphenate\.js.*$/, "hyphenopoly/");
  Hyphenopoly.config({
    require: { ru: "непротиворечивость" },
    paths: { maindir: dir, patterndir: dir + "patterns/" },
    setup: {
      hide: "none",
      selectors: { "article p, article li, .blog-posts li[lang=ru] a": {} }
    }
  });
})();
