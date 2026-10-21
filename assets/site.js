/* Behaviour for Lights Landing Coffee.
   Every page renders in full from its own HTML; this file only enhances —
   the wishlist, coffee search and filters, the per-lot product page, and the
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

  /* ------------------------------------------------------- fan logo -- */

  function initFanLogo() {
    var brand = $('.brand');
    var mark = $('.brand__mark', brand);
    if (!brand || !mark || !window.requestAnimationFrame) { return; }

    var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var canvas = el('span', 'brand__fan');
    canvas.appendChild(el('span', 'brand__slice brand__slice--base'));
    var moving = el('span', 'brand__moving');
    canvas.appendChild(moving);
    var reveals = [];
    var panels = [1, 2, 3, 4].map(function (number) {
      var reveal = el('span', 'brand__reveal');
      var panel = el('span', 'brand__slice brand__slice--' + number);
      reveal.appendChild(panel);
      moving.appendChild(reveal);
      reveals.push(reveal);
      return panel;
    });
    mark.appendChild(canvas);
    mark.classList.add('brand__mark--fan');
    var frame = null;
    var running = false;
    // Exact intersections of the artwork's adjacent black/white edges.
    // Each triangle is [hinge, leading outer corner, trailing outer corner].
    var triangles = [
      [[138.19, 461.315615], [138.19, 40.8], [301.83, 11.97]],
      [[171.288651, 370.428706], [301.83, 11.97], [424.6, 68.24]],
      [[270.678178, 251.861605], [424.6, 68.24], [479.13, 131.98]],
      [[360.323338, 200.306260], [479.13, 131.98], [507.05, 174.06]]
    ];

    function restore() {
      if (frame !== null) { window.cancelAnimationFrame(frame); }
      frame = null;
      running = false;
      panels.forEach(function (panel, index) {
        panel.style.transform = '';
        panel.style.visibility = '';
        reveals[index].style.clipPath = '';
      });
    }

    function draw(elapsed) {
      var corner = triangles[0][1].slice();
      var angle = -Math.PI / 2;
      triangles.forEach(function (triangle, index) {
        var t = Math.max(0, Math.min(1, (elapsed - (3 - index) * 200) / 400));
        // Overlapping smooth starts/finishes keep the fan moving between panels.
        var opening = t * t * (3 - 2 * t);
        var panel = panels[index];
        panel.style.visibility = opening === 0 ? 'hidden' : '';
        if (opening === 0) { return; }

        var hinge = triangle[0], leading = triangle[1], trailing = triangle[2];
        var ux = leading[0] - hinge[0], uy = leading[1] - hinge[1];
        var vx = trailing[0] - hinge[0], vy = trailing[1] - hinge[1];
        var leftLength = Math.hypot(ux, uy), rightLength = Math.hypot(vx, vy);
        var width = Math.atan2(vy, vx) - Math.atan2(uy, ux);
        // Slide the rigid panel along the shared edge as it rotates out.
        // At zero its trailing corner is tucked behind that edge; at one
        // its leading corner joins it. No scale, shear or path changes.
        var reach = rightLength + (leftLength - rightLength) * opening;
        var px = corner[0] - Math.cos(angle) * reach;
        var py = corner[1] - Math.sin(angle) * reach;
        var outgoing = angle + width * opening;
        var next = [px + Math.cos(outgoing) * rightLength, py + Math.sin(outgoing) * rightLength];
        var rotation = outgoing - Math.atan2(vy, vx);
        var a = Math.cos(rotation), b = Math.sin(rotation), c = -b, d = a;
        var x = px + .93 - a * (hinge[0] + .93) - c * (hinge[1] + .16);
        var y = py + .16 - b * (hinge[0] + .93) - d * (hinge[1] + .16);
        panel.style.transform = 'translate(' + (x / 508.99 * 100) + '%,' +
          (y / 491.25 * 100) + '%) matrix(' + [a, b, c, d, 0, 0].join(',') + ')';

        // Reveal only the part that has crossed the preceding panel's edge.
        // This mask stays outside the rigid artwork, in the canvas's space.
        var dx = Math.cos(angle) * 2000, dy = Math.sin(angle) * 2000;
        var nx = -Math.sin(angle) * 4000, ny = Math.cos(angle) * 4000;
        var clip = [[corner[0]-dx, corner[1]-dy], [corner[0]+dx, corner[1]+dy],
          [corner[0]+dx+nx, corner[1]+dy+ny], [corner[0]-dx+nx, corner[1]-dy+ny]];
        reveals[index].style.clipPath = 'polygon(' + clip.map(function (point) {
          return ((point[0]+.93)/508.99*100) + '% ' + ((point[1]+.16)/491.25*100) + '%';
        }).join(',') + ')';
        corner = next;
        angle = outgoing;
      });
    }

    function play() {
      if (motion.matches || running) { return; }
      running = true;
      var start = window.performance.now();
      draw(0);
      function step(now) {
        if (now - start >= 1000) { restore(); return; }
        draw(now - start);
        frame = window.requestAnimationFrame(step);
      }
      frame = window.requestAnimationFrame(step);
    }

    brand.addEventListener('pointerenter', function (event) {
      if (event.pointerType !== 'touch') { play(); }
    });
    brand.addEventListener('focus', play);
    brand.addEventListener('click', function (event) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) { return; }
      var home = new URL(brand.href);
      var current = new URL(window.location.href);
      if (current.pathname.replace(/index\.html$/, '') === home.pathname.replace(/index\.html$/, '')) {
        event.preventDefault();
        play();
      } else if (!motion.matches) {
        // Keep the home link working; the tap's animation plays after arrival.
        try { sessionStorage.setItem('lights-fan-on-arrival', '1'); } catch (error) {}
      }
    });
    motion.addEventListener('change', function () { if (motion.matches) { restore(); } });
    try {
      if (sessionStorage.getItem('lights-fan-on-arrival')) {
        sessionStorage.removeItem('lights-fan-on-arrival');
        play();
      }
    } catch (error) {}
  }

  /* --------------------------------------------------------- wishlist -- */
  /* Ordering is closed for now. "Add to cart" saves the coffee to the
     wishlist and opens cart.html, which says shopping is coming and lists
     what is saved, with every other coffee ready to add. */

  var SHOP = window.LIGHTS_SHOP;
  var wishlist = SHOP ? SHOP.readWishlist() : [];
  var refreshReserve = null;   /* set by initReserve on the wishlist page */

  function updateWishlistCount() {
    $$('[data-wishlist-count]').forEach(function (node) { node.textContent = wishlist.length; });
  }
  function saveWishlist(ids, message) {
    wishlist = SHOP.normalizeWishlist(ids);
    var saved = SHOP.writeWishlist(wishlist);
    updateWishlistCount();
    var status = $('[data-wishlist-status]');
    if (status) {
      status.textContent = saved ? message : 'Your browser could not save your wishlist. Private browsing or blocked site data can prevent it.';
    }
    return saved;
  }
  function wishlistRow(coffee, saved) {
    var row = el('li', 'cart-item');
    var photo = el('a', 'cart-item__photo');
    photo.href = 'product.html?id=' + encodeURIComponent(coffee.id);
    photo.setAttribute('aria-label', coffee.name);
    var image = el('img'); image.src = coffee.image; image.alt = '';
    photo.appendChild(image);
    var detail = el('div', 'cart-item__detail');
    var name = el('a', 'cart-item__name', coffee.name); name.href = photo.href;
    detail.appendChild(name);
    detail.appendChild(el('p', 'cart-item__options', coffee.origin + ' · ' + coffee.process));
    detail.appendChild(el('p', 'meta', SHOP.priceLabel(coffee)));
    var toggle = el('button', 'text-action', saved ? 'Remove' : 'Add to wishlist');
    toggle.type = 'button';
    toggle.id = 'wishlist-' + coffee.id;
    toggle.setAttribute('aria-label', (saved ? 'Remove ' : 'Add ') + coffee.name + (saved ? ' from' : ' to') + ' your wishlist');
    toggle.addEventListener('click', function () {
      if (saved) { saveWishlist(SHOP.remove(wishlist, coffee.id), coffee.name + ' removed from your wishlist.'); }
      else { saveWishlist(SHOP.add(wishlist, coffee.id), coffee.name + ' added to your wishlist.'); }
      renderWishlist(toggle.id);
    });
    var controls = el('div', 'cart-item__controls');
    controls.appendChild(toggle);
    detail.appendChild(controls);
    row.appendChild(photo); row.appendChild(detail);
    return row;
  }
  function renderWishlist(focusId) {
    var root = $('[data-wishlist-page]');
    if (!root || !SHOP) { return; }
    var list = $('[data-wishlist-items]', root);
    var more = $('[data-wishlist-more]', root);
    list.replaceChildren(); more.replaceChildren();
    DATA.coffees.forEach(function (coffee) {
      var saved = wishlist.indexOf(coffee.id) >= 0;
      (saved ? list : more).appendChild(wishlistRow(coffee, saved));
    });
    $('[data-wishlist-empty]', root).hidden = wishlist.length > 0;
    $('[data-wishlist-more-section]', root).hidden = wishlist.length === DATA.coffees.length;
    if (refreshReserve) { refreshReserve(); }
    if (focusId) {
      var target = $('#' + focusId);
      if (target) { target.focus(); }
    }
  }
  function initWishlist() {
    if (!SHOP) { return; }
    updateWishlistCount();

    var root = $('[data-wishlist-page]');
    if (root) {
      var added = SHOP.coffee(param('added'));
      var status = $('[data-wishlist-status]', root);
      if (added && wishlist.indexOf(added.id) >= 0) {
        status.textContent = added.name + ' is on your wishlist.';
      } else if (added) {
        status.textContent = 'Your browser could not save ' + added.name + ' to your wishlist. Private browsing or blocked site data can prevent it.';
      }
      // Say it once: a reload after removing the coffee should not repeat it.
      if (param('added') !== null) { window.history.replaceState(null, '', 'cart.html'); }
      renderWishlist();
    }
    window.addEventListener('storage', function (event) {
      if (event.key === SHOP.key || event.key === null) {
        wishlist = SHOP.readWishlist(); updateWishlistCount(); renderWishlist();
      }
    });
    $$('[data-add-to-cart]').forEach(function (button) {
      button.addEventListener('click', function () {
        var coffee = findCoffee(param('id')) || DATA.coffees[0];
        saveWishlist(SHOP.add(wishlist, coffee.id), coffee.name + ' added to your wishlist.');
        window.location.href = 'cart.html?added=' + encodeURIComponent(coffee.id);
      });
    });
  }

  /* ---------------------------------------------------- email reserve -- */
  /* The wishlist page's signup sends the email and the coffees on the
     wishlist to the endpoint in data.js as JSON. With no endpoint set the
     form stays hidden. */

  function initReserve() {
    var form = $('[data-reserve-form]');
    var endpoint = DATA.reserve && DATA.reserve.endpoint;
    if (!form || !SHOP || !/^https:\/\//.test(endpoint || '')) { return; }

    var listing = $('[data-reserve-coffees]', form);
    var submit = $('[data-reserve-submit]', form);
    var status = $('[data-reserve-status]', form);
    var email = $('[data-reserve-email]', form);
    var trap = $('[data-reserve-trap]', form);
    var sending = false;

    /* Shelf order, the same as the wishlist shown above the form. */
    function saved() {
      return DATA.coffees.filter(function (coffee) { return wishlist.indexOf(coffee.id) >= 0; });
    }
    function names(coffees) {
      return coffees.map(function (coffee) { return coffee.name + ' (' + SHOP.priceLabel(coffee) + ')'; }).join(', ');
    }
    refreshReserve = function () {
      var coffees = saved();
      listing.textContent = coffees.length ? 'Reserving: ' + names(coffees) + '.' : 'Add a coffee to your wishlist to reserve it.';
      submit.disabled = sending || coffees.length === 0;
    };

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var coffees = saved();
      if (sending || !coffees.length || !form.reportValidity()) { return; }
      var address = email.value.trim();
      sending = true;
      refreshReserve();
      status.textContent = 'Sending your reservation…';
      window.fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: address,
          coffees: names(coffees),
          coffee_ids: coffees.map(function (coffee) { return coffee.id; }).join(','),
          _subject: 'Coffee reservation: ' + coffees.map(function (coffee) { return coffee.name; }).join(', '),
          _gotcha: trap.value
        })
      }).then(function (response) {
        if (!response.ok) {
          status.textContent = 'We couldn’t take that reservation just now. Please try again in a moment.';
          return;
        }
        status.textContent = 'Thank you. Your reservation for ' + names(coffees) + ' is in, and we’ll email ' + address + ' when the shop opens.';
        email.value = '';
      }).catch(function () {
        status.textContent = 'Your reservation didn’t go through. Check your connection and try again.';
      }).then(function () {
        sending = false;
        refreshReserve();
      });
    });

    form.hidden = false;
    refreshReserve();
  }

  /* -------------------------------------------------- option swatches -- */
  /* Size and grind on the product page: one selection per row. */

  function initChoiceGroups() {
    $$('[data-choice-group]').forEach(function (group) {
      group.addEventListener('click', function (event) {
        var button = event.target.closest('.choice');
        if (!button || button.disabled || !group.contains(button)) { return; }

        $$('.choice', group).forEach(function (other) {
          other.setAttribute('aria-pressed', String(other === button));
        });
      });
    });
  }

  /* ---------------------------------------------------------- filters -- */

  function initFilters() {
    var listing = $('[data-listing]');
    if (!listing || !SHOP) { return; }
    var cards = $$('[data-coffee]', listing);
    var tally = $('[data-lot-count]');
    var empty = $('[data-listing-empty]');
    var input = $('[data-coffee-search]');
    var reset = $('[data-reset-search]');
    var chosen = { origin: 'all', process: 'all' };
    input.value = (param('q') || '').slice(0, 200);
    Object.keys(chosen).forEach(function (facet) {
      var value = param(facet);
      if ($$('[data-facet="' + facet + '"]').some(function (button) { return button.dataset.value === value; })) {
        chosen[facet] = value;
      }
    });
    function apply(updateURL) {
      var shown = 0;
      cards.forEach(function (card) {
        var id = new URL(card.href).searchParams.get('id');
        var coffee = SHOP.coffee(id);
        var ok = coffee && SHOP.matches(coffee, input.value) && Object.keys(chosen).every(function (facet) {
          // A coffee sold as more than one process lists each, space-separated.
          return chosen[facet] === 'all' || card.dataset[facet].toLowerCase().split(/\s+/).indexOf(chosen[facet]) >= 0;
        });
        card.hidden = !ok;
        if (ok) { shown += 1; }
      });
      $$('[data-facet]').forEach(function (button) {
        button.setAttribute('aria-pressed', String(chosen[button.dataset.facet] === button.dataset.value));
      });
      tally.textContent = shown + (shown === 1 ? ' lot' : ' lots');
      empty.hidden = shown > 0;
      reset.hidden = !input.value && Object.values(chosen).every(function (value) { return value === 'all'; });
      if (updateURL) {
        var url = new URL(window.location.href);
        if (input.value.trim()) { url.searchParams.set('q', input.value.trim()); } else { url.searchParams.delete('q'); }
        Object.keys(chosen).forEach(function (facet) {
          if (chosen[facet] === 'all') { url.searchParams.delete(facet); } else { url.searchParams.set(facet, chosen[facet]); }
        });
        window.history.replaceState(null, '', url);
      }
    }
    input.addEventListener('input', function () { apply(true); });
    $('[data-search-form]').addEventListener('submit', function (event) { event.preventDefault(); apply(true); });
    reset.addEventListener('click', function () {
      input.value = ''; Object.keys(chosen).forEach(function (facet) { chosen[facet] = 'all'; }); apply(true); input.focus();
    });
    $$('[data-facet]').forEach(function (button) {
      button.addEventListener('click', function () { chosen[button.dataset.facet] = button.dataset.value; apply(true); });
    });
    apply(false);
    if (window.location.hash === '#coffee-search') { input.focus(); }
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

    var coffee = findCoffee(param('id')) || DATA.coffees[0];
    if (!coffee) { return; }

    document.title = coffee.name + ' — Lights Landing Coffee';

    var well = $('[data-product-well]', root);
    var img  = $('[data-product-image]', root);
    img.src = coffee.image;
    img.alt = coffee.name + ' — label artwork';
    well.classList.toggle('product__well--photo', coffee.fit === 'cover');

    $('[data-product-eyebrow]', root).textContent =
      [coffee.origin, coffee.region, coffee.process].filter(Boolean).join(' · ');
    $('[data-product-name]', root).textContent  = coffee.name;
    $('[data-product-blurb]', root).textContent = coffee.blurb;
    $('[data-product-size]', root).textContent = coffee.size;
    $('[data-product-price]', root).textContent = 'Add to cart — ' + SHOP.money(coffee.price);

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
    document.title = guide.title + ' — Lights Landing Coffee';

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

  initFanLogo();
  initWishlist();
  initReserve();
  initChoiceGroups();
  initFilters();
  renderProduct();
  initGuide();
})();
