// The bento box of the menu in the header (see _includes/menu.html).
// A click on it (or the word "Menu") brings up the phone with the menu
// (assets/js/nokia.js); the chopsticks carry away the sushi they hold,
// the rest move up and a new one slides in from the other side.
// Without hover (a tap) the chopsticks first come and pick it up.
(function () {
  var toggle = document.querySelector(".menu-toggle");
  var row = toggle && toggle.querySelector(".b-row");
  if (!toggle || !row) return;

  // How long the chopsticks carry a sushi away ($bento-carry in assets/css/main.scss).
  var carry = 550;
  var busy = false;

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
    if (busy) return;
    busy = true;
    if (toggle.matches(":hover, :focus-visible")) {
      take();
    } else {
      toggle.classList.add("is-holding");
      setTimeout(take, 350);
    }
  });
})();
