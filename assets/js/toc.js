// Table of contents of a post: the button "Table of contents" (under "← to blog")
// stays at the top of the window while you read; a click on it slides a page with
// the post's sections and subsections out from under the post, below the button.
// The page marks the section you are in. A second click or Escape slides it back.
// The post layout loads this script only when the post has two headings or more.
(function () {
  var toggle = document.querySelector(".toc-toggle");
  var nav = document.querySelector(".toc");
  if (!toggle || !nav) return;
  var article = nav.parentNode;

  var heads = [].filter.call(article.querySelectorAll("h2, h3"), function (h) {
    return !h.classList.contains("no_toc");
  });

  function entry(h) {
    var a = document.createElement("a");
    a.href = "#" + h.id;
    a.appendChild(document.createElement("span")).textContent = h.textContent;
    var li = document.createElement("li");
    li.appendChild(a);
    return li;
  }

  var sheet = document.createElement("div");
  sheet.className = "toc-sheet";
  sheet.id = "toc";
  var list = sheet.appendChild(document.createElement("ol"));

  // Subsections go inside their section; one before any section counts as a section.
  var section = null, sub = null;
  heads.forEach(function (h, i) {
    if (!h.id) h.id = "section-" + (i + 1);
    if (h.tagName === "H2" || !section) {
      section = list.appendChild(entry(h));
      section.className = "toc-section";
      sub = null;
    } else {
      if (!sub) sub = section.appendChild(document.createElement("ol"));
      sub.appendChild(entry(h));
    }
  });
  toggle.parentNode.appendChild(sheet);

  function show(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }

  toggle.addEventListener("click", function () {
    show(!nav.classList.contains("is-open"));
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      show(false);
      toggle.focus();
    }
  });

  // The section being read: the last heading above the upper third of the window.
  var links = nav.querySelectorAll("a");
  var ticking = false;
  function mark() {
    ticking = false;
    var current = -1;
    heads.forEach(function (h, i) {
      if (h.getBoundingClientRect().top < innerHeight / 3) current = i;
    });
    [].forEach.call(links, function (a, i) {
      if (i === current) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }
  addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(mark); }
  }, { passive: true });
  mark();
})();
