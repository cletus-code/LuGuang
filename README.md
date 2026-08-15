# Lights Coffee — 陆光咖啡

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
catalogue and recipes, `assets/site.js` the behaviour. `uploads/` are the
design's own images, unchanged.

## The design system

Everything in the mockup's inline styles is now a token or a class in
`assets/styles.css`.

Ground `#f8f5ef` paper · `#fffdf9` sheet · `#f2efe8` image well.
Ink `#2e2a26` headings · `#7d7469` body · `#867c6f` labels · `#e0d9cf` rules.
Accents `#c25539` actions · `#d4674c` links · `#c98a3c` lamp · `#8a9478` brew icons.
Type Helvetica Neue at weights 200–400, Sacramento for the wordmark.

The signature is the **torn paper sheet**: `.sheet` carries the drop-shadow and
a `--z` stacking order, `.sheet__body` carries an SVG mask that chews the
bottom edge (the masthead is chewed top and bottom). Sheets are stacked with a
descending `--z` so each one casts its shadow onto the one below, exactly as in
the mockup.

## Behaviour

The mockup is a picture; these are the parts that had to become real. Every
page renders in full from its own HTML — the script only enhances.

- **Filters** hide and show cards and update the lot count, with an empty state.
- **Product page** fills the 3b template from `data.js` for whichever `?id=` is
  requested; without one it stays on Sidama Dusk.
- **Brew tabs** swap the recipe in place and push a `?m=` URL, so guides are
  linkable and the back button works.
- **Size / grind** swatches are real single-select rows.
- **Cart** is a counter in `localStorage` — enough to make "Add to cart" and the
  masthead tally honest. There is no cart page; the roadmap doesn't design one.

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

The roadmap doesn't design an About page, search, accounts, checkout, a
sourcing page, or a brew-guide index. Those words appear in the masthead and
footer as plain text rather than links, so nothing in the navigation is a dead
end. Cart, search and account are likewise unlinked.

`uploads/coffee-berries-1296x728-header.avif` ships with the assets but belongs
to the roadmap's dark exploration (turn 1) and is unused here.
