// The animations of the post on acceptance criteria.
// Turn it on for a post with `custom_js: [three-c]` in the front matter.
// .three-c: Card → Conversation → Confirmation → Backlog. The script plays
// the steps by setting `data-step` on the block; the first round the talk
// sends the card back and it changes, the second round it is confirmed.
// Hovering the card opens it as a ticket and stops the play.
// .anatomy: gets `play` when it comes into view, CSS does the rest.
// The "How I see it" button shows .an-mine, the same card with the design among the ACs.
(function () {
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The sticky notes are handwritten, like the notes in posts.
  var font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap";
  document.head.appendChild(font);

  // Each step: its name and how long it lasts, in ms.
  var steps = [
    ["card", 900], ["to-talk", 700], ["talk", 1500],
    ["back", 1100], ["changed", 1100],
    ["to-talk", 700], ["talk", 1300],
    ["to-ok", 700], ["ok", 1000], ["to-backlog", 900], ["done", 1600]
  ];

  document.querySelectorAll(".three-c").forEach(function (box) {
    var card = box.querySelector(".tc-card");
    var i = 0, timer = null, paused = false;

    function show(n) {
      box.dataset.step = steps[n][0];
      // The card stays changed from the step it changed (4) till the round ends.
      box.classList.toggle("tc-is-changed", n >= 4);
    }

    function next() {
      if (paused) return;
      show(i);
      timer = setTimeout(function () {
        i = (i + 1) % steps.length;
        next();
      }, steps[i][1]);
    }

    function open(on) {
      box.classList.toggle("tc-open", on);
      card.querySelector(".tc-ticket").setAttribute("aria-hidden", on ? "false" : "true");
      if (reduced) return;
      paused = on;
      clearTimeout(timer);
      if (!on) next();
    }

    card.addEventListener("mouseenter", function () { open(true); });
    card.addEventListener("mouseleave", function () { open(false); });
    card.addEventListener("focus", function () { open(true); });
    card.addEventListener("blur", function () { open(false); });

    if (reduced) { box.dataset.step = "done"; return; }

    // Start when the block is seen, so the reader catches the first round.
    new IntersectionObserver(function (entries, observer) {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      next();
    }, { threshold: 0.4 }).observe(box);
  });

  document.querySelectorAll(".anatomy:not(.an-mine)").forEach(function (box) {
    if (reduced) { box.classList.add("play", "still"); return; }
    new IntersectionObserver(function (entries, observer) {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      box.classList.add("play");
    }, { threshold: 0.5 }).observe(box);
  });

  document.querySelectorAll(".see-it").forEach(function (button) {
    var box = document.getElementById(button.getAttribute("aria-controls"));
    button.addEventListener("click", function () {
      var open = box.hidden;
      box.hidden = !open;
      button.setAttribute("aria-expanded", open);
      box.classList.toggle("play", open);
      if (reduced) box.classList.add("still");
    });
  });
})();
