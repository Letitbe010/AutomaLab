import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests run their own dev server on a dedicated port, so they never
 * restart or reuse the server the user has open on 5173 (which left stale
 * modules and a blank page in the user's browser tab).
 */
const PORT = 5174;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
