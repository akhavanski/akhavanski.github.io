// The button COPY next to the email on the business card (see _includes/social.html):
// a click copies the address, for 1.5 seconds the button says COPIED,
// and a screen reader hears "Email copied".
(function () {
  var btn = document.querySelector(".bcard-copy");
  if (!btn) return;
  var email = btn.dataset.email;
  var label = btn.querySelector(".bcard-label");
  var status = document.querySelector(".bcard-status");
  var timer = null;

  // Without the Clipboard API (old browsers, http) or when it refuses,
  // copy from a hidden textarea.
  function fallbackCopy() {
    var ta = document.createElement("textarea");
    ta.value = email;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    btn.focus(); // select() took the focus away
    return ok;
  }

  function showDone() {
    btn.classList.add("is-done");
    btn.parentNode.classList.add("is-done");
    label.textContent = "Copied";
    btn.setAttribute("aria-label", "Email copied");
    status.textContent = "Email copied";
    clearTimeout(timer);
    timer = setTimeout(function () {
      btn.classList.remove("is-done");
      btn.parentNode.classList.remove("is-done");
      label.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy email address");
      status.textContent = "";
    }, 1500);
  }

  btn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(showDone, function () {
        if (fallbackCopy()) showDone();
      });
    } else if (fallbackCopy()) {
      showDone();
    }
  });
})();
