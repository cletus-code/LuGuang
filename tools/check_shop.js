/* Run: node tools/check_shop.js */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
function load(storage = new Map(), blocked = false) {
  const window = { localStorage: {
    getItem(key) { if (blocked) throw Error('Blocked'); return storage.get(key) || null; },
    setItem(key, value) { if (blocked) throw Error('Blocked'); storage.set(key, value); }
  } };
  const context = vm.createContext({ window, Intl });
  for (const name of ['data.js', 'shop.js']) vm.runInContext(fs.readFileSync(path.join(root, 'assets', name), 'utf8'), context);
  return { shop: window.LIGHTS_SHOP, catalog: Array.from(window.LIGHTS.coffees) };
}
// Arrays made inside the vm context have their own prototype; compare copies.
const plain = value => JSON.parse(JSON.stringify(value));

// The catalogue: the five coffees on sale, cheapest first, each with a size and an image.
const storage = new Map([['lights.cart.items', '[{"id":"sidama-dusk"}]']]);
let { shop, catalog } = load(storage);
assert.deepEqual(catalog.map(coffee => coffee.id),
  ['alo-main-station', 'bambito-estate', 'finca-la-fresa', 'elida-estate', 'gato-grande']);
assert.deepEqual(catalog.map(coffee => shop.priceLabel(coffee)),
  ['$16 · 100g', '$18 · 100g', '$26 · 100g', '$39 · 75g', '$49 · 75g']);
for (const coffee of catalog) {
  for (const file of [coffee.art, coffee.bag]) assert(fs.existsSync(path.join(root, file)), coffee.id + ': ' + file + ' exists');
  assert(coffee.processes.length > 0, coffee.id + ': listed under at least one process');
  assert(coffee.cup || coffee.tasting, coffee.id + ': has tasting notes');
  assert(coffee.notes && coffee.label.en && coffee.label.zh && coffee.story.length, coffee.id + ': notes, label and farm story');
  const card = coffee.card;
  assert(card.tag && card.zh.length === 3 && card.en.length === 3 && card.notes && card.about, coffee.id + ': the printed card has every line');
}

// Search.
const names = query => catalog.filter(coffee => shop.matches(coffee, query)).map(coffee => coffee.id);
assert.deepEqual(names('ethiopia'), ['alo-main-station']);
assert.deepEqual(names('HONDURAS washed'), ['finca-la-fresa']);
assert.deepEqual(names('catuai'), ['bambito-estate']);
assert.deepEqual(names('volcan'), ['bambito-estate'], 'Accents are ignored');
assert.deepEqual(names('panama geisha'), ['elida-estate', 'gato-grande'], 'Bambito is sold as Yellow Catuai only');
assert.deepEqual(names('lychee'), ['finca-la-fresa'], 'Tasting notes are searchable');
assert.deepEqual(names('草莓庄园'), ['finca-la-fresa'], 'Chinese label names are searchable');
assert.deepEqual(names('   '), catalog.map(coffee => coffee.id));
assert.deepEqual(names('<script>'), []);

// The wishlist: known coffees, once each, surviving a new page.
assert.equal(shop.readWishlist().length, 0, 'The old cart never becomes a wishlist');
let list = shop.add([], 'gato-grande');
list = shop.add(list, 'gato-grande');
list = shop.add(list, 'alo-main-station');
assert.deepEqual(plain(list), ['gato-grande', 'alo-main-station'], 'Each coffee is saved once, in order added');
assert(shop.writeWishlist(list));
shop = load(storage).shop;
assert.deepEqual(plain(shop.readWishlist()), ['gato-grande', 'alo-main-station']);
assert.deepEqual(plain(shop.remove(shop.readWishlist(), 'gato-grande')), ['alo-main-station']);
assert.equal(storage.get('lights.cart.items'), '[{"id":"sidama-dusk"}]', 'Old cart storage is left alone');
assert.deepEqual(plain(shop.normalizeWishlist([null, 3, {}, 'sidama-dusk', 'not-a-coffee', 'elida-estate'])), ['elida-estate']);
for (const value of ['not json', '3', '{}', 'null']) {
  storage.set(shop.key, value); assert.equal(shop.readWishlist().length, 0);
}
shop = load(new Map(), true).shop;
assert.equal(shop.readWishlist().length, 0);
assert.equal(shop.writeWishlist(['gato-grande']), false, 'Storage failures reach the UI');

// Pages.
const links = html => Array.from(html.matchAll(/product\.html\?id=([a-z0-9-]+)/g), match => match[1]);
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
for (const name of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
  const html = read(name);
  assert(html.includes('href="coffee.html#coffee-search"'), name + ': Search is a real link');
  assert(html.includes('<a class="pill cart" href="cart.html">Wishlist · <span data-wishlist-count>0</span></a>'), name + ': Wishlist link');
  assert(!/free shipping/i.test(html), name + ': no shipping offers while ordering is closed');
  assert(!/cupping on fridays|cupping, fridays|lightscoffee\.example/i.test(html), name + ': no Friday cupping or placeholder email');
  assert(html.indexOf('assets/data.js') < html.indexOf('assets/shop.js') &&
    html.indexOf('assets/shop.js') < html.indexOf('assets/site.js'), name + ': data, then shop rules, then the UI');
  for (const id of links(html)) assert(catalog.some(coffee => coffee.id === id), name + ': links to a coffee on sale (' + id + ')');
  for (const [, file] of html.matchAll(/src="(uploads\/[^"]+)"/g)) assert(fs.existsSync(path.join(root, file)), name + ': ' + file + ' exists');
}
// Without JavaScript each row of cards is a list of links, in shelf order.
const fallback = (name, row) => links(read(name).split('data-beans="' + row + '"')[1].split('</ul>')[0]);
const ids = catalog.map(coffee => coffee.id);
assert.deepEqual(fallback('coffee.html', 'shelf'), ids, 'The shelf lists every coffee, cheapest first');
assert.deepEqual(fallback('index.html', 'home'), ids.slice(0, 3), 'Home shows the three cheapest');
assert.deepEqual(fallback('cart.html', 'wish'), ids, 'The wishlist offers every coffee');
const shelf = read('coffee.html');
const facets = facet => Array.from(shelf.matchAll(new RegExp('data-facet="' + facet + '" data-value="([^"]+)"', 'g')), match => match[1]).slice(1);
assert.deepEqual(facets('origin'), Array.from(new Set(catalog.map(coffee => coffee.origin))).sort(), 'An origin filter for each origin');
assert.deepEqual(Array.from(new Set(catalog.flatMap(coffee => coffee.processes))).filter(process => !facets('process').includes(process)), [],
  'A process filter for each process');
const product = read('product.html');
assert(product.includes('<title>' + catalog[0].name + ' — Lights Landing Coffee</title>') &&
  product.includes('data-product-price>' + shop.priceLabel(catalog[0]) + '<'), 'The coffee page shows the first coffee before it loads');
// Email reservations: hidden until an https endpoint is configured.
const config = load().shop && vm.runInContext('window.LIGHTS.reserve', (() => {
  const context = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(path.join(root, 'assets', 'data.js'), 'utf8'), context);
  return context;
})());
assert.equal(typeof config.endpoint, 'string', 'data.js sets reserve.endpoint');
assert(config.endpoint === '' || /^https:\/\//.test(config.endpoint), 'reserve.endpoint is empty or https');
const wishlistPage = read('cart.html');
assert(/<form class="card pad reserve" hidden data-reserve-form>/.test(wishlistPage), 'The form starts hidden');
assert(/type="email" required/.test(wishlistPage), 'Email is required');
assert(/name="_gotcha" tabindex="-1"/.test(wishlistPage), 'Spam trap is present and out of the tab order');
console.log('Shop checks passed: catalogue and order, printed cards, tasting notes, search, wishlist storage, corrupt or blocked storage, page links and the reservation form.');
