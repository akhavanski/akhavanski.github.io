// The turtle in the bottom right corner of the window (see _includes/turtle.html):
// a click on it opens or closes its speech bubble,
// a click elsewhere or Escape closes it.
(function () {
  var button = document.querySelector(".turtle-btn");
  var bubble = document.getElementById("turtle-bubble");
  if (!button || !bubble) return;

  function set(open) {
    button.setAttribute("aria-expanded", open);
    bubble.hidden = !open;
  }

  button.addEventListener("click", function () {
    set(bubble.hidden);
  });

  document.addEventListener("click", function (e) {
    if (!bubble.hidden && !e.target.closest(".turtle")) set(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !bubble.hidden) {
      set(false);
      button.focus();
    }
  });
})();
