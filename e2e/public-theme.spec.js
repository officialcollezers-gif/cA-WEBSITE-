import { test, expect } from '@playwright/test';
import { defaults } from '../server/content.js';

async function mockContent(page) {
  await page.route('**/api/content', route => route.fulfill({ json: defaults }));
  await page.route('https://images.unsplash.com/**', route => route.abort());
}

test('emerald theme fits public pages at desktop and mobile sizes with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await mockContent(page);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/about', '/services', '/blogs', '/contact', '/services/income-tax-advisory/individual-income-tax-return-filing']) {
      await page.goto(path);
      await expect(page.locator('main h1').first()).toBeVisible();
      await expect(page.locator('.boutique-loader')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
    }
  }
});

test('brand intro exits and navigation uses a non-blocking progress line', async ({ page }) => {
  await mockContent(page);
  await page.goto('/');
  await expect(page.locator('.atelier-loader-monogram')).toContainText('RG');
  await expect(page.locator('.boutique-loader')).toHaveCount(0, { timeout: 6000 });
  await page.locator('.modern-navbar a[href="/services"]').first().click();
  await expect(page.locator('main h1').first()).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  await expect(page.locator('.boutique-loader')).toHaveCount(0, { timeout: 3000 });
});
