import { defineConfig } from '@playwright/test';

process.env.PW_USE_CHROMIUM_HEADLESS_SHELL = process.env.PW_USE_CHROMIUM_HEADLESS_SHELL || '0';

const port = process.env.PLAYWRIGHT_PORT ? Number(process.env.PLAYWRIGHT_PORT) : 3000;
const defaultBrowser = (process.env.PLAYWRIGHT_BROWSER || 'chromium') as 'chromium' | 'webkit' | 'firefox';
const defaultChannel = process.env.PLAYWRIGHT_CHANNEL || (defaultBrowser === 'chromium' ? 'chrome' : undefined);

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'on-first-retry',
    browserName: defaultBrowser,
    channel: defaultChannel,
    launchOptions: {
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  },
  webServer: {
    command: `pnpm run start -- --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
