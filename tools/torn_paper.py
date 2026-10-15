#!/usr/bin/env python3
"""Generate the site's torn-paper assets from scratch.

Everything is procedural -- a fractal tear line, a fibrous lip where the
paper's core is exposed, hair-like fibres past the edge, paper grain and
relief lighting -- so the files are original work with no stock licence.

Requires only numpy and Pillow:

    python3 tools/torn_paper.py                    # writes into uploads/
    python3 tools/torn_paper.py --seed 7 --out /tmp/try

Outputs, each as .webp (what the site loads) and .png (lossless master, for
design tools and site builders). 2400 px wide: the 1200 px page at 2x.

  torn-bottom      2400x52   sheet edge, paper above, tear at the bottom
  torn-top         2400x52   the same, paper below, tear at the top
  torn-bottom-tex  2400x52   greyscale relief for torn-bottom, to multiply
  torn-top-tex     2400x52   greyscale relief for torn-top, to multiply
  torn-band        2400x260  a whole grey paper strip, both edges torn

All are straight alpha on a transparent background. Every pixel -- fully
transparent ones and the half-transparent fibres included -- carries paper
colour rather than black, so scaling, CSS masks and design tools never pull a
dark fringe in at the edge. The WebPs are written in exact mode for the same
reason (by default the encoder may blacken pixels it thinks nobody sees).
torn-top / torn-bottom are white paper and work as an <img>, a background, or
a CSS mask-image (which reads the alpha).
"""

import argparse
import os

import numpy as np
from PIL import Image, ImageDraw

SS = 3  # supersampling factor; everything is drawn at 3x and box-filtered


# ----------------------------------------------------------------- noise --

def blur(a, sx, sy=None):
    """Separable Gaussian blur, sigma in pixels, edge-clamped. numpy only."""
    sy = sx if sy is None else sy
    out = a
    for axis, s in ((1, sx), (0, sy)):
        if s <= 0:
            continue
        r = int(np.ceil(3 * s))
        k = np.exp(-0.5 * (np.arange(-r, r + 1) / s) ** 2)
        k /= k.sum()
        pad = [(0, 0), (0, 0)]
        pad[axis] = (r, r)
        p = np.pad(out, pad, mode='edge')
        acc = np.zeros_like(out)
        n = out.shape[axis]
        for i, w in enumerate(k):
            acc += w * (p[:, i:i + n] if axis == 1 else p[i:i + n, :])
        out = acc
    return out


def noise1d(rng, n, wavelength, smooth=True):
    """Value noise along one axis, in [-1, 1]. Cubic (smooth) or linear
    (angular, for the small jags of a real tear)."""
    k = int(np.ceil(n / wavelength)) + 4
    v = rng.uniform(-1, 1, k)
    x = np.arange(n) / wavelength + 1
    i = np.floor(x).astype(int)
    t = x - i
    if not smooth:
        return v[i] * (1 - t) + v[i + 1] * t
    p0, p1, p2, p3 = v[i - 1], v[i], v[i + 1], v[i + 2]   # Catmull-Rom
    return 0.5 * (2 * p1 + (-p0 + p2) * t +
                  (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
                  (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3)


def noise2d(rng, w, h, cx, cy):
    """Smooth 2D noise with feature size cx x cy pixels, unit std."""
    gw, gh = int(np.ceil(w / cx)) + 3, int(np.ceil(h / cy)) + 3
    g = Image.fromarray(rng.standard_normal((gh, gw)).astype('float32'), 'F')
    a = np.array(g.resize((int(gw * cx), int(gh * cy)), Image.BICUBIC))
    a = a[int(cy):int(cy) + h, int(cx):int(cx) + w]
    return (a - a.mean()) / (a.std() + 1e-6)


def downsample(a, f=SS):
    h, w = a.shape[0] // f, a.shape[1] // f
    return a[:h * f, :w * f].reshape(h, f, w, f).mean(axis=(1, 3))


def paper_grain(rng, w, h):
    """Paper 'formation': fine speckle, the cloudy flocs of pulp, broad
    mottling and a hint of short fibres -- combined to roughly unit std."""
    fine = blur(rng.standard_normal((h, w)), 0.5)
    fine /= fine.std()
    flocs = noise2d(rng, w, h, 7, 7)
    mottle = noise2d(rng, w, h, 160, 110)
    fibres = noise2d(rng, w, h, 3.5, 1.4)
    return 0.55 * fine + 0.45 * flocs + 0.25 * mottle + 0.2 * fibres


# ------------------------------------------------------------- the edge --

def torn_edge(rng, w, h, flipped=False):
    """One torn edge, paper above and the tear near the bottom. Returns
    final-resolution float maps:
      alpha  coverage, 1 = paper
      shade  multiplicative relief (1 = flat paper); may exceed 1 where lit
      lip    0..1, where the white fibrous core is exposed
      inner  0..1 envelope, 0 on the paper's inner (top) row, 1 near the tear
    flipped=True lights it from below, for an edge that will be turned over
    to become a top edge -- after the flip the light comes from above again.
    """
    W, H = w * SS, h * SS

    # Tear line: long wander, then progressively sharper, angular jags.
    n = W
    outer = (h * 0.55
             + 13.0 * noise1d(rng, n, 400 * SS)
             + 5.0 * noise1d(rng, n, 110 * SS)
             + 2.4 * noise1d(rng, n, 22 * SS, smooth=False)
             + 0.9 * noise1d(rng, n, 5 * SS, smooth=False))
    # Soft limits, so a deep wander rounds off instead of running flat.
    lo, hi = 10, h - 6
    c, r = (lo + hi) / 2, (hi - lo) / 2
    outer = c + r * np.tanh((outer - c) / r)

    # Lip width: where the surface layer tore back further than the core.
    # Its inner line is jagged in its own right, wide in places and zero
    # where the tear was clean.
    lip_w = (5.5 + 6.5 * noise1d(rng, n, 120 * SS)
             + 2.5 * noise1d(rng, n, 18 * SS, smooth=False)
             + 1.0 * noise1d(rng, n, 5 * SS, smooth=False))
    lip_w = np.clip(lip_w, 0, np.minimum(16, outer - 7))

    y = (np.arange(H)[:, None] + 0.5) / SS     # final-pixel units
    d = outer[None, :] - y                     # depth into the paper
    ds = d - lip_w[None, :]                    # depth into the surface layer

    # ---- coverage: paper body, a fine fuzz of fibres just past the edge,
    # and a few loose strands.
    body = (d > 0).astype(np.float32)

    fuzz_w = np.clip(1.3 + 1.1 * noise1d(rng, n, 40 * SS), 0.4, None)
    strands = noise2d(rng, W, H, 0.45 * SS, 2.2 * SS)   # run outward
    fall = np.clip(1 + d / fuzz_w[None, :], 0, 1) ** 1.6
    fuzz = fall * np.clip(0.35 + 0.45 * strands, 0, 1) * (d <= 0)

    fib = Image.new('L', (W, H), 0)
    draw = ImageDraw.Draw(fib)
    slope = np.gradient(outer)                 # per supersampled px
    for _ in range(int(w * 1.4)):
        x0 = rng.uniform(0, W - 1)
        xi = int(x0)
        if rng.uniform() > 0.35 + lip_w[xi] / 12:  # fluffier where lip is wide
            continue
        y0 = (outer[xi] - rng.uniform(0, 1.5)) * SS
        ang = np.pi / 2 + np.arctan(slope[xi]) + rng.normal(0, 0.6)
        long_one = rng.uniform() < 0.03
        length = min(0.5 + rng.exponential(3.5 if long_one else 1.3),
                     9 if long_one else 5) * SS
        pts = [(x0, y0)]
        for _seg in range(3):
            ang += rng.normal(0, 0.3)
            px, py = pts[-1]
            pts.append((px + np.cos(ang) * length / 3,
                        py + np.sin(ang) * length / 3))
        draw.line(pts, fill=int(rng.uniform(50, 170)), width=1)
    fib = np.asarray(fib, dtype=np.float32) / 255

    alpha = np.maximum(np.maximum(body, fuzz), fib)
    # The outermost pixel of paper is thin, translucent fibre, not a cut.
    rim = np.clip(d / 1.2, 0, 1)
    alpha = np.where(d > 0, np.minimum(alpha, 0.55 + 0.45 * rim
                                       + 0.15 * strands * (1 - rim)), alpha)
    alpha = np.clip(alpha, 0, 1)

    # ---- relief: surface sits above the exposed core, core is fibrous.
    lip = np.clip((-ds + 0.4) / 0.8, 0, 1) * (d > -0.5)
    streaks = noise2d(rng, W, H, 1.2 * SS, 5 * SS)    # fibres run outward
    clouds = noise2d(rng, W, H, 3 * SS, 3 * SS)       # fluffed-up core
    z = (1.0 - 0.45 * lip                              # step down onto core
         + 0.10 * lip * streaks + 0.12 * lip * clouds
         - 0.35 * np.clip((0.9 - d) / 0.9, 0, 1) * lip  # thin rim falls away
         + 0.03 * blur(rng.standard_normal((H, W)), 0.7 * SS))
    z = blur(z, 0.7 * SS)
    gy, gx = np.gradient(z)
    gy, gx = gy * SS, gx * SS                  # per final pixel
    # Light from the upper left: slopes that rise toward it are lit.
    light = 1 + (-0.45 if flipped else 0.45) * gy + 0.2 * gx
    # A soft contact shadow just under the step, and lip slightly greyer
    # where it is thin and translucent.
    contact = 0.07 * np.exp(-((ds + 1.2) / 1.3) ** 2) * (d > 0)
    # The surface just inside the tear lifts and curls a little, so it sits
    # slightly in shade -- which is what makes the core beside it read white
    # even under a multiply that can only darken.
    curl = 0.07 * np.exp(-np.clip(ds, 0, None) / 7) * (ds > 0)
    curl *= 0.6 + 0.4 * noise1d(rng, n, 60 * SS)[None, :]
    shade = light - contact - curl

    inner = np.clip(y / (np.minimum(outer - lip_w, h) * 0.85)[None, :], 0, 1)
    inner = inner * inner * (3 - 2 * inner)    # smoothstep

    return (downsample(alpha), downsample(shade),
            downsample(lip), downsample(inner))


# ---------------------------------------------------------------- output --

def save_rgba(stem, grey, alpha, lossless=False):
    """Straight alpha. Grey is defined on every pixel, transparent ones
    included, so nothing dark sits under the alpha. Writes stem.png (lossless
    greyscale + alpha master) and stem.webp (for the site: lossless for flat
    masks, high-quality lossy for grain, alpha always exact)."""
    g = np.clip(np.round(grey * 255), 0, 255).astype(np.uint8)
    a = np.clip(np.round(alpha * 255), 0, 255).astype(np.uint8)
    Image.fromarray(np.dstack([g, a]), 'LA').save(stem + '.png', optimize=True)
    rgba = Image.fromarray(np.dstack([g, g, g, a]), 'RGBA')
    if lossless:
        rgba.save(stem + '.webp', lossless=True, method=6, exact=True)
    else:
        rgba.save(stem + '.webp', quality=90, alpha_quality=100, method=6,
                  exact=True)


def edge_assets(rng, w, h, out, name):
    for flip, side in ((False, 'bottom'), (True, 'top')):
        alpha, shade, lip, inner = torn_edge(rng, w, h, flipped=flip)
        grain = paper_grain(rng, w, h)

        # Texture for sheets: multiply-only (a multiply can darken, not
        # lighten), pure white on the inner row so it meets the flat sheet
        # invisibly.
        tex = np.minimum(shade, 1) * (1 - 0.035 * grain * (1 - lip))
        tex = 1 - (1 - tex) * inner

        f = (lambda a: a[::-1]) if flip else (lambda a: a)
        save_rgba(os.path.join(out, f'{name}-{side}'),
                  np.ones_like(alpha), f(alpha), lossless=True)
        save_rgba(os.path.join(out, f'{name}-{side}-tex'), f(tex), f(alpha))


def band_asset(rng, w, h, edge_h, out, name):
    """A grey paper strip, torn top and bottom, with its own colour."""
    a_b, s_b, l_b, _ = torn_edge(rng, w, edge_h)
    a_t, s_t, l_t, _ = torn_edge(rng, w, edge_h, flipped=True)
    alpha = np.ones((h, w))
    shade = np.ones((h, w))
    lip = np.zeros((h, w))
    alpha[:edge_h], shade[:edge_h], lip[:edge_h] = a_t[::-1], s_t[::-1], l_t[::-1]
    alpha[-edge_h:], shade[-edge_h:], lip[-edge_h:] = a_b, s_b, l_b

    grain = paper_grain(rng, w, h)
    base = 218 / 255                           # neutral grey paper
    core = 247 / 255                           # exposed core is whiter
    colour = base * (1 + 0.016 * grain)
    colour = colour * (1 - lip) + core * (1 + 0.012 * grain) * lip
    colour = colour * shade
    save_rgba(os.path.join(out, f'{name}-band'), colour, alpha)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    ap.add_argument('--seed', type=int, default=2026)
    ap.add_argument('--width', type=int, default=2400)
    ap.add_argument('--edge-height', type=int, default=52)
    ap.add_argument('--band-height', type=int, default=260)
    ap.add_argument('--name', default='torn')
    ap.add_argument('--out', default=os.path.join(
        os.path.dirname(os.path.abspath(__file__)), '..', 'uploads'))
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    rng = np.random.default_rng(args.seed)
    edge_assets(rng, args.width, args.edge_height, args.out, args.name)
    band_asset(rng, args.width, args.band_height, args.edge_height,
               args.out, args.name)


if __name__ == '__main__':
    main()
