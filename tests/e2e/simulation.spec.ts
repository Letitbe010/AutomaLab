import { test, expect, type Page } from '@playwright/test';
import { join } from 'node:path';

const FIXTURES = join(process.cwd(), 'tests', 'engine', 'fixtures');

async function importProject(page: Page, file: string) {
  await page.goto('/');
  await expect(page.getByTestId('save-status')).toHaveText('Gordeta');
  await page.getByRole('button', { name: 'Proiektuak' }).click();
  await page.getByTestId('import-project-input').setInputFiles(join(FIXTURES, file));
  await expect(page.getByTestId('projects-dialog')).toBeHidden();
}

test('R1 in the UI: hold the push button, the cylinder extends; release, it retracts', async ({
  page,
}) => {
  await importProject(page, 'r1-single-button.automalab.json');
  const canvas = page.getByTestId('canvas');
  await page.getByRole('button', { name: 'Simulatu' }).click();
  await expect(page.getByTestId('sim-time')).not.toHaveText('t = 0,00 s');

  const cylinder = canvas.locator('[data-component-id="c1"]');
  const supplyLine = canvas.locator('[data-connection-id="w1"]');
  const cylLine = canvas.locator('[data-connection-id="w2"]');
  await expect(supplyLine).toHaveAttribute('data-state', 'PRESSURE');
  await expect(cylLine).toHaveAttribute('data-state', 'EXHAUST');

  // Hold the mouse on the valve.
  const box = (await canvas.locator('[data-component-id="v1"] rect').first().boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(cylLine).toHaveAttribute('data-state', 'PRESSURE');
  await expect(cylinder).toHaveAttribute('data-position', '1', { timeout: 4000 });
  await page.mouse.up();
  await expect(cylLine).toHaveAttribute('data-state', 'EXHAUST');
  await expect(cylinder).toHaveAttribute('data-position', '0', { timeout: 4000 });

  // The space-phase diagram shows the two movements.
  await page.getByRole('tab', { name: 'Espazio-fase diagrama' }).click();
  await expect(page.getByTestId('space-phase')).toContainText('1A+');
  await expect(page.getByTestId('space-phase')).toContainText('1A-');
});

test('pause, step and reset controls', async ({ page }) => {
  await importProject(page, 'r1-single-button.automalab.json');
  await page.getByRole('button', { name: 'Simulatu' }).click();
  await page.getByRole('button', { name: 'Pausatu' }).click();
  const time = page.getByTestId('sim-time');
  const before = await time.textContent();
  await page.waitForTimeout(300);
  await expect(time).toHaveText(before!);
  await page.getByRole('button', { name: 'Urrats bat (10 ms)' }).click();
  await expect(time).not.toHaveText(before!);
  await page.getByRole('button', { name: 'Hasieratu' }).click();
  await expect(time).toHaveText('t = 0,00 s');
});

test('simulation is refused while the schematic has errors', async ({ page }) => {
  await importProject(page, 'r1-single-button.automalab.json');
  // Make an error: change a wire into an electric one is not possible from the UI,
  // so import a broken file instead.
  await page.getByRole('button', { name: 'Proiektuak' }).click();
  const broken = JSON.stringify({
    schemaVersion: 1,
    name: 'Akatsa',
    simulation: { level: 'logic', dtMs: 1, supplyPressureBar: 6 },
    components: [{ id: 'x', type: 'pn.ezezaguna', x: 0, y: 0, rot: 0, mirror: false, params: {} }],
    connections: [],
    tags: {},
    plc: { io: [], ladder: [], grafcet: null },
  });
  await page.getByTestId('import-project-input').setInputFiles({
    name: 'akatsa.automalab.json',
    mimeType: 'application/json',
    buffer: Buffer.from(broken),
  });
  await page.getByRole('button', { name: 'Simulatu' }).click();
  await expect(page.getByText('Ezin da simulatu', { exact: false })).toBeVisible();
  await expect(page.getByTestId('canvas')).toHaveAttribute('data-mode', 'edit');
});

test('help card appears when hovering a library item', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('complementary', { name: 'Liburutegia' })
    .getByRole('button', { name: 'Manometroa', exact: true })
    .hover();
  await expect(page.getByTestId('help-card')).toContainText('Lerroaren presioa erakusten du');
});

test('R5 cascade in the UI: one start runs A+ B+ B- A- and the rollers light up', async ({
  page,
}) => {
  await importProject(page, 'r5-cascade-abba.automalab.json');
  const canvas = page.getByTestId('canvas');
  // Limit-valve marks are drawn on the cylinders.
  await expect(canvas.locator('[data-limit-mark]')).toHaveCount(4);
  await page.getByRole('button', { name: 'Simulatu' }).click();
  // At rest both cylinders are retracted: a0 and b0 are pressed.
  await expect(canvas.locator('[data-limit-mark="a0"]')).toHaveAttribute('data-on', 'true');
  await expect(canvas.locator('[data-limit-mark="b0"]')).toHaveAttribute('data-on', 'true');

  await page.getByRole('button', { name: 'Doitu' }).click();
  await page.getByRole('combobox', { name: 'Abiadura' }).selectOption('5');
  const start = (await canvas.locator('[data-component-id="st"] rect').first().boundingBox())!;
  await page.mouse.move(start.x + 8, start.y + start.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(100);
  await page.mouse.up();

  await page.getByRole('tab', { name: 'Espazio-fase diagrama' }).click();
  const diagram = page.getByTestId('space-phase');
  await expect(diagram).toContainText('1A-', { timeout: 5000 });
  await expect(diagram).toHaveText(/1A\+\s*2A\+\s*2A-\s*1A-/);
});
