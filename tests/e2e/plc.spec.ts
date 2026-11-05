import { test, expect, type Page } from '@playwright/test';

const menu = (page: Page, name: string) =>
  page.getByRole('navigation', { name: 'Menu nagusia' }).getByRole('button', { name }).click();
const tab = (page: Page, name: string) =>
  page.getByRole('tablist', { name: 'Ikuspegiak' }).getByRole('tab', { name }).click();

test('PLC template: Ladder online view and I/O table during simulation', async ({ page }) => {
  await page.goto('/');
  await menu(page, 'Txantiloiak');
  await page
    .locator('[data-template-id="tpl-plc-01"]')
    .getByRole('button', { name: 'Ireki', exact: true })
    .click();

  await tab(page, 'Ladder');
  const ladder = page.getByTestId('ladder-view');
  await expect(ladder.locator('[data-rung-id]')).toHaveCount(3);
  await expect(ladder).toContainText('"Martxa"');

  await tab(page, 'I/O taula');
  await expect(page.getByTestId('io-table').locator('tr[data-address="I0.1"]')).toContainText('S1');

  // Simulate: start from the schematic, then look at the Ladder view.
  await tab(page, 'Eskema');
  await page.getByRole('button', { name: 'Simulatu', exact: true }).click();
  const canvas = page.getByTestId('canvas');
  // A real click lasts longer than one 10 ms scan; Playwright clicks are instantaneous.
  const s1 = await canvas.locator('[data-component-id="s1"]').boundingBox();
  await page.mouse.move(s1!.x + s1!.width / 2, s1!.y + s1!.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(200);
  await page.mouse.up();
  await expect(canvas.locator('[data-component-id="c1"]')).toHaveAttribute('data-position', '1', {
    timeout: 4000,
  });

  await tab(page, 'Ladder');
  await expect(ladder.locator('[data-powered="true"]').first()).toBeVisible();
  await ladder.getByRole('button', { name: 'Scan bat' }).click();
  await expect(page.getByTestId('scan-info')).toContainText('Scan-ak:');

  await tab(page, 'I/O taula');
  const table = page.getByTestId('io-table');
  await expect(table.locator('tr[data-address="I0.0"] [data-value]')).toHaveAttribute(
    'data-value',
    '1',
  );
  await expect(table.locator('tr[data-address="Q0.0"] [data-value]')).toHaveAttribute(
    'data-value',
    '1',
  );
});

test('write a rung in the Ladder editor; invalid operands are reported', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Proiektuak' }).click();
  await page.getByRole('button', { name: 'Proiektu berria' }).click();
  await tab(page, 'Ladder');
  const ladder = page.getByTestId('ladder-view');
  await ladder.getByRole('button', { name: 'Kontaktu NA', exact: true }).click();
  const inspector = page.getByTestId('ladder-inspector');
  await inspector.getByRole('combobox', { name: 'Operandoa' }).fill('I0.0');
  await ladder.getByRole('button', { name: 'Bobina', exact: true }).click();
  await inspector.getByRole('combobox', { name: 'Operandoa' }).fill('Q9.9');
  await expect(ladder.locator('[data-rung-id]')).toHaveCount(1);
  await expect(page.getByText('«Q9.9» ez da helbide baliozkoa', { exact: false })).toBeVisible();
});
