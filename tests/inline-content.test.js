import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { html } from '../server/content.js';

test('inline template retains responsive cards, gradients, tables and native FAQs', () => {
  const clean = html(readFileSync(new URL('../examples/gst-registration-inline.html', import.meta.url), 'utf8'));
  for (const value of ['linear-gradient', 'flex-wrap:wrap', 'clamp(', '<details', '<summary', 'scope="col"'])
    assert.ok(clean.includes(value), value);
});

test('inline content removes scripts, external CSS resources and overlay positioning', () => {
  const clean = html('<style>body{display:none}</style><script>alert(1)</script><div onclick="bad()" style="position:fixed;inset:0;z-index:9999;background:url(https://example.com/pixel);color:#173c35">Text</div><a href="javascript:bad()">Link</a>');
  assert.doesNotMatch(clean, /<style|<script|onclick|position|inset|z-index|url\(|javascript:/);
  assert.match(clean, /color:#173c35/);
});
