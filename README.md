# Lights Landing Coffee — 陆光咖啡

The shop's website, designed as **the café's bean wall**: a light maple wall
that stays still while white cards scroll over it, every card laid down a few
pixels lopsided, and each coffee printed like the café's wall cards — its own
marbled colour, Chinese and English names, 风味表现 notes, price and logo —
that turns over to a white back with the basics.

No build step, no dependencies. Open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
```

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Home — introduction, the three cheapest coffees, brew guides, the café |
| `coffee.html` | The shelf — every coffee card, with search, Origin / Process filters and price order |
| `product.html` | One coffee, `?id=<id>` — basics, its printed card, tasting, the estate, roast, the roaster's recipes |
| `brew.html` | Brew guides, `?m=<method>` — V60, Espresso, Iced |
| `cafe.html` | Address, hours, the bar menu, photos |
| `about.html` | Who we are, roasting, brewing |
| `cart.html` | Wishlist — shopping is coming soon, saved coffees, email reservations |

`assets/styles.css` is the whole design, `assets/data.js` the catalogue and
brew guides, `assets/i18n.js` the Chinese for each page's text,
`assets/shop.js` the search and wishlist rules, and `assets/site.js` the page
behaviour.

## English and Chinese

The **中** at the top right puts the whole site into Chinese; there it reads
**EN** and switches back. The page changes in place, without reloading.

- **Page text** is written in English in each HTML file. Every translatable
  element carries `data-i18n="key"` (or `data-i18n-attr="placeholder:key"` for
  attributes), and `assets/i18n.js` holds the Chinese for each key. To change
  Chinese wording, edit `i18n.js`; to add text, give it a new key there.
- **Coffees and brew guides** carry their Chinese in `data.js` under `zh`. The
  tasting notes and estate stories are the roaster's own Chinese.
- **Cards** carry only their own language: in English the English names and
  tasting notes, with no Chinese at all; in Chinese the Chinese names, the
  「process」 and 风味表现, with no English names.
- **The choice** is remembered in the browser (`lights.lang`). A first visit
  follows the browser's language. `?lang=zh` or `?lang=en` on any link sets
  it, so a Chinese link can be shared. A small script in each page's head
  hides the page for the moment it takes to switch, so Chinese readers never
  see English flash first.
- Reservation emails to the shop are always in English.

## The header

The logo sits at the left, Coffee · Brew guide · Café · About are spread evenly
across the middle, and three icons sit at the right:

- **Search** is a magnifying glass. Hovering (or tapping, or tabbing to it)
  slides it left and opens an underline to type into; Enter opens the shelf
  filtered by that search. Its room is reserved, so opening it doesn't move
  the menu.
- **中 / EN** switches language. Like the menu items, it draws an underline
  from left to right on hover; the page you're on keeps its underline.
- **The cart** opens the wishlist; a small black square shows how many
  coffees are on it, and disappears at zero.

On phones the menu takes its own row under the logo and icons, spread edge to
edge.

## The design

- **The wall.** `body::after` is a fixed layer of `uploads/American-Hard-Maple.webp`;
  everything else scrolls over it.
- **White cards.** `.card` is white, square-cornered, with a soft warm drop
  shadow. `site.js` gives every card and coffee card one random lean for the
  visit — a rotation that moves its edge about 4px whatever its width, plus a
  nudge of up to 1.5px — so the page looks laid down by hand.
- **Black and white.** Ink `#121212`, grey `#5c5c5c` (6.6:1 on white), rules
  `#e2e2e2`, wood `#ead6b6`. Helvetica Neue for Latin, Noto Sans SC for Chinese.
  The only colour is each coffee's card and the photographs. The brew-guide
  photo is black and white.
- **The coffee card** (`.bean`) is drawn by `site.js` from `data.js`: front
  `card.zh` or `card.en`, the price, and the process in the corner, over its `art`
  (`uploads/card-*.jpg`), with the roaster's tasting notes (aroma, palate,
  finish; in English, their translation) at the foot. Sizes are container
  units, so it scales like a print. Where the full notes don't fit, the card
  shows them as one line of flavours (`card.notes`, or `notes` in English),
  in whole lines. The back lists the basics and one button, "Add to
  wishlist"; the card itself opens the coffee's page.
- **Turning a card.** With a mouse, a card turns over while the pointer rests
  on it (and while the keyboard is inside it). On a phone it turns under the
  finger: a sideways swipe drags it round in 3D, lifting it off the wall and
  shading the face as it goes edge-on, and letting go springs it to the nearer
  side, or over when flicked. Up-and-down swipes still scroll. The first card
  on the shelf and home page gives one small wobble per visit on touch screens,
  so people know it moves. A click or tap anywhere on a card, front or back,
  opens the coffee's page; only "Add to wishlist" stays put. The card on a
  coffee's own page only turns. Reduced Motion skips the animation.
- **Search and sort** are a thin underline, not a box.
- **Even rows.** Cards side by side share one height, with their links or
  buttons at the foot, so rows line up (home, About, wishlist). The home
  page's brew methods are large buttons, one above another.

## Animated masthead logo

Hover over or focus the upper-left logo to unfold its fan. Panels begin 0.2
seconds apart and overlap for a fluid opening lasting one second. Their original
shapes stay rigid and reveal from behind clipping edges. Tapping on the homepage
replays it; tapping from another page goes home and plays it on arrival. Repeated
triggers during an opening do not restart it. Reduced Motion keeps it still;
without JavaScript the original logo and home link remain available.

## Photography

Every editorial photo in `uploads/` is a real photograph of the shop, resized
for its slot, saved as progressive JPEG and stripped of EXIF. The bag photos
(`bag-*.jpg`) and the card colours (`card-*.jpg`) are the shop's own. The maple
is a stock texture.

Not used by this design and safe to delete once you're sure: the torn-paper
set from the previous design (`uploads/torn-*`, rebuilt by
`tools/prepare_torn_paper.py` and checked by `tools/check_torn_paper.py`), and
`iced-coffee.jpg` and `pack-*.jpg`.

> **Licence check needed** if the torn paper ever returns: it is derived from a
> Pngtree asset (`pngtree-white-torn-paper-strips-with-cutout-edges`, image
> 16485356), whose free tier requires attribution and restricts commercial use.

## Behaviour

Page text is in each page's HTML. The coffee cards need JavaScript; without
it, each row of cards is a plain list of links to the coffees' pages.

- **Search** (the header's or the shelf's own) matches names (English and
  Chinese), origin, region, process, variety, lot and tasting notes in either language,
  ignoring case and accents. Search, filters and sort live in the URL
  (`?q=`, `origin=`, `process=`, `sort=desc`), so a filtered shelf can be shared.
- **Coffee page** fills from `data.js` for whichever `?id=` is asked for;
  without one it shows the first coffee, ALO Main Station.
- **Brew tabs** swap the guide in place and push a `?m=` URL, so guides are
  linkable and the back button works.
- **Ordering is closed for now.** "Add to wishlist" on a card's back or a
  coffee's page saves it in place ("On your wishlist"; click again to remove).
  The header's cart shows how many are saved. `cart.html` says shopping is coming soon,
  lists the wishlist, and shows every other coffee's card. The wishlist is
  coffee ids only (`lights.wishlist` in this browser's storage), syncs between
  tabs, and says so when the browser refuses to save it.
- **Reserve by email.** The wishlist page has a form: an email address, plus the coffees on the
  wishlist, sent as one JSON POST (`email`, `coffees`, `coffee_ids`, `_subject`, and a `_gotcha`
  spam trap) to `reserve.endpoint` in `assets/data.js`. The visitor is told whether it went
  through. **The form stays hidden until that endpoint is set**, so nobody can submit into
  nothing. To switch it on with Formspree, which emails you each reservation and keeps a list
  you can export:
  1. Sign up at formspree.io and create a form. It gives an endpoint like
     `https://formspree.io/f/abcdwxyz`.
  2. Paste it into `assets/data.js`: `var reserve = { endpoint: 'https://formspree.io/f/abcdwxyz' };`
  3. Submit one reservation from the live site and confirm it in Formspree's dashboard and inbox.
     Check the plan's monthly submission limit.

  Any service that accepts a JSON POST and returns a 2xx status works the same way, as will the
  site's own `/api/reserve` once it runs on Cloudflare.
- **Checks:** `node tools/check_shop.js` verifies the catalogue and its
  cheapest-first order, every printed card's lines, search, wishlist storage,
  the links and images on every page, the filters and the reservation form;
  `node tools/check_fan_logo.js` verifies the logo animation.

Responsive down to 320px: coffee cards fill the width in as many columns as
fit (two on a phone), and every two-column card stacks below 820px.

## Where the content comes from

**The coffees** (`assets/data.js`) are the five on sale, cheapest first: ALO Main
Station ($16 · 100g), Bambito Estate ($18 · 100g), Finca La Fresa ($26 · 100g),
Elida Estate ($39 · 75g) and Gato Grande ($49 · 75g). Prices and sizes are the
shop's. Full label names (English and Chinese), lots, processes, tasting notes
(aroma, palate, finish) and the "About the estate" stories are translated from the
roaster's notes for each coffee. `card` holds the printed card's lines, `art`
its colour (`uploads/card-*.jpg`) and `bag` a photo of the bag
(`uploads/bag-*.jpg`), shown beside the tasting notes. The roast (Giesen W1A, light, roasted within 7 days of
shipping, best 13–15 days after roasting) and the roaster's cone and
flat-bottom recipes are the same for every coffee and are written into
`product.html`.

Decisions made while transcribing:

- **ALO Main Station** is the 74158 zero-fermentation washed. The bag tag also
  mentions K72; the story mentions the K72 and mixed lots only to compare.
- **Bambito Estate** is sold as the Yellow Catuai anaerobic natural only.
- **Finca La Fresa** is lot #131 (the old label art printed #161 and #121).
- **Elida Estate** is a dark-room dried (DRD) natural; the label's English
  line says washed.
- **Gato Grande**'s CFY is cold-fermentation yeast natural.
- The roaster's text names Bambito's eldest manager in Chinese only; the site
  leaves her name out rather than guess the spelling. It calls Honduras the
  world's second-largest arabica producer; the site says "one of the largest".
- The recipes use the roaster's water, Nongfu Spring; the site gives its TDS
  (40–50) so customers outside China can match it.

The V60 recipe, the café menu and the rest of the page copy are the original design's.
Written to fill the design's templates, and worth a review:

- **Espresso and Iced recipes** (`assets/data.js`) — the original design only
  specified V60. There is no French press guide.
- **The cards' one-line 风味表现** is shortened from the roaster's notes, for
  cards too small for the full notes.

## Not built

Checkout/payment collection, accounts, a sourcing page, and the Shipping and
Privacy pages remain outside this build. Ordering is closed: "Add to wishlist"
only saves in the browser, and no order or payment is submitted. Connect a payment service before enabling purchase completion.
