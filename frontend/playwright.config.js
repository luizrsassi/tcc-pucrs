import { defineConfig, devices } from '@playwright/test';

export default defineConfig({

  testDir: './tests',

  testIgnore: '**/node_modules/**',

  fullyParallel: true,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {

    baseURL: 'http://localhost:5173',

    trace: 'on-first-retry',

  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

});