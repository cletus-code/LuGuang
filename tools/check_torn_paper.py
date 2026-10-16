#!/usr/bin/env python3
"""Check the torn-paper assets in uploads/ against what the site needs.

    python3 tools/check_torn_paper.py            # checks uploads/
    python3 tools/check_torn_paper.py some/dir

Exits non-zero and says why if any asset breaks a hard requirement. See
tools/TORN_PAPER_BRIEF.md for what each requirement is for.
"""

import os
import sys

import numpy as np
from PIL import Image

EDGE_W, BAND_W, BAND_H = 2400, 2400, 260
NAV_INK = (0x5a, 0x52, 0x49)          # masthead link colour, --strip-ink


def lum(rgb):
    c = np.asarray(rgb, dtype=float) / 255
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def main(folder):
    errors, notes = [], []

    def load(name, ext):
        path = os.path.join(folder, f'{name}.{ext}')
        if not os.path.exists(path):
            errors.append(f'missing {path}')
            return None
        return np.array(Image.open(path).convert('RGBA')).astype(int)

    edge_h = None
    for name in ['torn-bottom', 'torn-top', 'torn-bottom-tex', 'torn-top-tex',
                 'torn-band']:
        for ext in ['png', 'webp']:
            a = load(name, ext)
            if a is None:
                continue
            h, w = a.shape[:2]
            label = f'{name}.{ext}'
            size_kb = os.path.getsize(os.path.join(folder, label)) / 1024
            notes.append(f'{label:22} {w}x{h}  {size_kb:6.1f} KB')

            want_w = BAND_W if name == 'torn-band' else EDGE_W
            if w != want_w:
                errors.append(f'{label}: width {w}, expected {want_w}')
            if name == 'torn-band' and h != BAND_H:
                errors.append(f'{label}: height {h}, expected {BAND_H}')
            if name != 'torn-band':
                edge_h = edge_h or h
                if h != edge_h:
                    errors.append(f'{label}: height {h}, other edges are {edge_h}')

            alpha = a[..., 3]
            if alpha.min() == 255:
                errors.append(f'{label}: no transparency at all')
            # Nothing dark under the alpha -- the cause of black fringes.
            under = alpha < 255
            if under.any():
                darkest = a[under][:, :3].min()
                floor = 150 if name == 'torn-band' else 170
                if darkest < floor:
                    errors.append(f'{label}: RGB {darkest} under transparent '
                                  f'pixels (must stay paper-coloured, >= {floor})')

            # The inner side meets a flat sheet: fully opaque, and for the
            # multiply textures pure white, so there is no seam.
            if name != 'torn-band':
                inner = a[:2] if 'bottom' in name else a[-2:]
                if inner[..., 3].min() < 255:
                    errors.append(f'{label}: inner rows not fully opaque')
                if name.endswith('-tex'):
                    tol = 0 if ext == 'png' else 3
                    if inner[..., :3].min() < 255 - tol:
                        errors.append(f'{label}: inner rows not white '
                                      f'(min {inner[..., :3].min()})')
                else:
                    if a[..., :3].min() < 255:
                        notes.append(f'  note: {label} is not pure white paper')

            # Masthead links must stay readable on the strip.
            if name == 'torn-band':
                mid = a[h // 4: 3 * h // 4]
                p1 = np.percentile(lum(mid[..., :3]), 1)
                ratio = (p1 + .05) / (lum(NAV_INK) + .05)
                notes.append(f'  nav text contrast on darkest 1% of strip: {ratio:.2f}:1')
                if ratio < 4.5:
                    errors.append(f'{label}: nav text contrast {ratio:.2f}:1 < 4.5:1')

    site = sum(os.path.getsize(os.path.join(folder, f)) for f in
               ['torn-band.webp', 'torn-bottom.webp', 'torn-bottom-tex.webp']
               if os.path.exists(os.path.join(folder, f))) / 1024
    notes.append(f'site loads {site:.0f} KB of torn paper (budget 150 KB)')
    if site > 150:
        errors.append(f'site payload {site:.0f} KB over the 150 KB budget')
    if edge_h:
        notes.append(f'edge height {edge_h}px -> set --torn-height: '
                     f'{edge_h // 2}px in assets/styles.css')

    print('\n'.join(notes))
    if errors:
        print('\nFAIL\n  ' + '\n  '.join(errors))
        sys.exit(1)
    print('\nOK')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(
        os.path.dirname(os.path.abspath(__file__)), '..', 'uploads'))
