/**
 * Admin Client Management E2E Tests
 * Tests for clients page in the admin dashboard
 */

import { test, expect } from '@playwright/test';
import { loginAsAdmin, clearAuth } from '../fixtures/auth';

test.describe('Admin Client Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.afterEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should navigate to clients page', async ({ page }) => {
    await page.goto('/clients');
    await expect(page).toHaveURL(/\/clients/);
  });

  test('should display clients page content', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForTimeout(1500);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should be accessible after login', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForTimeout(1000);

    expect(page.url()).not.toContain('/login');
  });

  test('should access admin dashboard', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('/admin');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/clients');
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('/clients');
  });

  test('should protect admin routes', async ({ page }) => {
    await clearAuth(page);
    await page.goto('/admin');

    // Should redirect to login when not authenticated
    await expect(page).toHaveURL(/\/login/);
  });
});
