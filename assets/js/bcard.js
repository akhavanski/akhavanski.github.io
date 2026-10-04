// The copy button next to the email on the business card (see _includes/social.html):
// a click copies the address, for 1.5 seconds the icon turns into a tick
// with "Copied" beside it, and a screen reader hears "Email copied".
(function () {
  var button = document.querySelector(".bcard-copy");
  var status = document.querySelector(".bcard-status");
  if (!button) return;
  var row = button.closest(".bcard-email");
  var timer;

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () { return copyOld(text); });
    }
    return copyOld(text);
  }

  // Without the Clipboard API (old browsers, http) or when it refuses,
  // copy from a hidden textarea.
  function copyOld(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = document.execCommand("copy");
    document.body.removeChild(area);
    button.focus(); // select() took the focus away
    return ok ? Promise.resolve() : Promise.reject();
  }

  button.addEventListener("click", function () {
    copy(button.dataset.email).then(function () {
      row.classList.add("is-copied");
      status.textContent = "Email copied";
      clearTimeout(timer);
      timer = setTimeout(function () {
        row.classList.remove("is-copied");
        status.textContent = "";
      }, 1500);
    });
  });
})();
