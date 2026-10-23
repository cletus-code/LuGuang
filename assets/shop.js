/* Catalogue search and the wishlist. Ordering is closed for now, so "Add to
   wishlist" saves a coffee here instead; the wishlist holds coffee ids only,
   never prices, which always come from the catalogue. */
window.LIGHTS_SHOP = (function () {
  'use strict';
  var coffees = window.LIGHTS.coffees;
  var key = 'lights.wishlist';

  function coffee(id) {
    return coffees.find(function (item) { return item.id === id; });
  }
  /* Known coffees only, each once, in the order they were added. */
  function normalizeWishlist(value) {
    var ids = [];
    if (!Array.isArray(value)) { return ids; }
    value.forEach(function (id) {
      if (typeof id === 'string' && coffee(id) && ids.indexOf(id) < 0) { ids.push(id); }
    });
    return ids;
  }
  function readWishlist() {
    try { return normalizeWishlist(JSON.parse(window.localStorage.getItem(key))); }
    catch (error) { return []; }
  }
  function writeWishlist(ids) {
    try { window.localStorage.setItem(key, JSON.stringify(normalizeWishlist(ids))); return true; }
    catch (error) { return false; }
  }
  function add(ids, id) { return normalizeWishlist(ids.concat(id)); }
  function remove(ids, id) { return normalizeWishlist(ids).filter(function (other) { return other !== id; }); }
  function text(value) {
    return String(value).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }
  function matches(item, query) {
    var label = item.label || {};
    var zh = item.zh || {};
    var haystack = text([item.name, item.origin, item.region, item.process, item.variety,
      item.notes, item.blurb, Object.values(item.specs || {}).join(' '), label.en, label.zh,
      zh.name, zh.origin, zh.region, zh.process, zh.variety, zh.notes].join(' '));
    return text(query).trim().split(/\s+/).every(function (word) { return haystack.indexOf(word) >= 0; });
  }
  function money(dollars) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(dollars);
  }
  function priceLabel(item) { return money(item.price) + ' · ' + item.size; }
  return { key: key, coffee: coffee, normalizeWishlist: normalizeWishlist, readWishlist: readWishlist,
    writeWishlist: writeWishlist, add: add, remove: remove, matches: matches, money: money,
    priceLabel: priceLabel };
})();
