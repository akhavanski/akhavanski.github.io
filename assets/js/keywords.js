// The golden keys next to a post title open a catalogue drawer
// with the post's keywords (its tags). The keys turn when it opens.
// The post layout loads this script only when the post has tags.
(function () {
  var keys = document.querySelector("button.keys");
  var drawer = document.getElementById("keywords");
  if (!keys || !drawer) return;

  function show(open) {
    keys.setAttribute("aria-expanded", String(open));
    drawer.hidden = !open;
  }

  keys.addEventListener("click", function () {
    show(drawer.hidden);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !drawer.hidden) {
      show(false);
      keys.focus();
    }
  });
})();
