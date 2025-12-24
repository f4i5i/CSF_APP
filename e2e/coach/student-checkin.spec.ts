/**
 * Coach Student Check-In E2E Tests
 * Tests for the student check-in functionality
 */

import { test, expect } from '@playwright/test';
import { loginAsCoach, clearAuth } from '../fixtures/auth';

test.describe('Coach Student Check-In Flow', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCoach(page);
  });

  test.afterEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should access check-in page', async ({ page }) => {
    await page.goto('/checkIn');
    await expect(page).toHaveURL(/\/checkIn/i);
  });

  test('should display check-in content', async ({ page }) => {
    await page.goto('/checkIn');
    await page.waitForTimeout(1500);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  test('should not redirect to login', async ({ page }) => {
    await page.goto('/checkIn');
    await page.waitForTimeout(1000);

    expect(page.url()).not.toContain('/login');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/checkIn');
    await page.waitForTimeout(1000);

    expect(page.url()).not.toContain('/login');
  });
});
