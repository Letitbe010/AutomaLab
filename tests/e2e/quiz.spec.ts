import { test, expect, type Page } from '@playwright/test';

const menu = (page: Page, name: string) =>
  page.getByRole('navigation', { name: 'Menu nagusia' }).getByRole('button', { name }).click();

test('open a template, take its quiz and see the result in "Nire aurrerapena"', async ({
  page,
}) => {
  await page.goto('/');
  await menu(page, 'Txantiloiak');
  await page
    .locator('[data-template-id="tpl-pn-02"]')
    .getByRole('button', { name: 'Ireki', exact: true })
    .click();
  const panel = page.getByTestId('template-panel');
  await panel.getByRole('tab', { name: 'Galdetegia' }).click();
  await panel.getByRole('button', { name: 'Hasi galdetegia' }).click();

  const question = panel.getByTestId('quiz-question');
  const answer = async (option: string) => {
    await question.getByRole('button', { name: option, exact: true }).click();
    await question.getByRole('button', { name: 'Egiaztatu' }).click();
  };

  // q1 (predict): right answer, and the simulation result is shown.
  await answer('1A ateratzen da eta aurrean geratzen da');
  await expect(question.getByRole('status')).toContainText('Zuzena.');
  await expect(question.getByTestId('quiz-simulated')).toContainText('1A+');
  await question.getByRole('button', { name: 'Hurrengoa' }).click();

  // q2 (predict): right.
  await answer('Ezer ez: 1V1 dagoeneko itzultzeko posizioan dago');
  await question.getByRole('button', { name: 'Hurrengoa' }).click();

  // q3 (true/false): wrong on purpose.
  await answer('Gezurra');
  await expect(question.getByRole('status')).toContainText('Ez da zuzena.');
  await question.getByRole('button', { name: 'Hurrengoa' }).click();

  // q4 (numeric, decimal comma accepted).
  await question.getByRole('textbox', { name: 'Erantzuna' }).fill('433,5');
  await question.getByRole('button', { name: 'Egiaztatu' }).click();
  await expect(question.getByRole('status')).toContainText('Zuzena.');
  await question.getByRole('button', { name: 'Hurrengoa' }).click();

  // q5 (single).
  await answer('14');
  await question.getByRole('button', { name: 'Amaitu' }).click();

  const result = panel.getByTestId('quiz-result');
  await expect(result).toContainText('80 %');
  await expect(result).toContainText('4 / 5 zuzen');
  await expect(result.getByRole('button', { name: /Teoria: Funtzio logikoak/ })).toBeVisible();

  // Progress page, also after a reload (stored in IndexedDB).
  for (const reload of [false, true]) {
    if (reload) await page.reload();
    await menu(page, 'Nire aurrerapena');
    const row = page.getByTestId('progress-page').locator('tr[data-template-id="tpl-pn-02"]');
    await expect(row.locator('[data-best]')).toHaveText('80 %');
    await expect(row).toContainText('1'); // attempts
    await expect(page.getByRole('meter', { name: 'Pneumatika' })).toHaveAttribute(
      'aria-valuenow',
      '16',
    ); // 80 % of 1 template out of 5
  }

  // The catalog shows the best score.
  await menu(page, 'Txantiloiak');
  await expect(page.locator('[data-template-id="tpl-pn-02"]')).toContainText('Onena: 80 %');
});
