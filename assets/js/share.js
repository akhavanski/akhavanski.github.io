// Sharing the post (see _includes/share.html). On a wide screen the turtle
// climbs out on hover (or focus, or a click) with a bubble of buttons: each opens
// a new post or message with the link, the last one copies it and the bubble
// says "Thank you!". A while after the pointer leaves, both hide again; Escape
// or a click elsewhere hides them at once. On a phone the turtle says "Share",
// and a tap opens the system share menu, or copies the link where there is none.
(function () {
  var box = document.querySelector(".share");
  if (!box) return;
  var url = box.dataset.url;
  var title = box.dataset.title;
  // The labels come from data attributes (a section in another language sets them);
  // without them they are English.
  var labelShare = box.dataset.labelShare || "Share";
  var labelThanks = box.dataset.labelThanks || "Thank you!";
  var labelCopied = box.dataset.labelCopied || "Link copied";

  var turtle = box.querySelector(".share-turtle-btn");
  var word = box.querySelector(".share-word");
  var copyBtn = box.querySelector(".share-copy");
  var status = box.querySelector(".share-status");
  var timer = null;

  var u = encodeURIComponent(url), t = encodeURIComponent(title);
  var targets = {
    linkedin: "https://www.linkedin.com/feed/?shareActive=true&text=" + encodeURIComponent(title + " " + url),
    telegram: "https://t.me/share/url?url=" + u + "&text=" + t,
    whatsapp: "https://wa.me/?text=" + encodeURIComponent(title + " " + url),
    x: "https://x.com/intent/post?url=" + u + "&text=" + t,
    email: "mailto:?subject=" + t + "&body=" + u
  };
  box.querySelectorAll("[data-target]").forEach(function (a) {
    a.href = targets[a.dataset.target];
  });

  // Without the Clipboard API (old browsers, http) or when it refuses,
  // copy from a hidden textarea.
  function fallbackCopy(back) {
    var ta = document.createElement("textarea");
    ta.value = url;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    back.focus(); // select() took the focus away
    return ok;
  }

  function copy(back, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, function () {
        if (fallbackCopy(back)) done();
      });
    } else if (fallbackCopy(back)) {
      done();
    }
  }

  // For 1.5 seconds the element says the link is copied.
  function flash(el, back, after) {
    el.textContent = labelThanks;
    status.textContent = labelCopied;
    box.classList.add("is-copied");
    clearTimeout(timer);
    timer = setTimeout(function () {
      el.textContent = back;
      status.textContent = "";
      box.classList.remove("is-copied");
      if (after) after();
    }, 1500);
  }

  var wide = window.matchMedia("(min-width: 72rem)");
  var bubble = box.querySelector(".share-bubble");

  function shareNative() {
    if (navigator.share) {
      navigator.share({ title: title, url: url }).catch(function () {});
    } else {
      copy(turtle, function () { flash(word, labelShare); });
    }
  }

  bubble.addEventListener("click", function () {
    if (!wide.matches) shareNative();
  });

  var hideTimer = null;

  function set(open) {
    clearTimeout(hideTimer);
    turtle.setAttribute("aria-expanded", open);
    box.classList.toggle("is-open", open);
  }

  function hideLater() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(function () { set(false); }, 1500);
  }

  // With data-pin="end" (the section Черепаха и слоны) the turtle is fixed at the bottom of the
  // window and comes out only while the end of the page (the mark .share-end) is in the window:
  // the class at-end. Scrolled back up, it hides again and the bubble closes.
  var end = box.dataset.pin === "end" && document.querySelector(".share-end");
  if (end && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      var at = entries[entries.length - 1].isIntersecting;
      box.classList.toggle("at-end", at);
      if (!at) {
        set(false);
        if (box.contains(document.activeElement)) document.activeElement.blur();
      }
    }).observe(end);
  } else if (end) {
    box.classList.add("at-end");
  }

  var area = box.querySelector(".share-turtle");
  area.addEventListener("mouseenter", function () { if (wide.matches) set(true); });
  area.addEventListener("mouseleave", hideLater);
  area.addEventListener("focusin", function () { set(true); });
  area.addEventListener("focusout", function (e) {
    if (!area.contains(e.relatedTarget) && !area.matches(":hover")) hideLater();
  });

  turtle.addEventListener("click", function () {
    if (!wide.matches) return shareNative();
    set(true);
    box.querySelector(".share-links a").focus();
  });

  copyBtn.addEventListener("click", function () {
    copy(copyBtn, function () {
      flash(word, labelShare, function () {
        if (!area.matches(":hover")) hideLater();
      });
    });
  });

  document.addEventListener("click", function (e) {
    if (box.classList.contains("is-open") && !e.target.closest(".share-turtle")) set(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && box.classList.contains("is-open")) {
      set(false);
      turtle.blur();
    }
  });
})();
