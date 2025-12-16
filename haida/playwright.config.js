// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.TEST_URL || 'http://localhost:3000',
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure'
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'form-validation',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/form-validation.spec.js'
    },
    {
      name: 'widget-rendering',
      use: { ...devices['Desktop Firefox'] },
      testMatch: '**/widget-rendering.spec.js'
    },
    {
      name: 'navigation-flow',
      use: { ...devices['Desktop Safari'] },
      testMatch: '**/navigation-flow.spec.js'
    },
    {
      name: 'data-rendering',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/data-rendering.spec.js'
    },
    {
      name: 'interaction',
      use: { ...devices['Desktop Edge'] },
      testMatch: '**/interaction.spec.js'
    },
    {
      name: 'modal-interaction',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/modal-interaction.spec.js'
    },
    {
      name: 'general-e2e',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/general-e2e.spec.js'
    },

    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    /* Test against branded browsers */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'] },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run start:app',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },

  /* Global timeout */
  timeout: 60 * 1000,

  /* Global test timeout */
  expect: {
    timeout: 5000
  },

  /* Output folder for test artifacts */
  outputFolder: 'test-results/artifacts'
});
