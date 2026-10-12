/* Behaviour for Lights Landing Coffee.
   Every page renders in full from its own HTML; this file only enhances —
   the listing filters, the per-lot product page and its Buy button, and the
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

  /* Lots and guides share one HTML file each, so the page's canonical URL,
     description and share-card tags are rewritten to match what is shown. */
  var SITE = 'https://lightslanding.shop/';

  function setMeta(title, description, path, image) {
    var pairs = [
      ['link[rel="canonical"]', 'href', SITE + path],
      ['meta[name="description"]', 'content', description],
      ['meta[property="og:title"]', 'content', title],
      ['meta[property="og:description"]', 'content', description],
      ['meta[property="og:url"]', 'content', SITE + path],
      ['meta[property="og:image"]', 'content', SITE + image]
    ];
    document.title = title;
    pairs.forEach(function (p) {
      var node = $(p[0]);
      if (node) { node.setAttribute(p[1], p[2]); }
    });
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text != null) { node.textContent = text; }
    return node;
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
        group.dispatchEvent(new CustomEvent('choice', { bubbles: true }));
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

  /* -------------------------------------------------------------- buy -- */
  /* Each size sells through its own Stripe Payment Link. The chosen lot,
     size and grind ride along as client_reference_id, which Stripe shows on
     the payment in the dashboard, so the order says what to grind. */

  function selected(group, attr) {
    var on = $('[aria-pressed="true"]', group);
    return on ? on.getAttribute(attr) : null;
  }

  function updateBuy(root, coffee) {
    var buy   = $('[data-buy]', root);
    var size  = selected($('[data-size-group]', root), 'data-size');
    var grind = selected($('[data-grind-group]', root), 'data-grind');
    var offer = coffee.sizes.filter(function (s) { return s.size === size; })[0];

    if (offer && offer.link) {
      var ref = [coffee.id, offer.size, grind].join('_');
      buy.href = offer.link + (offer.link.indexOf('?') < 0 ? '?' : '&') +
                 'client_reference_id=' + encodeURIComponent(ref);
      buy.removeAttribute('aria-disabled');
      buy.textContent = 'Buy — $' + offer.price;
    } else {
      buy.removeAttribute('href');
      buy.setAttribute('aria-disabled', 'true');
      buy.textContent = 'Coming soon';
    }
  }

  function renderProduct() {
    var root = $('[data-product]');
    if (!root) { return; }

    /* Without an ?id= the page keeps its own default lot, Sidama Dusk. */
    var coffee = findCoffee(param('id')) || DATA.coffees[0];
    if (!coffee) { return; }

    setMeta(coffee.name + ' — Lights Landing Coffee', coffee.blurb,
            'product.html?id=' + coffee.id, coffee.image);

    var well = $('[data-product-well]', root);
    var img  = $('[data-product-image]', root);
    img.src = coffee.image;
    img.alt = coffee.name + ' — pack shot';
    well.classList.toggle('product__well--photo', coffee.fit === 'cover');

    $('[data-product-eyebrow]', root).textContent =
      [coffee.origin, coffee.region, coffee.process].filter(Boolean).join(' · ');
    $('[data-product-name]', root).textContent  = coffee.name;
    $('[data-product-blurb]', root).textContent = coffee.blurb;

    var sizes = $('[data-size-group]', root);
    sizes.innerHTML = '';
    coffee.sizes.filter(function (s) { return s.price != null; })
      .forEach(function (s, i) {
        var b = el('button', 'choice', s.size);
        b.type = 'button';
        b.setAttribute('data-size', s.size);
        b.setAttribute('aria-pressed', String(i === 0));
        sizes.appendChild(b);
      });

    root.addEventListener('choice', function () { updateBuy(root, coffee); });
    updateBuy(root, coffee);

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
    setMeta(guide.title + ' — Lights Landing Coffee', guide.intro,
            guide === DATA.guides[0] ? 'brew.html' : 'brew.html?m=' + guide.id,
            guide.image);

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

  initChoiceGroups();
  initFilters();
  renderProduct();
  initGuide();
})();
