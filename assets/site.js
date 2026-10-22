/* Behaviour for Lights Landing Coffee.
   Pages carry their own English text; this file puts them into Chinese
   when asked, draws the coffee cards from assets/data.js, and runs the
   wishlist, the shelf's search, filters and sort, each coffee's page, the
   brew-guide tabs and the email reservations. Every white card gets its
   small lean here. */

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

  /* --------------------------------------------------------- language -- */
  /* English or Chinese. Text marked data-i18n in a page swaps to its
     Chinese in assets/i18n.js; coffees and guides carry their own `zh`.
     The choice is kept in this browser; ?lang=zh or ?lang=en in a link
     sets it, and a first visit follows the browser's language. */

  var ZH = window.LIGHTS_ZH || {};
  var LANG_KEY = 'lights.lang';
  var lang = (function () {
    var asked = null, stored = null;
    try {
      asked = param('lang');
      stored = window.localStorage.getItem(LANG_KEY);
    } catch (error) {}
    if (asked === 'zh' || asked === 'en') {
      try { window.localStorage.setItem(LANG_KEY, asked); } catch (error) {}
      return asked;
    }
    if (stored === 'zh' || stored === 'en') { return stored; }
    return /^zh/i.test((window.navigator && window.navigator.language) || '') ? 'zh' : 'en';
  })();
  var rerenders = [];            /* parts drawn by script, redrawn on a switch */
  var englishHTML = new Map();   /* each translated node's own English */

  function isZh() { return lang === 'zh'; }
  /* A piece of interface text in the current language. */
  function L(en, zh) { return isZh() ? zh : en; }
  /* A coffee's or guide's field in the current language. */
  function loc(item, field) {
    return isZh() && item.zh && item.zh[field] != null ? item.zh[field] : item[field];
  }
  var LABELS = { Region: '产区', Variety: '品种', Process: '处理法', Lot: '批次', Altitude: '海拔',
    Harvest: '产季', Roast: '烘焙度', Price: '价格', Tasting: '风味' };
  function label(name) { return L(name, LABELS[name] || name); }

  function translatePage() {
    var root = document.documentElement;
    if (!root) { return; }
    root.lang = isZh() ? 'zh-Hans' : 'en';
    $$('[data-i18n]').forEach(function (node) {
      if (!englishHTML.has(node)) { englishHTML.set(node, node.innerHTML); }
      var chinese = ZH[node.dataset.i18n];
      node.innerHTML = isZh() && chinese != null ? chinese : englishHTML.get(node);
    });
    $$('[data-i18n-attr]').forEach(function (node) {
      node.dataset.i18nAttr.split(',').forEach(function (pair) {
        var name = pair.split(':')[0], key = pair.split(':')[1];
        var keep = 'data-en-' + name;
        if (!node.hasAttribute(keep)) { node.setAttribute(keep, node.getAttribute(name) || ''); }
        node.setAttribute(name, isZh() && ZH[key] != null ? ZH[key] : node.getAttribute(keep));
      });
    });
    var toggle = $('[data-lang-toggle]');
    if (toggle) {
      toggle.textContent = L('中', 'EN');
      toggle.lang = L('zh-Hans', 'en');
      toggle.setAttribute('aria-label', L('切换到中文', 'Switch to English'));
    }
    root.classList.remove('is-translating');
  }
  function initLanguage() {
    translatePage();
    var toggle = $('[data-lang-toggle]');
    if (!toggle) { return; }
    toggle.addEventListener('click', function () {
      lang = isZh() ? 'en' : 'zh';
      try { window.localStorage.setItem(LANG_KEY, lang); } catch (error) {}
      // A ?lang= left in the address would undo the choice on a reload.
      if (param('lang') !== null) {
        var url = new URL(window.location.href);
        url.searchParams.delete('lang');
        window.history.replaceState(window.history.state, '', url);
      }
      translatePage();
      refreshWishlist();
      rerenders.forEach(function (draw) { draw(); });
      wobble();
      fitTastes();
    });
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

  /* ----------------------------------------------------------- wobble -- */
  /* Every white card and coffee card is laid on the wall by hand: each keeps
     one random lean for the visit, a few pixels at its edge whatever its
     width, in a random direction. */

  var LEANS = {};
  var unnamed = 0;
  function lean(key) {
    if (!LEANS[key]) {
      LEANS[key] = { d: Math.random() * 2 - 1, x: Math.random() * 3 - 1.5, y: Math.random() * 3 - 1.5 };
    }
    return LEANS[key];
  }
  function wobble() {
    $$('.card, .bean').forEach(function (card) {
      if (!card.dataset.lean) { card.dataset.lean = 'card-' + (unnamed += 1); }
      var tilt = lean(card.dataset.lean);
      var width = card.offsetWidth;
      if (!width) { return; }
      var degrees = tilt.d * Math.asin(Math.min(1, 4 / width)) * 180 / Math.PI;
      card.style.setProperty('--tilt', degrees.toFixed(3) + 'deg');
      card.style.setProperty('--nx', tilt.x.toFixed(2) + 'px');
      card.style.setProperty('--ny', tilt.y.toFixed(2) + 'px');
    });
  }
  /* The tasting notes at the foot of a card get whatever room its names
     leave. They show in full (aroma, palate, finish) where that fits, as one
     line of flavours where it doesn't, and in whole lines either way: never
     a line cut in half. */
  function fitTastes() {
    $$('.bean__taste').forEach(function (taste) {
      var full = taste.querySelector('.bean__taste-full');
      var short = taste.querySelector('.bean__taste-short');
      full.hidden = false;
      short.hidden = true;
      short.style.webkitLineClamp = '';
      taste.style.visibility = '';
      if (taste.scrollHeight <= taste.clientHeight + 1) { return; }
      full.hidden = true;
      short.hidden = false;
      var style = window.getComputedStyle(short);
      var room = taste.clientHeight - short.offsetTop + taste.offsetTop;
      var lines = Math.floor(room / parseFloat(style.lineHeight) + .05);
      short.style.webkitLineClamp = String(Math.max(lines, 1));
      if (lines < 1) { taste.style.visibility = 'hidden'; }
    });
  }
  function initWobble() {
    if (!$('.card')) { return; }
    var timer = null;
    window.addEventListener('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { wobble(); fitTastes(); }, 150);
    });
    if (document.fonts) { document.fonts.ready.then(fitTastes); }
    wobble();
  }

  /* --------------------------------------------------------- wishlist -- */
  /* Ordering is closed for now. "Add to wishlist" saves the coffee in this
     browser; cart.html says shopping is coming and lists what is saved. */

  var SHOP = window.LIGHTS_SHOP;
  var wishlist = SHOP ? SHOP.readWishlist() : [];
  var painters = [];          /* every wishlist button on the page */
  var onWishlistChange = [];  /* page parts that list what is saved */
  function failed() {
    return L('Your browser could not save your wishlist. Private browsing or blocked site data can prevent it.',
      '你的浏览器无法保存心愿单。无痕浏览或被屏蔽的网站数据可能导致这个问题。');
  }

  function findCoffee(id) {
    for (var i = 0; i < DATA.coffees.length; i += 1) {
      if (DATA.coffees[i].id === id) { return DATA.coffees[i]; }
    }
    return null;
  }
  function isSaved(coffee) { return wishlist.indexOf(coffee.id) >= 0; }
  function refreshWishlist() {
    var n = wishlist.length;
    $$('[data-wishlist-count]').forEach(function (node) {
      node.textContent = n;
      node.hidden = n === 0;
    });
    $$('[data-wishlist-link]').forEach(function (link) {
      link.setAttribute('aria-label', L('Wishlist, ' + n + (n === 1 ? ' coffee' : ' coffees'), '心愿单，' + n + ' 款咖啡'));
    });
    painters = painters.filter(function (painter) { return painter.button.isConnected; });
    painters.forEach(function (painter) { painter.paint(); });
    onWishlistChange.forEach(function (render) { render(); });
  }
  /* Returns false when the browser refused to store it. */
  function saveWishlist(ids) {
    wishlist = SHOP.normalizeWishlist(ids);
    var saved = SHOP.writeWishlist(wishlist);
    refreshWishlist();
    return saved;
  }
  function wishButton(coffee, className, status) {
    var button = el('button', className);
    button.type = 'button';
    function paint() {
      var on = isSaved(coffee);
      button.textContent = on ? L('On your wishlist', '已在心愿单') : L('Add to wishlist', '加入心愿单');
      button.setAttribute('aria-pressed', String(on));
    }
    button.addEventListener('click', function () {
      var ok = saveWishlist(isSaved(coffee) ? SHOP.remove(wishlist, coffee.id) : SHOP.add(wishlist, coffee.id));
      if (status) { status.textContent = ok ? '' : failed(); }
    });
    paint();
    painters.push({ button: button, paint: paint });
    return button;
  }
  function initWishlist() {
    if (!SHOP) { return; }
    refreshWishlist();
    window.addEventListener('storage', function (event) {
      if (event.key === SHOP.key || event.key === null) {
        wishlist = SHOP.readWishlist();
        refreshWishlist();
      }
    });
  }

  /* -------------------------------------------------------- bean card -- */
  /* Front: the café's printed wall card. Back: white, with the basic info,
     a wishlist button and a link to the coffee's own page. */

  function lines(node, list) {
    list.forEach(function (text, i) {
      if (i) { node.appendChild(document.createElement('br')); }
      node.appendChild(document.createTextNode(text));
    });
    return node;
  }
  function productURL(coffee) { return 'product.html?id=' + encodeURIComponent(coffee.id); }
  /* Absolute, because a url() in a custom property resolves against the
     stylesheet that uses it, not this page. */
  function artURL(coffee) { return 'url("' + new URL(coffee.art, document.baseURI).href + '")'; }

  /* The 「tag」 printed in the card's corner; the brackets are Chinese. */
  function tag(coffee) { return L(coffee.card.tag, '「' + coffee.card.tag + '」'); }

  /* [label, value, optional on phone-sized cards]. A coffee's page lists
     the roast where a card lists the price. */
  function basics(coffee, onPage) {
    var specs = loc(coffee, 'specs');
    var rows = [[label('Region'), loc(coffee, 'region')], [label('Variety'), loc(coffee, 'variety'), true],
      [label('Process'), loc(coffee, 'process')]];
    // The lot, altitude or harvest the label gives, whichever it has.
    var lot = ['Lot', 'Altitude', 'Harvest'].filter(function (name) { return specs[name]; })[0];
    if (lot) { rows.push([label(lot), specs[lot], true]); }
    rows.push(onPage ? [label('Roast'), specs.Roast] : [label('Price'), SHOP.priceLabel(coffee)]);
    rows.push([label('Tasting'), loc(coffee, 'notes'), true]);
    return rows;
  }
  function specList(rows, compact) {
    var dl = el('dl', 'specs');
    rows.forEach(function (row) {
      var dt = el('dt', null, row[0]);
      var dd = el('dd', null, row[1]);
      if (compact && row[2]) { dt.classList.add('opt'); dd.classList.add('opt'); }
      dl.appendChild(dt);
      dl.appendChild(dd);
    });
    return dl;
  }

  /* ---------------------------------------------------- turning a card -- */
  /* With a mouse, a card turns over while the pointer rests on it (or while
     the keyboard is inside it). On a touch screen it turns under the finger:
     a sideways swipe drags it round like a real card, and letting go springs
     it to the nearer side, or on over the edge when flicked. A click or tap
     anywhere on the card, front or back, opens the coffee's page; only the
     wishlist button does something else. */

  var REDUCED = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var SPRING = 170;   /* stiffness, 1/s² */

  function turnable(card, inner, url) {
    var angle = 0;          /* degrees; even multiples of 180 show the front */
    var frame = null;
    var drag = null;        /* the swipe in progress */
    var swipedAt = 0;       /* a swipe's own click must not open the page */

    function paint(degrees) {
      angle = degrees;
      // Mid-turn the card comes up off the wall and its face darkens, the
      // way a card held edge-on to the light does.
      var edge = Math.abs(Math.sin(degrees * Math.PI / 180));
      inner.style.transform = 'translateZ(' + (edge * 28).toFixed(1) + 'px) rotateY(' + degrees.toFixed(2) + 'deg)';
      card.style.setProperty('--edge', edge.toFixed(3));
      card.classList.toggle('is-flipped', Math.abs(Math.round(degrees / 180)) % 2 === 1);
    }
    /* A damped spring: it carries the finger's speed and settles with a
       small overshoot, so the card has weight. */
    function springTo(target, velocity, damping) {
      if (frame !== null) { window.cancelAnimationFrame(frame); frame = null; }
      if (REDUCED.matches || !window.requestAnimationFrame) { paint(target); return; }
      var x = angle, v = velocity || 0, last = null;
      var friction = 2 * (damping || .62) * Math.sqrt(SPRING);
      function step(now) {
        if (last === null) { last = now; }
        var dt = Math.min(.032, (now - last) / 1000);
        last = now;
        v += (-SPRING * (x - target) - friction * v) * dt;
        x += v * dt;
        if (Math.abs(x - target) < .3 && Math.abs(v) < 3) { paint(target); frame = null; return; }
        paint(x);
        frame = window.requestAnimationFrame(step);
      }
      frame = window.requestAnimationFrame(step);
    }
    /* The nearest resting angle that shows the front (0) or the back (1). */
    function side(which) {
      return Math.round((angle - which * 180) / 360) * 360 + which * 180;
    }

    card.addEventListener('pointerenter', function (event) {
      if (event.pointerType === 'mouse') { springTo(side(1), 0, .8); }
    });
    card.addEventListener('pointerleave', function (event) {
      // Stay turned only while the keyboard is working inside the card.
      var keyboard = card.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
      if (event.pointerType === 'mouse' && !keyboard) { springTo(side(0), 0, .8); }
    });
    card.addEventListener('focusin', function () { springTo(side(1), 0, .8); });
    card.addEventListener('focusout', function (event) {
      if (!card.contains(event.relatedTarget) && !card.matches(':hover')) { springTo(side(0), 0, .8); }
    });

    card.addEventListener('pointerdown', function (event) {
      if (event.pointerType === 'mouse' || !event.isPrimary) { return; }
      drag = { x: event.clientX, y: event.clientY, from: angle, moving: false, t: event.timeStamp, last: angle, v: 0 };
    });
    card.addEventListener('pointermove', function (event) {
      if (!drag) { return; }
      var dx = event.clientX - drag.x, dy = event.clientY - drag.y;
      if (!drag.moving) {
        if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }   // a scroll
        if (Math.abs(dx) < 8) { return; }
        drag.moving = true;
        card.setPointerCapture(event.pointerId);
        card.classList.add('is-held');
        if (frame !== null) { window.cancelAnimationFrame(frame); frame = null; }
      }
      // A swipe across the whole card turns it about two-thirds over.
      var degrees = drag.from + dx / card.offsetWidth * 120;
      var dt = Math.max(1, event.timeStamp - drag.t);
      drag.v = .7 * drag.v + .3 * (degrees - drag.last) / dt * 1000;
      drag.last = degrees;
      drag.t = event.timeStamp;
      paint(degrees);
    });
    function release() {
      if (!drag) { return; }
      var moved = drag.moving, from = drag.from, v = drag.v;
      drag = null;
      if (!moved) { return; }
      card.classList.remove('is-held');
      swipedAt = Date.now();
      // Go to the side the card would coast to, but never more than one
      // turn from where the swipe began.
      var target = Math.round((angle + v * .18) / 180) * 180;
      target = Math.max(from - 180, Math.min(from + 180, target));
      springTo(target, v);
    }
    card.addEventListener('pointerup', release);
    card.addEventListener('pointercancel', release);

    card.addEventListener('click', function (event) {
      if (Date.now() - swipedAt < 400) { event.preventDefault(); return; }
      if (!url || event.target.closest('button, a')) { return; }
      window.location.href = url;
    });

    return {
      /* A small sideways wobble that shows a card can be turned. */
      nudge: function () { springTo(angle, 420, .35); }
    };
  }

  /* The foot of a card: the roaster's tasting notes (in English, their
     translation), and a one-line version for when the card is too small. */
  function tasting(coffee) {
    var taste = el('div', 'bean__taste');
    taste.appendChild(el('b', null, L('Tasting notes', '风味表现')));
    var full = el('div', 'bean__taste-full');
    (loc(coffee, 'cup') || [[null, loc(coffee, 'tasting')]]).forEach(function (pair) {
      var row = el('p');
      if (pair[0]) { row.appendChild(el('span', null, pair[0] + L(': ', '：'))); }
      row.appendChild(document.createTextNode(pair[1]));
      full.appendChild(row);
    });
    taste.appendChild(full);
    var short = el('p', 'bean__taste-short', L(coffee.notes, coffee.card.notes));
    short.hidden = true;
    taste.appendChild(short);
    return taste;
  }

  /* `key` names where the card sits, so the same coffee in two places keeps
     two leans. Home leads with the coffee's page; elsewhere the wishlist. */
  function bean(coffee, key) {
    var card = el('article', 'bean');
    card.dataset.lean = coffee.id + '-' + key;
    card.style.setProperty('--art', artURL(coffee));
    card.setAttribute('aria-label', loc(coffee, 'name'));
    var inner = el('div', 'bean__inner');

    var front = el('div', 'bean__face bean__front');
    front.appendChild(el('span', 'bean__art'));
    var face = el('div', 'bean__body');
    var tips = el('p', 'bean__tips');
    tips.appendChild(el('small', null, 'Tips'));
    tips.appendChild(el('b', null, tag(coffee)));
    face.appendChild(tips);
    // Each language's card carries only its own names, which leaves the
    // room for the tasting notes.
    face.appendChild(isZh() ? lines(el('p', 'bean__zh'), coffee.card.zh)
      : lines(el('p', 'bean__en'), coffee.card.en));
    face.appendChild(el('p', 'bean__price', SHOP.priceLabel(coffee)));
    face.appendChild(tasting(coffee));
    front.appendChild(face);
    front.appendChild(el('span', 'bean__mark'));
    // The coffee's own page is the card's link. The card on that page
    // only turns over.
    var url = key === 'print' ? null : productURL(coffee);
    if (url) {
      var hit = el('a', 'bean__hit');
      hit.href = url;
      hit.setAttribute('aria-label', loc(coffee, 'name') + L(': ', '：') + loc(coffee, 'origin') + L(', ', '，') + SHOP.priceLabel(coffee));
      front.appendChild(hit);
    }

    var back = el('div', 'bean__face bean__back');
    var body = el('div', 'bean__body');
    body.appendChild(el('span', 'eyebrow', L('Basic info', '基本信息')));
    body.appendChild(el('p', 'bean__back-title', L(coffee.card.en, coffee.card.zh).slice(0, 2).join(' ')));
    body.appendChild(specList(basics(coffee), true));
    var actions = el('div', 'bean__actions');
    var status = el('p', 'bean__status');
    status.setAttribute('role', 'status');
    var featured = key === 'home';
    var more = url ? el('a', featured ? 'btn' : 'link', L('More about this coffee', '了解这支咖啡')) : null;
    if (more) { more.href = url; }
    if (featured) {
      actions.appendChild(more);
      actions.appendChild(wishButton(coffee, 'btn btn--quiet', status));
    } else {
      actions.appendChild(wishButton(coffee, 'btn', status));
      if (more) { actions.appendChild(more); }
    }
    actions.appendChild(status);
    body.appendChild(actions);
    back.appendChild(body);

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    card.turn = turnable(card, inner, url);
    return card;
  }

  /* On a touch screen nothing says a card can be swiped, so the first card
     on the page gives one small wobble, once a visit. */
  function hintSwipe(container) {
    var card = container.querySelector('.bean');
    var touch = window.matchMedia && window.matchMedia('(hover: none)').matches;
    if (!card || !touch || REDUCED.matches) { return; }
    try {
      if (window.sessionStorage.getItem('lights-swipe-hint')) { return; }
      window.sessionStorage.setItem('lights-swipe-hint', '1');
    } catch (error) {}
    setTimeout(function () { card.turn.nudge(); }, 700);
  }

  /* Fill a [data-beans] row, replacing its plain-link fallback. */
  function fillBeans(container, coffees, key) {
    container.replaceChildren();
    coffees.forEach(function (coffee) { container.appendChild(bean(coffee, key)); });
    wobble();
    fitTastes();
  }
  function initRows() {
    if (!SHOP) { return; }
    var home = $('[data-beans="home"]');
    if (home) {
      var draw = function () { fillBeans(home, DATA.coffees.slice(0, 3), 'home'); };
      draw();
      rerenders.push(draw);
      hintSwipe(home);
    }
  }

  /* ------------------------------------------------------------ shelf -- */
  /* Search, origin and process filters and price order, all kept in the
     address so a filtered shelf can be shared or reloaded. */

  function initShelf() {
    var shelf = $('[data-beans="shelf"]');
    if (!shelf || !SHOP) { return; }
    var input = $('[data-coffee-search]');
    var sort = $('[data-sort]');
    var tally = $('[data-lot-count]');
    var empty = $('[data-shelf-empty]');
    var chosen = { origin: 'all', process: 'all' };

    input.value = (param('q') || '').slice(0, 200);
    if (param('sort') === 'desc') { sort.value = 'desc'; }
    Object.keys(chosen).forEach(function (facet) {
      var wanted = (param(facet) || '').toLowerCase();
      $$('[data-facet="' + facet + '"]').forEach(function (chip) {
        if (chip.dataset.value.toLowerCase() === wanted) { chosen[facet] = chip.dataset.value; }
      });
    });

    function render(updateURL) {
      var list = DATA.coffees.filter(function (coffee) {
        return SHOP.matches(coffee, input.value) &&
          (chosen.origin === 'all' || coffee.origin === chosen.origin) &&
          (chosen.process === 'all' || coffee.processes.indexOf(chosen.process) >= 0);
      }).sort(function (a, b) { return sort.value === 'desc' ? b.price - a.price : a.price - b.price; });
      fillBeans(shelf, list, 'shelf');
      tally.textContent = L(list.length + (list.length === 1 ? ' lot' : ' lots'), list.length + ' 款');
      empty.hidden = list.length > 0;
      $$('[data-facet]').forEach(function (chip) {
        chip.setAttribute('aria-pressed', String(chosen[chip.dataset.facet] === chip.dataset.value));
      });
      if (updateURL) {
        var url = new URL(window.location.href);
        var query = input.value.trim();
        if (query) { url.searchParams.set('q', query); } else { url.searchParams.delete('q'); }
        Object.keys(chosen).forEach(function (facet) {
          if (chosen[facet] === 'all') { url.searchParams.delete(facet); }
          else { url.searchParams.set(facet, chosen[facet].toLowerCase()); }
        });
        if (sort.value === 'desc') { url.searchParams.set('sort', 'desc'); } else { url.searchParams.delete('sort'); }
        url.hash = '';
        window.history.replaceState(null, '', url);
      }
    }
    input.addEventListener('input', function () { render(true); });
    $('[data-search-form]').addEventListener('submit', function (event) { event.preventDefault(); render(true); });
    sort.addEventListener('change', function () { render(true); });
    $$('[data-facet]').forEach(function (chip) {
      chip.addEventListener('click', function () {
        chosen[chip.dataset.facet] = chip.dataset.value;
        render(true);
      });
    });
    $('[data-reset-shelf]').addEventListener('click', function () {
      input.value = '';
      chosen.origin = chosen.process = 'all';
      render(true);
      input.focus();
    });
    render(false);
    rerenders.push(function () { render(false); });
    hintSwipe(shelf);
    if (window.location.hash === '#coffee-search') { input.focus(); }
  }

  /* ------------------------------------------------------ coffee page -- */

  function text(selector, value) {
    var node = $(selector);
    if (node) { node.textContent = value; }
    return node;
  }
  function renderProduct() {
    var root = $('[data-product]');
    if (!root || !SHOP) { return; }
    var coffee = findCoffee(param('id')) || DATA.coffees[0];
    function paint() {
      document.title = L(coffee.name + ' — Lights Landing Coffee', coffee.zh.name + ' — 陆光咖啡');
      text('[data-product-eyebrow]', loc(coffee, 'origin') + ' · ' + tag(coffee));
      // In Chinese the name is the card's Chinese, with its English below.
      lines(text('[data-product-name]', ''), isZh() ? coffee.card.zh : coffee.card.en);
      var sub = text('[data-product-sub]', '');
      if (isZh()) { lines(sub, coffee.card.en); }
      sub.hidden = !isZh();
      text('[data-product-price]', SHOP.priceLabel(coffee));
      var wish = wishButton(coffee, 'btn', $('[data-wishlist-status]'));
      wish.setAttribute('data-product-wish', '');
      $('[data-product-wish]').replaceWith(wish);

      var specs = $('[data-product-specs]');
      var fresh = specList(basics(coffee, true));
      specs.replaceChildren();
      while (fresh.firstChild) { specs.appendChild(fresh.firstChild); }
      text('[data-product-blurb]', loc(coffee, 'blurb'));
      $('[data-product-print]').replaceChildren(bean(coffee, 'print'));

      var cup = $('[data-product-cup]');
      cup.replaceChildren();
      (loc(coffee, 'cup') || [[L('Tasting', '风味表现'), loc(coffee, 'tasting')]]).forEach(function (pair) {
        var row = el('div');
        row.appendChild(el('dt', null, pair[0]));
        row.appendChild(el('dd', null, pair[1]));
        cup.appendChild(row);
      });
      text('[data-product-label-en]', coffee.label.en);
      text('[data-product-label-zh]', coffee.label.zh).hidden = !isZh();
      var bag = $('[data-product-bag]');
      bag.src = coffee.bag;
      bag.alt = L('A bag of ' + coffee.name + ' with its printed tag', coffee.zh.name + '的咖啡袋和挂牌');

      var story = $('[data-product-story]');
      story.replaceChildren();
      loc(coffee, 'story').forEach(function (para) { story.appendChild(el('p', null, para)); });
      var awards = $('[data-product-awards]');
      awards.replaceChildren();
      (loc(coffee, 'awards') || []).forEach(function (line) { awards.appendChild(el('li', null, line)); });
      $('[data-product-awards-block]').hidden = !coffee.awards;

      fillBeans($('[data-beans="also"]'), DATA.coffees.filter(function (other) { return other !== coffee; }), 'also');
    }
    paint();
    rerenders.push(paint);
  }

  /* ------------------------------------------------------- brew guide -- */

  function findGuide(id) {
    for (var i = 0; i < DATA.guides.length; i += 1) {
      if (DATA.guides[i].id === id) { return DATA.guides[i]; }
    }
    return null;
  }
  var shownGuide = null;
  function paintGuide(guide) {
    shownGuide = guide;
    document.title = L(guide.title + ' — Lights Landing Coffee', guide.zh.title + ' — 陆光咖啡');
    var image = $('[data-guide-image]');
    image.src = guide.image;
    image.alt = loc(guide, 'alt');
    text('[data-guide-title]', loc(guide, 'title'));
    text('[data-guide-intro]', loc(guide, 'intro'));
    text('[data-guide-note]', loc(guide, 'note'));

    var glance = $('[data-guide-glance]');
    glance.replaceChildren();
    loc(guide, 'glance').forEach(function (pair) {
      glance.appendChild(el('dt', null, pair[0]));
      glance.appendChild(el('dd', null, pair[1]));
    });
    var steps = $('[data-guide-steps]');
    steps.replaceChildren();
    loc(guide, 'steps').forEach(function (step, i) {
      var row = el('div', 'step');
      row.appendChild(el('span', 'step__n', ('0' + (i + 1)).slice(-2)));
      var body = el('div');
      body.appendChild(el('h3', null, step[0]));
      body.appendChild(el('p', null, step[1]));
      row.appendChild(body);
      steps.appendChild(row);
    });
    $$('[data-guide-tab]').forEach(function (tab) {
      var named = findGuide(tab.dataset.guideTab);
      if (named) { tab.textContent = loc(named, 'name'); }
      if (tab.dataset.guideTab === guide.id) { tab.setAttribute('aria-current', 'page'); }
      else { tab.removeAttribute('aria-current'); }
    });
  }
  function initGuide() {
    if (!$('[data-guide-steps]')) { return; }
    paintGuide(findGuide(param('m')) || DATA.guides[0]);
    rerenders.push(function () { paintGuide(shownGuide); });
    $$('[data-guide-tab]').forEach(function (tab) {
      tab.addEventListener('click', function (event) {
        var next = findGuide(tab.dataset.guideTab);
        if (!next) { return; }
        event.preventDefault();
        paintGuide(next);
        window.history.pushState({ m: next.id }, '', 'brew.html?m=' + next.id);
      });
    });
    window.addEventListener('popstate', function () {
      paintGuide(findGuide(param('m')) || DATA.guides[0]);
    });
  }

  /* ---------------------------------------------------- wishlist page -- */

  function wishRow(coffee) {
    var row = el('li', 'wish-row');
    var swatch = el('span', 'wish-row__swatch');
    swatch.style.setProperty('--art', artURL(coffee));
    row.appendChild(swatch);
    var detail = el('div');
    var name = el('a', 'wish-row__name', loc(coffee, 'name'));
    name.href = productURL(coffee);
    detail.appendChild(name);
    detail.appendChild(el('div', 'wish-row__meta', loc(coffee, 'origin') + ' · ' + SHOP.priceLabel(coffee)));
    row.appendChild(detail);
    var remove = el('button', null, L('Remove', '移除'));
    remove.type = 'button';
    remove.setAttribute('aria-label', L('Remove ' + coffee.name + ' from your wishlist', '从心愿单移除' + coffee.zh.name));
    remove.addEventListener('click', function () {
      var ok = saveWishlist(SHOP.remove(wishlist, coffee.id));
      text('[data-wishlist-status]', ok ? L(coffee.name + ' removed from your wishlist.', '已从心愿单移除' + loc(coffee, 'name') + '。') : failed());
    });
    row.appendChild(remove);
    return row;
  }
  function initWishlistPage() {
    var list = $('[data-wishlist-items]');
    if (!list || !SHOP) { return; }
    var more = $('[data-beans="wish"]');
    var shown = null;
    function render() {
      var saved = DATA.coffees.filter(isSaved);
      var key = saved.map(function (coffee) { return coffee.id; }).join();
      if (key === shown) { return; }
      shown = key;
      // A card added from below leaves the page; keep the keyboard nearby.
      var lostFocus = more.contains(document.activeElement) || list.contains(document.activeElement);
      list.replaceChildren();
      saved.forEach(function (coffee) { list.appendChild(wishRow(coffee)); });
      $('[data-wishlist-empty]').hidden = saved.length > 0;
      var others = DATA.coffees.filter(function (coffee) { return !isSaved(coffee); });
      $('[data-wishlist-more]').hidden = others.length === 0;
      fillBeans(more, others, 'wish');
      if (lostFocus) { $('[data-wishlist-heading]').focus(); }
    }
    onWishlistChange.push(render);
    rerenders.push(function () { shown = null; render(); });
    render();
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

    /* Shelf order, the same as the wishlist beside the form. */
    function saved() { return DATA.coffees.filter(isSaved); }
    function names(coffees) {
      return coffees.map(function (coffee) { return coffee.name + ' (' + SHOP.priceLabel(coffee) + ')'; }).join(', ');
    }
    /* What the visitor reads; the email to the shop is always in English. */
    function shownNames(coffees) {
      return isZh() ? coffees.map(function (coffee) { return coffee.zh.name + '（' + SHOP.priceLabel(coffee) + '）'; }).join('、')
        : names(coffees);
    }
    function refresh() {
      var coffees = saved();
      listing.textContent = coffees.length ? L('Reserving: ' + names(coffees) + '.', '预留：' + shownNames(coffees) + '。')
        : L('Add a coffee to your wishlist to reserve it.', '先把咖啡加入心愿单，才能预留。');
      submit.disabled = sending || coffees.length === 0;
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var coffees = saved();
      if (sending || !coffees.length || !form.reportValidity()) { return; }
      var address = email.value.trim();
      sending = true;
      refresh();
      status.textContent = L('Sending your reservation…', '正在发送你的预留…');
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
          status.textContent = L('We couldn’t take that reservation just now. Please try again in a moment.', '暂时无法接收这次预留，请稍后再试。');
          return;
        }
        status.textContent = L('Thank you. Your reservation for ' + names(coffees) + ' is in, and we’ll email ' + address + ' when the shop opens.',
          '谢谢。你已预留' + shownNames(coffees) + '，开业时我们会发邮件到 ' + address + '。');
        email.value = '';
      }).catch(function () {
        status.textContent = L('Your reservation didn’t go through. Check your connection and try again.', '预留没有发送成功。请检查网络后再试。');
      }).then(function () {
        sending = false;
        refresh();
      });
    });

    onWishlistChange.push(refresh);
    rerenders.push(refresh);
    form.hidden = false;
    refresh();
    wobble();
  }

  /* ------------------------------------------------------------- boot -- */

  initLanguage();
  initFanLogo();
  initWishlist();
  initRows();
  initShelf();
  renderProduct();
  initGuide();
  initWishlistPage();
  initReserve();
  initWobble();
})();
