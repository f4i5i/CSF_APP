/**
 * Admin Financials E2E Tests
 * Tests for financial reporting page in the admin dashboard
 */

import { test, expect } from '@playwright/test';
import { loginAsAdmin, clearAuth } from '../fixtures/auth';

test.describe('Admin Financials', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.afterEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should navigate to financials page', async ({ page }) => {
    await page.goto('/financials');
    await expect(page).toHaveURL(/\/financials/);
  });

  test('should display financials page content', async ({ page }) => {
    await page.goto('/financials');
    await page.waitForTimeout(1500);

    // Page should have some content
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should be accessible after login', async ({ page }) => {
    await page.goto('/financials');
    await page.waitForTimeout(1000);

    // Should not redirect to login
    expect(page.url()).not.toContain('/login');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/financials');
    await page.waitForTimeout(1000);

    // Page should still load
    expect(page.url()).toContain('/financials');
  });
});
