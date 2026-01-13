/**
 * Setup Script - Create Test User for Frontend UI Tests
 *
 * This script creates a test user in production using the frontend UI
 * to ensure all UI tests can run with a valid authenticated session.
 */

import { test, expect } from '@playwright/test';

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  process.env.PLAYWRIGHT_FRONTEND_URL ||
  'http://localhost:5173';

const TEST_USER = {
  email: process.env.TEST_USER_EMAIL || 'hola@stayarta.com',
  password: process.env.TEST_USER_PASSWORD || 'HaidaTest2025Pass!',
  fullName: process.env.TEST_USER_FULL_NAME || 'Test User HAIDA',
  role: process.env.TEST_USER_ROLE || 'qa_engineer'
};

test.describe('Setup Test User', () => {

  test('Create or verify test user exists', async ({ page }) => {
    console.log(`🔧 Setting up test user: ${TEST_USER.email}`);

    // Navigate to login page
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('networkidle');

    console.log(`📍 On page: ${page.url()}`);

    // Try to login first to see if user exists
    console.log(`🔑 Attempting login with existing credentials...`);

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    await expect(emailInput).toBeVisible({ timeout: 10000 });

    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);

    // Look for login button
    const loginButton = page.locator('button:has-text("Log in"), button:has-text("Sign in"), button[type="submit"]').first();
    await loginButton.click();

    // Wait a bit to see what happens
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    console.log(`📍 After login attempt: ${currentUrl}`);

    // Check if we're logged in (redirected away from /login)
    if (!currentUrl.includes('/login')) {
      console.log(`✅ User already exists and login successful!`);
      console.log(`✅ Redirected to: ${currentUrl}`);

      // Take a screenshot of dashboard
      await page.screenshot({ path: 'test-results/dashboard-screenshot.png', fullPage: true });
      console.log(`📸 Screenshot saved: test-results/dashboard-screenshot.png`);

    } else {
      console.log(`⚠️  Still on login page - attempting to create new user...`);

      // Look for "Sign Up" or "Register" link/button
      const signUpLink = page.locator('text="Sign up", text="Register", text="Create account"').first();

      if (await signUpLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log(`🔗 Found sign up link, clicking...`);
        await signUpLink.click();
        await page.waitForTimeout(2000);

        // Fill registration form
        const regEmailInput = page.locator('input[type="email"], input[name="email"]').first();
        const regPasswordInput = page.locator('input[type="password"], input[name="password"]').first();
        const regNameInput = page.locator('input[name="name"], input[name="fullName"], input[name="full_name"]').first();

        await regEmailInput.fill(TEST_USER.email);
        await regPasswordInput.fill(TEST_USER.password);

        if (await regNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await regNameInput.fill(TEST_USER.fullName);
        }

        const registerButton = page.locator('button:has-text("Register"), button:has-text("Sign up"), button[type="submit"]').first();
        await registerButton.click();

        await page.waitForTimeout(3000);
        console.log(`✅ Registration form submitted`);
        console.log(`📍 Current URL: ${page.url()}`);

      } else {
        console.log(`⚠️  Could not find sign up link`);
        console.log(`⚠️  User might not exist, but registration UI not found`);
      }
    }

    // Final check - get console logs
    page.on('console', msg => console.log(`🖥️  Browser Console: ${msg.text()}`));

    // Take final screenshot
    await page.screenshot({ path: 'test-results/final-state.png', fullPage: true });
    console.log(`📸 Final screenshot: test-results/final-state.png`);
  });

});
