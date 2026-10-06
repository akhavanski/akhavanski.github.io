// The animations of the post on acceptance criteria.
// Turn it on for a post with `custom_js: [three-c]` in the front matter.
// .three-c: Card → Conversation → Confirmation, a still picture;
// hovering the card opens it as a ticket.
// .alt: the switch of examples, text on the left and a picture on the right;
// the prototype in it can be clicked through.
// .anatomy: gets `play` when it comes into view, CSS does the rest.
// The "How I see it" button turns .an-swap to the card where all it links to is among the ACs.
(function () {
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The sticky notes are handwritten, like the notes in posts.
  var font = document.createElement("link");
  font.rel = "stylesheet";
  font.href = "https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap";
  document.head.appendChild(font);

  // Hovering or focusing the card opens it as a ticket.
  document.querySelectorAll(".three-c .tc-card").forEach(function (card) {
    var box = card.closest(".three-c");
    var ticket = card.querySelector(".tc-ticket");

    function open(on) {
      box.classList.toggle("tc-open", on);
      ticket.setAttribute("aria-hidden", on ? "false" : "true");
    }

    card.addEventListener("mouseenter", function () { open(true); });
    card.addEventListener("mouseleave", function () { open(false); });
    card.addEventListener("focus", function () { open(true); });
    card.addEventListener("blur", function () { open(false); });
  });

  document.querySelectorAll(".anatomy").forEach(function (box) {
    if (reduced) { box.classList.add("play", "still"); return; }
    new IntersectionObserver(function (entries, observer) {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      box.classList.add("play");
    }, { threshold: 0.5 }).observe(box);
  });

  // "How I see it": the new card pushes the old one out, then the clouds
  // outside fly to their scraps among the ACs.
  document.querySelectorAll(".an-swap").forEach(function (box) {
    var button = box.nextElementSibling.querySelector(".see-it");
    var came = box.querySelectorAll(".an-came");
    var timer;

    function fly() {
      came.forEach(function (scrap) {
        var cloud = box.querySelector("." + scrap.dataset.from);
        var from = cloud.getBoundingClientRect(), to = scrap.getBoundingClientRect();
        scrap.style.transition = "none";
        scrap.style.transform = "translate(" + (from.left - to.left) + "px, " + (from.top - to.top) + "px) rotate(0deg)";
        scrap.style.opacity = 1;
        cloud.style.visibility = "hidden";
        scrap.getBoundingClientRect();
        scrap.style.transition = reduced ? "none" : "transform 0.7s cubic-bezier(.3, 1.3, .5, 1)";
        scrap.style.transform = "";
      });
      // The clouds are all in the card now: the card takes the middle.
      timer = setTimeout(function () {
        came.forEach(function (scrap) { scrap.style.transition = "none"; });
        box.classList.add("flown");
      }, reduced ? 0 : 750);
    }

    // One way only: the button goes once the card has turned.
    button.addEventListener("click", function () {
      button.parentElement.hidden = true;
      box.classList.add("swapped");
      box.querySelector(".an-new").setAttribute("aria-hidden", false);
      box.querySelector(".an-old").setAttribute("aria-hidden", true);
      if (reduced) box.classList.add("still");
      timer = setTimeout(fly, reduced ? 0 : 750);
    });
  });

  document.querySelectorAll(".alt").forEach(function (box) {
    var tabs = box.querySelectorAll("[role=tab]");

    function show(name) {
      box.dataset.alt = name;
      tabs.forEach(function (tab) { tab.setAttribute("aria-selected", tab.dataset.for === name); });
      box.querySelectorAll(".alt-panel").forEach(function (panel) {
        panel.hidden = panel.dataset.panel !== name;
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () { show(tab.dataset.for); });
    });

    // The prototype: pay, then order again; a ticked "Save card"
    // brings the saved card first next time.
    var proto = box.querySelector(".proto");
    if (!proto) return;
    var saved = false;
    proto.addEventListener("click", function (e) {
      var go = e.target.closest("[data-go]");
      if (!go) return;
      if (go.dataset.go === "paid") {
        if (proto.dataset.screen === "form") saved = proto.querySelector(".pr-check input").checked;
        proto.querySelector(".pr-note").textContent = saved ? "Your card is saved" : "";
        proto.dataset.screen = "paid";
      } else {
        proto.dataset.screen = saved ? "saved" : "form";
      }
    });
  });
})();
