import { test, expect, type Page } from '@playwright/test';

const menu = (page: Page, name: string) =>
  page.getByRole('navigation', { name: 'Menu nagusia' }).getByRole('button', { name }).click();

async function pressOn(page: Page, id: string) {
  const box = await page.getByTestId('canvas').locator(`[data-component-id="${id}"]`).boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(200);
  await page.mouse.up();
}

test('typing a wrong sequence says which step is wrong', async ({ page }) => {
  await page.goto('/');
  await menu(page, 'Sortzailea');
  await page.getByLabel('Sekuentzia').fill('A+ B+ B+ A-');
  await expect(page.getByTestId('sequence-error')).toContainText('3. urratsa: B+ bi aldiz');
});

test('A+ B+ B- A-: analysis, generated cascade runs, and compare says OK', async ({ page }) => {
  await page.goto('/');
  await menu(page, 'Sortzailea');
  await page.getByLabel('Sekuentzia').fill('A+ B+ B- A-');
  await expect(page.getByTestId('phase-diagram').locator('[data-cylinder="B"]')).toHaveAttribute(
    'data-levels',
    '00100',
  );
  await expect(page.getByTestId('overlaps').locator('li')).toHaveCount(2);
  await expect(page.getByTestId('groups').locator('li')).toHaveCount(2);

  await page.getByRole('button', { name: 'Ireki kaskada editorean' }).click();
  await page.getByRole('button', { name: 'Simulatu', exact: true }).click();
  await pressOn(page, 'st');
  // Signature of A+ B+ B- A-: each power valve switches in this order, then rests.
  const canvas = page.getByTestId('canvas');
  const valve = (id: string, position: string) =>
    expect(canvas.locator(`[data-component-id="${id}"]`)).toHaveAttribute(
      'data-position',
      position,
      { timeout: 3000 },
    );
  await valve('vA', '0');
  await valve('vB', '0');
  await valve('vB', '1');
  await valve('vA', '1');
  await page.getByRole('button', { name: 'Editatu', exact: true }).click();

  await menu(page, 'Sortzailea');
  await page.getByRole('button', { name: 'Alderatu', exact: true }).click();
  await expect(page.getByTestId('compare-result')).toHaveAttribute('data-status', 'same');

  await page.getByLabel('Sekuentzia').fill('A+ B+ A- B-');
  await page.getByRole('button', { name: 'Alderatu', exact: true }).click();
  await expect(page.getByTestId('compare-result')).toContainText('3. urratsean');
});

test('the PLC version opens with its GRAFCET', async ({ page }) => {
  await page.goto('/');
  await menu(page, 'Sortzailea');
  await page.getByRole('button', { name: 'Ireki PLC + GRAFCET editorean' }).click();
  await page.getByRole('tab', { name: 'GRAFCET' }).click();
  await expect(page.getByTestId('grafcet-view').locator('[data-step-id]')).toHaveCount(5);
});
