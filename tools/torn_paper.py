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

  torn-bottom      2400x64   sheet edge, paper above, tear at the bottom
  torn-top         2400x64   the same, paper below, tear at the top
  torn-bottom-tex  2400x64   greyscale relief for torn-bottom, to multiply
  torn-top-tex     2400x64   greyscale relief for torn-top, to multiply
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


def paper_grain(rng, w, h, ribs=True):
    """Paper texture, roughly unit std: the ribbing of laid paper (fine
    vertical lines that come and go), a network of short fibres, the cloudy
    flocs of pulp, fine speckle and broad mottling."""
    out = np.zeros((h, w))
    if ribs:
        x = np.arange(w)[None, :]
        y = np.arange(h)[:, None]
        wobble = 1.6 * noise2d(rng, w, h, 400, 60)        # lines aren't ruled
        phase = 2 * np.pi * (x + wobble) / 6.5
        rib = np.sign(np.sin(phase)) * np.abs(np.sin(phase)) ** 0.6
        rib *= np.clip(0.55 + 0.45 * noise2d(rng, w, h, 300, 400), 0, 1)
        rib *= 0.85 + 0.15 * noise1d(rng, h, 12)[:, None] * np.ones((1, w))
        out += 0.9 * blur(rib, 0.6, 0)
    fib = Image.new('L', (w, h), 128)
    draw = ImageDraw.Draw(fib)
    for _ in range(int(w * h / 45)):
        x0, y0 = rng.uniform(0, w), rng.uniform(0, h)
        ang = rng.uniform(0, np.pi)
        length = rng.uniform(4, 16)
        bend = rng.normal(0, 0.3)
        pts = [(x0, y0)]
        for _seg in range(3):
            ang += bend
            pts.append((pts[-1][0] + np.cos(ang) * length / 3,
                        pts[-1][1] + np.sin(ang) * length / 3))
        draw.line(pts, fill=int(128 + rng.choice([-1, 1]) * rng.uniform(10, 40)))
    fibres = blur(np.asarray(fib, dtype=np.float64) - 128, 0.45)
    fibres /= fibres.std() + 1e-6
    fine = blur(rng.standard_normal((h, w)), 0.5)
    fine /= fine.std()
    out += (0.45 * fibres + 0.35 * fine
            + 0.35 * noise2d(rng, w, h, 7, 7)               # flocs
            + 0.3 * noise2d(rng, w, h, 160, 110))           # mottling
    return out


# ------------------------------------------------------------- the edge --

def torn_edge(rng, w, h, flipped=False):
    """One torn edge, paper above and the tear near the bottom. Returns
    final-resolution float maps:
      alpha  coverage, 1 = paper
      shade  relief lighting, 1 = flat paper; above 1 where lit
      lip    0..1, where the white torn core is exposed
      inner  0..1 envelope, 0 on the paper's inner (top) row, 1 near the tear
    flipped=True lights it from below, for an edge that will be turned over
    to become a top edge -- after the flip the light comes from above again.

    The lip is modelled as a height field: the surface layer lifts a little
    where it tore, drops onto the exposed core, and the core rolls up into
    two or three soft ridges before falling away to a fibrous fringe.
    """
    W, H = w * SS, h * SS
    n = W

    # Tear line: long wander, then progressively sharper, angular jags.
    outer = (h * 0.62
             + 12.0 * noise1d(rng, n, 380 * SS)
             + 6.0 * noise1d(rng, n, 100 * SS)
             + 2.5 * noise1d(rng, n, 20 * SS, smooth=False)
             + 1.0 * noise1d(rng, n, 5 * SS, smooth=False))
    lo, hi = h * 0.38, h - 6
    c, r = (lo + hi) / 2, (hi - lo) / 2
    outer = c + r * np.tanh((outer - c) / r)   # soft limits, no flat runs

    # Lip width: the surface layer tore back further than the core. Wide and
    # rolling in places, a narrow clean tear in others.
    lip_w = (15.0 + 10.0 * noise1d(rng, n, 160 * SS)
             + 4.0 * noise1d(rng, n, 34 * SS)
             + 1.5 * noise1d(rng, n, 6 * SS, smooth=False))
    lip_w = np.clip(lip_w, 3.0, np.minimum(34, outer - 6))

    y = (np.arange(H)[:, None] + 0.5) / SS     # final-pixel units
    d = outer[None, :] - y                     # depth into the paper
    ds = d - lip_w[None, :]                    # depth into the surface layer
    t = np.clip(-ds / lip_w[None, :], 0, 1)    # 0 at surface tear .. 1 outer
    in_lip = (ds <= 0) & (d > 0)

    # ---- coverage: paper, a fuzz of fibres past the edge, loose strands.
    body = (d > 0).astype(np.float32)
    fuzz_w = np.clip(1.4 + 1.2 * noise1d(rng, n, 40 * SS), 0.4, None)
    strands = noise2d(rng, W, H, 0.45 * SS, 2.2 * SS)   # run outward
    fall = np.clip(1 + d / fuzz_w[None, :], 0, 1) ** 1.6
    fuzz = fall * np.clip(0.35 + 0.45 * strands, 0, 1) * (d <= 0)

    fib = Image.new('L', (W, H), 0)
    draw = ImageDraw.Draw(fib)
    slope = np.gradient(outer)
    for _ in range(int(w * 1.4)):
        x0 = rng.uniform(0, W - 1)
        xi = int(x0)
        if rng.uniform() > 0.3 + lip_w[xi] / 30:
            continue
        y0 = (outer[xi] - rng.uniform(0, 1.5)) * SS
        ang = np.pi / 2 + np.arctan(slope[xi]) + rng.normal(0, 0.6)
        long_one = rng.uniform() < 0.04
        length = min(0.5 + rng.exponential(3.5 if long_one else 1.3),
                     9 if long_one else 5) * SS
        pts = [(x0, y0)]
        for _seg in range(3):
            ang += rng.normal(0, 0.3)
            pts.append((pts[-1][0] + np.cos(ang) * length / 3,
                        pts[-1][1] + np.sin(ang) * length / 3))
        draw.line(pts, fill=int(rng.uniform(50, 170)), width=1)
    fib = np.asarray(fib, dtype=np.float32) / 255

    alpha = np.maximum(np.maximum(body, fuzz), fib)
    rim = np.clip(d / 1.2, 0, 1)               # last pixel is thin fibre
    alpha = np.where(d > 0, np.minimum(alpha, 0.55 + 0.45 * rim
                                       + 0.15 * strands * (1 - rim)), alpha)
    alpha = np.clip(alpha, 0, 1)

    # ---- relief, in pixels of height.
    def along(wl, amp=1.0, base=0.0):
        return (base + amp * noise1d(rng, n, wl * SS))[None, :]

    lift = along(70, 0.5, 1.0) * np.exp(-np.clip(ds, 0, None) / 4) * (ds > 0)
    ridges = np.zeros((H, W))
    for centre, width in ((0.22, 0.16), (0.55, 0.2), (0.82, 0.12)):
        # Each crease wanders across the lip and fades in and out, so they
        # never run as parallel ribbons.
        c_k = centre + along(55, 0.16) + along(14, 0.05)
        a_k = 0.16 * lip_w[None, :] * np.clip(along(45, 0.8, 0.55), 0, None)
        w_k = width * along(70, 0.35, 1.0)
        ridges += a_k * np.exp(-((t - c_k) / w_k) ** 2)
    streaks = noise2d(rng, W, H, 1.2 * SS, 6 * SS)     # fibres run outward
    clouds = noise2d(rng, W, H, 4 * SS, 4 * SS)
    core = (-0.9 + ridges + 0.08 * streaks + 0.15 * clouds
            - 1.5 * np.clip((t - 0.85) / 0.15, 0, 1) ** 2)
    z = np.where(in_lip, core, 0.0) + 1.2 * lift
    z = np.where(d <= 0, -2.0, z)
    z += 0.12 * blur(rng.standard_normal((H, W)), 0.6 * SS)
    z = blur(z, 1.6 * SS)

    gy, gx = np.gradient(z)
    gy, gx = gy * SS, gx * SS                  # height per final pixel
    ly = -0.32 if flipped else 0.32            # light from above-left
    light = 1 + ly * gy + 0.1 * gx
    # Ambient occlusion: creases between ridges, and the step under the
    # torn surface, sit in soft shade.
    ao = 0.07 * np.exp(-((ds + 0.8) / 1.6) ** 2) * (d > 0)
    ao += 0.05 * np.clip(-blur(z, 2.5 * SS) + z, None, 0) * -1 * in_lip
    # The surface just inside the tear sits a touch in shade, which is what
    # makes the core read white even under a multiply that can only darken.
    curl = 0.07 * np.exp(-np.clip(ds, 0, None) / 10) * (ds > 0)
    # Soft paper, not foil: the roll's shadows stay grey.
    shade = np.clip(light - ao - curl, 0.84, 1.12)

    lip = in_lip.astype(np.float64)
    lip = blur(lip, 0.4 * SS)

    # Exactly flat for the first 2px, so the strip meets the sheet with no line.
    reach = np.maximum(np.minimum(outer - lip_w, h) * 0.8 - 2, 1)
    inner = np.clip((y - 2) / reach[None, :], 0, 1)
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
        grain = paper_grain(rng, w, h, ribs=False)

        # Texture for sheets: multiply-only (a multiply can darken, not
        # lighten), pure white on the inner row so it meets the flat sheet
        # invisibly.
        tex = np.minimum(shade, 1) * (1 - 0.03 * grain * (1 - lip))
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
    light = 1 + 0.025 * noise2d(rng, w, h, 700, 500)   # uneven lighting
    base = 218 / 255                           # neutral grey paper
    core = 246 / 255                           # exposed core is whiter
    colour = base * (1 + 0.022 * grain)
    colour = colour * (1 - lip) + core * (1 + 0.01 * grain) * lip
    colour = colour * shade * light
    save_rgba(os.path.join(out, f'{name}-band'), colour, alpha)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[0])
    ap.add_argument('--seed', type=int, default=2026)
    ap.add_argument('--width', type=int, default=2400)
    ap.add_argument('--edge-height', type=int, default=64)
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
