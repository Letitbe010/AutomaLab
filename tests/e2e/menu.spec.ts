import { test, expect } from '@playwright/test';

test('app opens with the Basque main menu and navigates between sections', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Menu nagusia' });
  await expect(nav.getByRole('button')).toHaveText([
    'Editorea',
    'Txantiloiak',
    'Ariketak',
    'Sortzailea',
    'Teoria',
    'Nire aurrerapena',
  ]);

  await nav.getByRole('button', { name: 'Nire aurrerapena' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nire aurrerapena');
});
