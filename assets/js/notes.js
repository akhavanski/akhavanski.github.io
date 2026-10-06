// Author's notes in a post, set in the margin like Tufte's side notes.
// A footnote: text[^name] and [^name]: Note. — a small grey number in the text,
// the same number before the note.
// A comment: [text](#comment "Comment") — the text is highlighted,
// the note has a yellow line on the left.
// A fix: [new text](#fix "Why"){: data-was="old text"} — the text has a wavy
// underline, the note has a red line and the old text crossed out on top.
// A picture under the note: [text](#comment "Note"){: data-img="/assets/img/pic.png"}.
// On a wide screen the note stands in the right column, level with its line;
// on a narrow one it is hidden and a tap on the marked text opens it under the line.
// The post layout loads this script only when the post has such a link or a footnote.
(function () {
  var wide = window.matchMedia("(min-width: 72rem)");
  var pairs = [];

  // The note goes after the punctuation right behind the marked text,
  // so on a phone a full stop is not left alone under the opened note.
  function insertAfter(ref, note) {
    var next = ref.nextSibling;
    if (next && next.nodeType === 3) {
      var punct = next.data.match(/^[.,;:!?…)\]»”’]+/);
      if (punct) ref = next.splitText(punct[0].length).previousSibling;
    }
    ref.after(note);
  }

  function makeNote(kind, id) {
    var note = document.createElement("span");
    note.className = "sidenote sidenote-" + kind;
    note.id = id;
    note.setAttribute("role", "note");
    return note;
  }

  // Plain text, only *words in stars* become italic.
  function addText(note, text) {
    text.split(/\*([^*]+)\*/).forEach(function (part, i) {
      if (i % 2) note.appendChild(document.createElement("em")).textContent = part;
      else if (part) note.appendChild(document.createTextNode(part));
    });
  }

  function link(trigger, note) {
    trigger.tabIndex = 0;
    trigger.setAttribute("role", "button");
    trigger.setAttribute("aria-controls", note.id);
    pairs.push({ trigger: trigger, note: note });
  }

  // #fix and #comment links become marks.
  document.querySelectorAll('a[href="#fix"], a[href="#comment"]').forEach(function (a, i) {
    var kind = a.getAttribute("href").slice(1);
    var mark = document.createElement("mark");
    mark.className = kind;
    while (a.firstChild) mark.appendChild(a.firstChild);
    a.replaceWith(mark);

    var note = makeNote(kind, "note-" + (i + 1));
    if (a.dataset.was) {
      note.appendChild(document.createElement("del")).textContent = a.dataset.was;
    }
    addText(note.appendChild(document.createElement("span")), a.title);
    if (a.dataset.img) {
      var pic = note.appendChild(document.createElement("img"));
      pic.src = a.dataset.img;
      pic.alt = "";
    }
    insertAfter(mark, note);
    link(mark, note);
  });

  // Footnotes: the note takes the text from the list at the end, which then goes.
  document.querySelectorAll("a.footnote").forEach(function (a) {
    var item = document.getElementById(decodeURIComponent(a.hash.slice(1)));
    if (!item) return;
    var sup = a.closest("sup") || a;
    var n = a.textContent;
    var ref = document.createElement("span");
    ref.className = "fn-ref";
    ref.textContent = n;
    ref.setAttribute("aria-label", "Note " + n);
    sup.replaceWith(ref);

    var note = makeNote("footnote", "fn-note-" + n);
    note.appendChild(document.createElement("span")).className = "fn-n";
    note.firstChild.textContent = n;
    item.querySelectorAll(".reversefootnote").forEach(function (back) { back.remove(); });
    Array.prototype.forEach.call(item.children, function (block, j) {
      if (j) note.appendChild(document.createTextNode(" "));
      while (block.firstChild) note.appendChild(block.firstChild);
    });
    // The non-breaking space kramdown leaves before the way back.
    if (note.lastChild && note.lastChild.nodeType === 3) {
      note.lastChild.data = note.lastChild.data.replace(/[\s ]+$/, "");
    }
    insertAfter(ref, note);
    link(ref, note);
  });

  var list = document.querySelector(".footnotes");
  if (list) list.remove();

  if (!pairs.length) return;

  function setOpen(pair, open) {
    pair.open = open;
    pair.note.classList.toggle("open", open);
    pair.trigger.classList.toggle("open", open);
    pair.trigger.setAttribute("aria-expanded", String(open || wide.matches));
  }

  function toggle(pair) {
    if (!wide.matches) setOpen(pair, !pair.open);
  }

  function light(pair, on) {
    pair.trigger.classList.toggle("lit", on);
    pair.note.classList.toggle("lit", on);
  }

  pairs.forEach(function (pair) {
    setOpen(pair, false);
    pair.trigger.addEventListener("click", function () { toggle(pair); });
    pair.trigger.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle(pair);
      }
    });
    [pair.trigger, pair.note].forEach(function (el) {
      el.addEventListener("mouseenter", function () { light(pair, true); });
      el.addEventListener("mouseleave", function () { light(pair, false); });
    });
  });

  wide.addEventListener("change", function () {
    pairs.forEach(function (pair) { setOpen(pair, pair.open); });
  });
})();
