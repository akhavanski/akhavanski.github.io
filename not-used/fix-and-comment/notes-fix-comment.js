// #fix and #comment marks, taken out of assets/js/notes.js:
// they went inside notes.js before the footnote part and used its makeNote, insertAfter and link.

  // Plain text, only *words in stars* become italic.
  function addText(note, text) {
    text.split(/\*([^*]+)\*/).forEach(function (part, i) {
      if (i % 2) note.appendChild(document.createElement("em")).textContent = part;
      else if (part) note.appendChild(document.createTextNode(part));
    });
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

