// Scripts of the section "Черепаха и слоны" (akh.cx/czerepaha): for now only the star by the
// name. A click opens the note about the section; a second click, a click elsewhere
// or Escape closes it.
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
  initStar();
})();
