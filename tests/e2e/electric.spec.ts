import { test, expect, type Page } from '@playwright/test';

const menu = (page: Page, name: string) =>
  page.getByRole('navigation', { name: 'Menu nagusia' }).getByRole('button', { name }).click();

test('electropneumatic template: start/stop with self-holding in the UI', async ({ page }) => {
  await page.goto('/');
  await menu(page, 'Txantiloiak');
  await page
    .locator('[data-template-id="tpl-ep-03"]')
    .getByRole('button', { name: 'Ireki', exact: true })
    .click();
  await page.getByRole('button', { name: 'Simulatu', exact: true }).click();
  const canvas = page.getByTestId('canvas');
  const cylinder = canvas.locator('[data-component-id="c1"]');
  await expect(cylinder).toHaveAttribute('data-position', '0');

  // The wire between the closed stop button and the start button is at +24 V.
  const live = canvas.locator('[data-connection-id="w5"]');
  await expect(live).toHaveAttribute('data-state', 'plus');
  // Wire from the open relay contact to the lamp: no potential yet.
  await expect(canvas.locator('[data-connection-id="w14"]')).toHaveAttribute('data-state', 'off');

  // Start: a short click on S1 latches K1; the cylinder extends and stays.
  await canvas.locator('[data-component-id="s1"]').click();
  await expect(cylinder).toHaveAttribute('data-position', '1', { timeout: 4000 });
  await expect(canvas.locator('[data-connection-id="w14"]')).toHaveAttribute('data-state', 'plus');

  // Stop.
  await canvas.locator('[data-component-id="s0"]').click();
  await expect(cylinder).toHaveAttribute('data-position', '0', { timeout: 4000 });
});

test('library lists the electric components', async ({ page }) => {
  await page.goto('/');
  const library = page.getByRole('complementary', { name: 'Liburutegia' });
  await expect(
    library.getByRole('button', { name: 'Errelearen bobina', exact: true }),
  ).toBeVisible();
  await expect(
    library.getByRole('button', { name: 'Sentsore magnetikoa (reed) NA', exact: true }),
  ).toBeVisible();
});
