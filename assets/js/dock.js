// The dock with the contacts on the About page (see _includes/social.html):
// the apps near the cursor grow, the nearer the bigger, like in a real dock;
// a click makes the app bounce.
(function () {
  var dock = document.querySelector(".dock");
  if (!dock) return;
  var apps = dock.querySelectorAll(".dock-app");
  var BASE = 32, MAX = 58, RANGE = 85;

  dock.addEventListener("mousemove", function (e) {
    dock.classList.add("dock-hover");
    apps.forEach(function (app) {
      var r = app.getBoundingClientRect();
      var d = Math.min(1, Math.abs(e.clientX - r.left - r.width / 2) / RANGE);
      app.style.setProperty("--size", BASE + (MAX - BASE) * Math.cos(d * Math.PI / 2) + "px");
    });
  });
  dock.addEventListener("mouseleave", function () {
    dock.classList.remove("dock-hover");
    apps.forEach(function (app) { app.style.removeProperty("--size"); });
  });
  apps.forEach(function (app) {
    app.addEventListener("click", function () {
      app.classList.remove("dock-bounce");
      void app.offsetWidth;
      app.classList.add("dock-bounce");
    });
  });
})();
