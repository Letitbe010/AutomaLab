import { test, expect, type Page } from '@playwright/test';

async function addFromLibrary(page: Page, name: string) {
  await page
    .getByRole('complementary', { name: 'Liburutegia' })
    .getByRole('button', { name })
    .click();
}

async function portCenter(page: Page, ref: string) {
  const box = await page.locator(`[data-port="${ref}"]`).boundingBox();
  if (!box) throw new Error(`port ${ref} not visible`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

test('draw, connect, rotate, undo and redo in the editor', async ({ page }) => {
  await page.goto('/');
  const canvas = page.getByTestId('canvas');
  await expect(canvas).toBeVisible();

  await addFromLibrary(page, 'Aire-iturria');
  await addFromLibrary(page, '3/2 balbula NI: pultsadorea / malgukia');
  await expect(canvas.locator('[data-component-id]')).toHaveCount(2);
  // Labels are suggested automatically.
  await expect(canvas.getByText('0Z1')).toBeVisible();
  await expect(canvas.getByText('1V1')).toBeVisible();

  // Connect source port 1 to valve port 1.
  const a = await portCenter(page, 'c1|1');
  const b = await portCenter(page, 'c2|1');
  await page.mouse.click(a.x, a.y);
  await page.mouse.click(b.x, b.y);
  await expect(canvas.locator('[data-connection-id]')).toHaveCount(1);
  await expect(page.getByText('1V1: 2 portua ez dago konektatuta.')).toBeVisible();

  // Select the valve and rotate it with R; undo restores it.
  await canvas.locator('[data-component-id="c2"] rect').first().click();
  await expect(page.getByRole('complementary', { name: 'Propietateak' })).toContainText(
    'Biraketa: 0°',
  );
  await page.keyboard.press('r');
  await expect(page.getByRole('complementary', { name: 'Propietateak' })).toContainText(
    'Biraketa: 90°',
  );
  await page.keyboard.press('Control+z');
  await expect(page.getByRole('complementary', { name: 'Propietateak' })).toContainText(
    'Biraketa: 0°',
  );
  await page.keyboard.press('Control+y');
  await expect(page.getByRole('complementary', { name: 'Propietateak' })).toContainText(
    'Biraketa: 90°',
  );

  // Delete removes the valve and its line.
  await page.keyboard.press('Delete');
  await expect(canvas.locator('[data-component-id]')).toHaveCount(1);
  await expect(canvas.locator('[data-connection-id]')).toHaveCount(0);
});

test('simulation mode locks the schematic', async ({ page }) => {
  await page.goto('/');
  await addFromLibrary(page, 'Aire-iturria');
  await page.getByRole('button', { name: 'Simulatu' }).click();
  await expect(
    page.getByText('Simulazio modua: eskema blokeatuta.', { exact: false }),
  ).toBeVisible();
  await expect(page.locator('[data-port]')).toHaveCount(0);
  await expect(
    page
      .getByRole('complementary', { name: 'Liburutegia' })
      .getByRole('button', { name: 'Aire-iturria' }),
  ).toBeDisabled();
});
