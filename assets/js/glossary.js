// Explains terms in a post: the term is underlined with red dots,
// a click on it opens a library catalogue card with its dictionary entry.
// In the post write [term](#glossary), the entries are in _data/glossary.yml.
// The post layout loads this script only when the post has such a link.
(function () {
  var links = document.querySelectorAll('a[href="#glossary"]');
  if (!links.length) return;

  var glossary = JSON.parse(document.getElementById("glossary-data").textContent);

  links.forEach(function (link) {
    var word = link.title || link.textContent;
    // A term missing from the glossary stays plain text.
    if (!glossary[word]) {
      link.replaceWith.apply(link, link.childNodes);
      return;
    }
    var term = document.createElement("span");
    term.className = "term";
    term.tabIndex = 0;
    term.setAttribute("role", "button");
    term.setAttribute("aria-expanded", "false");
    term.setAttribute("aria-controls", "term-card");
    term.dataset.term = word;
    while (link.firstChild) term.appendChild(link.firstChild);
    link.replaceWith(term);
  });

  // One card for the whole page: it moves to the clicked term.
  var card = document.createElement("div");
  card.className = "term-card";
  card.id = "term-card";
  card.setAttribute("role", "note");
  card.hidden = true;
  document.body.appendChild(card);

  var current = null;

  function line(tag, cls, text) {
    var el = document.createElement(tag);
    el.className = cls;
    el.textContent = text;
    return el;
  }

  function fill(word) {
    var entry = glossary[word];
    card.textContent = "";

    var head = document.createElement("div");
    head.className = "term-head";
    head.appendChild(line("b", "term-word", word));
    if (entry.pron) head.appendChild(line("span", "term-pron", entry.pron));
    if (entry.pos) head.appendChild(line("i", "term-pos", entry.pos));
    card.appendChild(head);

    var body = document.createElement("div");
    body.className = "term-body";
    if (entry.full) body.appendChild(line("p", "term-full", entry.full));
    body.appendChild(line("p", "term-def", entry.def));
    if (entry.example) body.appendChild(line("p", "term-example", entry.example));
    if (entry.synonyms) body.appendChild(line("p", "term-more", "Synonyms: " + entry.synonyms.join(", ")));
    if (entry.see) body.appendChild(line("p", "term-more", "See also: " + entry.see.join(", ")));
    card.appendChild(body);
  }

  function open(term) {
    if (current) current.setAttribute("aria-expanded", "false");
    current = term;
    term.setAttribute("aria-expanded", "true");
    fill(term.dataset.term);
    card.hidden = false;
    // Restart the animation: the card slides out of the drawer again.
    card.classList.remove("out");
    void card.offsetWidth;
    card.classList.add("out");
    place();
  }

  function close() {
    if (!current) return;
    current.setAttribute("aria-expanded", "false");
    current = null;
    card.hidden = true;
  }

  function toggle(term) {
    if (term === current) close();
    else open(term);
  }

  // Under the last line of the term, but not off the screen.
  function place() {
    var lines = current.getClientRects();
    var last = lines[lines.length - 1];
    var gap = 16;
    var maxLeft = document.documentElement.clientWidth - card.offsetWidth - gap;
    var left = Math.max(gap, Math.min(last.left - 24, maxLeft));
    card.style.left = window.scrollX + left + "px";
    card.style.top = window.scrollY + last.bottom + 8 + "px";
  }

  document.addEventListener("click", function (e) {
    var term = e.target.closest(".term");
    if (term) toggle(term);
    else if (!card.contains(e.target)) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && current) {
      var term = current;
      close();
      term.focus();
    } else if ((e.key === "Enter" || e.key === " ") && e.target.matches(".term")) {
      e.preventDefault();
      toggle(e.target);
    }
  });

  window.addEventListener("resize", function () {
    if (current) place();
  });
})();
