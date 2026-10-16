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
  return { shop: window.LIGHTS_SHOP, catalog: window.LIGHTS.coffees };
}
const storage = new Map([['lights.cart', '7']]);
let { shop, catalog } = load(storage);
const names = query => Array.from(catalog).filter(coffee => shop.matches(coffee, query)).map(coffee => coffee.id);
assert.deepEqual(names('nARINO'), ['narino-night']);
assert.deepEqual(names('colombia honey'), ['narino-night']);
assert.deepEqual(names('grapefruit'), ['nyeri-lamplight']);
assert.deepEqual(names('caturra'), ['narino-night']);
assert.deepEqual(names('   '), Array.from(catalog).map(coffee => coffee.id));
assert.deepEqual(names('<script>'), []);
assert.deepEqual(names('coffee-that-does-not-exist'), []);
assert.equal(shop.readCart().length, 0, 'The old counter never invents product selections');
let cart = shop.addItem([], 'narino-night', '250g', 'Espresso');
cart = shop.addItem(cart, 'narino-night', '250g', 'Espresso');
assert.equal(cart.length, 1);
assert.equal(cart[0].quantity, 2);
cart = shop.addItem(cart, 'narino-night', '250g', 'Whole bean');
cart = shop.addItem(cart, 'sidama-dusk', '250g', 'Filter');
assert.equal(cart.length, 3, 'Different grinds remain separate');
assert.equal(shop.subtotal(cart), 7800);
assert.equal(shop.money(shop.subtotal(cart)), '$78.00');
assert(shop.writeCart(cart));
assert.equal(storage.get('lights.cart'), '7', 'Legacy storage remains untouched');
shop = load(storage).shop;
assert.equal(shop.readCart().length, 3, 'Selections survive a new page/session');
assert.equal(shop.subtotal(shop.readCart()), 7800);
let edited = shop.readCart(); edited[0].quantity = 3;
assert.equal(shop.subtotal(edited), 9700);
assert(shop.writeCart(edited.filter(item => item.id !== 'sidama-dusk')));
assert.equal(shop.subtotal(shop.readCart()), 7600);
assert(shop.writeCart([]));
assert.equal(shop.readCart().length, 0);
const valid = { id: 'sidama-dusk', size: '250g', grind: 'Whole bean', quantity: 2, price: 0.01 };
const corrupt = [null, false, 3, { ...valid, id: 'not-a-coffee' }, { ...valid, size: '1kg' },
  { ...valid, grind: 'bad' }, { ...valid, quantity: -1 }, { ...valid, quantity: .5 },
  { ...valid, quantity: '2' }, { ...valid, quantity: Infinity }];
assert.equal(shop.normalizeCart(corrupt).length, 0);
assert.equal(shop.subtotal([valid]), 4200, 'Totals use catalogue prices, never saved prices');
assert.equal(shop.normalizeCart([{ ...valid, quantity: 200 }, valid])[0].quantity, 99);
for (const value of ['not json', '3', '{}', 'null']) {
  storage.set(shop.key, value); assert.equal(shop.readCart().length, 0);
}
shop = load(new Map(), true).shop;
assert.equal(shop.readCart().length, 0);
assert.equal(shop.writeCart([valid]), false, 'Storage failures reach the UI');
for (const name of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
  const html = fs.readFileSync(path.join(root, name), 'utf8');
  assert(!/<span>Account<\/span>/.test(html), name + ': remove Account');
  assert(html.includes('href="coffee.html#coffee-search"'), name + ': Search is a real link');
  assert(html.includes('href="cart.html"'), name + ': Cart is a real link');
  assert(html.indexOf('assets/shop.js') < html.indexOf('assets/site.js'), name + ': load cart rules before the UI');
}
console.log('Shop checks passed: search, saved selections, grind separation, quantities, totals, corrupt storage, unavailable sizes and header links.');
