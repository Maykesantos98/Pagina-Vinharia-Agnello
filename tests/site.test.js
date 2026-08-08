const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('flex-layout.html', 'utf8');
const css = fs.readFileSync('css/flex-style.css', 'utf8');
const script = fs.existsSync('js/main.js') ? fs.readFileSync('js/main.js', 'utf8') : '';

test('uses semantic landmarks and accessible navigation', () => {
  assert.match(html, /<main[\s>]/);
  assert.match(html, /aria-label="Navegação principal"/);
  assert.match(html, /class="menu-toggle"/);
  assert.match(html, /class="skip-link"/);
});

test('uses repository-relative local asset paths', () => {
  assert.doesNotMatch(html, /(?:src|href)="\/css\//);
  assert.doesNotMatch(css, /url\(['"]?\/css\//);
});

test('provides interactive purchase and newsletter feedback', () => {
  assert.match(html, /data-add-to-cart/);
  assert.match(html, /id="cart-count"/);
  assert.match(html, /id="newsletter-status"/);
  assert.match(script, /aria-expanded/);
  assert.match(script, /localStorage/);
  assert.doesNotMatch(html, /href="#"/);
});

test('supports responsive and reduced-motion experiences', () => {
  assert.match(css, /@media\s*\(max-width:/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /:focus-visible/);
});

test('includes useful metadata and image dimensions', () => {
  assert.match(html, /name="description"/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /<img[^>]+width="\d+"[^>]+height="\d+"/);
});
