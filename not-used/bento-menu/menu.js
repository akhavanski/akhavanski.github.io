// The menu in the header (see _includes/menu.html). A click on the bento box
// (or the word "Menu") opens or closes the menu; the chopsticks carry away
// the sushi they hold, another pair pushes the rest up and puts a new one in
// on the other side. Without hover (a tap) the chopsticks first come and pick it up.
// A click elsewhere or Escape closes the menu.
(function () {
  var toggle = document.querySelector(".menu-toggle");
  var list = document.getElementById("menu-list");
  var row = toggle && toggle.querySelector(".b-row");
  var fresh = toggle && toggle.querySelector(".b-new");
  if (!toggle || !list || !row || !fresh) return;

  // How long the left chopsticks take to push the row and put a new sushi in
  // ($bento-turn in assets/css/main.scss).
  var turn = 1400;
  var busy = false;

  function show(open) {
    toggle.setAttribute("aria-expanded", String(open));
    list.hidden = !open;
  }

  // The last sushi goes with the chopsticks; the others are pushed a slot up,
  // and the left chopsticks bring the next kind (.b-new) to the first slot.
  // There it becomes one of the row.
  function take() {
    var kinds = row.dataset.kinds.split(" ");
    var next = Number(row.dataset.next);
    var kind = "#" + kinds[next % kinds.length];
    row.dataset.next = next + 1;
    fresh.setAttribute("href", kind);

    toggle.classList.add("is-taking");
    for (var i = 1, el = row.firstElementChild; el !== row.lastElementChild; i++, el = el.nextElementSibling) {
      el.style.setProperty("--slot", i);
    }

    setTimeout(function () {
      var item = row.firstElementChild.cloneNode(true);
      item.querySelector(".b-food").setAttribute("href", kind);
      item.style.setProperty("--slot", 0);
      row.lastElementChild.remove();
      row.insertBefore(item, row.firstElementChild);
      toggle.classList.remove("is-taking", "is-holding");
      busy = false;
    }, turn);
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
