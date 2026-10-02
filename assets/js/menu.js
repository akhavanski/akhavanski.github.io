// The menu in the header (see _includes/menu.html). A click on the bento box
// (or the word "Menu") opens or closes the menu; the chopsticks carry away
// the sushi they hold, the rest move up and a new one slides in from the other
// side. Without hover (a tap) the chopsticks first come and pick it up.
// A click elsewhere or Escape closes the menu.
(function () {
  var toggle = document.querySelector(".menu-toggle");
  var list = document.getElementById("menu-list");
  var row = toggle && toggle.querySelector(".b-row");
  if (!toggle || !list || !row) return;

  // How long the chopsticks carry a sushi away ($bento-carry in assets/css/main.scss).
  var carry = 550;
  var busy = false;

  function show(open) {
    toggle.setAttribute("aria-expanded", String(open));
    list.hidden = !open;
  }

  // The last sushi goes with the chopsticks; the others move a slot up,
  // and the next kind comes in at the first slot from beyond the box.
  function take() {
    var kinds = row.dataset.kinds.split(" ");
    var next = Number(row.dataset.next);
    var first = row.firstElementChild;
    var item = first.cloneNode(true);
    item.querySelector(".b-food").setAttribute("href", "#" + kinds[next % kinds.length]);
    item.style.setProperty("--slot", -1);
    row.dataset.next = next + 1;
    row.insertBefore(item, first);
    // So the new sushi slides in from beyond the edge of the box.
    getComputedStyle(item).transform;

    toggle.classList.add("is-taking");
    for (var i = 0, el = item; el !== row.lastElementChild; i++, el = el.nextElementSibling) {
      el.style.setProperty("--slot", i);
    }

    setTimeout(function () {
      row.lastElementChild.remove();
      toggle.classList.remove("is-taking", "is-holding");
      busy = false;
    }, carry);
  }

  toggle.addEventListener("click", function () {
    show(list.hidden);
    if (busy) return;
    busy = true;
    if (toggle.matches(":hover, :focus-visible")) {
      take();
    } else {
      toggle.classList.add("is-holding");
      setTimeout(take, 350);
    }
  });

  document.addEventListener("click", function (e) {
    if (!list.hidden && !e.target.closest(".menu")) show(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !list.hidden) {
      show(false);
      toggle.focus();
    }
  });
})();
