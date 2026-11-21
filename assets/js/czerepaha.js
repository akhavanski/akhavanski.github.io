// Scripts of the section "Черепаха и слоны" (akh.cx/czerepaha): the star by the name and the
// topic filter of the feed.
// The star: a click opens the note about the section; a second click, a click elsewhere
// or Escape closes it.
// The topics: the buttons are hidden in the HTML (without this script the feed shows every
// note); the script shows them, filters the feed by a click (the choice goes to ?topic=…)
// and, from 84rem, moves them into the header under the menu (as toc.js does with the contents).
(function () {
  function initStar() {
    var star = document.querySelector(".cz-star");
    var note = document.getElementById("cz-about");
    if (!star || !note) return;
    // The note's tail points at the star, wherever the name has put it.
    function set(open) {
      if (open) note.style.setProperty("--tail", star.offsetLeft + star.offsetWidth / 2 + "px");
      note.hidden = !open;
      star.setAttribute("aria-expanded", open ? "true" : "false");
    }
    star.addEventListener("click", function (e) {
      e.stopPropagation();
      set(note.hidden);
    });
    document.addEventListener("click", function (e) {
      if (!note.hidden && !note.contains(e.target)) set(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !note.hidden) {
        set(false);
        star.focus();
      }
    });
  }
  function initTopics() {
    var box = document.querySelector(".cz-topics");
    if (!box) return;
    var posts = [].slice.call(document.querySelectorAll(".cz-post"));
    var buttons = [].slice.call(box.querySelectorAll("button"));
    var home = box.parentNode, next = box.nextSibling;
    function show(key) {
      posts.forEach(function (p) { p.hidden = !!key && p.dataset.topic !== key; });
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.topic === key ? "true" : "false"); });
    }
    function known(key) {
      return buttons.some(function (b) { return b.dataset.topic === key; });
    }
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      var key = b.dataset.topic;
      show(key);
      history.replaceState(null, "", key ? "?topic=" + key : location.pathname);
    });
    var key = new URLSearchParams(location.search).get("topic") || "";
    show(known(key) ? key : "");
    box.hidden = false;
    var left = matchMedia("(min-width: 84rem)"), header = document.querySelector("header");
    function place() {
      if (left.matches) header.appendChild(box);
      else home.insertBefore(box, next);
    }
    place();
    left.addEventListener("change", place);
  }
  initStar();
  initTopics();
})();
