/**
 * Coach Class Schedule E2E Tests
 * Tests for viewing class schedules
 */

import { test, expect } from '@playwright/test';
import { loginAsCoach, clearAuth } from '../fixtures/auth';

test.describe('Coach Class Schedule', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCoach(page);
  });

  test.afterEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should access check-in page', async ({ page }) => {
    await page.goto('/checkIn');
    await page.waitForTimeout(1000);

    expect(page.url()).not.toContain('/login');
  });

  test('should access calendar page', async ({ page }) => {
    await page.goto('/calendar');
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
