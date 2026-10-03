// The dock with the contacts on the About page (see _includes/social.html):
// the apps near the cursor grow, the nearer the bigger, like in a real dock;
// a click makes the app bounce. And a thin red arrow with a curl
// from the word "here" to the dock.
(function () {
  var dock = document.querySelector(".dock");
  if (!dock) return;
  var apps = dock.querySelectorAll(".dock-app");
  var BASE = 44, MAX = 80, RANGE = 110;

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

  var here = document.querySelector(".here");
  
  if (!here) return;
  var NS = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "here-arrow");
  svg.setAttribute("aria-hidden", "true");
  var line = document.createElementNS(NS, "path");
  var head = document.createElementNS(NS, "path");
  svg.append(line, head);
  document.body.append(svg);

  function draw() {
    var h = here.getBoundingClientRect(), m = dock.getBoundingClientRect();
    var x = h.right + 4 + scrollX, y = h.top + h.height * 0.6 + scrollY;
    var top = m.top + scrollY, left = m.left + scrollX;
    // From the side of the dock if there is room on its left, else from above.
    var side = left - x > 70;
    var ex = side ? left - 8 : Math.max(x + 60, left + 40);
    var ey = side ? top + m.height * 0.45 : top - 8;
    var c1 = side ? [ex - 70, ey] : [ex, ey - 50];
    line.setAttribute("d",
      "M" + x + " " + y +
      " c18 -2 34 -14 26 -24 c-8 -10 -22 4 -8 20" +
      " C" + (x + 40) + " " + (y + 30) + " " + c1[0] + " " + c1[1] + " " + ex + " " + ey);
    var a = Math.atan2(ey - c1[1], ex - c1[0]);
    function wing(t) { return (ex - 9 * Math.cos(a + t)) + " " + (ey - 9 * Math.sin(a + t)); }
    head.setAttribute("d", "M" + wing(0.45) + " L" + ex + " " + ey + " L" + wing(-0.45));
  }
  draw();
  addEventListener("resize", draw);
  addEventListener("load", draw);
  if (document.fonts) document.fonts.ready.then(draw);
})();
