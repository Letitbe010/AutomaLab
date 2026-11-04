import { test, expect } from '@playwright/test';

test('symbol gallery lists every component with its ports', async ({ page }) => {
  await page.goto('/#/symbols');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ikurren galeria');
  for (const type of ['pn.source', 'pn.valve.3-2.button-spring', 'pn.cyl.single']) {
    await expect(page.getByTestId(`symbol-${type}`)).toBeVisible();
  }
  const valve = page.getByTestId('symbol-pn.valve.3-2.button-spring');
  // 2 preview states + 4 rotations + mirror, 3 ports each
  await expect(valve.locator('[data-port]')).toHaveCount(7 * 3);
});
