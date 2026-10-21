import { test, expect } from '@playwright/test';
test('separate admin deployment serves the login panel at its root', async ({ page }) => {
  await page.goto('http://127.0.0.1:5174/');
  await expect(page.getByRole('heading', { name: /Behind the scenes/ })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Back to website' })).toHaveAttribute('href', 'http://127.0.0.1:5175');
});
test('separate public deployment reads the admin API across origins and directs admin traffic to the other panel', async ({ page }) => {
  const reads = [];
  page.on('response', r => { if (r.url() === 'http://127.0.0.1:5174/api/content') reads.push(r.status()); });
  await page.goto('http://127.0.0.1:5175/');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await expect.poll(() => reads).toContain(200);
  await expect(page.getByText('Live content is temporarily unavailable.', { exact: false })).toHaveCount(0);
  await page.goto('http://127.0.0.1:5175/admin');
  await expect(page.getByRole('link', { name: 'Open the admin panel' })).toHaveAttribute('href', 'http://127.0.0.1:5174');
  await expect(page.getByRole('button', { name: 'Save changes' })).toHaveCount(0);
});
