import { expect, test } from '@playwright/test';

async function expectNoHorizontalOverflow(page: import('@playwright/test').Page) {
  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(hasOverflow).toBe(false);
}

test('documents workstation shell is reachable and keyboard focus is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/documents/);
  await expect(page.getByRole('heading', { name: 'Documents' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Upload PDF' })).toBeVisible();
  await page.keyboard.press('Tab');
  const focusedOutline = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle);
  expect(focusedOutline).not.toBe('none');
  await expectNoHorizontalOverflow(page);
});

test('review workbench layout renders at desktop and mobile widths', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 980 });
  await page.goto('/documents/demo-doc');
  await expect(page.getByRole('heading', { name: 'HER2+ Brain Metastases Evidence Review' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'PDF evidence' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Attached provenance' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Schema fields' })).toBeVisible();
  await expect(page.getByText('PDF unavailable')).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.setViewportSize({ width: 390, height: 920 });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Schema fields' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
