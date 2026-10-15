# Lights Landing Coffee — 陆光咖啡

A static implementation of the light theme from **`Lights Coffee Roadmap.dc.html`**
(Claude Design project `2c8b7a5f`), option **2a** and its page set **3a–3d**.

No build step, no dependencies, and no third-party requests (the Google Fonts
link went with the Sacramento wordmark — it is blocked in mainland China and
was holding up first paint). Open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
```

## Deploying to lightslanding.shop

The repo is ready for GitHub Pages as it stands: `CNAME` names the domain,
`.nojekyll` serves the folder as-is, and `404.html` uses root-relative paths so
it renders at any depth.

1. **GitHub** → repo *Settings → Pages* → *Deploy from a branch*, `main`, `/ (root)`.
2. **DNS** at the registrar for `lightslanding.shop`:
   - `A` records on the apex `@` → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - `CNAME` on `www` → `cletus-code.github.io`
3. Back in *Settings → Pages*, wait for the DNS check, then tick
   **Enforce HTTPS**.

Any static host works the same way (Netlify, Cloudflare Pages, Vercel): point
it at the repo root with no build command. Canonical URLs, Open Graph tags,
`sitemap.xml` and `robots.txt` all assume `https://lightslanding.shop/`.

## Pages

| File | Roadmap option | What it is |
| --- | --- | --- |
| `index.html` | 2a | Homepage — hero, this week's roasts, learn / café split |
| `coffee.html` | 3a | Shelf listing with origin / process / roast filters |
| `product.html` | 3b | Lot detail, `?id=<slug>` selects the lot |
| `brew.html` | 3c | Brew guide, `?m=<method>` selects the method |
| `cafe.html` | 3d | Address, hours, bar menu |
| `about.html` | — | About the roaster |
| `shipping.html`, `privacy.html` | — | Policies Stripe asks a shop to publish |
| `404.html` | — | Not-found page, root-relative so it works at any depth |

`assets/styles.css` holds the whole design system, `assets/data.js` the
catalogue and recipes, `assets/site.js` the behaviour. `uploads/` are the
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

The tear is two layers of the same edge. The **mask** is the alpha of
`uploads/torn-top.webp` / `torn-bottom.webp`, which cuts the sheet's
silhouette and keeps the fibres' partial transparency. A mask carries no
colour, so the **texture** comes from `torn-top-tex.webp` / `torn-bottom-tex.webp`
— the same edges in greyscale relief, normalised so flat paper reads as white
and ramped to nothing at the inner edge, multiplied over the sheet colour. That
restores the grain and the soft shadow just inside the tear without tinting
the sheet. Both layers are drawn once across the sheet, never tiled, so there
is no repeat.

The **masthead is different**: it has no fill and no mask at all. It simply
paints `uploads/torn-band.webp` — a whole grey paper strip, both torn lips
included — stretched to the bar. The bar is the paper itself rather than a
coloured card wearing torn edges.

### Regenerating the torn paper

Every torn-paper asset is generated from scratch by `tools/torn_paper.py`
(numpy and Pillow, nothing else): a fractal tear line, a whiter fibrous lip
where the paper's core is exposed, a fine fuzz of fibres past the edge, paper
grain, and relief lighting from the upper left. Being procedural, the files
are original work with no stock licence attached.

```bash
pip install numpy pillow
python3 tools/torn_paper.py               # rewrite uploads/torn-*
python3 tools/torn_paper.py --seed 7      # a different tear
python3 tools/torn_paper.py --width 3600 --edge-height 78 --band-height 390
```

Each asset is written twice: `.webp` is what the site loads (about 115 KB for
the three it uses), `.png` is the lossless greyscale master for design tools and site
builders. All are 2400px wide (the 1200px page at 2x) on a **transparent
background**, and every pixel under the alpha — transparent and
half-transparent fibres included — is paper colour, never black, so they
don't pick up a dark fringe when scaled, masked or dropped onto another
background.

> **Contrast.** The strip's paper is neutral grey (218), so the masthead's
> links use `--strip-ink` `#5a5249` (5.49:1) rather than `--body`. Body text,
> labels and both corals were also darkened a step from the mockup's values so
> every text pair on paper and sheet clears WCAG AA 4.5:1 — see the comment on
> the tokens in `assets/styles.css`.

## Photography

Every editorial photo and pack shot in `uploads/` is a real photograph of the
shop, from `~/Downloads/Luguang photos`. They were resized to fit their slot
(700px for cards, 900–1600px for heroes), saved as progressive JPEG at q80,
and **stripped of EXIF** — the originals carried camera and location metadata
that has no business on a public site. Roughly 1.4 MB for 22 images.

The one asset that is still stock is `American-Hard-Maple.webp`, the wood
texture behind the announce bar. It is a texture rather than a photo of the
shop, so nothing in the folder replaced it.

## Behaviour

The mockup is a picture; these are the parts that had to become real. Every
page renders in full from its own HTML — the script only enhances.

- **Filters** hide and show cards and update the lot count, with an empty state.
- **Product page** fills the 3b template from `data.js` for whichever `?id=` is
  requested; without one it stays on Sidama Dusk.
- **Brew tabs** swap the recipe in place and push a `?m=` URL, so guides are
  linkable and the back button works.
- **Size / grind** swatches are real single-select rows.
- **Buying** goes through Stripe Payment Links, one per lot and size, set in
  `assets/data.js`. The Buy button opens the link for the chosen size with
  `client_reference_id=<lot>_<size>_<grind>` appended, so the grind shows on
  the payment in the Stripe dashboard. A size with no `price` isn't offered;
  one with a price but no `link` shows a greyed "Coming soon". There is no
  cart: each checkout is one lot.

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

## Setting up Stripe

For each lot, in the Stripe dashboard → *Payment Links* → *New*:

1. Add the product at the site's price (e.g. *Sidama Dusk 250g*, $21).
2. Turn on **Collect customers' addresses → Shipping** and choose the
   countries you ship to; add your shipping rate(s).
3. Under *After payment*, optionally redirect to `https://lightslanding.shop/`.
4. Copy the `https://buy.stripe.com/...` URL into that size's `link` in
   `assets/data.js`.

For 1kg bags, set `price` as well as `link`. Fill in the account's *Public
details* (support email, statement descriptor), since the Shipping and Privacy
pages tell customers to reply to their Stripe receipt.

## Not built

Search, accounts, a cart, a sourcing page and a brew-guide index. The
masthead's Search / Account / Cart placeholders were removed before launch
rather than left as text that looks clickable.

`uploads/coffee-berries-1296x728-header.avif` ships with the assets but belongs
to the roadmap's dark exploration (turn 1) and is unused here.
