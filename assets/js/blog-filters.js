// Filters on the blog page. The icons in the heading line open them:
// the globe opens the languages, the tag opens the tags; a second click closes.
// A click on a language or a tag turns it on or off.
// Several languages and several tags can be on at once. A post is shown
// if it is in one of the chosen languages (any language if none is chosen)
// and has one of the chosen tags (any tags if none is chosen).
// A closed filter still works, its icon shows how many values are chosen.
// The choice is kept in the address, e.g. /blog?lang=en&tag=ai&tag=agency,
// so a filtered list can be shared or opened again.
(function () {
  var toggles = document.querySelector(".filter-toggles");
  var box = document.querySelector(".blog-filters");
  if (!toggles || !box) return;

  var buttons = box.querySelectorAll("button[data-filter]");
  var posts = document.querySelectorAll(".blog-posts li");
  var status = box.querySelector(".filter-status");
  var count = status.querySelector("span");

  function chosen(filter) {
    var values = [];
    buttons.forEach(function (button) {
      if (button.dataset.filter === filter && button.getAttribute("aria-pressed") === "true") {
        values.push(button.dataset.value);
      }
    });
    return values;
  }

  function open(toggle, on) {
    toggle.setAttribute("aria-expanded", String(on));
    document.getElementById(toggle.getAttribute("aria-controls")).hidden = !on;
  }

  function apply() {
    var langs = chosen("lang");
    var tags = chosen("tag");
    var shown = 0;

    posts.forEach(function (post) {
      var postTags = post.dataset.tags.split(" ");
      var fits =
        (!langs.length || langs.indexOf(post.dataset.lang) !== -1) &&
        (!tags.length || tags.some(function (tag) { return postTags.indexOf(tag) !== -1; }));
      post.hidden = !fits;
      if (fits) shown++;
    });

    toggles.querySelectorAll(".filter-count").forEach(function (badge) {
      var n = chosen(badge.dataset.filter).length;
      badge.textContent = n || "";
    });

    var active = langs.length + tags.length > 0;
    status.hidden = !active;
    count.textContent = shown
      ? "Showing " + shown + " of " + posts.length + (posts.length === 1 ? " post." : " posts.")
      : "No posts match.";

    var params = new URLSearchParams();
    langs.forEach(function (lang) { params.append("lang", lang); });
    tags.forEach(function (tag) { params.append("tag", tag); });
    var query = params.toString();
    history.replaceState(null, "", location.pathname + (query ? "?" + query : "") + location.hash);
  }

  // The choice from the address, if the page was opened with one.
  var params = new URLSearchParams(location.search);
  buttons.forEach(function (button) {
    var on = params.getAll(button.dataset.filter).indexOf(button.dataset.value) !== -1;
    button.setAttribute("aria-pressed", String(on));
  });

  // A filter chosen in the address is open, so it is seen what the list is filtered by.
  toggles.querySelectorAll(".filter-toggle").forEach(function (toggle) {
    var filter = toggle.querySelector(".filter-count").dataset.filter;
    open(toggle, chosen(filter).length > 0);
  });

  toggles.addEventListener("click", function (e) {
    var toggle = e.target.closest(".filter-toggle");
    if (toggle) open(toggle, toggle.getAttribute("aria-expanded") !== "true");
  });

  box.addEventListener("click", function (e) {
    var button = e.target.closest("button");
    if (!button) return;
    if (button.classList.contains("filter-reset")) {
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      // The reset button hides now, so the focus goes to the first icon.
      toggles.querySelector(".filter-toggle").focus();
    } else {
      button.setAttribute("aria-pressed", String(button.getAttribute("aria-pressed") !== "true"));
    }
    apply();
  });

  toggles.hidden = false;
  apply();
})();
