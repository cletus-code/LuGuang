#!/usr/bin/env python3
"""Prepare the generated eggshell master: python3 tools/prepare_torn_paper.py.

Only numpy and Pillow are needed. The original procedural alternative remains
in torn_paper.py. Prompt and provenance are in torn-paper-generation.json.
"""
from pathlib import Path
import argparse

import numpy as np
from PIL import Image


def save(folder, name, rgb, alpha, lossless=False):
    rgba = np.dstack((np.clip(rgb, 0, 255).astype('uint8'), alpha))
    image = Image.fromarray(rgba)
    image.save(folder / (name + '.png'), optimize=True)
    image.save(folder / (name + '.webp'), lossless=lossless, quality=90,
               alpha_quality=100, method=6, exact=True)


def main():
    root = Path(__file__).resolve().parent.parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', type=Path, default=root / 'uploads')
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    source = Image.open(root / 'tools/torn-paper-source.png').convert('RGBA')
    raw = np.array(source)
    solid = raw[..., 3] > 180
    first = solid.argmax(axis=0)
    last = len(raw) - 1 - solid[::-1].argmax(axis=0)
    # The generated paper body is slightly translucent; seal only its interior.
    y = np.arange(len(raw))[:, None]
    raw[..., 3] = np.where((y >= first) & (y <= last), 255, raw[..., 3])
    raw[..., 3][raw[..., 3] < 12] = 0
    # Crop vertical blank space only. The strip spans the width without repeats.
    top, bottom = max(0, first.min() - 12), min(len(raw), last.max() + 13)
    raw = raw[top:bottom]
    alpha = np.array(Image.fromarray(raw[..., 3]).resize((2400, 260), Image.Resampling.LANCZOS))
    # Neutralise generated fringe colour noise, retaining its light and relief.
    grey = np.array(Image.fromarray(raw[..., :3]).convert('L').resize(
        (2400, 260), Image.Resampling.LANCZOS)).astype(float)
    body = np.median(grey[90:170])
    core = np.clip((grey - body) / max(250 - body, 1), 0, 1)[..., None]
    rgb = np.array([243, 237, 217]) + (grey - body)[..., None]
    rgb += core * np.array([0, 5, 15])
    rgb = np.clip(rgb, 210, 255)
    rgb[alpha == 0] = [243, 237, 217]
    save(args.out, 'torn-band', rgb, alpha)
    white = np.full((64, 2400, 3), 255, dtype='uint8')
    for side, section in [('bottom', slice(-64, None)), ('top', slice(0, 64))]:
        edge_alpha = alpha[section].copy()
        inner = slice(0, 2) if side == 'bottom' else slice(-2, None)
        edge_alpha[inner] = 255
        # Relief can only darken the section; the lip stays the section colour.
        shade = np.clip(250 - grey[section], 0, 40)
        fade = np.clip((np.arange(64) - 8) / 18, 0, 1)
        if side == 'top':
            fade = fade[::-1]
        texture = np.repeat((255 - shade * fade[:, None])[..., None], 3, axis=2)
        texture[inner] = 255
        texture[edge_alpha == 0] = 255
        save(args.out, 'torn-' + side, white, edge_alpha, lossless=True)
        save(args.out, 'torn-' + side + '-tex', texture, edge_alpha)


if __name__ == '__main__':
    main()
