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
  assert(fs.existsSync(path.join(root, coffee.image)), coffee.id + ': image exists');
  assert(coffee.processes.length > 0, coffee.id + ': listed under at least one process');
}

// Search.
const names = query => catalog.filter(coffee => shop.matches(coffee, query)).map(coffee => coffee.id);
assert.deepEqual(names('ethiopia'), ['alo-main-station']);
assert.deepEqual(names('HONDURAS washed'), ['finca-la-fresa']);
assert.deepEqual(names('catuai'), ['bambito-estate']);
assert.deepEqual(names('volcan'), ['bambito-estate'], 'Accents are ignored');
assert.deepEqual(names('panama geisha'), ['bambito-estate', 'elida-estate', 'gato-grande']);
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
for (const name of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(root, name), 'utf8');
  assert(html.includes('href="coffee.html#coffee-search"'), name + ': Search is a real link');
  assert(html.includes('<a class="cart" href="cart.html">Wishlist · <span data-wishlist-count>0</span></a>'), name + ': Wishlist link');
  assert(!/free shipping/i.test(html), name + ': no shipping offers while ordering is closed');
  assert(!/cupping on fridays|cupping, fridays|lightscoffee\.example/i.test(html), name + ': no Friday cupping or placeholder email');
  assert(html.indexOf('assets/shop.js') < html.indexOf('assets/site.js'), name + ': load shop rules before the UI');
  for (const [, id] of html.matchAll(/product\.html\?id=([a-z0-9-]+)/g)) {
    assert(catalog.some(coffee => coffee.id === id), name + ': links to a coffee on sale (' + id + ')');
  }
}
const shelf = fs.readFileSync(path.join(root, 'coffee.html'), 'utf8');
assert.deepEqual(Array.from(shelf.matchAll(/data-coffee data-origin/g)).length, catalog.length, 'Every coffee is on the shelf');
assert.deepEqual(Array.from(shelf.matchAll(/product\.html\?id=([a-z0-9-]+)/g), match => match[1]),
  catalog.map(coffee => coffee.id), 'The shelf lists the cheapest first');
// Email reservations: hidden until an https endpoint is configured.
const config = load().shop && vm.runInContext('window.LIGHTS.reserve', (() => {
  const context = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(path.join(root, 'assets', 'data.js'), 'utf8'), context);
  return context;
})());
assert.equal(typeof config.endpoint, 'string', 'data.js sets reserve.endpoint');
assert(config.endpoint === '' || /^https:\/\//.test(config.endpoint), 'reserve.endpoint is empty or https');
const wishlistPage = fs.readFileSync(path.join(root, 'cart.html'), 'utf8');
assert(/<form class="reserve" hidden data-reserve-form>/.test(wishlistPage), 'The form starts hidden');
assert(/type="email" required/.test(wishlistPage), 'Email is required');
assert(/name="_gotcha" tabindex="-1"/.test(wishlistPage), 'Spam trap is present and out of the tab order');
console.log('Shop checks passed: catalogue and order, search, wishlist storage, corrupt or blocked storage, page links and the reservation form.');
