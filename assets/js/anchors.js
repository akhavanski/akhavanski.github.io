// A link to a section of a post: next to each heading (h2, h3, h4) of the post
// a chain 🔗 shows on hover (on keyboard focus too; on touch screens it is always
// there, pale). A click copies the address of the page with the heading's anchor,
// and "Copied" shows next to the chain and fades away in 1.5 seconds; a screen reader
// hears "Link to the section copied". The chain and "Copied" are drawn by the styles
// (::before and ::after), so the heading's text stays the same for toc.js and the rest.
// Styles in assets/css/main.scss. The post layout loads this script after toc.js,
// which gives an id to a heading that has none.
(function () {
  var heads = document.querySelectorAll("article h2, article h3, article h4");
  if (!heads.length) return;

  var status = document.createElement("span");
  status.className = "anchor-status";
  status.setAttribute("aria-live", "polite");
  document.body.appendChild(status);

  // Without the Clipboard API (old browsers, http) or when it refuses,
  // copy from a hidden textarea.
  function fallbackCopy(text, back) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    back.focus(); // select() took the focus away
    return ok;
  }

  [].forEach.call(heads, function (h) {
    if (!h.id) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "anchor-copy";
    btn.setAttribute("aria-label", "Copy link to this section");
    btn.title = "Copy link";
    h.appendChild(btn);

    var timer = null;
    function done() {
      // Off and on again, so a second click starts the fading anew.
      btn.classList.remove("is-copied");
      void btn.offsetWidth;
      btn.classList.add("is-copied");
      status.textContent = "Link to the section copied";
      clearTimeout(timer);
      timer = setTimeout(function () {
        btn.classList.remove("is-copied");
        status.textContent = "";
      }, 1500);
    }

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var url = location.href.split("#")[0] + "#" + encodeURIComponent(h.id);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () {
          if (fallbackCopy(url, btn)) done();
        });
      } else if (fallbackCopy(url, btn)) {
        done();
      }
    });
  });
})();
