// The pictures of the post on acceptance criteria, styles in assets/css/main.scss.
// Turn it on for a post with `custom_js: [three-c]` in the front matter.
// .three-c: Card → Conversation → Confirmation, a still picture;
// hovering the card opens it as a ticket.
// .alt: the switch of examples, text on the left and a picture on the right;
// the prototype in it can be clicked through.
(function () {

  // The redline in the examples is handwritten, like the notes in posts.
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

  document.querySelectorAll(".alt").forEach(function (box) {
    var tabs = box.querySelectorAll("[role=tab]");

    function show(name) {
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
