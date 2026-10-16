/* Catalogue search and cart values. Saved items contain selections, never prices. */
window.LIGHTS_SHOP = (function () {
  'use strict';
  var coffees = window.LIGHTS.coffees;
  var key = 'lights.cart.items';
  var grinds = ['Whole bean', 'Filter', 'Espresso'];

  function coffee(id) {
    return coffees.find(function (item) { return item.id === id; });
  }
  function itemKey(item) { return JSON.stringify([item.id, item.size, item.grind]); }
  function normalizeCart(value) {
    var items = [];
    if (!Array.isArray(value)) { return items; }
    value.forEach(function (raw) {
      if (!raw || !coffee(raw.id) || raw.size !== '250g' || grinds.indexOf(raw.grind) < 0 ||
          !Number.isInteger(raw.quantity) || raw.quantity < 1) { return; }
      var found = items.find(function (item) { return itemKey(item) === itemKey(raw); });
      if (found) { found.quantity = Math.min(99, found.quantity + raw.quantity); }
      else { items.push({ id: raw.id, size: raw.size, grind: raw.grind, quantity: Math.min(99, raw.quantity) }); }
    });
    return items;
  }
  function readCart() {
    try { return normalizeCart(JSON.parse(window.localStorage.getItem(key))); }
    catch (error) { return []; }
  }
  function writeCart(items) {
    try { window.localStorage.setItem(key, JSON.stringify(normalizeCart(items))); return true; }
    catch (error) { return false; }
  }
  function addItem(items, id, size, grind) {
    return normalizeCart(items.concat({ id: id, size: size, grind: grind, quantity: 1 }));
  }
  function unitPrice(item) { return Math.round(coffee(item.id).price * 100); }
  function subtotal(items) {
    return normalizeCart(items).reduce(function (sum, item) { return sum + unitPrice(item) * item.quantity; }, 0);
  }
  function text(value) {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  function matches(item, query) {
    var haystack = text([item.name, item.origin, item.region, item.process, item.roast,
      item.notes, item.blurb, Object.values(item.specs || {}).join(' ')].join(' '));
    return text(query).trim().split(/\s+/).every(function (word) { return haystack.indexOf(word) >= 0; });
  }
  function money(cents) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100); }
  return { key: key, coffee: coffee, normalizeCart: normalizeCart, readCart: readCart, writeCart: writeCart,
    addItem: addItem, unitPrice: unitPrice, subtotal: subtotal, matches: matches, money: money };
})();
