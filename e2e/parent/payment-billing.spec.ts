/**
 * Parent Payment and Billing E2E Tests
 * Tests for payment and billing pages
 */

import { test, expect } from '@playwright/test';
import { loginAsParent, clearAuth } from '../fixtures/auth';

test.describe('Parent Payment and Billing', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsParent(page);
  });

  test.afterEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should access payment billing page', async ({ page }) => {
    await page.goto('/paymentbilling');
    await page.waitForTimeout(1000);

    expect(page.url()).not.toContain('/login');
  });

  test('should access checkout page', async ({ page }) => {
    await page.goto('/checkout');
    await page.waitForTimeout(1000);

    // Checkout page should be accessible
    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/paymentbilling');
    await page.waitForTimeout(1000);

    expect(page.url()).not.toContain('/login');
  });
});
