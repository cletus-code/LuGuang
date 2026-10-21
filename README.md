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

The tear is two layers, from the approved generated eggshell paper master. The **mask** is the
alpha of `uploads/torn-top.webp` / `torn-bottom.webp`, which cuts the sheet's
silhouette and keeps the fibres' partial transparency. A mask carries no
colour, so the **texture** comes from `torn-top-tex.webp` / `torn-bottom-tex.webp`
— the same strips in greyscale, normalised so flat paper reads as white and
ramped to nothing at the inner edge, multiplied over the sheet colour. That
restores the grain and the soft shadow just inside the tear without tinting
the sheet. Both layers are drawn once across the sheet, never tiled, so there
is no repeat.

The **masthead is different**: it has no fill or mask underneath. It paints the
approved warm eggshell `uploads/torn-band.webp`, including both transparent torn
lips, at 2400×260 pixels. This replaces the original 720×193 photographed PNG.
The page is at most 1200px wide, so the new artwork supplies 2× source resolution.
Navigation uses `--strip-ink` for readable contrast on the textured paper.

### Rebuilding the generated paper

The original generated master and prompt are saved in `tools/torn-paper-source.png`
and `tools/torn-paper-generation.json`. Rebuild with
`python3 tools/prepare_torn_paper.py`; validate with `python3 tools/check_torn_paper.py`
(Pillow and NumPy). All five PNG masters and matching WebP assets come from that
same master. Section edges are 2400×64 and use `--torn-height: 32px`; the shared
photo overlap follows that value automatically. The public site loads the WebP
set. Versioned asset references prevent a cached original from hiding this update.

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
  process, variety and lot match case/accent-insensitively. Search combines
  with the existing filters, keeps its query in the URL, and offers a clear action and empty state.
- **Product page** fills the 3b template from `data.js` for whichever `?id=` is
  requested; without one it shows the first coffee, ALO Main Station.
- **Brew tabs** swap the recipe in place and push a `?m=` URL, so guides are
  linkable and the back button works.
- **Ordering is closed for now.** "Add to cart" on a product page saves that coffee to the
  **wishlist** and opens `cart.html`, which says shopping is coming soon, lists the wishlist, and
  offers every other coffee with an "Add to wishlist" button. The header link reads
  "Wishlist · N". The wishlist is coffee ids only (`lights.wishlist` in this browser's storage),
  syncs between tabs, and says so when the browser refuses to save it. The old cart's
  `lights.cart.items` is left untouched. Each coffee comes in one size, shown on its page; the
  grind choice is gone until ordering opens.
- **Shelf filters** are Origin and Process. A coffee sold as more than one process (Bambito Estate)
  lists each in `data-process` and matches either.
- **Checks:** `node tools/check_shop.js` verifies the catalogue and its cheapest-first order,
  search, wishlist storage and the links on every page;
  `node tools/check_fan_logo.js` verifies the unchanged logo behavior.

Responsive down to 320px: grids drop to two columns at 1040 and one at 620, the
listing's filter sidebar becomes chip rows at 860, and every two-column band
stacks.

## Where the content comes from

**The coffees** (`assets/data.js`) are the five on sale, cheapest first: ALO Main
Station ($16 · 100g), Bambito Estate ($18 · 100g), Finca La Fresa ($26 · 100g),
Elida Estate ($39 · 75g) and Gato Grande ($49 · 75g). Prices and sizes are the
shop's. Names, origins, regions, varieties, processes and lot numbers are
transcribed from each bag's label. Their images, `uploads/label-*.jpg`, are the
label artwork cropped from the shop's listings until bag photos replace them;
to switch to a photo, change `image` and set `fit: 'cover'`.

Worth checking against the bags:

- **Blurbs and "From the farm" text** restate the labels in prose, including
  readings of the process codes: DRD as dried in a dark room, CFY as cold yeast
  fermentation, zero-fermentation washed as washed with no fermentation stage.
- **Finca La Fresa's lot** is #161 on the English label and #121 in the Chinese
  line; the site says #161.
- **Bambito Estate** is labelled Geisha / Yellow Catuai, washed / anaerobic
  natural, at one price ($18 · 100g).
- **No tasting notes** are given for any coffee yet.

The V60 recipe, the café menu and the rest of the page copy are the design's own.
Written to fill the design's templates, and worth a review:

- **French press recipe** (`assets/data.js`) — the 3c tab row names four
  methods and the design only specifies V60. Espresso and Iced use the numbers
  from 3b's "Brew it this way" cards.

## Not built

Checkout/payment collection, accounts, a sourcing page and a brew-guide index remain outside
this build. Ordering is closed: "Add to cart" only saves to the wishlist, and no order or
payment is submitted. Connect a payment service before enabling purchase completion.

`uploads/coffee-berries-1296x728-header.avif` ships with the assets but belongs
to the roadmap's dark exploration (turn 1) and is unused here.
