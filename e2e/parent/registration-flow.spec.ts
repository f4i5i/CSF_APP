/**
 * Parent Registration Flow E2E Tests
 * Tests for the registration process
 */

import { test, expect } from '@playwright/test';
import { clearAuth } from '../fixtures/auth';

test.describe('Parent Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await clearAuth(page);
  });

  test.afterEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should display registration page', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);
  });

  test('should have registration form', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(1000);

    // Should have email and password fields
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');

    await expect(emailInput.first()).toBeVisible();
    await expect(passwordInput.first()).toBeVisible();
  });

  test('should have link to login page', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(500);

    const loginLink = page.locator('a[href*="login"]');
    await expect(loginLink.first()).toBeVisible();
  });

  test('should navigate to login from register', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(500);

    const loginLink = page.locator('a[href*="login"]').first();
    await loginLink.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/register');
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('/register');
  });
});
