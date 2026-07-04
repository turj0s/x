import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for editable-region regression tests. Runs against the
 * Vite dev server (started manually in CI or already running locally on
 * :8080). Snapshots live next to specs under `e2e/__snapshots__` and are
 * updated with `playwright test --update-snapshots`.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: {
    // Visual snapshot tolerance: 0.2% pixel diff catches real regressions
    // while allowing sub-pixel AA jitter between machines.
    toHaveScreenshot: { maxDiffPixelRatio: 0.002 },
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 900 },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: process.env.CI
    ? {
        command: 'bun run dev',
        url: 'http://localhost:8080',
        reuseExistingServer: false,
        timeout: 120_000,
      }
    : undefined,
});
