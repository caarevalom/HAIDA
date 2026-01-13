/**
 * Create Test User and Run Full UI Tests
 *
 * This script:
 * 1. Creates a test user via Sign Up
 * 2. Logs in
 * 3. Runs all UI tests while authenticated
 */

import { test } from '@playwright/test';

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  process.env.PLAYWRIGHT_FRONTEND_URL ||
  'http://localhost:5173';

const TEST_USER = {
  email: `test-haida-${Date.now()}@hiberus.com`,
  password: process.env.TEST_USER_PASSWORD || 'HaidaTest2025Pass!',
  fullName: process.env.TEST_USER_FULL_NAME || 'Test User HAIDA',
  role: process.env.TEST_USER_ROLE || 'qa_engineer'
};

test.describe('Full Frontend UI Testing with Authentication', () => {

  test('Step 1: Create user via Sign Up', async ({ page }) => {
    console.log(`\n🔧 STEP 1: Creating test user`);
    console.log(`📧 Email: ${TEST_USER.email}`);
    console.log(`🔑 Password: ${TEST_USER.password}\n`);

    // Go to login page
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('networkidle');

    console.log(`📍 On page: ${page.url()}`);

    // Click "Sign up" link
    console.log(`🔗 Looking for "Sign up" link...`);
    const signUpLink = page.getByText('Sign up', { exact: false });
    await signUpLink.click();
    await page.waitForTimeout(2000);

    console.log(`📍 After clicking Sign up: ${page.url()}`);

    // Fill sign up form
    console.log(`📝 Filling sign up form...`);

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const nameInput = page.locator('input[name="name"], input[name="fullName"], input[name="full_name"], input[placeholder*="name" i]').first();

    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);

    // Try to fill name if field exists
    if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await nameInput.fill(TEST_USER.fullName);
      console.log(`✅ Name field filled`);
    } else {
      console.log(`⚠️  Name field not found, skipping`);
    }

    // Take screenshot before submit
    await page.screenshot({ path: 'test-results/before-signup.png', fullPage: true });

    // Click sign up button
    const signUpButton = page.locator('button:has-text("Sign up"), button:has-text("Register"), button:has-text("Create"), button[type="submit"]').first();
    console.log(`🖱️  Clicking sign up button...`);
    await signUpButton.click();

    // Wait for response
    await page.waitForTimeout(5000);

    console.log(`📍 After sign up: ${page.url()}`);

    // Take screenshot after submit
    await page.screenshot({ path: 'test-results/after-signup.png', fullPage: true });

    // Check if we're redirected (success) or still on signup (error)
    const currentUrl = page.url();
    if (!currentUrl.includes('/login') && !currentUrl.includes('/signup')) {
      console.log(`✅ Sign up successful! Redirected to: ${currentUrl}`);
    } else {
      console.log(`⚠️  Still on login/signup page - checking for errors...`);

      // Look for error messages
      const errorMessage = await page.locator('text=/error|failed|invalid/i').textContent().catch(() => null);
      if (errorMessage) {
        console.log(`❌ Error found: ${errorMessage}`);
      }
    }
  });

  test('Step 2: Login with created user', async ({ page }) => {
    console.log(`\n🔐 STEP 2: Logging in with test user`);

    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("Sign in"), button:has-text("Log in"), button[type="submit"]').first();

    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);

    console.log(`📧 Email entered: ${TEST_USER.email}`);
    console.log(`🔑 Password entered: ••••••••••••••••`);

    await page.screenshot({ path: 'test-results/before-login.png', fullPage: true });

    await loginButton.click();
    console.log(`🖱️  Login button clicked`);

    await page.waitForTimeout(5000);

    const afterLoginUrl = page.url();
    console.log(`📍 After login: ${afterLoginUrl}`);

    await page.screenshot({ path: 'test-results/after-login.png', fullPage: true });

    if (!afterLoginUrl.includes('/login')) {
      console.log(`✅ LOGIN SUCCESSFUL!`);
      console.log(`✅ Redirected to: ${afterLoginUrl}`);
    } else {
      console.log(`❌ Login failed - still on login page`);
    }
  });

  test('Step 3: Test Dashboard Navigation', async ({ page }) => {
    console.log(`\n🧭 STEP 3: Testing Dashboard Navigation`);

    // First login
    await page.goto(`${FRONTEND_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button[type="submit"]').first();

    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);
    await loginButton.click();
    await page.waitForTimeout(3000);

    // Should be on dashboard now
    const currentUrl = page.url();
    console.log(`📍 Current page: ${currentUrl}`);

    if (currentUrl.includes('/dashboard') || currentUrl.includes('/app') || !currentUrl.includes('/login')) {
      console.log(`✅ On dashboard!`);

      // Take screenshot of dashboard
      await page.screenshot({ path: 'test-results/dashboard.png', fullPage: true });

      // Look for navigation menu
      const navLinks = await page.locator('nav a, [role="navigation"] a').count();
      console.log(`🔗 Found ${navLinks} navigation links`);

      // Try to find specific links
      const dashboardLink = page.getByText('Dashboard', { exact: false });
      const projectsLink = page.getByText('Projects', { exact: false });
      const chatLink = page.getByText('Chat', { exact: false });

      if (await dashboardLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log(`✅ Dashboard link found`);
      }

      if (await projectsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log(`✅ Projects link found`);
        await projectsLink.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/projects-page.png', fullPage: true });
        console.log(`📸 Projects page screenshot taken`);
      }

      if (await chatLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log(`✅ Chat link found`);
        await chatLink.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'test-results/chat-page.png', fullPage: true });
        console.log(`📸 Chat page screenshot taken`);
      }

    } else {
      console.log(`❌ Not on dashboard - still on: ${currentUrl}`);
    }
  });

  test('Step 4: Test Chat IA', async ({ page }) => {
    console.log(`\n💬 STEP 4: Testing Chat IA (Copilot)`);

    // Login first
    await page.goto(`${FRONTEND_URL}/login`);
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button[type="submit"]').first();

    await emailInput.fill(TEST_USER.email);
    await passwordInput.fill(TEST_USER.password);
    await loginButton.click();
    await page.waitForTimeout(3000);

    // Navigate to chat
    const chatLink = page.getByText('Chat', { exact: false });
    if (await chatLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await chatLink.click();
      await page.waitForTimeout(2000);

      console.log(`📍 On chat page: ${page.url()}`);

      // Look for chat input
      const chatInput = page.locator('textarea, input[placeholder*="message" i], input[placeholder*="chat" i]').first();
      if (await chatInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log(`✅ Chat input found`);

        await chatInput.fill('Hello, this is a test message');
        await page.screenshot({ path: 'test-results/chat-with-message.png', fullPage: true });
        console.log(`📸 Chat with message screenshot taken`);

        // Look for send button
        const sendButton = page.locator('button:has-text("Send"), button[aria-label*="send" i]').first();
        if (await sendButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log(`✅ Send button found`);
          console.log(`⚠️  Not clicking send to avoid actual API calls`);
        }
      } else {
        console.log(`⚠️  Chat input not found`);
      }

      // Check for conversation history
      const conversationItems = await page.locator('[class*="conversation"], [class*="thread"], [class*="history"] li, [class*="history"] div').count();
      console.log(`📜 Found ${conversationItems} conversation/history items`);

    } else {
      console.log(`⚠️  Chat link not found`);
    }
  });

});
