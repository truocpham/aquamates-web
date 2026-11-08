import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.PORT ?? 4015);

// Runs against the real static export (npm run e2e:build) with Supabase answered by e2e/backend.ts.
export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/results',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: `http://localhost:${port}`, trace: 'retain-on-failure' },
  webServer: { command: 'node e2e/serve.mjs dist-e2e', url: `http://localhost:${port}`, env: { PORT: String(port) }, reuseExistingServer: false },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'firefox', use: devices['Desktop Firefox'] },
    { name: 'webkit', use: devices['Desktop Safari'] },
  ],
});
