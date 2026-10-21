import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { defaults, html } from '../server/content.js';

const content = structuredClone(defaults);
const gst = content.categories.find(c => c.slug === 'gst-services');
gst.subServices[0].contentHtml = html(readFileSync(new URL('../examples/gst-registration-inline.html', import.meta.url), 'utf8').replaceAll('#086354', '#087f70').replaceAll('#52645b', '#65796f'));
const routes = ['/', '/about', '/services', '/blogs', '/blogs/income-tax-return-filing-guide', '/contact', ...content.categories.map(c => `/services/${c.slug}`), `/services/${gst.slug}/${gst.subServices[0].slug}`];

for (const width of [1440, 390]) {
  test(`public text contrast across all sections and category pages at ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('**/api/content', r => r.fulfill({ json: content }));
    await page.route('https://images.unsplash.com/**', r => r.abort());
    for (const path of routes) {
      await page.goto(path);
      await expect(page.locator('main h1').first()).toBeVisible();
      // Scroll through every section so reveal animations do not hide text from the audit.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          scrollTo(0, y);
          await new Promise(resolve => setTimeout(resolve, 20));
        }
        scrollTo(0, 0);
      });
      const result = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
      expect(result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, reason: n.failureSummary })) })), path).toEqual([]);
    }
  });
}
