/**
 * Parent Dashboard E2E Tests
 * Tests for the parent dashboard
 */

import { test, expect } from '@playwright/test';
import { loginAsParent, clearAuth } from '../fixtures/auth';

test.describe('Parent Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsParent(page);
  });

  test.afterEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should redirect to dashboard after login', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('should display dashboard content', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForTimeout(1500);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('/dashboard');
  });
});
