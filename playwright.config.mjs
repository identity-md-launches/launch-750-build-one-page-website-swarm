import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '*.spec.mjs',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4179/preview/', browserName: 'chromium', colorScheme: 'dark' },
  webServer: {
    command: 'node tests/serve.mjs',
    url: 'http://127.0.0.1:4179/preview/',
    reuseExistingServer: false,
  },
});
