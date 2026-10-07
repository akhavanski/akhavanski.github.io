// Table of contents of a post: the button "Table of contents" (under "← to blog")
// stays at the top of the window while you read; a click on it slides a page with
// the post's sections and subsections out from under the post, below the button.
// The page is set like a LaTeX table of contents: "Contents" on top, the sections
// numbered 1, 2, … and the subsections 4.1, 4.2, … ("Sources" goes without a number).
// The page marks the section you are in. A second click or Escape slides it back.
// It also goes back by itself: on a click outside it, when the mouse has left it
// for three seconds, when the focus has left it, and when the post has scrolled
// half a window with the mouse elsewhere. A jump to a section doesn't count as scrolling.
// Once "← to blog" has scrolled away, the button is alone left of the text and goes quiet.
// When the column left of the text is too narrow for the page, the page lies over the text.
// On a narrow screen the button is at the bottom right of the window and the page
// comes out above it (the styles do that, the script is the same).
// The page's bottom left corner is dog-eared; a click on it unfolds it for good
// and shows a small grey line "I love how LaTeX looks." for a few seconds.
// The post layout loads this script only when the post has two headings or more.
(function () {
  var toggle = document.querySelector(".toc-toggle");
  var nav = document.querySelector(".toc");
  if (!toggle || !nav) return;
  var article = nav.parentNode;

  // While "← to blog" is out of the window, the button gets the class is-alone.
  var back = document.querySelector(".to-blog");
  if (back && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      nav.classList.toggle("is-alone", !entries[0].isIntersecting);
    }).observe(back);
  }

  var heads = [].filter.call(article.querySelectorAll("h2, h3"), function (h) {
    return !h.classList.contains("no_toc");
  });

  // The heading's own number ("1. ") and source references ("[5]") stay out.
  function entry(h, num) {
    var a = document.createElement("a");
    a.href = "#" + h.id;
    a.appendChild(document.createElement("span")).className = "toc-num";
    a.lastChild.textContent = num;
    a.appendChild(document.createElement("span")).textContent = h.textContent
      .replace(/^\d+\.\s+/, "").replace(/\s*\[\d+(,\s*\d+)*\]$/, "");
    var li = document.createElement("li");
    li.appendChild(a);
    return li;
  }

  var sheet = document.createElement("div");
  sheet.className = "toc-sheet";
  sheet.id = "toc";
  var title = sheet.appendChild(document.createElement("p"));
  title.className = "toc-title";
  title.textContent = "Contents";
  var list = sheet.appendChild(document.createElement("ol"));

  // Subsections go inside their section; one before any section counts as a section.
  var section = null, sub = null, n = 0, m = 0;
  heads.forEach(function (h, i) {
    if (!h.id) h.id = "section-" + (i + 1);
    if (h.tagName === "H2" || !section) {
      var plain = /^(Sources|Источники)$/.test(h.textContent.trim());
      if (!plain) { n++; m = 0; }
      section = list.appendChild(entry(h, plain ? "" : String(n)));
      section.className = "toc-section";
      sub = null;
    } else {
      if (!sub) sub = section.appendChild(document.createElement("ol"));
      sub.appendChild(entry(h, n + "." + ++m));
    }
  });
  var corner = sheet.appendChild(document.createElement("button"));
  corner.className = "toc-corner";
  corner.type = "button";
  corner.setAttribute("aria-label", "Dog-ear");
  var love = sheet.appendChild(document.createElement("span"));
  love.className = "toc-love";
  love.setAttribute("role", "status");
  corner.addEventListener("click", function () {
    love.innerHTML = 'I love how <span class="latex">L<span class="latex-a">a</span>T<span class="latex-e">e</span>X</span> looks.';
    love.classList.add("is-shown");
    sheet.classList.add("is-unfolded");
    setTimeout(function () { love.classList.remove("is-shown"); }, 3500);
    setTimeout(function () { corner.remove(); }, 500);
  });
  toggle.parentNode.appendChild(sheet);

  var inside = false, leaving = null, scrollFrom = 0, jumped = false;

  function isOpen() { return nav.classList.contains("is-open"); }

  // How far the page has to lie over the text so that it stays 1rem off
  // the window's left edge (wide screens only).
  var wide = matchMedia("(min-width: 60rem)");
  function fit() {
    var over = 0;
    if (wide.matches) {
      var rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      var left = nav.getBoundingClientRect().right - 1.25 * rem - sheet.offsetWidth;
      over = Math.max(0, rem - left);
    }
    nav.style.setProperty("--toc-over", over + "px");
  }
  addEventListener("resize", fit);

  function show(open) {
    if (open) fit();
    clearTimeout(leaving);
    scrollFrom = scrollY;
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }

  sheet.addEventListener("click", function (e) {
    if (e.target.closest("a")) jumped = true;
  });

  document.addEventListener("click", function (e) {
    if (isOpen() && !nav.contains(e.target)) show(false);
  });

  // The mouse on the button or the page; three seconds away from both close it.
  nav.addEventListener("pointerover", function (e) {
    if (e.pointerType !== "mouse") return;
    inside = true;
    clearTimeout(leaving);
  });
  nav.addEventListener("pointerout", function (e) {
    if (e.pointerType !== "mouse" || nav.contains(e.relatedTarget)) return;
    inside = false;
    if (isOpen()) leaving = setTimeout(function () { show(false); }, 3000);
  });

  nav.addEventListener("focusout", function (e) {
    if (e.relatedTarget && !nav.contains(e.relatedTarget)) show(false);
  });

  toggle.addEventListener("click", function () {
    show(!isOpen());
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && isOpen()) {
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
    if (jumped) { jumped = false; scrollFrom = scrollY; }
    if (isOpen() && !inside && Math.abs(scrollY - scrollFrom) > innerHeight / 2) show(false);
    if (!ticking) { ticking = true; requestAnimationFrame(mark); }
  }, { passive: true });
  mark();
})();
