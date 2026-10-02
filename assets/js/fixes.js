// Shows corrections in a post: the fixed text is highlighted,
// a click on it opens a handwritten sticky note that says what was changed.
// In the post write [fixed text](#fix "What was changed and why").
// The post layout loads this script only when the post has such a link.
(function () {
  var links = document.querySelectorAll('a[href="#fix"]');
  if (!links.length) return;

  links.forEach(function (link) {
    var mark = document.createElement("mark");
    mark.className = "fix";
    mark.tabIndex = 0;
    mark.setAttribute("role", "button");
    mark.setAttribute("aria-expanded", "false");
    mark.setAttribute("aria-controls", "fix-note");
    mark.dataset.note = link.title;
    while (link.firstChild) mark.appendChild(link.firstChild);
    link.replaceWith(mark);
  });

  // One note for the whole page: it moves to the clicked text.
  var note = document.createElement("div");
  note.className = "fix-note";
  note.id = "fix-note";
  note.setAttribute("role", "note");
  note.hidden = true;
  document.body.appendChild(note);

  var current = null;

  function open(mark) {
    if (current) current.setAttribute("aria-expanded", "false");
    current = mark;
    mark.setAttribute("aria-expanded", "true");
    fill(mark.dataset.note);
    note.hidden = false;
    place();
  }

  // The note is plain text, only *words in stars* become italic.
  function fill(text) {
    note.textContent = "";
    text.split(/\*([^*]+)\*/).forEach(function (part, i) {
      if (i % 2) {
        var em = document.createElement("em");
        em.textContent = part;
        note.appendChild(em);
      } else if (part) {
        note.appendChild(document.createTextNode(part));
      }
    });
  }

  function close() {
    if (!current) return;
    current.setAttribute("aria-expanded", "false");
    current = null;
    note.hidden = true;
  }

  function toggle(mark) {
    if (mark === current) close();
    else open(mark);
  }

  // Under the last line of the highlighted text, but not off the screen.
  function place() {
    var lines = current.getClientRects();
    var line = lines[lines.length - 1];
    var gap = 16;
    var maxLeft = document.documentElement.clientWidth - note.offsetWidth - gap;
    note.style.left = window.scrollX + Math.max(gap, Math.min(line.left, maxLeft)) + "px";
    note.style.top = window.scrollY + line.bottom + 14 + "px";
  }

  document.addEventListener("click", function (e) {
    var mark = e.target.closest("mark.fix");
    if (mark) toggle(mark);
    else if (!note.contains(e.target)) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && current) {
      var mark = current;
      close();
      mark.focus();
    } else if ((e.key === "Enter" || e.key === " ") && e.target.matches("mark.fix")) {
      e.preventDefault();
      toggle(e.target);
    }
  });

  window.addEventListener("resize", function () {
    if (current) place();
  });
})();
