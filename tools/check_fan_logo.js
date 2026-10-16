/* Run with node tools/check_fan_logo.js. No dependencies or browser required. */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../assets/site.js'), 'utf8');

function page({ url = 'https://example.com/index.html', reduced = false, storage = new Map(), supported = true } = {}) {
  const callbacks = new Map();
  let nextFrame = 1;
  function element() {
    return {
      children: [], listeners: {}, classes: [],
      appendChild(child) { this.children.push(child); },
      setAttribute() {},
      addEventListener(name, handler) { this.listeners[name] = handler; },
      style: {},
      classList: { add(name) { /* A marker only; no CSS needed in this behavioral check. */ } }
    };
  }
  const mark = element();
  const brand = element();
  brand.href = 'https://example.com/index.html';
  brand.querySelector = selector => selector === '.brand__mark' ? mark : null;
  const motion = { matches: reduced, addEventListener(name, handler) { this.change = handler; } };
  const document = {
    querySelector: selector => selector === '.brand' ? brand : null,
    querySelectorAll: () => [], createElement: element
  };
  const sessionStorage = {
    getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key)
  };
  const window = { location: { href: url, search: '' }, matchMedia: () => motion,
    performance: { now: () => 0 },
    requestAnimationFrame: supported ? callback => { const id = nextFrame++; callbacks.set(id, callback); return id; } : undefined,
    cancelAnimationFrame: id => callbacks.delete(id)
  };
  vm.runInNewContext(source, { document, window, sessionStorage, URL, Promise });
  function tick(time) {
    const batch = Array.from(callbacks.values());
    callbacks.clear();
    batch.forEach(callback => callback(time));
  }
  const reveals = mark.children.length ? mark.children[0].children[1].children : [];
  const panels = reveals.map(reveal => reveal.children[0]);
  function visible() { return panels.map(panel => panel.style.visibility !== 'hidden'); }
  // Apply the actual CSS rigid transform to an SVG coordinate.
  function point(index, xy) {
    const transform = panels[index].style.transform;
    if (!transform) { return xy; }
    const numbers = transform.match(/-?[\d.]+(?:e[+-]?\d+)?/gi).map(Number);
    const [tx, ty, a, b, c, d] = numbers;
    const x = xy[0] + .93, y = xy[1] + .16;
    return [a*x+c*y+tx/100*508.99-.93, b*x+d*y+ty/100*491.25-.16];
  }
  function click(extra = {}) {
    const event = { button: 0, prevented: false, preventDefault() { this.prevented = true; }, ...extra };
    brand.listeners.click(event);
    return event;
  }
  return { brand, mark, panels, callbacks, motion, storage, click, tick, visible, point };
}

function near(actual, expected) {
  assert(Math.hypot(actual[0]-expected[0], actual[1]-expected[1]) < .001, `${actual} should join ${expected}`);
}

// A rigid panel must preserve every length and angle throughout the reveal.
// This fails for the old affine morph even when the final logo looks correct.
const rigid = page();
rigid.brand.listeners.focus();
for (let time = 17; time < 2300; time += 37) {
  rigid.tick(time);
  rigid.panels.forEach((panel, index) => {
    if (panel.style.visibility === 'hidden') { return; }
    const [tx, ty, a, b, c, d] = panel.style.transform.match(/-?[\d.]+(?:e[+-]?\d+)?/gi).map(Number);
    assert(Math.abs(a*a+b*b-1) < 1e-10, 'Horizontal length never changes');
    assert(Math.abs(c*c+d*d-1) < 1e-10, 'Vertical length never changes');
    assert(Math.abs(a*c+b*d) < 1e-10, 'No shear or angle changes');
    assert(Math.abs(a*d-b*c-1) < 1e-10, 'No scaling or reflection');
    assert.equal(panel.style.clipPath, undefined, 'Original panel silhouette stays fixed');
  });
}

const home = page();
assert.equal(home.panels.length, 4, 'Four panels revealed beside the fixed base');
assert.equal(home.callbacks.size, 0, 'No autoplay');
home.brand.listeners.pointerenter({ pointerType: 'touch' });
assert.equal(home.callbacks.size, 0, 'Touch waits for activation');
home.brand.listeners.pointerenter({ pointerType: 'mouse' });
assert.equal(home.callbacks.size, 1);
home.tick(500);
assert.deepEqual(home.visible(), [false, false, false, true]);
near(home.point(3, [479.13, 131.98]), [138.19, 40.8]);
const firstPosition = home.point(3, [507.05, 174.06]);
home.brand.listeners.focus();
assert.equal(home.callbacks.size, 1, 'Focus during hover does not restart');
home.tick(1100);
assert.deepEqual(home.visible(), [false, false, true, true]);
near(home.point(2, [424.6, 68.24]), [138.19, 40.8]);
near(home.point(3, [479.13, 131.98]), home.point(2, [479.13, 131.98]));
assert(Math.hypot(...home.point(3, [507.05, 174.06]).map((n,i) => n-firstPosition[i])) > 10,
  'The first panel moves outward when the next one opens');
home.tick(1700);
assert.deepEqual(home.visible(), [false, true, true, true]);
near(home.point(1, [301.83, 11.97]), [138.19, 40.8]);
near(home.point(2, [424.6, 68.24]), home.point(1, [424.6, 68.24]));
near(home.point(3, [479.13, 131.98]), home.point(2, [479.13, 131.98]));
home.tick(2299);
assert.deepEqual(home.visible(), [true, true, true, true]);
near(home.point(3, [507.05, 174.06]), [507.05, 174.06]);
home.tick(2300);
assert(home.panels.every(panel => panel.style.transform === '' && panel.style.visibility === ''),
  'Finishes as the untouched original logo');
assert.equal(home.callbacks.size, 0);
assert(home.click().prevented, 'At home a tap replays without navigating');
assert.equal(home.callbacks.size, 1);
assert(!home.click({ metaKey: true }).prevented, 'Modified clicks retain normal link behavior');

const other = page({ url: 'https://example.com/coffee.html' });
assert(!other.click().prevented, 'Other pages still navigate home');
assert.equal(other.storage.get('lights-fan-on-arrival'), '1');
const arrival = page({ storage: other.storage });
assert.equal(arrival.callbacks.size, 1, 'The tap plays on arrival');
assert.equal(arrival.storage.size, 0, 'Arrival plays only once');
arrival.motion.matches = true;
arrival.motion.change();
assert.equal(arrival.callbacks.size, 0);
assert(arrival.panels.every(panel => panel.style.transform === '' && panel.style.visibility === ''),
  'Enabling Reduce Motion restores the complete logo');
const still = page({ reduced: true });
still.brand.listeners.focus();
still.click();
assert.equal(still.callbacks.size, 0);
const fallback = page({ supported: false });
assert.equal(fallback.mark.children.length, 0, 'Unsupported browsers keep the original static mask');
console.log('Fan logo checks passed: rigid shapes at every frame, clipped reveal, attached edges, 0.6s cascade, final artwork, replay, navigation and reduced motion.');
