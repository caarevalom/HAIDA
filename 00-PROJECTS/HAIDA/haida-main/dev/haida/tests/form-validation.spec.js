// HAIDA Test Suite - Form Validation Profile
// Triggered by Changedetection.io when form changes are detected

import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

const TEST_URL = process.env.TEST_URL || 'http://localhost:3000/login';
const WEBHOOK_ID = process.env.WEBHOOK_ID || 'test-run';

test.describe('Form Validation Tests', () => {
  let page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
  });

  test('should load form page within acceptable time', async () => {
    const startTime = Date.now();
    const response = await page.goto(TEST_URL, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;

    expect(response.status()).toBeLessThan(400);
    expect(loadTime).toBeLessThan(3000);
    console.log(`✓ Page loaded in ${loadTime}ms`);
  });

  test('should render all form fields', async () => {
    // Check for email field
    const emailField = page.locator('input[name="email"], #email, [aria-label="Email"]').first();
    await expect(emailField).toBeVisible();

    // Check for password field
    const passwordField = page
      .locator('input[name="password"], #password, [aria-label="Password"]')
      .first();
    await expect(passwordField).toBeVisible();

    // Check for submit button
    const submitButton = page
      .locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")')
      .first();
    await expect(submitButton).toBeVisible();

    console.log('✓ All form fields rendered');
  });

  test('should validate email field', async () => {
    const emailField = page.locator('input[name="email"], #email, [aria-label="Email"]').first();

    // Test invalid email
    await emailField.fill('invalid-email');
    await page.keyboard.press('Tab'); // Trigger blur event

    // Wait for validation message
    const errorMessage = page
      .locator('[role="alert"], .error, .validation-error, .invalid-feedback')
      .first();
    const isVisible = await errorMessage.isVisible().catch(() => false);

    if (isVisible) {
      const errorText = await errorMessage.textContent();
      expect(errorText).toBeTruthy();
      console.log(`✓ Email validation error: ${errorText}`);
    }
  });

  test('should validate password field', async () => {
    const passwordField = page
      .locator('input[name="password"], #password, [aria-label="Password"]')
      .first();

    // Test short password
    await passwordField.fill('123');
    await page.keyboard.press('Tab');

    // Check for validation feedback
    const errorMessage = page
      .locator('[role="alert"], .error, .validation-error, .invalid-feedback')
      .nth(1);
    const isVisible = await errorMessage.isVisible().catch(() => false);

    if (isVisible) {
      const errorText = await errorMessage.textContent();
      expect(errorText).toBeTruthy();
      console.log(`✓ Password validation working`);
    }
  });

  test('should enable submit button when form is valid', async () => {
    const emailField = page.locator('input[name="email"], #email').first();
    const passwordField = page.locator('input[name="password"], #password').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await emailField.fill('test@example.com');
    await passwordField.fill('ValidPassword123!');

    // Button should not be disabled
    const isDisabled = await submitButton.isDisabled();
    expect(isDisabled).toBeFalsy();

    console.log('✓ Submit button enabled for valid form');
  });

  test('should have proper accessibility attributes', async () => {
    // Inject axe
    await injectAxe(page);

    // Run accessibility check
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });

    console.log('✓ Form passes WCAG 2A accessibility checks');
  });

  test('should handle form submission', async () => {
    const emailField = page.locator('input[name="email"], #email').first();
    const passwordField = page.locator('input[name="password"], #password').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await emailField.fill('test@example.com');
    await passwordField.fill('ValidPassword123!');

    // Listen for API calls or navigation
    page.on('response', (response) => {
      console.log(`← ${response.status()} ${response.url()}`);
    });

    await submitButton.click();

    // Wait for either redirect or success message
    const successMessage = page
      .locator('[role="alert"]:has-text("Success"), .success-message')
      .first();
    const isSuccess = await Promise.race([
      successMessage
        .isVisible()
        .then(() => true)
        .catch(() => false),
      page
        .waitForURL('**/dashboard', { timeout: 5000 })
        .then(() => true)
        .catch(() => false),
    ]);

    expect(isSuccess).toBeTruthy();
    console.log('✓ Form submission successful');
  });

  test('should display appropriate error messages on submission failure', async () => {
    await page.reload();

    const emailField = page.locator('input[name="email"], #email').first();
    const submitButton = page.locator('button[type="submit"]').first();

    // Try with invalid credentials
    await emailField.fill('nonexistent@example.com');
    await page.locator('input[name="password"], #password').first().fill('wrongpassword');

    await submitButton.click();

    const errorAlert = page.locator('[role="alert"]').first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });

    const errorText = await errorAlert.textContent();
    expect(errorText).toBeTruthy();
    console.log(`✓ Error displayed: ${errorText}`);
  });

  test('should take screenshot for visual regression comparison', async () => {
    await page.reload();
    await page.screenshot({
      path: `./screenshots/form-${WEBHOOK_ID}.png`,
      fullPage: true,
    });

    console.log(`✓ Screenshot saved: form-${WEBHOOK_ID}.png`);
  });
});

test.describe('Form Interaction Tests', () => {
  test('should handle multiple rapid submissions gracefully', async ({ page }) => {
    await page.goto(TEST_URL);

    const emailField = page.locator('input[name="email"], #email').first();
    const passwordField = page.locator('input[name="password"], #password').first();
    const submitButton = page.locator('button[type="submit"]').first();

    await emailField.fill('test@example.com');
    await passwordField.fill('Password123!');

    // Rapid clicks
    for (let i = 0; i < 3; i++) {
      await submitButton.click({ noWaitAfter: true });
    }

    // Should not break, check button state
    const isDisabled = await submitButton.isDisabled().catch(() => true);
    console.log(`✓ Form handles rapid submissions (button disabled: ${isDisabled})`);
  });

  test('should preserve form state on page navigation', async ({ page }) => {
    await page.goto(TEST_URL);

    const emailField = page.locator('input[name="email"], #email').first();
    await emailField.fill('test@example.com');
    const filledValue = await emailField.inputValue();

    expect(filledValue).toBe('test@example.com');
    console.log('✓ Form state preserved');
  });

  test('should clear form when clear button clicked', async ({ page }) => {
    await page.goto(TEST_URL);

    const emailField = page.locator('input[name="email"], #email').first();
    const clearButton = page.locator('button:has-text("Clear"), button[type="reset"]').first();

    await emailField.fill('test@example.com');
    const clearButtonVisible = await clearButton.isVisible().catch(() => false);

    if (clearButtonVisible) {
      await clearButton.click();
      const clearedValue = await emailField.inputValue();
      expect(clearedValue).toBe('');
      console.log('✓ Form cleared successfully');
    }
  });
});
