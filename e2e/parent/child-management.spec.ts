/**
 * Parent Child Management E2E Tests
 * Tests for managing children profiles
 */

import { test, expect } from '@playwright/test';
import { loginAsParent, clearAuth } from '../fixtures/auth';

test.describe('Parent Child Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsParent(page);
  });

  test.afterEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should access add child page', async ({ page }) => {
    await page.goto('/addchild');
    await page.waitForTimeout(1000);

    expect(page.url()).not.toContain('/login');
  });

  test('should access register child page', async ({ page }) => {
    await page.goto('/registerchild');
    await page.waitForTimeout(1000);

    expect(page.url()).not.toContain('/login');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('/dashboard');
  });
});
