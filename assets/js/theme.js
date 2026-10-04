// The dot in the bottom left corner switches the theme (see _includes/header.html).
// On hover it grows into a pill that says what a click does. A click from light
// plays a sunset over the pill, from dark a sunrise; the theme changes when the
// sun is behind the pill. The choice is saved, _includes/head.html applies it.
(function () {
  var root = document.documentElement;
  var dot = document.querySelector(".theme-dot");
  if (!dot) return;
  var label = dot.querySelector(".theme-label");
  var FLIP = 400, END = 800; // ms: when the theme changes, when the sky is gone
  var busy = false;

  function show() {
    var other = root.dataset.theme === "dark" ? "light" : "dark";
    label.textContent = "switch to " + other + " theme";
    dot.setAttribute("aria-label", label.textContent);
  }

  function set(theme) {
    root.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch (e) {}
    show();
  }

  dot.addEventListener("click", function () {
    if (busy) return;
    var next = root.dataset.theme === "dark" ? "light" : "dark";
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return set(next);
    busy = true;
    var play = next === "dark" ? "sunset" : "sunrise";
    root.classList.add("theme-" + play);
    setTimeout(function () { set(next); }, FLIP);
    setTimeout(function () { root.classList.remove("theme-" + play); busy = false; }, END);
  });

  show();
})();
