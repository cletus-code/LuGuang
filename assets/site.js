/* Behaviour for Lights Coffee.
   Every page renders in full from its own HTML; this file only enhances —
   the cart tally, the listing filters, the per-lot product page, and the
   brew-method tabs. */

(function () {
  'use strict';

  var DATA = window.LIGHTS || { coffees: [], guides: [] };
  var $  = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  function param(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text != null) { node.textContent = text; }
    return node;
  }

  /* ------------------------------------------------------------- cart -- */

  var CART_KEY = 'lights.cart';

  function cartCount() {
    try { return parseInt(localStorage.getItem(CART_KEY), 10) || 0; }
    catch (e) { return 0; }
  }

  function setCartCount(n) {
    try { localStorage.setItem(CART_KEY, String(n)); } catch (e) { /* private mode */ }
    $$('[data-cart-count]').forEach(function (node) { node.textContent = n; });
  }

  function initCart() {
    setCartCount(cartCount());

    $$('[data-add-to-cart]').forEach(function (button) {
      var timer = null;

      button.addEventListener('click', function () {
        setCartCount(cartCount() + 1);

        /* The label is re-read each time rather than cached at load, because
           renderProduct() rewrites it with the lot's price. */
        if (timer === null) { button.dataset.label = button.textContent; }
        else { clearTimeout(timer); }

        button.textContent = 'Added';
        timer = setTimeout(function () {
          button.textContent = button.dataset.label;
          timer = null;
        }, 1200);
      });
    });
  }

  /* -------------------------------------------------- option swatches -- */
  /* Size and grind on the product page: one selection per row. */

  function initChoiceGroups() {
    $$('[data-choice-group]').forEach(function (group) {
      group.addEventListener('click', function (event) {
        var button = event.target.closest('.choice');
        if (!button || !group.contains(button)) { return; }

        $$('.choice', group).forEach(function (other) {
          other.setAttribute('aria-pressed', String(other === button));
        });
      });
    });
  }

  /* ---------------------------------------------------------- filters -- */

  function initFilters() {
    var listing = $('[data-listing]');
    if (!listing) { return; }

    var cards   = $$('[data-coffee]', listing);
    var tally   = $('[data-lot-count]');
    var empty   = $('[data-listing-empty]');
    var chosen  = { origin: 'all', process: 'all', roast: 'all' };

    function apply() {
      var shown = 0;

      cards.forEach(function (card) {
        var ok = ['origin', 'process', 'roast'].every(function (facet) {
          return chosen[facet] === 'all' ||
                 card.dataset[facet].toLowerCase() === chosen[facet];
        });

        card.hidden = !ok;
        if (ok) { shown += 1; }
      });

      if (tally) { tally.textContent = shown + (shown === 1 ? ' lot' : ' lots'); }
      if (empty) { empty.hidden = shown > 0; }
    }

    $$('[data-facet]', listing).forEach(function (button) {
      button.addEventListener('click', function () {
        var facet = button.dataset.facet;
        chosen[facet] = button.dataset.value.toLowerCase();

        $$('[data-facet="' + facet + '"]', listing).forEach(function (other) {
          other.setAttribute('aria-pressed', String(other === button));
        });

        apply();
      });
    });

    apply();
  }

  /* --------------------------------------------------- product detail -- */

  function findCoffee(id) {
    for (var i = 0; i < DATA.coffees.length; i += 1) {
      if (DATA.coffees[i].id === id) { return DATA.coffees[i]; }
    }
    return null;
  }

  function renderProduct() {
    var root = $('[data-product]');
    if (!root) { return; }

    var coffee = findCoffee(param('id'));
    if (!coffee) { return; }   /* keep the page's own default lot */

    document.title = coffee.name + ' — Lights Coffee';

    var well = $('[data-product-well]', root);
    var img  = $('[data-product-image]', root);
    img.src = coffee.image;
    img.alt = coffee.name + ' — pack shot';
    well.classList.toggle('product__well--photo', coffee.fit === 'cover');

    $('[data-product-eyebrow]', root).textContent =
      [coffee.origin, coffee.region, coffee.process].filter(Boolean).join(' · ');
    $('[data-product-name]', root).textContent  = coffee.name;
    $('[data-product-blurb]', root).textContent = coffee.blurb;
    $('[data-product-price]', root).textContent = 'Add to cart — $' + coffee.price;

    var specs = $('[data-product-specs]', root);
    specs.innerHTML = '';
    Object.keys(coffee.specs).forEach(function (key) {
      var wrap = el('div');
      wrap.appendChild(el('dt', null, key));
      wrap.appendChild(el('dd', null, coffee.specs[key]));
      specs.appendChild(wrap);
    });

    var story = $('[data-product-story]');
    if (story) {
      story.innerHTML = '';
      coffee.story.forEach(function (para) { story.appendChild(el('p', null, para)); });
    }
  }

  /* -------------------------------------------------------- brew tabs -- */

  function findGuide(id) {
    for (var i = 0; i < DATA.guides.length; i += 1) {
      if (DATA.guides[i].id === id) { return DATA.guides[i]; }
    }
    return null;
  }

  function paintGuide(guide) {
    document.title = guide.title + ' — Lights Coffee';

    var image = $('[data-guide-image]');
    image.src = guide.image;
    image.alt = guide.alt;

    $('[data-guide-title]').textContent = guide.title;
    $('[data-guide-intro]').textContent = guide.intro;

    var glance = $('[data-guide-glance]');
    glance.innerHTML = '';
    guide.glance.forEach(function (pair) {
      glance.appendChild(el('dt', null, pair[0]));
      glance.appendChild(el('dd', null, pair[1]));
    });

    $('[data-guide-note]').textContent = guide.note;

    var steps = $('[data-guide-steps]');
    steps.innerHTML = '';
    guide.steps.forEach(function (step, i) {
      var row  = el('div', 'step');
      var body = el('div');

      row.appendChild(el('div', 'step__n', ('0' + (i + 1)).slice(-2)));
      body.appendChild(el('div', 'step__title', step[0]));
      body.appendChild(el('div', 'step__text', step[1]));
      row.appendChild(body);
      steps.appendChild(row);
    });

    $$('[data-guide-tab]').forEach(function (tab) {
      tab.setAttribute('aria-selected', String(tab.dataset.guideTab === guide.id));
    });
  }

  function initGuide() {
    if (!$('[data-guide-steps]')) { return; }

    var guide = findGuide(param('m'));
    if (guide) { paintGuide(guide); }

    $$('[data-guide-tab]').forEach(function (tab) {
      tab.addEventListener('click', function (event) {
        var next = findGuide(tab.dataset.guideTab);
        if (!next) { return; }

        event.preventDefault();
        paintGuide(next);
        history.pushState({ m: next.id }, '', 'brew.html?m=' + next.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    window.addEventListener('popstate', function () {
      paintGuide(findGuide(param('m')) || DATA.guides[0]);
    });
  }

  /* ------------------------------------------------------------- boot -- */

  initCart();
  initChoiceGroups();
  initFilters();
  renderProduct();
  initGuide();
})();
