/* Behaviour for Lights Landing Coffee.
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

    document.title = coffee.name + ' — Lights Landing Coffee';

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
  initCart();
  initChoiceGroups();
  initFilters();
  renderProduct();
  initGuide();
})();
