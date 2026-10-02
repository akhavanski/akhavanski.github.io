#!/usr/bin/env python3
"""Writes nokia-3310.svg, the phone of the menu: python3 gen_nokia.py nokia-3310.svg"""
import math, sys

OUT = sys.argv[1]

def rounded(points, r):
    """A closed path through the points with rounded corners."""
    n = len(points)
    d = []
    for i in range(n):
        p0, p1, p2 = points[i - 1], points[i], points[(i + 1) % n]
        rr = r[i] if isinstance(r, (list, tuple)) else r
        def toward(a, b, dist):
            dx, dy = b[0] - a[0], b[1] - a[1]
            l = math.hypot(dx, dy)
            k = min(dist, l / 2) / l
            return (a[0] + dx * k, a[1] + dy * k)
        a = toward(p1, p0, rr)
        b = toward(p1, p2, rr)
        d.append(("M" if i == 0 else "L") + f"{a[0]:.1f},{a[1]:.1f}")
        d.append(f"Q{p1[0]:.1f},{p1[1]:.1f} {b[0]:.1f},{b[1]:.1f}")
    return " ".join(d) + " Z"

BODY = ("M100,2 C128,2 160,3 176,8 C190,13 197,29 198.5,59 C199.5,100 199.5,180 198.5,250 "
        "C197.5,330 194,400 190,432 C187,452 176,459.5 155,459.5 L45,459.5 C24,459.5 13,452 10,432 "
        "C6,400 2.5,330 1.5,250 C0.5,180 0.5,100 1.5,59 C3,29 10,13 24,8 C40,3 72,2 100,2 Z")
COVER = ("M100,4.5 C127,4.5 158,5.5 173.5,10.5 C186,15 193.5,30 195,59 C196,100 196,180 195,250 "
         "C194,330 190.5,398 186.8,429 C184,448 174,456.3 154,456.3 L46,456.3 C26,456.3 16,448 13.2,429 "
         "C9.5,398 6,330 5,250 C4,180 4,100 5,59 C6.5,30 14,15 26.5,10.5 C42,5.5 73,4.5 100,4.5 Z")
RING_OUT = ("M100,6.5 C126,6.5 156,7.5 171,12 C183,16 190,29 191.5,57 C192.5,100 192.5,170 192,213 "
            "C191.6,238 183,259 171.5,268.5 L130.5,297.5 C124,301.5 112,302.5 100,302.5 "
            "C86,302.5 66,299 55,287.5 L29.6,259.5 C21,250 8.6,236 8,213 "
            "C7.5,170 7.5,100 8.5,57 C10,29 17,16 29,12 C44,7.5 74,6.5 100,6.5 Z")
RING_IN = ("M100,12 C124,12 150,13 163,16.5 C173,19.5 178.2,30 179.6,55 C180.5,100 180.5,170 180,204 "
           "C179.5,228 171,241 152,246.5 C136,250.5 118,251 100,251 C82,251 64,250.5 48,246.5 "
           "C29,241 20.5,228 20,204 C19.5,170 19.5,100 20.4,55 C21.8,30 27,19.5 37,16.5 C50,13 76,12 100,12 Z")
# The display window; the HTML screen lies over it (see .nokia-screen).
LCD = (27.5, 121, 171.5, 219)
NAVI = ("M58.5,250.5 C60,245 80,239.5 100,239.5 C120,239.5 140,245 141.5,250.5 "
        "C142.5,254.5 123,262.5 100,262.5 C77,262.5 57.5,254.5 58.5,250.5 Z")
C_KEY = [(29.4, 253.4), (49.6, 250.6), (67.7, 272.3), (55.2, 287.0), (29.4, 259.2)]
ROCKER = [(136.8, 250.6), (167.6, 253.5), (171.0, 268.8), (130.2, 297.6), (111.2, 280.8)]

KEYS = [
    ("1", 40.5, 309, 14, "l", "1", "vm"),
    ("2", 100, 316, 0, "m", "2", "abc"),
    ("3", 159.5, 309, -14, "r", "3", "def"),
    ("4", 42.5, 341.5, 14, "l", "4", "ghi"),
    ("5", 100, 350, 0, "m", "5", "jkl"),
    ("6", 157.5, 341.5, -14, "r", "6", "mno"),
    ("7", 44.5, 375.7, 14, "l", "7", "pqrs"),
    ("8", 100, 383.2, 0, "m", "8", "tuv"),
    ("9", 155.5, 375.7, -14, "r", "9", "wxyz"),
    ("*", 46.5, 410, 14, "l", "*", "+"),
    ("0", 100, 417.4, 0, "m", "0", "space"),
    ("#", 153.5, 410, -14, "r", "#", "shift"),
]

def rot(u, v, a):
    a = math.radians(a)
    return (u * math.cos(a) - v * math.sin(a), u * math.sin(a) + v * math.cos(a))

def label(kind, x, y):
    """Small symbols on the keys, centred on x, y."""
    if kind == "vm":
        return (f'<path class="n-ink-line" d="M{x-3.2:.1f},{y+1.6:.1f} h6.4"/>'
                f'<circle class="n-ink-line" cx="{x-3.2:.1f}" cy="{y:.1f}" r="1.6"/>'
                f'<circle class="n-ink-line" cx="{x+3.2:.1f}" cy="{y:.1f}" r="1.6"/>')
    if kind == "space":
        return f'<path class="n-ink-line" d="M{x-3.5:.1f},{y-1.4:.1f} v2.6 h7 v-2.6"/>'
    if kind == "shift":
        return f'<path class="n-ink-line" d="M{x-3.4:.1f},{y+2.4:.1f} h6.8 v-2.8 l-3.4,-3 l-3.4,3 z"/>'
    if kind == "*":
        return "".join(
            f'<path class="n-ink-bold" d="M{x+3.6*math.cos(math.radians(a)):.2f},{y+3.6*math.sin(math.radians(a)):.2f} '
            f'L{x-3.6*math.cos(math.radians(a)):.2f},{y-3.6*math.sin(math.radians(a)):.2f}"/>'
            for a in (90, 30, 150))
    return None

def key(name, cx, cy, angle, col, digit, letters):
    out = [f'<g class="n-key" data-key="{name}" transform="translate({cx} {cy})">']
    out.append(f'<ellipse class="n-hole" rx="22.6" ry="12.6" transform="rotate({angle})"/>')
    out.append(f'<ellipse class="n-light" rx="26" ry="15.5" transform="rotate({angle})"/>')
    out.append(f'<ellipse class="n-drop" cx=".5" cy="1.8" rx="20.6" ry="10.8" transform="rotate({angle})"/>')
    out.append('<g class="n-cap">')
    out.append(f'<ellipse class="n-cap-face" rx="20.6" ry="10.8" transform="rotate({angle})"/>')
    out.append(f'<ellipse class="n-cap-shine" cx="-2" cy="-5.6" rx="12" ry="3" transform="rotate({angle}) "/>')
    # Where the digit and the letters go, along the key: the digit on the
    # outer end and a bit higher, the letters on the inner end and lower.
    if col == "l":
        du, dv, lu, lv = -9, -1.4, 6, 2.6
    elif col == "r":
        du, dv, lu, lv = 9, -1.4, -6, 2.6
    else:
        du, dv, lu, lv = -6.5, 0, 5.5, 0.6
    dx, dy = rot(du, dv, angle)
    lx, ly = rot(lu, lv, angle)
    sym = label(digit, dx, dy)
    out.append(sym or f'<text class="n-digit" x="{dx:.1f}" y="{dy:.1f}">{digit}</text>')
    sym = label(letters, lx, ly)
    out.append(sym or f'<text class="n-letters" x="{lx:.1f}" y="{ly:.1f}">{letters}</text>')
    out.append("</g></g>")
    return "\n".join(out)

L = LCD
svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 462" aria-hidden="true">
<!-- Nokia 3310 for the menu (nokia.js). Keys with data-key are pressed by the script. -->
<style>
  .n-hole {{ fill: #04060d; opacity: .72; }}
  .n-light {{ fill: url(#n-glow-fill); opacity: 0; transition: opacity .5s; }}
  .n-backlight {{ opacity: 0; transition: opacity .5s; }}
  .is-lit .n-light {{ opacity: .9; }}
  .is-lit .n-backlight {{ opacity: .75; }}
  .n-drop {{ fill: #000; opacity: .55; filter: url(#n-blur); transition: opacity .08s; }}
  .n-cap {{ transition: transform .08s; }}
  .n-cap-face {{ fill: url(#n-key); stroke: #5f6670; stroke-width: .5; }}
  .n-cap-shine {{ fill: #fff; opacity: .65; filter: url(#n-blur); }}
  .n-digit, .n-letters {{ fill: #15241b; text-anchor: middle; dominant-baseline: central;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; }}
  .n-digit {{ font-size: 11.5px; font-weight: 700; }}
  .n-letters {{ font-size: 6.6px; font-weight: 600; }}
  .n-ink-line, .n-ink-bold {{ fill: none; stroke: #15241b; stroke-linecap: round; stroke-linejoin: round; }}
  .n-ink-line {{ stroke-width: .8; }}
  .n-ink-bold {{ stroke-width: 1.7; }}
  .n-hit {{ fill: transparent; }}
  .n-key {{ cursor: pointer; }}
  .n-key.is-pressed .n-cap {{ transform: translate(0, .7px); }}
  .n-key.is-pressed .n-drop {{ opacity: .2; }}
</style>
<defs>
  <linearGradient id="n-body" x1="0" x2="1">
    <stop offset="0" stop-color="#090d20"/><stop offset=".05" stop-color="#18203f"/>
    <stop offset=".5" stop-color="#222d50"/><stop offset=".95" stop-color="#151c38"/>
    <stop offset="1" stop-color="#070a1a"/>
  </linearGradient>
  <linearGradient id="n-cover" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#34436d"/><stop offset=".45" stop-color="#2c3a62"/>
    <stop offset="1" stop-color="#232e52"/>
  </linearGradient>
  <linearGradient id="n-cover-sides" x1="0" x2="1">
    <stop offset="0" stop-color="#d8e0ff" stop-opacity=".2"/><stop offset=".09" stop-color="#d8e0ff" stop-opacity="0"/>
    <stop offset=".84" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".42"/>
  </linearGradient>
  <linearGradient id="n-cover-ends" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#c8d4ff" stop-opacity=".16"/><stop offset=".06" stop-color="#c8d4ff" stop-opacity="0"/>
    <stop offset=".88" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/>
  </linearGradient>
  <radialGradient id="n-cover-shine" cx=".32" cy=".62" r=".5">
    <stop offset="0" stop-color="#aebdff" stop-opacity=".12"/><stop offset="1" stop-color="#aebdff" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="n-silver" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f1f3f5"/><stop offset=".25" stop-color="#cfd3d9"/>
    <stop offset=".62" stop-color="#b4bac2"/><stop offset=".82" stop-color="#c9cdd3"/>
    <stop offset="1" stop-color="#dfe2e6"/>
  </linearGradient>
  <linearGradient id="n-silver-sides" x1="0" x2="1">
    <stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset=".08" stop-color="#000" stop-opacity="0"/>
    <stop offset=".3" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/>
    <stop offset=".92" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".32"/>
  </linearGradient>
  <radialGradient id="n-key" cx=".42" cy=".28" r=".85">
    <stop offset="0" stop-color="#fbfcfc"/><stop offset=".38" stop-color="#dde0e4"/>
    <stop offset=".78" stop-color="#b2b8c0"/><stop offset="1" stop-color="#868c96"/>
  </radialGradient>
  <linearGradient id="n-navi" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f7f8f9"/><stop offset=".45" stop-color="#d9dde1"/>
    <stop offset="1" stop-color="#9aa0a9"/>
  </linearGradient>
  <linearGradient id="n-soft-key" x1="0" y1="0" x2=".6" y2="1">
    <stop offset="0" stop-color="#f3f4f6"/><stop offset=".5" stop-color="#d0d4d9"/>
    <stop offset="1" stop-color="#9da3ac"/>
  </linearGradient>
  <linearGradient id="n-badge" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2a2d33"/><stop offset=".5" stop-color="#0d0f12"/><stop offset="1" stop-color="#050607"/>
  </linearGradient>
  <radialGradient id="n-glow-fill">
    <stop offset=".7" stop-color="#c4ff9a"/><stop offset=".8" stop-color="#9dff70" stop-opacity=".7"/><stop offset="1" stop-color="#7dff5a" stop-opacity="0"/>
  </radialGradient>
  <filter id="n-blur" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="1.1"/></filter>
  <filter id="n-blur-big" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="2.2"/></filter>
  <filter id="n-grain" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" stitchTiles="stitch"/>
    <feColorMatrix type="saturate" values="0"/>
  </filter>
  <clipPath id="n-cover-clip"><path d="{COVER}"/></clipPath>
  <clipPath id="n-ring-clip"><path d="{RING_OUT} {RING_IN}" clip-rule="evenodd"/></clipPath>
</defs>

<!-- The housing: the dark back seen at the edges, the blue front cover over it. -->
<path d="{BODY}" fill="url(#n-body)"/>
<path d="{BODY}" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width=".8"/>
<path d="{COVER}" fill="url(#n-cover)"/>
<g clip-path="url(#n-cover-clip)">
  <rect width="200" height="462" filter="url(#n-grain)" opacity=".22" style="mix-blend-mode:overlay"/>
  <rect width="200" height="462" fill="url(#n-cover-sides)"/>
  <rect width="200" height="462" fill="url(#n-cover-ends)"/>
  <rect width="200" height="462" fill="url(#n-cover-shine)"/>
</g>
<path d="{COVER}" fill="none" stroke="#05081a" stroke-opacity=".7" stroke-width=".8"/>
<path d="{COVER}" fill="none" stroke="#c8d2ff" stroke-opacity=".14" stroke-width=".6" transform="translate(.5 .7)" clip-path="url(#n-cover-clip)"/>

<!-- The light grey ring round the top half, with a bevel. -->
<path d="{RING_OUT} {RING_IN}" fill-rule="evenodd" fill="#05081a" opacity=".55" transform="translate(0 1.1)" filter="url(#n-blur)"/>
<path d="{RING_OUT} {RING_IN}" fill-rule="evenodd" fill="url(#n-silver)"/>
<g clip-path="url(#n-ring-clip)">
  <rect width="200" height="310" fill="url(#n-silver-sides)"/>
  <path d="{RING_OUT}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="1.4" transform="translate(.4 .9)"/>
  <path d="{RING_IN}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.2" transform="translate(-.3 -.8)"/>
  <path d="{RING_IN}" fill="none" stroke="#3a4150" stroke-opacity=".5" stroke-width="1.6" transform="translate(.3 1)"/>
</g>
<path d="{RING_OUT} {RING_IN}" fill-rule="evenodd" fill="none" stroke="#0a0e1e" stroke-opacity=".7" stroke-width=".6"/>

<!-- The earpiece: five holes in a groove. -->
<path d="M100,13 C104.5,22 104.6,62 100,75 C95.4,62 95.5,22 100,13 Z" fill="#141b33" opacity=".75"/>
<path d="M100,13 C104.5,22 104.6,62 100,75" fill="none" stroke="#9aa8d8" stroke-opacity=".25" stroke-width=".6"/>
{"".join(f'<ellipse cx="100" cy="{y}" rx="3.1" ry="1.65" fill="#04060c"/><path d="M97.2,{y+1:.1f} q2.8,1.4 5.6,0" fill="none" stroke="#a9b6e6" stroke-opacity=".35" stroke-width=".5"/>' for y in (19, 30.5, 42, 53.5, 65))}

<!-- The logo. -->
<rect x="67.5" y="85.5" width="65" height="14" rx="1.4" fill="url(#n-badge)" stroke="#000" stroke-width=".5"/>
<rect x="68.3" y="86.2" width="63.4" height="5" rx="1" fill="#fff" opacity=".06"/>
<text x="100" y="96.6" text-anchor="middle" textLength="53" lengthAdjust="spacingAndGlyphs"
  font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="10.4"
  fill="#eef0f2">NOKIA</text>

<!-- The display window: the screen itself is HTML on top of it. -->
<rect x="{L[0]-1.6}" y="{L[1]-1.6}" width="{L[2]-L[0]+3.2}" height="{L[3]-L[1]+3.2}" rx="11" fill="#03050c"/>
<rect x="{L[0]-1.6}" y="{L[1]-1.6}" width="{L[2]-L[0]+3.2}" height="{L[3]-L[1]+3.2}" rx="11" fill="none" stroke="#8d9bd0" stroke-opacity=".18" stroke-width=".6" transform="translate(0 .6)"/>

<!-- Backlight leaking round the keys, lit by the script. -->
<g class="n-backlight" filter="url(#n-blur-big)">
  <path d="{NAVI}" fill="url(#n-glow-fill)" transform="translate(100 251) scale(1.12 1.35) translate(-100 -251)"/>
  <path d="{rounded(C_KEY, 5)}" fill="#a8ff80" opacity=".8"/>
  <path d="{rounded(ROCKER, 6)}" fill="#a8ff80" opacity=".8"/>
</g>

<!-- Navi key, C key and the scroll rocker. -->
<g class="n-key" data-key="select">
  <path d="{NAVI}" fill="#04060d" opacity=".75" transform="translate(100 251) scale(1.06 1.16) translate(-100 -251)"/>
  <path class="n-drop" d="{NAVI}" transform="translate(.4 1.6)"/>
  <g class="n-cap">
    <path d="{NAVI}" fill="url(#n-navi)" stroke="#5f6670" stroke-width=".5"/>
    <path d="M66,248.5 C72,244.5 86,241.6 100,241.6 C114,241.6 128,244.5 134,248.5" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="1.2" stroke-linecap="round" filter="url(#n-blur)"/>
    <path d="M83,251.2 Q100,248.6 117,251.2" fill="none" stroke="#1f6fc0" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M83,251.2 Q100,248.6 117,251.2" fill="none" stroke="#5db8ff" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M86,250.4 Q100,248.2 114,250.4" fill="none" stroke="#c9ecff" stroke-width=".5" stroke-linecap="round" opacity=".8"/>
  </g>
</g>
<g class="n-key" data-key="back">
  <path d="{rounded(C_KEY, 5)}" fill="#04060d" opacity=".7" transform="translate(48 269) scale(1.09) translate(-48 -269)"/>
  <path class="n-drop" d="{rounded(C_KEY, 5)}" transform="translate(.4 1.6)"/>
  <g class="n-cap">
    <path d="{rounded(C_KEY, 5)}" fill="url(#n-soft-key)" stroke="#5f6670" stroke-width=".5"/>
    <path d="M33,255.6 L49,253.5" stroke="#fff" stroke-opacity=".9" stroke-width="1.3" stroke-linecap="round" filter="url(#n-blur)"/>
    <path class="n-ink-bold" d="M47.3,264.2 C44.2,263 41.4,265.2 41.6,268.2 C41.8,271.2 44.6,272.8 47.4,271.6"/>
  </g>
</g>
<g class="n-key" data-key="rocker">
  <path d="{rounded(ROCKER, 6)}" fill="#04060d" opacity=".7" transform="translate(142 274) scale(1.07) translate(-142 -274)"/>
  <path class="n-drop" d="{rounded(ROCKER, 6)}" transform="translate(.4 1.6)"/>
  <g class="n-cap">
    <path d="{rounded(ROCKER, 6)}" fill="url(#n-soft-key)" stroke="#5f6670" stroke-width=".5"/>
    <path d="M141,253.2 L163,255.2" stroke="#fff" stroke-opacity=".9" stroke-width="1.3" stroke-linecap="round" filter="url(#n-blur)"/>
    <path class="n-ink-bold" d="M152.5,257.6 L159.6,258.4 L159.2,264.8"/>
    <path class="n-ink-bold" d="M123.6,274.2 L124.2,281 L131,281.4"/>
  </g>
  <path class="n-hit" data-key="up" d="M136.8,250.6 L167.6,253.5 L171,268.8 L150,284 L124,262 Z"/>
  <path class="n-hit" data-key="down" d="M124,262 L150,284 L130.2,297.6 L111.2,280.8 Z"/>
</g>

<!-- The keypad. -->
{chr(10).join(key(*k) for k in KEYS)}

<!-- The microphone under the 5. -->
<circle cx="94.5" cy="366.5" r=".9" fill="#05070f"/><circle cx="105.5" cy="366.5" r=".9" fill="#05070f"/>
</svg>
'''
open(OUT, "w").write(svg)
print(len(svg), "bytes")
