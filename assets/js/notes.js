// Shows author's notes in a post, opened by a click on the marked text.
// A comment: [text](#comment "Comment") — the text is highlighted,
// the note is a handwritten sticky note held by a strip of tape.
// A fix: [new text](#fix "Why"){: data-was="old text"} — the text has a wavy
// underline, the note is a card with the old text cut out of the page glued on it.
// A picture under the note: [text](#comment "Note"){: data-img="/assets/img/pic.png"}.
// The post layout loads this script only when the post has such a link.
(function () {
  var links = document.querySelectorAll('a[href="#fix"], a[href="#comment"]');
  if (!links.length) return;

  links.forEach(function (link) {
    var mark = document.createElement("mark");
    mark.className = link.getAttribute("href").slice(1);
    mark.tabIndex = 0;
    mark.setAttribute("role", "button");
    mark.setAttribute("aria-expanded", "false");
    mark.setAttribute("aria-controls", "post-note");
    mark.dataset.note = link.title;
    if (link.dataset.img) mark.dataset.img = link.dataset.img;
    if (link.dataset.was) mark.dataset.was = link.dataset.was;
    while (link.firstChild) mark.appendChild(link.firstChild);
    link.replaceWith(mark);
  });

  // One note for the whole page: it moves to the clicked text
  // and turns into a sticky note or a card.
  var note = document.createElement("div");
  note.className = "note";
  note.id = "post-note";
  note.setAttribute("role", "note");
  note.hidden = true;
  document.body.appendChild(note);

  // Load the handwriting font now, so the first note opens already in it
  // (the browser would wait until a note is shown).
  if (document.fonts) document.fonts.load('500 1em "Caveat"');

  var current = null;

  function open(mark) {
    if (current) current.setAttribute("aria-expanded", "false");
    current = mark;
    mark.setAttribute("aria-expanded", "true");
    note.classList.toggle("note-card", mark.className === "fix");
    fill(mark.dataset.note, mark.dataset.img, mark.dataset.was);
    note.hidden = false;
    place();
  }

  // The note is plain text, only *words in stars* become italic.
  // The old text of a fix, if any, goes on top, a picture goes under the text.
  function fill(text, img, was) {
    note.textContent = "";
    if (was) {
      var cutout = note.appendChild(document.createElement("div"));
      cutout.className = "note-cutout";
      cutout.appendChild(document.createElement("span")).textContent = was;
    }
    text.split(/\*([^*]+)\*/).forEach(function (part, i) {
      if (i % 2) {
        var em = document.createElement("em");
        em.textContent = part;
        note.appendChild(em);
      } else if (part) {
        note.appendChild(document.createTextNode(part));
      }
    });
    if (img) {
      var pic = note.appendChild(document.createElement("img"));
      pic.src = img;
      pic.alt = "";
      // The note was placed before the picture loaded and may get wider.
      pic.onload = function () { if (current) place(); };
    }
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
  // The note is a bit higher than the line's bottom, so its tape
  // goes over the marked text, in the middle of it.
  function place() {
    var lines = current.getClientRects();
    var line = lines[lines.length - 1];
    var gap = 16;
    var maxLeft = document.documentElement.clientWidth - note.offsetWidth - gap;
    var left = Math.max(gap, Math.min(line.left, maxLeft));
    var middle = (line.left + line.right) / 2 - left;
    note.style.left = window.scrollX + left + "px";
    note.style.top = window.scrollY + line.bottom + 4 + "px";
    note.style.setProperty("--tape-x", Math.max(48, Math.min(middle, note.offsetWidth - 48)) + "px");
  }

  document.addEventListener("click", function (e) {
    var mark = e.target.closest("mark.fix, mark.comment");
    if (mark) toggle(mark);
    else if (!note.contains(e.target)) close();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && current) {
      var mark = current;
      close();
      mark.focus();
    } else if ((e.key === "Enter" || e.key === " ") && e.target.matches("mark.fix, mark.comment")) {
      e.preventDefault();
      toggle(e.target);
    }
  });

  window.addEventListener("resize", function () {
    if (current) place();
  });
})();
