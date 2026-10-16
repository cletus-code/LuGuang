# Lights Landing Coffee — 陆光咖啡

A static implementation of the light theme from **`Lights Coffee Roadmap.dc.html`**
(Claude Design project `2c8b7a5f`), option **2a** and its page set **3a–3d**.

No build step, no dependencies. Open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
```

## Pages

| File | Roadmap option | What it is |
| --- | --- | --- |
| `index.html` | 2a | Homepage — hero, this week's roasts, learn / café split |
| `coffee.html` | 3a | Shelf listing with origin / process / roast filters |
| `product.html` | 3b | Lot detail, `?id=<slug>` selects the lot |
| `brew.html` | 3c | Brew guide, `?m=<method>` selects the method |
| `cafe.html` | 3d | Address, hours, bar menu, cupping |

`assets/styles.css` holds the whole design system, `assets/data.js` the
catalogue and recipes, `assets/site.js` the page behaviour, and `assets/shop.js` the search/cart rules. `uploads/` are the
design's own images, unchanged.

## The design system

Everything in the mockup's inline styles is now a token or a class in
`assets/styles.css`.

Ground `#f8f5ef` paper · `#fffdf9` sheet · `#f2efe8` image well.
Ink `#2e2a26` headings · `#7d7469` body · `#867c6f` labels · `#e0d9cf` rules.
Accents `#c25539` actions · `#d4674c` links · `#c98a3c` lamp · `#8a9478` brew icons.
Type Helvetica Neue at weights 200–400.

The masthead carries the Lu Guang logomark, `uploads/logo.svg` — the paths
lifted straight out of `陆光咖啡logo_.pdf`, so it stays vector at 2.4 KB. It is
painted as a CSS mask rather than an `<img>` so it takes the brand ink and
can shift to coral on hover. The Sacramento wordmark and the amber dot it sat
beside are gone; the footer still uses the word "Lights Landing" as plain text.

The signature is the **torn paper sheet**: `.sheet` carries the drop-shadow and
a `--z` stacking order, `.sheet__body` carries a mask that chews the bottom
edge (the masthead is chewed top and bottom, and rides up over the announce
bar by `--torn-height` so its notches show wood rather than page). Sheets are
stacked with a descending `--z` so each one casts its shadow onto the one
below, exactly as in the mockup.

The tear is two layers, from the same photographed strip. The **mask** is the
alpha of `uploads/torn-top.png` / `torn-bottom.png`, which cuts the sheet's
silhouette and keeps the fibres' partial transparency. A mask carries no
colour, so the **texture** comes from `torn-top-tex.png` / `torn-bottom-tex.png`
— the same strips in greyscale, normalised so flat paper reads as white and
ramped to nothing at the inner edge, multiplied over the sheet colour. That
restores the grain and the soft shadow just inside the tear without tinting
the sheet. Both layers are drawn once across the sheet, never tiled, so there
is no repeat.

The **masthead is different**: it has no fill and no mask at all. It simply
paints `uploads/torn-band.png` — the whole photographed strip, both torn lips
included — stretched to the bar. The bar is the photograph rather than a
coloured card wearing torn edges.

> **Contrast.** The strip's paper is neutral grey (218), so nav links in
> `--body` measure 3.27:1 against it, under the 4.5:1 AA floor. `--ink`
> measures 10.14:1 and `#5a5249` measures 5.46:1. Darken the masthead's link
> colour or lighten the strip before this ships.

### Photos beneath torn edges

Adjacent sheets overlap by the shared torn-edge height, so transparent notches
show the next section's photograph instead of a blank strip of page background.
Home and product photo columns start flush beneath the torn header; their text
keeps its own padding. On narrow screens Home leads with its photograph before
the introduction, keeping the same torn-paper-over-photo effect.

## Animated masthead logo

Hover over or focus the upper-left logo to unfold its fan. Panels begin 0.2
seconds apart and overlap for a fluid opening lasting one second. Their original
shapes stay rigid and reveal from behind clipping edges. Tapping on the homepage
replays it; tapping from another page goes home and plays it on arrival. Repeated
triggers during an opening do not restart it. Reduced Motion keeps it still;
without JavaScript the original logo and home link remain available.

Check: `node tools/check_fan_logo.js` covers continuous movement, rigid shapes,
attached edges, stagger, replay, home navigation and reduced motion.

## Photography

Every editorial photo and pack shot in `uploads/` is a real photograph of the
shop, from `~/Downloads/Luguang photos`. They were resized to fit their slot
(700px for cards, 900–1600px for heroes), saved as progressive JPEG at q80,
and **stripped of EXIF** — the originals carried camera and location metadata
that has no business on a public site. Roughly 1.4 MB for 22 images.

The one asset that is still stock is `American-Hard-Maple.webp`, the wood
texture behind the announce bar. It is a texture rather than a photo of the
shop, so nothing in the folder replaced it.

> **Licence check needed.** Those two PNGs are derived from a Pngtree asset
> (`pngtree-white-torn-paper-strips-with-cutout-edges`, image 16485356).
> Pngtree's free tier requires attribution and restricts commercial use, and
> this repo is public. Confirm the licence, add attribution, or swap the
> source image before trading on this site.

## Behaviour

The mockup is a picture; these are the parts that had to become real. Every
page renders in full from its own HTML — the script only enhances.

- **Search** in the header opens the coffee shelf’s labeled search field. Name, origin, region,
  process, roast, tasting notes and varietal match case/accent-insensitively. Search combines
  with the existing filters, keeps its query in the URL, and offers a clear action and empty state.
- **Product page** fills the 3b template from `data.js` for whichever `?id=` is
  requested; without one it stays on Sidama Dusk.
- **Brew tabs** swap the recipe in place and push a `?m=` URL, so guides are
  linkable and the back button works.
- **Size / grind** swatches are real single-select rows.
- **Cart** opens `cart.html`: saved coffee, 250g size, grind, quantities, line totals and subtotal.
  Matching selections combine; different grinds stay separate. Update quantity or remove a line;
  changes persist in this browser and sync between tabs. Stored prices are never trusted: totals
  use the current catalogue. The older count-only `lights.cart` value has no item identities and
  is left untouched; actual selections use `lights.cart.items`. Storage failures are shown.
- **Available size:** the catalogue currently prices 250g only; unpriced 1kg is not offered.
- **Account** was removed from every header. Search and Cart are normal links on every page.
- **Checks:** `node tools/check_shop.js` verifies search, selections, storage and totals;
  `node tools/check_fan_logo.js` verifies the unchanged logo behavior.

Responsive down to 320px: grids drop to two columns at 1040 and one at 620, the
listing's filter sidebar becomes chip rows at 860, and every two-column band
stacks.

## Where the content comes from

Names, origins, processes, tasting notes, prices, the V60 recipe, the café menu
and all page copy are the design's own.

Written to fill the templates the design provides, and worth a review before
this goes anywhere real:

- **Per-lot specs and farm notes** for the five lots other than Sidama Dusk
  (`assets/data.js`) — the 3b template needs them and only Sidama Dusk's were
  designed.
- **French press recipe** (`assets/data.js`) — the 3c tab row names four
  methods and the design only specifies V60. Espresso and Iced use the numbers
  from 3b's "Brew it this way" cards.
- **Roast values** used by the listing's roast facet. Only House Daylight's
  roast is stated in the design ("Blend · Filter"); Nariño Night is marked
  espresso, the rest filter.

## Not built

Checkout/payment collection, accounts, a sourcing page and a brew-guide index remain outside
this build. The cart explicitly says checkout is not yet available; no order or payment is
submitted. Connect a payment service before enabling purchase completion.

`uploads/coffee-berries-1296x728-header.avif` ships with the assets but belongs
to the roadmap's dark exploration (turn 1) and is unused here.
