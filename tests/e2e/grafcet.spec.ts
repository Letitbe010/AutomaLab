import { test, expect, type Page } from '@playwright/test';

const menu = (page: Page, name: string) =>
  page.getByRole('navigation', { name: 'Menu nagusia' }).getByRole('button', { name }).click();
const tab = (page: Page, name: string) =>
  page.getByRole('tablist', { name: 'Ikuspegiak' }).getByRole('tab', { name }).click();
const holdClick = async (page: Page, testIdLocator: ReturnType<Page['locator']>) => {
  const b = await testIdLocator.boundingBox();
  await page.mouse.move(b!.x + b!.width / 2, b!.y + b!.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(200);
  await page.mouse.up();
};

test('GRAFCET template: active steps in simulation and conversion to Ladder', async ({ page }) => {
  await page.goto('/');
  await menu(page, 'Txantiloiak');
  await page
    .locator('[data-template-id="tpl-gr-01"]')
    .getByRole('button', { name: 'Ireki', exact: true })
    .click();
  await tab(page, 'GRAFCET');
  const view = page.getByTestId('grafcet-view');
  await expect(view.locator('[data-step-id]')).toHaveCount(3);
  await expect(view.locator('[data-transition-id]')).toHaveCount(3);

  await tab(page, 'Eskema');
  await page.getByRole('button', { name: 'Simulatu', exact: true }).click();
  const canvas = page.getByTestId('canvas');
  await holdClick(page, canvas.locator('[data-component-id="s1"]'));
  await tab(page, 'GRAFCET');
  await expect(view.locator('[data-step-id="x2"][data-active="true"]')).toBeVisible();
  await expect(view.getByTestId('scan-info')).toContainText('Scan-ak:');

  await page.getByRole('button', { name: 'Editatu', exact: true }).click();
  await view.getByRole('button', { name: 'Bihurtu Ladder-era' }).click();
  const ladder = page.getByTestId('ladder-view');
  await expect(ladder.locator('[data-rung-id]').first()).toBeVisible();
  expect(await ladder.locator('[data-rung-id]').count()).toBeGreaterThan(5);
});

test('draw a GRAFCET with the commands; syntax errors are shown', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Proiektuak' }).click();
  await page.getByRole('button', { name: 'Proiektu berria' }).click();
  await tab(page, 'GRAFCET');
  const view = page.getByTestId('grafcet-view');
  await view.getByRole('button', { name: 'Urrats berria' }).click();
  await view.getByRole('button', { name: 'Gehitu behean' }).click();
  await expect(view.locator('[data-step-id]')).toHaveCount(2);
  await expect(view.locator('[data-transition-id]')).toHaveCount(1);

  await view
    .locator('[data-transition-id]')
    .first()
    .click({ position: { x: 5, y: 5 } });
  const inspector = page.getByTestId('grafcet-inspector');
  await inspector.getByRole('combobox', { name: 'Hartzailetasuna' }).fill('I0.0 *');
  await expect(inspector).toContainText('osatu gabe');
  await inspector.getByRole('combobox', { name: 'Hartzailetasuna' }).fill('I0.0 * /I0.1');
  await expect(inspector).not.toContainText('osatu gabe');

  // Jump back: link the transition's next step to step 1.
  await view.getByRole('button', { name: 'Lotu hurrengo urratsa' }).click();
  await view.locator('[data-step-id="x1"] text').first().click();
  await expect(view.locator('svg polygon')).toHaveCount(1); // the upward arrow of the jump
});
