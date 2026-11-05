import { test, expect, type Page } from '@playwright/test';

const menu = (page: Page, name: string) =>
  page.getByRole('navigation', { name: 'Menu nagusia' }).getByRole('button', { name }).click();

test('calculation exercise: answers with decimal comma are checked and the solution shown', async ({
  page,
}) => {
  await page.goto('/');
  await menu(page, 'Ariketak');
  await expect(page.locator('[data-exercise-id]')).toHaveCount(18);
  await page
    .locator('[data-exercise-id="ex-pn-c03"]')
    .getByRole('button', { name: 'Ebatzi' })
    .click();
  const view = page.getByTestId('calc-exercise');
  const inputs = view.getByRole('textbox');
  await inputs.nth(0).fill('600');
  await inputs.nth(1).fill('0,6');
  await inputs.nth(2).fill('7,013');
  await view.getByRole('button', { name: 'Egiaztatu' }).click();
  await expect(view.getByTestId('calc-summary')).toContainText('Ariketa gaindituta');
  await expect(view.getByTestId('calc-summary')).toContainText('Ebazpena');
});

test('design exercise: failed check explains why; example solution passes; progress', async ({
  page,
}) => {
  await page.goto('/');
  await menu(page, 'Ariketak');
  await page
    .locator('[data-exercise-id="ex-pn-06"]')
    .getByRole('button', { name: 'Hasi (proiektu berria)' })
    .click();
  const panel = page.getByTestId('exercise-panel');
  await expect(panel).toContainText('Joan-etorri automatikoa');
  await expect(panel).toContainText('0S1');
  await panel.getByRole('button', { name: /Erakutsi pista bat/ }).click();
  await expect(panel).toContainText('amaiera-balbula');

  // Empty circuit: three failed checks; the reason names the missing label.
  await panel.getByRole('tab', { name: 'Egiaztatu' }).click();
  for (let i = 0; i < 3; i++)
    await panel.getByRole('button', { name: 'Egiaztatu', exact: true }).click();
  const results = panel.getByTestId('exercise-results');
  await expect(results.locator('li[data-ok="false"]').first()).toContainText(
    'etiketadun osagairik',
  );
  await expect(panel.getByTestId('exercise-summary')).toContainText('ez dira betetzen');

  // After 3 attempts the example solution is offered; it passes every check.
  await panel.getByRole('button', { name: /Ikusi soluzio-adibide bat/ }).click();
  const panel2 = page.getByTestId('exercise-panel');
  await panel2.getByRole('tab', { name: 'Egiaztatu' }).click();
  await panel2.getByRole('button', { name: 'Egiaztatu', exact: true }).click();
  await expect(panel2.getByTestId('exercise-summary')).toContainText('Ariketa gaindituta');
  await expect(panel2.getByTestId('exercise-results').locator('li[data-ok="true"]')).toHaveCount(4);

  await menu(page, 'Nire aurrerapena');
  const row = page.getByTestId('progress-exercises').locator('tr[data-exercise-id="ex-pn-06"]');
  await expect(row.locator('td[data-passed="true"]')).toBeVisible();
  await expect(row).toContainText('4');
});

test('a circuit already drawn (opened template) can be checked against an exercise', async ({
  page,
}) => {
  await page.goto('/');
  await menu(page, 'Txantiloiak');
  await page
    .locator('[data-template-id="tpl-pn-03"]')
    .getByRole('button', { name: 'Ireki', exact: true })
    .click();
  await menu(page, 'Ariketak');
  await page
    .locator('[data-exercise-id="ex-pn-04"]')
    .getByRole('button', { name: 'Egiaztatu uneko proiektua' })
    .click();
  const panel = page.getByTestId('exercise-panel');
  await panel.getByRole('button', { name: 'Egiaztatu', exact: true }).click();
  await expect(panel.getByTestId('exercise-summary')).toContainText('Ariketa gaindituta');

  // The same circuit does not solve the OR exercise.
  await menu(page, 'Ariketak');
  await page
    .locator('[data-exercise-id="ex-pn-03"]')
    .getByRole('button', { name: 'Egiaztatu uneko proiektua' })
    .click();
  await page
    .getByTestId('exercise-panel')
    .getByRole('button', { name: 'Egiaztatu', exact: true })
    .click();
  await expect(page.getByTestId('exercise-summary')).toContainText('ez dira betetzen');
  await expect(page.getByTestId('exercise-results')).toContainText('Baimendu gabeko osagaiak');
});
