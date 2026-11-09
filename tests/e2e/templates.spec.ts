import { test, expect, type Page } from '@playwright/test';

const menu = (page: Page, name: string) =>
  page.getByRole('navigation', { name: 'Menu nagusia' }).getByRole('button', { name }).click();

test('catalog: filters, open a copy, description links and reset', async ({ page }) => {
  await page.goto('/');
  await menu(page, 'Txantiloiak');
  const cards = page.locator('[data-template-id]');
  await expect(cards).toHaveCount(19);
  await expect(cards.first().locator('svg polyline').first()).toBeAttached();

  // Filters.
  await page.getByLabel('Maila').selectOption({ label: 'Ertaina' });
  await expect(cards).toHaveCount(10);
  await page.getByLabel('Maila').selectOption({ label: 'Guztiak' });
  await page.getByLabel('Etiketa').selectOption('kaskada');
  await expect(cards).toHaveCount(1);
  await page.getByLabel('Etiketa').selectOption({ label: 'Guztiak' });

  // Open the cascade template: a new project with the description panel.
  await page
    .locator('[data-template-id="tpl-pn-05"]')
    .getByRole('button', { name: 'Ireki', exact: true })
    .click();
  const panel = page.getByTestId('template-panel');
  await expect(panel).toContainText('A+ B+ B− A− sekuentzia');
  await expect(page.getByTestId('canvas').locator('[data-component-id]')).toHaveCount(11);

  // A label in the description highlights the component on the canvas.
  await panel.locator('a[data-comp="b1"]').first().click();
  const b1 = page.getByTestId('canvas').locator('[data-highlight]');
  await expect(b1).toBeVisible();

  // Edit the copy (delete the selected b1), then reset it to the template.
  await page.getByRole('toolbar').getByRole('button', { name: 'Ezabatu' }).click();
  await expect(page.getByTestId('canvas').locator('[data-component-id]')).toHaveCount(10);
  page.once('dialog', (d) => void d.accept());
  await panel.getByRole('button', { name: 'Berrezarri txantiloia' }).click();
  await expect(page.getByTestId('canvas').locator('[data-component-id]')).toHaveCount(11);

  // The original is untouched: opening it again gives a second, full project.
  await menu(page, 'Txantiloiak');
  await page
    .locator('[data-template-id="tpl-pn-05"]')
    .getByRole('button', { name: 'Ireki', exact: true })
    .click();
  await expect(page.getByTestId('canvas').locator('[data-component-id]')).toHaveCount(11);
  await page.getByRole('button', { name: 'Proiektuak' }).click();
  await expect(
    page.getByTestId('projects-dialog').getByText('A+ B+ B− A− sekuentzia, kaskada-metodoa'),
  ).toHaveCount(2);
});

test('a template opened from a theory sheet runs in simulation', async ({ page }) => {
  await page.goto('/');
  await menu(page, 'Teoria');
  await page
    .getByRole('navigation', { name: 'Teoria-fitxak' })
    .getByRole('button', { name: /Funtzio logikoak/ })
    .click();
  await page
    .getByTestId('theory-templates')
    .getByRole('button', { name: 'Bi eskuko agintea (AND funtzioa)' })
    .click();
  await expect(page.getByTestId('template-panel')).toBeVisible();

  await page.getByRole('button', { name: 'Simulatu', exact: true }).click();
  const canvas = page.getByTestId('canvas');
  const cylinder = canvas.locator('[data-component-id="c1"]');
  await expect(cylinder).toHaveAttribute('data-position', '0');
  await expect(canvas.locator('[data-component-id="v1"]')).toHaveAttribute('data-position', '1');

  // Shift+click latches each button: with both held the cylinder extends.
  await canvas.locator('[data-component-id="s1"]').click({ modifiers: ['Shift'] });
  await page.waitForTimeout(300);
  await expect(canvas.locator('[data-component-id="v1"]')).toHaveAttribute('data-position', '1');
  await canvas.locator('[data-component-id="s2"]').click({ modifiers: ['Shift'] });
  await expect(cylinder).toHaveAttribute('data-position', '1', { timeout: 4000 });
  // A plain click releases a latched button: the cylinder returns.
  await canvas.locator('[data-component-id="s1"]').click();
  await expect(cylinder).toHaveAttribute('data-position', '0', { timeout: 4000 });
});
