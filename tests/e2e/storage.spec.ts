import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

async function addFromLibrary(page: Page, name: string) {
  await page
    .getByRole('complementary', { name: 'Liburutegia' })
    .getByRole('button', { name })
    .click();
}

async function waitSaved(page: Page) {
  // Autosave runs every 5 s.
  await expect(page.getByTestId('save-status')).toHaveText('Gordeta', { timeout: 12_000 });
}

test('a drawn circuit survives closing and reopening the browser', async ({ page }) => {
  await page.goto('/');
  await addFromLibrary(page, 'Eragin bakuneko zilindroa');
  await addFromLibrary(page, '3/2 balbula, pultsadorea eta malgukia');
  const name = page.getByRole('textbox', { name: 'Proiektuaren izena' });
  await name.fill('Proba zirkuitua');
  await name.press('Enter');
  await expect(page.getByTestId('save-status')).toHaveText('Aldaketak…');
  await waitSaved(page);

  await page.reload();
  const canvas = page.getByTestId('canvas');
  await expect(canvas.locator('[data-component-id]')).toHaveCount(2);
  await expect(canvas.getByText('1A')).toBeVisible();
  await expect(canvas.getByText('1V1')).toBeVisible();
  await expect(name).toHaveValue('Proba zirkuitua');
});

test('full backup exported in one profile restores in another', async ({ page, browser }) => {
  await page.goto('/');
  await addFromLibrary(page, 'Aire-iturria');
  const name = page.getByRole('textbox', { name: 'Proiektuaren izena' });
  await name.fill('Babeskopia proba');
  await name.press('Enter');

  await page.getByRole('button', { name: 'Proiektuak' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Esportatu dena' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^automalab-babeskopia-\d{4}-\d{2}-\d{2}\.json$/);
  const file = await download.path();
  const backup = JSON.parse(readFileSync(file, 'utf8'));
  expect(backup.format).toBe('automalab-backup');
  expect(backup.projects[0].project.name).toBe('Babeskopia proba');

  // A new context is a separate browser profile with empty storage.
  const other = await browser.newContext();
  const page2 = await other.newPage();
  await page2.goto('/');
  await expect(page2.getByTestId('save-status')).toHaveText('Gordeta');
  await page2.getByRole('button', { name: 'Proiektuak' }).click();
  await page2.getByTestId('import-backup-input').setInputFiles(file);
  await expect(page2.getByText('1 proiektu berri, 0 gainidatziko dira.')).toBeVisible();
  await page2.getByRole('button', { name: 'Inportatu', exact: true }).click();
  await expect(page2.getByRole('textbox', { name: 'Proiektuaren izena' })).toHaveValue(
    'Babeskopia proba',
  );
  await expect(page2.getByTestId('canvas').locator('[data-component-id]')).toHaveCount(1);
  await other.close();
});

test('single project export and import', async ({ page }) => {
  await page.goto('/');
  await addFromLibrary(page, 'Eragin bakuneko zilindroa');
  await page.getByRole('button', { name: 'Proiektuak' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Esportatu proiektu hau (.automalab.json)' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('Proiektu berria.automalab.json');

  await page.getByTestId('import-project-input').setInputFiles(await download.path());
  // Imported as a new project and opened.
  await expect(page.getByTestId('projects-dialog')).toBeHidden();
  await expect(page.getByTestId('canvas').locator('[data-component-id]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Proiektuak' }).click();
  await expect(page.getByTestId('projects-dialog').getByRole('listitem')).toHaveCount(2);
});
