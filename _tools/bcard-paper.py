# Makes the worn paper of the business card on About (_includes/social.html):
# assets/img/bcard-paper.jpg is the colour of the paper (aged cream, grime at
# the edges and along the creases), assets/img/bcard-light.jpg is the light on
# the crumpled and flattened sheet, laid over the card and its print with
# multiply, and assets/img/bcard-shape.png is the worn outline: soft corners,
# frayed edges, a nick or two. The creases are a Voronoi network on three
# scales, so they run in straight segments between flat facets, as on paper.
# Run with numpy, scipy and Pillow: python3 _tools/bcard-paper.py
import numpy as np
from pathlib import Path
from PIL import Image
from scipy.ndimage import gaussian_filter
from scipy.spatial import cKDTree

W, H = 1050, 600
OUT = Path(__file__).resolve().parent.parent / "assets" / "img"
rng = np.random.default_rng(11)
yy, xx = np.mgrid[0:H, 0:W].astype(float)
pts = np.c_[xx.ravel(), yy.ravel()]


def smooth(sigma, amp=1.0):
    f = gaussian_filter(rng.standard_normal((H, W)), sigma, mode="wrap")
    return f / f.std() * amp


def creases(n, warp=0):
    """A Voronoi network of n cells: the distance to the nearest crease
    and a random tilt of each cell, the facet between the creases."""
    seeds = rng.uniform([-40, -40], [W + 40, H + 40], (n, 2))
    wx, wy = (smooth(40, warp), smooth(40, warp)) if warp else (0, 0)
    d, i = cKDTree(seeds).query(np.c_[(xx + wx).ravel(), (yy + wy).ravel()], k=2)
    tilt = rng.normal(0, 1, (n, 2))[i[:, 0]].reshape(H, W, 2)
    return (d[:, 1] - d[:, 0]).reshape(H, W) / 2, tilt


# Height: valleys along the creases, big folds first, then smaller ones;
# the smaller networks are bent a little, so not every crease is ruler-straight.
# Each facet also leans its own way, so the two sides of a crease catch
# the light differently, as on a crumpled sheet smoothed out by hand.
height = np.zeros((H, W))
slope = np.zeros((H, W, 2))
for n, k, lean, warp in ((14, 1.0, 0.06, 0), (60, 0.5, 0.03, 6), (260, 0.2, 0.012, 4)):
    d, tilt = creases(n, warp)
    height += k * d
    slope += lean * tilt
height = np.sqrt(height + 4)  # facets flatten out, creases stay sharp
height += smooth(3, 0.04) + smooth(0.7, 0.015)  # fibres
height = gaussian_filter(height, 0.7)
slope = gaussian_filter(slope, (1.2, 1.2, 0))

# Light from the upper left, a bit low, so the creases show.
gy, gx = np.gradient(height)
k = 0.7
n = np.dstack([-gx * k - slope[..., 0], -gy * k - slope[..., 1], np.ones_like(height)])
n /= np.linalg.norm(n, axis=2, keepdims=True)
L = np.array([-0.55, -0.6, 0.58])
L /= np.linalg.norm(L)
diffuse = n @ L
diffuse /= np.percentile(diffuse, 70)  # most of the card is in full light
cavity = gaussian_filter(height, 6) - height  # deep creases get less light
light = np.clip(diffuse - 0.35 * np.clip(cavity, 0, None), 0.5, 1.0)

# The outline: soft corners of different radii, the edge chewed by fibres,
# and a couple of nicks.
def rounded_rect_dist(r):
    qx = np.maximum(np.abs(xx - W / 2) - (W / 2 - r), 0)
    qy = np.maximum(np.abs(yy - H / 2) - (H / 2 - r), 0)
    inside = np.minimum(np.maximum(np.abs(xx - W / 2) - (W / 2 - r), np.abs(yy - H / 2) - (H / 2 - r)), 0)
    return r - (np.hypot(qx, qy) + inside)  # > 0 inside

radius = np.full((H, W), 10.0)
for cx, cy, r in ((0, 0, 16), (W, 0, 7), (0, H, 9), (W, H, 22)):
    radius += (r - 10) * np.exp(-((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * 60 ** 2))
edge = rounded_rect_dist(radius) - 3
edge += smooth(1.5, 1.1) + smooth(8, 1.8)
for cx, cy, r in ((W * 0.31, -3, 11), (W + 2, H * 0.62, 8), (W * 0.77, H + 2, 7)):
    edge = np.minimum(edge, np.hypot(xx - cx, yy - cy) - r - 3)
shape = np.clip((edge + 0.6) / 1.4, 0, 1)

# The colour: aged cream, mottled; handled edges and rubbed crease tops grey.
from_edge = np.clip(edge, 0, None)
paper = np.array([248, 243, 230], float) * np.ones((H, W, 3))
paper *= (1 + smooth(80, 0.012) + smooth(10, 0.006))[..., None]
grime = 0.2 * np.exp(-from_edge / 8) + 0.08 * np.exp(-from_edge / 40)
grime *= np.clip(1 + smooth(4, 0.5), 0.2, 2)
ridge = np.clip(-cavity, 0, None)
grime += 0.05 * np.clip(ridge / (ridge.max() * 0.3), 0, 1) * np.clip(1 + smooth(5, 0.6), 0, 2)
dirt = np.array([150, 140, 120], float)
paper = paper * (1 - grime[..., None]) + dirt * grime[..., None]
fuzz = np.exp(-from_edge / 3) * np.clip(smooth(1, 1), 0, 1) * 0.6  # torn fibres show white
paper = paper * (1 - fuzz[..., None]) + 252 * fuzz[..., None]

OUT.mkdir(parents=True, exist_ok=True)
Image.fromarray(np.clip(paper, 0, 255).astype(np.uint8)).save(OUT / "bcard-paper.jpg", quality=86, optimize=True)
Image.fromarray(np.clip(light * 255, 0, 255).astype(np.uint8), ).save(OUT / "bcard-light.jpg", quality=86, optimize=True)
rgba = np.zeros((H, W, 4), np.uint8)
rgba[..., 3] = (shape * 255).astype(np.uint8)
Image.fromarray(rgba).save(OUT / "bcard-shape.png", optimize=True)
