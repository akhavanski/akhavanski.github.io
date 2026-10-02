// Filters on the home page. A click on the name of a filter (Keywords, Language)
// opens a menu with its options; a second click, a click anywhere else
// or Escape closes it. On wide screens, where the filters stand in the column
// right of the list, a filter with chosen options stays open: only a click
// on its name closes it. A click on an option turns it on or off.
// Several languages and several keywords can be on at once. A post is shown
// if it is in one of the chosen languages (any language if none is chosen)
// and has one of the chosen keywords, that is tags (any if none is chosen).
// The choice is kept in the address, e.g. /?lang=en&tag=ai&tag=agency,
// so a filtered list can be shared or opened again.
(function () {
  var box = document.querySelector(".blog-filters");
  if (!box) return;

  var names = box.querySelectorAll(".filter-name");
  var buttons = box.querySelectorAll("button[data-filter]");
  var posts = document.querySelectorAll(".blog-posts li");
  var status = box.querySelector(".filter-status");
  var count = status.querySelector("span");
  // The width of $wide-screen in assets/css/main.scss.
  var wide = window.matchMedia("(min-width: 72rem)");

  function chosen(filter) {
    var values = [];
    buttons.forEach(function (button) {
      if (button.dataset.filter === filter && button.getAttribute("aria-pressed") === "true") {
        values.push(button.dataset.value);
      }
    });
    return values;
  }

  function menu(name) {
    return document.getElementById(name.getAttribute("aria-controls"));
  }

  function show(name, open) {
    name.setAttribute("aria-expanded", String(open));
    menu(name).classList.toggle("is-open", open);
  }

  // A filter with chosen options stays open on wide screens.
  function kept(name) {
    return wide.matches && menu(name).querySelector('[aria-pressed="true"]') !== null;
  }

  // Closes the menus, all but the kept ones.
  function closeAll() {
    names.forEach(function (name) {
      if (!kept(name)) show(name, false);
    });
  }

  // Opens the filters with chosen options on wide screens,
  // on narrow ones closes all (the menus would cover the list).
  function showKept() {
    names.forEach(function (name) {
      if (kept(name)) show(name, true);
      else if (!wide.matches) show(name, false);
    });
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
      // One menu at a time, besides the kept ones.
      var open = button.getAttribute("aria-expanded") !== "true";
      closeAll();
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

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".filter")) closeAll();
  });

  // Escape closes the open menu, unless it is kept;
  // the focus goes back to its name.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    names.forEach(function (name) {
      if (name.getAttribute("aria-expanded") !== "true" || kept(name)) return;
      show(name, false);
      name.focus();
    });
  });

  wide.addEventListener("change", showKept);

  box.hidden = false;
  apply();
  showKept();
})();
