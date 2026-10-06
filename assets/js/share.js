// Sharing the post (see _includes/share.html). On a phone the button "Share"
// opens the system share menu, or copies the link where there is none.
// On a wide screen a click on the turtle turns its bubble "Share" into buttons:
// each opens a new post or message with the link, the last one copies it
// and the bubble says "Thank you!". Escape or a click elsewhere closes them.
(function () {
  var box = document.querySelector(".share");
  if (!box) return;
  var url = box.dataset.url;
  var title = box.dataset.title;

  var btn = box.querySelector(".share-btn");
  var turtle = box.querySelector(".share-turtle-btn");
  var word = box.querySelector(".share-word");
  var copyBtn = box.querySelector(".share-copy");
  var status = box.querySelector(".share-status");
  var timer = null;

  var u = encodeURIComponent(url), t = encodeURIComponent(title);
  var targets = {
    linkedin: "https://www.linkedin.com/feed/?shareActive=true&text=" + encodeURIComponent(title + " " + url),
    telegram: "https://t.me/share/url?url=" + u + "&text=" + t,
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
    el.textContent = "Thank you!";
    status.textContent = "Link copied";
    box.classList.add("is-copied");
    clearTimeout(timer);
    timer = setTimeout(function () {
      el.textContent = back;
      status.textContent = "";
      box.classList.remove("is-copied");
      if (after) after();
    }, 1500);
  }

  btn.addEventListener("click", function () {
    if (navigator.share) {
      navigator.share({ title: title, url: url }).catch(function () {});
    } else {
      copy(btn, function () { flash(btn, "Share"); });
    }
  });

  function set(open) {
    turtle.setAttribute("aria-expanded", open);
    box.classList.toggle("is-open", open);
    if (open) box.querySelector(".share-links a").focus();
  }

  turtle.addEventListener("click", function () {
    set(!box.classList.contains("is-open"));
  });

  copyBtn.addEventListener("click", function () {
    copy(copyBtn, function () {
      set(false);
      turtle.focus();
      flash(word, "Share");
    });
  });

  document.addEventListener("click", function (e) {
    if (box.classList.contains("is-open") && !e.target.closest(".share-turtle")) set(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && box.classList.contains("is-open")) {
      set(false);
      turtle.focus();
    }
  });
})();
