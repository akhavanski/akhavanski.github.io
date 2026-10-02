// Filters on the blog page. A click on the name of a filter (Language, Keywords)
// opens a menu with its options; a second click, a click anywhere else
// or Escape closes it. A click on an option turns it on or off,
// a click on a keyword under a post turns that keyword on.
// Several languages and several keywords can be on at once. A post is shown
// if it is in one of the chosen languages (any language if none is chosen)
// and has one of the chosen keywords, that is tags (any if none is chosen).
// The choice is kept in the address, e.g. /blog?lang=en&tag=ai&tag=agency,
// so a filtered list can be shared or opened again.
(function () {
  var box = document.querySelector(".blog-filters");
  if (!box) return;

  var names = box.querySelectorAll(".filter-name");
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

  function show(name, open) {
    name.setAttribute("aria-expanded", String(open));
    document.getElementById(name.getAttribute("aria-controls")).classList.toggle("is-open", open);
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

    box.querySelectorAll(".filter-count").forEach(function (badge) {
      var n = chosen(badge.dataset.filter).length;
      badge.textContent = n ? "(" + n + ")" : "";
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

  box.addEventListener("click", function (e) {
    var button = e.target.closest("button");
    if (!button) return;
    if (button.classList.contains("filter-name")) {
      // One menu at a time.
      var open = button.getAttribute("aria-expanded") !== "true";
      names.forEach(function (name) { show(name, false); });
      show(button, open);
      return;
    }
    if (button.classList.contains("filter-reset")) {
      buttons.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      // The reset button hides now, so the focus goes to the first filter's name.
      names[0].focus();
    } else {
      button.setAttribute("aria-pressed", String(button.getAttribute("aria-pressed") !== "true"));
    }
    apply();
  });

  // A keyword under a post links to the list filtered by it;
  // with the script the filter turns on without reloading the page.
  document.querySelector(".blog-posts").addEventListener("click", function (e) {
    var link = e.target.closest("a[data-tag]");
    if (!link) return;
    e.preventDefault();
    buttons.forEach(function (button) {
      if (button.dataset.filter === "tag" && button.dataset.value === link.dataset.tag) {
        button.setAttribute("aria-pressed", "true");
      }
    });
    apply();
    // The list got shorter, so the filters may be above the screen now.
    if (box.getBoundingClientRect().top < 0) box.scrollIntoView();
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".filter")) names.forEach(function (name) { show(name, false); });
  });

  // Escape closes the open menu, the focus goes back to its name.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    names.forEach(function (name) {
      if (name.getAttribute("aria-expanded") !== "true") return;
      show(name, false);
      name.focus();
    });
  });

  box.hidden = false;
  apply();
})();
