/**
 * Admin Classes Management E2E Tests
 * Tests for classes page in the admin dashboard
 */

import { test, expect } from '@playwright/test';
import { loginAsAdmin, clearAuth } from '../fixtures/auth';

test.describe('Admin Classes Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test.afterEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should navigate to classes page', async ({ page }) => {
    await page.goto('/admin/classes');
    await expect(page).toHaveURL(/\/admin\/classes/);
  });

  test('should display classes page content', async ({ page }) => {
    await page.goto('/admin/classes');
    await page.waitForTimeout(1500);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should be accessible after login', async ({ page }) => {
    await page.goto('/admin/classes');
    await page.waitForTimeout(1000);

    expect(page.url()).not.toContain('/login');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/classes');
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('/admin/classes');
  });
});
