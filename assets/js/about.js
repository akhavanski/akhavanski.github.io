// The About button in the header: a click opens a sticky note under it
// with the text about me and the contact icons, like the notes on fixes
// in posts (assets/js/fixes.js). A second click, a click anywhere else
// or Escape closes it. The script shows the button; the styles then hide
// the icons in the title, as they are in the note (assets/css/main.scss).
(function () {
  var toggle = document.querySelector(".about-toggle");
  var note = document.getElementById("about");
  if (!toggle || !note) return;

  // The handwriting font of the note. It is loaded now,
  // so the note opens already in it.
  var font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap";
  font.onload = function () {
    if (document.fonts) document.fonts.load('500 1em "Caveat"');
  };
  document.head.appendChild(font);

  function show(open) {
    toggle.setAttribute("aria-expanded", String(open));
    note.hidden = !open;
    if (open) place();
  }

  // Under the button, the right edges in line, but not off the screen.
  // The note is a bit higher than the button's bottom, so its tape
  // goes over the button, in the middle of it.
  function place() {
    var button = toggle.getBoundingClientRect();
    var gap = 16;
    var maxLeft = document.documentElement.clientWidth - note.offsetWidth - gap;
    var left = Math.max(gap, Math.min(button.right - note.offsetWidth, maxLeft));
    var middle = (button.left + button.right) / 2 - left;
    note.style.left = window.scrollX + left + "px";
    note.style.top = window.scrollY + button.bottom + 4 + "px";
    note.style.setProperty("--tape-x", Math.max(48, Math.min(middle, note.offsetWidth - 48)) + "px");
  }

  document.addEventListener("click", function (e) {
    if (toggle.contains(e.target)) show(note.hidden);
    else if (!note.hidden && !note.contains(e.target)) show(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !note.hidden) {
      show(false);
      toggle.focus();
    }
  });

  window.addEventListener("resize", function () {
    if (!note.hidden) place();
  });

  toggle.hidden = false;
  toggle.closest("header").classList.add("has-about");
})();
