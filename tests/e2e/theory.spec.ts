import { test, expect } from '@playwright/test';

test('theory section: search, open a sheet with formulas, symbols and links', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Menu nagusia' })
    .getByRole('button', { name: 'Teoria' })
    .click();
  const list = page.getByRole('navigation', { name: 'Teoria-fitxak' });
  await expect(list.getByRole('listitem')).toHaveCount(14);

  await page.getByRole('searchbox', { name: 'Bilatu teorian…' }).fill('indarra');
  await list.getByRole('button', { name: /Zilindroaren indarra/ }).click();
  const sheet = page.getByTestId('theory-sheet');
  await expect(sheet.getByRole('heading', { level: 2 }).first()).toHaveText(
    'Zilindroaren indarra eta aire-kontsumoa',
  );
  await expect(sheet.getByText('Zirriborroa — berrikusteko')).toBeVisible();
  await expect(sheet.locator('.katex').first()).toBeVisible();
  await expect(sheet.locator('.md-symbol svg')).toHaveCount(1);
  await expect(sheet.getByText('Creus', { exact: false }).first()).toBeVisible();

  // Internal link to another sheet.
  await sheet.getByRole('button', { name: 'Presioa eta unitateak' }).click();
  await expect(
    page.getByTestId('theory-sheet').getByRole('heading', { level: 2 }).first(),
  ).toHaveText('Presioa eta unitateak');
});

test('"Teoria gehiago" opens the sheet next to the editor', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('complementary', { name: 'Liburutegia' })
    .getByRole('button', { name: 'Eragin bikoitzeko zilindroa', exact: true })
    .click();
  await page
    .getByRole('complementary', { name: 'Propietateak' })
    .getByRole('button', { name: /Teoria gehiago/ })
    .click();
  const drawer = page.getByTestId('theory-drawer');
  await expect(drawer).toContainText('Zilindroaren indarra eta aire-kontsumoa');
  await expect(page.getByTestId('canvas')).toBeVisible();
  await drawer.getByRole('button', { name: 'Itxi' }).click();
  await expect(drawer).toBeHidden();
});
