// A menu on a Nokia 3310 (see index.html): a click on the Menu button
// brings the phone up from the bottom of the window.
// The phone itself is nokia-3310.svg, loaded on the first hover.
// Its screen is an 84 × 48 canvas drawn pixel by pixel like the real display,
// with the same slow fade of the pixels; it shows the menu one item at a time:
// the name, the number and the scroll bar on top, a picture, "Select" below.
// The items are the menu's real links, hidden from the eye: the screen shows
// the one in focus. The scroll key, the arrows, Tab, the wheel or a swipe
// on the screen move along them, a digit jumps to one; the navi key, Enter
// or a click on the screen opens it. The C key, Escape or a click beside
// the phone puts it away.
(function () {
  var toggle = document.querySelector(".menu-toggle");
  var dialog = document.getElementById("nokia");
  if (!toggle || !dialog || !dialog.showModal) return;

  var phone = dialog.querySelector(".nokia-phone");
  var screen = dialog.querySelector(".nokia-screen");
  var canvas = screen.querySelector("canvas");
  var ctx = canvas.getContext("2d");
  var links = [].slice.call(dialog.querySelectorAll(".menu-list a"));
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  var W = 84, H = 48;
  var target = new Uint8Array(W * H);
  // What the display shows: the pixels follow the target with a lag.
  var shown = new Float32Array(W * H);
  var index = 0;
  var frame = 0;
  var clock = 0;
  var grid = document.createElement("canvas");

  // The bold font of the phone: 7 pixels high, descenders below.
  var FONT = {
    "A": [" #### ", "##  ##", "##  ##", "######", "##  ##", "##  ##", "##  ##"],
    "B": ["##### ", "##  ##", "##  ##", "##### ", "##  ##", "##  ##", "##### "],
    "C": [" #### ", "##  ##", "##    ", "##    ", "##    ", "##  ##", " #### "],
    "D": ["##### ", "##  ##", "##  ##", "##  ##", "##  ##", "##  ##", "##### "],
    "E": ["#####", "##   ", "##   ", "#### ", "##   ", "##   ", "#####"],
    "F": ["#####", "##   ", "##   ", "#### ", "##   ", "##   ", "##   "],
    "G": [" #### ", "##  ##", "##    ", "## ###", "##  ##", "##  ##", " #####"],
    "H": ["##  ##", "##  ##", "##  ##", "######", "##  ##", "##  ##", "##  ##"],
    "I": ["##", "##", "##", "##", "##", "##", "##"],
    "J": ["   ##", "   ##", "   ##", "   ##", "   ##", "## ##", " ### "],
    "K": ["##  ##", "## ## ", "####  ", "###   ", "####  ", "## ## ", "##  ##"],
    "L": ["##   ", "##   ", "##   ", "##   ", "##   ", "##   ", "#####"],
    "M": ["##   ##", "### ###", "#######", "## # ##", "##   ##", "##   ##", "##   ##"],
    "N": ["##  ##", "### ##", "######", "## ###", "##  ##", "##  ##", "##  ##"],
    "O": [" #### ", "##  ##", "##  ##", "##  ##", "##  ##", "##  ##", " #### "],
    "P": ["##### ", "##  ##", "##  ##", "##### ", "##    ", "##    ", "##    "],
    "Q": [" #### ", "##  ##", "##  ##", "##  ##", "##  ##", "## ## ", " ## ##"],
    "R": ["##### ", "##  ##", "##  ##", "##### ", "####  ", "## ## ", "##  ##"],
    "S": [" #### ", "##  ##", "##    ", " #### ", "    ##", "##  ##", " #### "],
    "T": ["######", "  ##  ", "  ##  ", "  ##  ", "  ##  ", "  ##  ", "  ##  "],
    "U": ["##  ##", "##  ##", "##  ##", "##  ##", "##  ##", "##  ##", " #### "],
    "V": ["##  ##", "##  ##", "##  ##", "##  ##", "##  ##", " #### ", "  ##  "],
    "W": ["##   ##", "##   ##", "##   ##", "## # ##", "#######", "### ###", "##   ##"],
    "X": ["##  ##", "##  ##", " #### ", "  ##  ", " #### ", "##  ##", "##  ##"],
    "Y": ["##  ##", "##  ##", "##  ##", " #### ", "  ##  ", "  ##  ", "  ##  "],
    "Z": ["######", "    ##", "   ## ", "  ##  ", " ##   ", "##    ", "######"],
    "a": ["", "", " #### ", "    ##", " #####", "##  ##", " #####"],
    "b": ["##    ", "##    ", "##### ", "##  ##", "##  ##", "##  ##", "##### "],
    "c": ["", "", " ####", "##   ", "##   ", "##   ", " ####"],
    "d": ["    ##", "    ##", " #####", "##  ##", "##  ##", "##  ##", " #####"],
    "e": ["", "", " #### ", "##  ##", "######", "##    ", " #####"],
    "f": [" ###", "##  ", "####", "##  ", "##  ", "##  ", "##  "],
    "g": ["", "", " #####", "##  ##", "##  ##", "##  ##", " #####", "    ##", " #### "],
    "h": ["##    ", "##    ", "##### ", "##  ##", "##  ##", "##  ##", "##  ##"],
    "i": ["##", "", "##", "##", "##", "##", "##"],
    "j": ["  ##", "", "  ##", "  ##", "  ##", "  ##", "  ##", "  ##", "### "],
    "k": ["##    ", "##    ", "##  ##", "## ## ", "####  ", "## ## ", "##  ##"],
    "l": ["##", "##", "##", "##", "##", "##", "##"],
    "m": ["", "", "####### ", "## ## ##", "## ## ##", "## ## ##", "## ## ##"],
    "n": ["", "", "##### ", "##  ##", "##  ##", "##  ##", "##  ##"],
    "o": ["", "", " #### ", "##  ##", "##  ##", "##  ##", " #### "],
    "p": ["", "", "##### ", "##  ##", "##  ##", "##  ##", "##### ", "##    ", "##    "],
    "q": ["", "", " #####", "##  ##", "##  ##", "##  ##", " #####", "    ##", "    ##"],
    "r": ["", "", "## ###", "###   ", "##    ", "##    ", "##    "],
    "s": ["", "", " #####", "##    ", " #### ", "    ##", "##### "],
    "t": ["", "##  ", "####", "##  ", "##  ", "##  ", " ###"],
    "u": ["", "", "##  ##", "##  ##", "##  ##", "##  ##", " #####"],
    "v": ["", "", "##  ##", "##  ##", "##  ##", " #### ", "  ##  "],
    "w": ["", "", "##   ##", "##   ##", "## # ##", "#######", " ## ## "],
    "x": ["", "", "##  ##", " #### ", "  ##  ", " #### ", "##  ##"],
    "y": ["", "", "##  ##", "##  ##", "##  ##", "##  ##", " #####", "    ##", " #### "],
    "z": ["", "", "######", "   ## ", "  ##  ", " ##   ", "######"],
    "0": [" #### ", "##  ##", "##  ##", "##  ##", "##  ##", "##  ##", " #### "],
    "1": ["  ##", " ###", "  ##", "  ##", "  ##", "  ##", "  ##"],
    "2": [" #### ", "##  ##", "    ##", "   ## ", "  ##  ", " ##   ", "######"],
    "3": [" #### ", "##  ##", "    ##", "  ### ", "    ##", "##  ##", " #### "],
    "4": ["   ###", "  ####", " ## ##", "##  ##", "######", "    ##", "    ##"],
    "5": ["######", "##    ", "##### ", "    ##", "    ##", "##  ##", " #### "],
    "6": [" #### ", "##    ", "##### ", "##  ##", "##  ##", "##  ##", " #### "],
    "7": ["######", "    ##", "   ## ", "  ##  ", "  ##  ", "  ##  ", "  ##  "],
    "8": [" #### ", "##  ##", "##  ##", " #### ", "##  ##", "##  ##", " #### "],
    "9": [" #### ", "##  ##", "##  ##", " #####", "    ##", "    ##", " #### "],
    " ": ["   "],
    "-": ["", "", "", "####"],
    ".": ["", "", "", "", "", "##", "##"],
    ",": ["", "", "", "", "", "##", "##", " #"],
    ":": ["", "##", "##", "", "##", "##"],
    "!": ["##", "##", "##", "##", "##", "", "##"],
    "?": [" #### ", "##  ##", "    ##", "   ## ", "  ##  ", "", "  ##  "],
    "'": ["##", "##"]
  };

  // Pictures of the items, by the link's data-icon.
  var BOOK = [
    "    #####     ",
    "  ##     ##   ",
    " #         ## ",
    "#            #",
    "#  ######    #",
    "#            #",
    "#  #######   #",
    "#            #",
    "#  #######   #",
    "#            #",
    "#  #####     #",
    "#    #####   #",
    "#  ##     ## #",
    "# #         ##",
    "##############"
  ];
  var PERSON = [
    "       #######       ",
    "     ###########     ",
    "    #############    ",
    "    ### ##### ###    ",
    "    ### ##### ###    ",
    "    #############    ",
    "    ## ####### ##    ",
    "     ##       ##     ",
    "      #########      ",
    "        #####        ",
    "",
    "    #############    ",
    "  #################  ",
    " ################### ",
    "#####################",
    "#####################",
    "#####################"
  ];
  var ICONS = {
    // An open book: the left page and its mirror.
    blog: function (cx, cy) {
      bitmap(BOOK.map(function (row) {
        return row + row.slice(0, -1).split("").reverse().join("");
      }), cx, cy);
    },
    about: function (cx, cy) {
      bitmap(PERSON, cx, cy);
    },
    // A clock with the time now.
    now: function (cx, cy) {
      var x, y, d, t = new Date();
      for (y = -12; y <= 12; y++) {
        for (x = -12; x <= 12; x++) {
          d = Math.sqrt(x * x + y * y);
          if (d >= 9.6 && d <= 11.5) px(cx + x, cy + y);
        }
      }
      for (d = 0; d < 4; d++) {
        x = [0, 1, 0, -1][d];
        y = [-1, 0, 1, 0][d];
        px(cx + x * 8, cy + y * 8);
        px(cx + x * 7, cy + y * 7);
      }
      hand(cx, cy, (t.getHours() % 12 + t.getMinutes() / 60) / 12, 4.5);
      hand(cx, cy, t.getMinutes() / 60, 7.5);
    }
  };

  function px(x, y) {
    if (x >= 0 && x < W && y >= 0 && y < H) target[y * W + x] = 1;
  }

  function bitmap(rows, cx, cy) {
    var x0 = cx - (rows[0].length >> 1), y0 = cy - (rows.length >> 1);
    rows.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) if (row[x] === "#") px(x0 + x, y0 + y);
    });
  }

  function hand(cx, cy, turn, length) {
    var a = turn * 2 * Math.PI;
    line(cx, cy, Math.round(cx + Math.sin(a) * length), Math.round(cy - Math.cos(a) * length));
  }

  function line(x0, y0, x1, y1) {
    var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    var sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx + dy;
    for (;;) {
      px(x0, y0);
      if (x0 === x1 && y0 === y1) return;
      var e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  function glyph(ch) {
    return FONT[ch] || FONT[" "];
  }

  // The widest row: lowercase letters start with empty rows.
  function glyphWidth(rows) {
    return Math.max.apply(null, rows.map(function (row) { return row.length; }));
  }

  function textWidth(str) {
    return str.split("").reduce(function (w, ch) {
      return w + glyphWidth(glyph(ch)) + 1;
    }, -1);
  }

  function text(str, x, y) {
    str.split("").forEach(function (ch) {
      var rows = glyph(ch);
      rows.forEach(function (row, dy) {
        for (var dx = 0; dx < row.length; dx++) if (row[dx] === "#") px(x + dx, y + dy);
      });
      x += glyphWidth(rows) + 1;
    });
  }

  // One item: its name and number on top, the scroll bar on the right,
  // its picture in the middle and "Select" over the navi key.
  function draw() {
    var link = links[index];
    var number = String(index + 1);
    var top = 10, height = 28, y;
    target.fill(0);
    text(link.textContent.trim(), 0, 0);
    text(number, W - textWidth(number), 0);
    for (y = top; y < top + height; y += 2) px(W - 2, y);
    var size = Math.max(5, Math.floor(height / links.length));
    var at = top + Math.round(index * (height - size) / Math.max(1, links.length - 1));
    for (y = at; y < at + size; y++) {
      px(W - 3, y);
      px(W - 2, y);
      px(W - 1, y);
    }
    if (ICONS[link.dataset.icon]) ICONS[link.dataset.icon](39, 24);
    text("Select", (W - textWidth("Select")) >> 1, 40);
    if (!frame) frame = requestAnimationFrame(paint);
  }

  // The canvas has a pixel of the screen's size for each pixel of the display.
  function resize() {
    var ratio = window.devicePixelRatio || 1;
    canvas.width = grid.width = Math.round(canvas.clientWidth * ratio);
    canvas.height = grid.height = Math.round(canvas.clientHeight * ratio);
    // The faint cells of the pixels that are off.
    var g = grid.getContext("2d");
    var pw = grid.width / W, ph = grid.height / H;
    g.fillStyle = "rgba(30, 60, 0, 0.05)";
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) g.fillRect(x * pw + pw * 0.06, y * ph + ph * 0.06, pw * 0.88, ph * 0.88);
    }
    if (!frame) frame = requestAnimationFrame(paint);
  }

  // Each pixel goes a third of the way to its target in a frame,
  // with a faint shadow on the glass under it, like on the real display.
  function paint() {
    var pw = canvas.width / W, ph = canvas.height / H;
    var busy = false, i, a, x, y;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
    ctx.drawImage(grid, 0, 0);
    for (i = 0; i < W * H; i++) {
      a = shown[i] + (target[i] - shown[i]) * (reduced.matches ? 1 : 0.34);
      if (Math.abs(target[i] - a) < 0.02) a = target[i];
      else busy = true;
      shown[i] = a;
    }
    [[0.16, pw * 0.3, ph * 0.38, "#0b1a00"], [0.95, 0, 0, "#0f180b"]].forEach(function (pass) {
      ctx.fillStyle = pass[3];
      for (i = 0; i < W * H; i++) {
        if (!shown[i]) continue;
        x = i % W;
        y = (i - x) / W;
        ctx.globalAlpha = shown[i] * pass[0];
        ctx.fillRect(x * pw + pass[1] + pw * 0.05, y * ph + pass[2] + ph * 0.05, pw * 0.9, ph * 0.9);
      }
    });
    frame = busy ? requestAnimationFrame(paint) : 0;
  }

  // The focus event alone is not enough: it does not come while the window
  // itself is not in focus.
  function focus(i) {
    index = (i + links.length) % links.length;
    links[index].focus({ preventScroll: true });
    draw();
  }

  // Presses a key on the phone for a moment, when the keyboard did the job.
  function press(name) {
    var hit = phone.querySelector('[data-key="' + name + '"]');
    var key = hit && hit.closest(".n-key");
    if (!key) return;
    key.classList.add("is-pressed");
    setTimeout(function () { key.classList.remove("is-pressed"); }, 140);
  }

  function select() {
    var link = links[index];
    if (link.getAttribute("aria-current") === "page") close();
    else link.click();
  }

  function act(name) {
    if (name === "up") focus(index - 1);
    else if (name === "down") focus(index + 1);
    else if (name === "select") select();
    else if (name === "back") close();
    else if (links[name - 1]) focus(name - 1);
  }

  var loading;
  function load() {
    loading = loading || fetch(dialog.dataset.svg)
      .then(function (r) { return r.text(); })
      .then(function (svg) { phone.insertAdjacentHTML("afterbegin", svg); })
      .catch(function () {});
    return loading;
  }

  function open() {
    load().then(function () {
      if (dialog.open) return;
      dialog.classList.remove("is-closing");
      dialog.showModal();
      shown.fill(0);
      resize();
      focus(0);
      clock = setInterval(draw, 15000);
      // The backlight comes on as the phone lands.
      setTimeout(function () { phone.classList.add("is-lit"); }, reduced.matches ? 0 : 400);
    });
  }

  function close() {
    if (!dialog.open || dialog.classList.contains("is-closing")) return;
    clearInterval(clock);
    phone.classList.remove("is-lit");
    dialog.classList.add("is-closing");
    setTimeout(function () {
      dialog.close();
      dialog.classList.remove("is-closing");
    }, reduced.matches ? 0 : 300);
  }

  toggle.addEventListener("pointerenter", load);
  toggle.addEventListener("focus", load);
  toggle.addEventListener("click", open);

  dialog.addEventListener("focusin", function (e) {
    var i = links.indexOf(e.target);
    if (i < 0 || i === index) return;
    index = i;
    draw();
  });

  dialog.addEventListener("keydown", function (e) {
    var name = {
      ArrowDown: "down", ArrowRight: "down", ArrowUp: "up", ArrowLeft: "up",
      Enter: "select", " ": "select", Escape: "back", Backspace: "back"
    }[e.key] || (/^[0-9*#]$/.test(e.key) && e.key);
    if (!name) return;
    e.preventDefault();
    press(name);
    act(name);
  });

  dialog.addEventListener("cancel", function (e) {
    e.preventDefault();
    close();
  });

  // A click beside the phone lands on the dialog itself.
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) close();
  });

  // The keys: pressed while the pointer is down, the focus stays on the links.
  phone.addEventListener("pointerdown", function (e) {
    var hit = e.target.closest("[data-key]");
    if (hit) hit.closest(".n-key").classList.add("is-pressed");
  });

  phone.addEventListener("mousedown", function (e) {
    e.preventDefault();
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach(function (type) {
    phone.addEventListener(type, function () {
      [].forEach.call(phone.querySelectorAll(".is-pressed"), function (key) {
        key.classList.remove("is-pressed");
      });
    });
  });

  phone.addEventListener("click", function (e) {
    var hit = e.target.closest("[data-key]");
    if (hit) act(hit.dataset.key);
  });

  // The screen: a tap opens the item, a swipe or the wheel moves along.
  var swipe = null, wheel = 0;
  screen.addEventListener("pointerdown", function (e) {
    swipe = e.clientY;
  });

  screen.addEventListener("pointerup", function (e) {
    if (swipe === null) return;
    var dy = e.clientY - swipe;
    swipe = null;
    if (Math.abs(dy) < 12) select();
    else act(dy < 0 ? "down" : "up");
  });

  screen.addEventListener("wheel", function (e) {
    e.preventDefault();
    if (Date.now() - wheel < 200 || !e.deltaY) return;
    wheel = Date.now();
    act(e.deltaY > 0 ? "down" : "up");
  }, { passive: false });

  window.addEventListener("resize", function () {
    if (dialog.open) resize();
  });

  // Back from a link, the page may come from the cache with the phone out.
  window.addEventListener("pageshow", function (e) {
    if (!e.persisted || !dialog.open) return;
    clearInterval(clock);
    phone.classList.remove("is-lit");
    dialog.classList.remove("is-closing");
    dialog.close();
  });
})();
