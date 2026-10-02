// Keywords of a post: a click on the catalogue cabinet (or the word
// "Keywords" next to it) turns the cabinet, pulls out a drawer
// and shows the post's tags under it. A second click or Escape closes it.
// The post layout loads this script only when the post has tags.
(function () {
  var toggle = document.querySelector(".keywords-toggle");
  var list = document.getElementById("keywords");
  if (!toggle || !list) return;

  function show(open) {
    toggle.setAttribute("aria-expanded", String(open));
    list.hidden = !open;
  }

  toggle.addEventListener("click", function () {
    show(list.hidden);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !list.hidden) {
      show(false);
      toggle.focus();
    }
  });
})();
