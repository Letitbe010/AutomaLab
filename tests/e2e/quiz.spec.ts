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

  // q5 (identify): a click on the canvas is the answer.
  await expect(question.getByRole('button', { name: 'Egiaztatu' })).toBeDisabled();
  await page.getByTestId('canvas').locator('[data-component-id="s1"]').click();
  await expect(question.getByTestId('quiz-picked')).toContainText('1S1');
  await question.getByRole('button', { name: 'Egiaztatu' }).click();
  await expect(question.getByRole('status')).toContainText('Zuzena.');
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

test('exam mode: no feedback until the end, a multiple-choice question and the timer', async ({
  page,
}) => {
  await page.goto('/');
  await menu(page, 'Txantiloiak');
  await page
    .locator('[data-template-id="tpl-pn-01"]')
    .getByRole('button', { name: 'Ireki', exact: true })
    .click();
  const panel = page.getByTestId('template-panel');
  await panel.getByRole('tab', { name: 'Galdetegia' }).click();
  await panel.getByRole('checkbox', { name: /Azterketa-modua/ }).check();
  await panel.getByRole('combobox').selectOption('5');
  await panel.getByRole('button', { name: 'Hasi galdetegia' }).click();
  await expect(panel.getByTestId('quiz-timer')).toContainText('Geratzen da');

  const question = panel.getByTestId('quiz-question');
  await question.getByRole('button', { name: '1 portua blokeatuta dago' }).click();
  await question.getByRole('button', { name: '2 portua 3 ihesera konektatuta dago' }).click();
  await expect(question.getByRole('status')).toHaveCount(0);
  await question.getByRole('button', { name: 'Hurrengoa' }).click();
  await question.getByRole('button', { name: 'Aurrekoa' }).click();
  await expect(question.getByRole('button', { name: '1 portua blokeatuta dago' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await question.getByRole('button', { name: 'Amaitu azterketa' }).click();

  const result = panel.getByTestId('quiz-result');
  await expect(result).toContainText('Erantzun gabe:');
  await expect(result).toContainText('Erantzun zuzena');
});

test('random quiz: filters, runs, and is saved in progress', async ({ page }) => {
  await page.goto('/');
  await menu(page, 'Ariketak');
  await page.getByRole('button', { name: 'Ausazko galdetegia' }).click();
  const view = page.getByTestId('random-quiz');
  await view.getByRole('combobox', { name: 'Domeinua' }).selectOption({ label: 'Pneumatika' });
  await expect(view.getByTestId('random-available')).toContainText('galdera erabilgarri');
  await view.getByRole('combobox', { name: 'Galderak' }).selectOption('5');
  await view.getByRole('checkbox', { name: /Azterketa-modua/ }).check();
  await view.getByRole('button', { name: 'Hasi', exact: true }).click();
  await expect(view.getByTestId('quiz-question')).toContainText('1. galdera / 5');
  await expect(view.getByTestId('quiz-question').locator('summary')).toContainText('Txantiloia:');
  await view.getByRole('button', { name: 'Amaitu azterketa' }).click();
  await expect(view.getByTestId('quiz-result')).toContainText('0 / 5 zuzen');

  await menu(page, 'Nire aurrerapena');
  await expect(page.getByTestId('progress-random')).toContainText('1 eginda');
});
