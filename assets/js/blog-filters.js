// The filter on the Blog page (_includes/posts.html). Its options are tags,
// languages and the place a post was published on (the other blog or this one).
// Several tags and several languages can be on at once. A post is shown
// if it has one of the chosen tags (any if none is chosen), is in one of
// the chosen languages (any if none is chosen) and was published on the chosen
// place (both if none). The places are one at a time: they are radio buttons,
// though a click on the chosen one takes it off.
//
// On wide screens the options are open from the start, in the column right
// of the list; a click on the name (Filters) closes them and opens them again,
// nothing else does. On narrow screens the tags stand in a line under
// the title (they are moved into .filter-row), and the name, the cabinet,
// opens a menu with the rest; a second click, a click anywhere else, Escape
// or "Show N posts" at its foot closes it.
//
// Each option shows how many posts it would give with the other groups
// as they are; one that would give none is pale and cannot be chosen.
// A line under the filter says in words what is shown; on narrow screens
// it also has the options chosen in the closed menu, each with × to take it off.
// When nothing fits (a shared link can ask for that), the line offers to take
// off one of the options, with the number of posts that would bring back.
//
// The choice is kept in the address, e.g. /blog?lang=en&tag=ai&source=guest,
// so a filtered list can be shared or opened again. Unknown values are ignored.
// "Read on …" after an external post's title is hidden where it would lie
// over the filter.
(function () {
  var box = document.querySelector(".blog-filters");
  if (!box) return;

  var name = box.querySelector(".filter-name");
  var menu = document.getElementById(name.getAttribute("aria-controls"));
  var row = box.querySelector(".filter-row");
  var tagGroup = menu.querySelector('[data-group="tag"]');
  var options = Array.prototype.slice.call(box.querySelectorAll(".filter-option"));
  var posts = Array.prototype.slice.call(document.querySelectorAll(".blog-posts li"));
  var status = box.querySelector(".filter-status");
  var summary = status.querySelector(".filter-summary");
  var chosenLine = status.querySelector(".filter-chosen");
  var apply = menu.querySelector(".filter-apply");
  var count = box.querySelector(".filter-count");
  var countText = name.querySelector(".filter-count-text");
  // The width of $wide-screen in assets/css/main.scss.
  var wide = window.matchMedia("(min-width: 72rem)");
  // On wide screens the options stay open until the name is clicked.
  var closedByHand = false;

  function isRadio(option) {
    return option.getAttribute("role") === "radio";
  }

  function isOn(option) {
    return option.getAttribute(isRadio(option) ? "aria-checked" : "aria-pressed") === "true";
  }

  function setOn(option, on) {
    option.setAttribute(isRadio(option) ? "aria-checked" : "aria-pressed", String(on));
  }

  // The option's name, without its number of posts and its hint.
  function label(option) {
    return option.firstChild.nodeValue.trim();
  }

  function find(filter, value) {
    return options.filter(function (o) { return o.dataset.filter === filter && o.dataset.value === value; })[0];
  }

  function chosen(filter) {
    return options.filter(function (o) { return o.dataset.filter === filter && isOn(o); })
      .map(function (o) { return o.dataset.value; });
  }

  // The choice now: the chosen values of each group.
  function choice() {
    return { tag: chosen("tag"), lang: chosen("lang"), source: chosen("source") };
  }

  function fits(post, c) {
    var tags = post.dataset.tags.split(" ");
    return (!c.lang.length || c.lang.indexOf(post.dataset.lang) !== -1) &&
      (!c.tag.length || c.tag.some(function (t) { return tags.indexOf(t) !== -1; })) &&
      (!c.source.length || (c.source[0] === "guest") === post.classList.contains("external"));
  }

  function countFor(c) {
    return posts.filter(function (post) { return fits(post, c); }).length;
  }

  // The choice with one group changed.
  function withGroup(c, filter, values) {
    var next = { tag: c.tag, lang: c.lang, source: c.source };
    next[filter] = values;
    return next;
  }

  // How many posts an option would give: it takes the place of its group's
  // choice, the other groups stay as they are.
  function countOption(option, c) {
    return countFor(withGroup(c, option.dataset.filter, [option.dataset.value]));
  }

  function plural(n) {
    return n + (n === 1 ? " post" : " posts");
  }

  // The names of the chosen values, e.g. "AI or Product", in bold.
  function names(filter, values) {
    return values.map(function (v) {
      var b = document.createElement("b");
      b.textContent = label(find(filter, v));
      return b.outerHTML;
    }).join(" or ");
  }

  function show(open) {
    name.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
  }

  // The tags: in the line under the title on narrow screens, in the menu on wide ones.
  function place() {
    if (wide.matches) {
      if (tagGroup.parentNode !== menu) menu.insertBefore(tagGroup, menu.firstChild);
      row.hidden = true;
      show(!closedByHand);
    } else {
      if (tagGroup.parentNode !== row) row.appendChild(tagGroup);
      row.hidden = false;
      show(false);
    }
  }

  // An option chosen in the closed menu, in the line under the filter, with ×.
  function chip(option) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "filter-option filter-chip";
    b.dataset.fill = option.dataset.fill;
    b.setAttribute("aria-pressed", "true");
    b.setAttribute("aria-label", "Take off " + label(option));
    b.appendChild(document.createTextNode(label(option) + " "));
    var x = document.createElement("span");
    x.className = "filter-chip-x";
    x.setAttribute("aria-hidden", "true");
    x.textContent = "×";
    b.appendChild(x);
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      setOn(option, false);
      render();
      (chosenLine.querySelector("button") || name).focus();
    });
    return b;
  }

  // "Take off “AI”" when no post fits.
  function takeOff(option) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "filter-reset";
    b.textContent = "Take off “" + label(option) + "”";
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      setOn(option, false);
      render();
      summary.focus();
    });
    return b;
  }

  function render() {
    var c = choice();
    var shown = 0;

    posts.forEach(function (post) {
      var ok = fits(post, c);
      post.hidden = !ok;
      if (ok) shown++;
    });

    options.forEach(function (option) {
      var n = countOption(option, c);
      option.querySelector(".filter-option-count").textContent = n;
      var empty = n === 0 && !isOn(option);
      option.classList.toggle("is-empty", empty);
      if (empty) option.setAttribute("aria-disabled", "true");
      else option.removeAttribute("aria-disabled");
    });

    var on = options.filter(isOn);
    count.textContent = on.length ? "(" + on.length + ")" : "";
    countText.textContent = on.length ? ", " + on.length + " chosen" : "";
    status.hidden = !on.length;
    apply.textContent = shown ? "Show " + plural(shown) : "No posts match";

    chosenLine.textContent = "";
    on.forEach(function (option) {
      if (option.dataset.filter !== "tag") chosenLine.appendChild(chip(option));
    });

    summary.textContent = "";
    if (shown) {
      var parts = [];
      if (c.tag.length) parts.push("tagged " + names("tag", c.tag));
      if (c.lang.length) parts.push("in " + names("lang", c.lang));
      if (c.source.length) parts.push("published on " + names("source", c.source));
      summary.innerHTML = plural(shown) + (parts.length ? " " + parts.join(", ") : "") + ".";
    } else {
      summary.appendChild(document.createTextNode("No posts match. "));
      on.forEach(function (option) {
        var rest = c[option.dataset.filter].filter(function (v) { return v !== option.dataset.value; });
        summary.appendChild(takeOff(option));
        summary.appendChild(document.createTextNode(" (" + plural(countFor(withGroup(c, option.dataset.filter, rest))) + ") · "));
      });
    }

    var params = new URLSearchParams();
    c.lang.forEach(function (lang) { params.append("lang", lang); });
    c.tag.forEach(function (tag) { params.append("tag", tag); });
    c.source.forEach(function (source) { params.append("source", source); });
    var query = params.toString();
    history.replaceState(null, "", location.pathname + (query ? "?" + query : "") + location.hash);
  }

  // The choice from the address, if the page was opened with one;
  // one place at most, even if the address asks for both.
  var params = new URLSearchParams(location.search);
  options.forEach(function (option) {
    var on = params.getAll(option.dataset.filter).indexOf(option.dataset.value) !== -1;
    setOn(option, on && !(option.dataset.filter === "source" && chosen("source").length));
  });

  box.addEventListener("click", function (e) {
    var button = e.target.closest("button");
    if (!button) return;

    if (button === name) {
      var open = name.getAttribute("aria-expanded") !== "true";
      if (wide.matches) closedByHand = !open;
      // From now on the options come out one by one when opened (main.scss).
      menu.classList.add("is-played");
      show(open);
      return;
    }
    if (button === apply) {
      show(false);
      name.focus();
      return;
    }
    if (button.classList.contains("filter-reset")) {
      options.forEach(function (o) { setOn(o, false); });
      render();
      // The reset button hides now, so the focus goes to the filter's name.
      name.focus();
      return;
    }
    if (!button.classList.contains("filter-option")) return;
    if (button.getAttribute("aria-disabled") === "true") return;

    var on = !isOn(button);
    // The places: turning one on turns the other off.
    if (on && isRadio(button)) {
      options.forEach(function (o) { if (isRadio(o)) setOn(o, false); });
    }
    setOn(button, on);
    render();
  });

  // Arrows move between the places, as in any group of radio buttons.
  menu.addEventListener("keydown", function (e) {
    var radio = e.target.closest('[role="radio"]');
    var step = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
    if (!radio || !step) return;
    var radios = options.filter(isRadio);
    var next = radios[(radios.indexOf(radio) + step + radios.length) % radios.length];
    e.preventDefault();
    next.focus();
    if (next.getAttribute("aria-disabled") === "true") return;
    radios.forEach(function (o) { setOn(o, o === next); });
    render();
  });

  // On narrow screens a click elsewhere and Escape close the menu.
  document.addEventListener("click", function (e) {
    if (!wide.matches && !e.target.closest(".filter")) show(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || wide.matches || name.getAttribute("aria-expanded") !== "true") return;
    show(false);
    name.focus();
  });

  wide.addEventListener("change", place);

  // "Read on …" after the title of a post from another blog would lie over
  // the filter or its open menu: then it is hidden and only ↗ is left.
  function overlaps(a, b) {
    return a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
  }

  posts.forEach(function (post) {
    var hint = post.querySelector(".guest-at");
    if (!hint) return;
    function check() {
      var rect = hint.getBoundingClientRect();
      var covered = [box].concat(menu.classList.contains("is-open") ? [menu] : []).some(function (el) {
        return overlaps(rect, el.getBoundingClientRect());
      });
      post.classList.toggle("no-room", covered);
    }
    post.addEventListener("mouseenter", check);
    post.addEventListener("focusin", check);
  });

  summary.tabIndex = -1;
  box.hidden = false;
  place();
  render();
})();
