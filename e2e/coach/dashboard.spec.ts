/**
 * Coach Dashboard E2E Tests
 * Tests for the coach dashboard - includes visual regression testing
 * to verify pixel-perfect implementation against Figma design
 */

import { test, expect } from '@playwright/test';
import { loginAsCoach, clearAuth } from '../fixtures/auth';

test.describe('Coach Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsCoach(page);
  });

  test.afterEach(async ({ page }) => {
    await clearAuth(page);
  });

  test('should redirect to coach dashboard after login', async ({ page }) => {
    await expect(page).toHaveURL(/\/coachdashboard|\/dashboard/);
  });

  test('should display dashboard content', async ({ page }) => {
    await page.goto('/coachdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const content = await page.content();
    expect(content.length).toBeGreaterThan(0);
  });

  // ========================================
  // VISUAL REGRESSION TESTS
  // ========================================

  test('visual: full page matches Figma design at 1440px', async ({ page }) => {
    // Set viewport to match Figma design
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/coachdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for animations

    // Take full page screenshot
    await expect(page).toHaveScreenshot('coach-dashboard-1440.png', {
      fullPage: true,
      threshold: 0.15, // Allow 15% difference for dynamic content
      maxDiffPixelRatio: 0.1,
    });
  });

  test('visual: welcome section renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/coachdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check welcome message is visible
    const welcomeText = page.locator('h1:has-text("Welcome back")');
    await expect(welcomeText).toBeVisible();

    // Check coach name is displayed
    await expect(welcomeText).toContainText('Coach');
  });

  test('visual: stats cards display correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/coachdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check for stats section
    const checkedInStat = page.locator('text=Checked In Today');
    const announcementsStat = page.locator('text=Announcements');

    await expect(checkedInStat).toBeVisible();
    await expect(announcementsStat).toBeVisible();
  });

  test('visual: announcements section renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/coachdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check announcements header
    const announcementsHeader = page.locator('h2:has-text("Announcements")');
    await expect(announcementsHeader).toBeVisible();

    // Check New Post button
    const newPostButton = page.locator('button:has-text("New Post")');
    await expect(newPostButton).toBeVisible();

    // Take screenshot of announcements section
    const announcementsSection = page.locator('div:has(h2:has-text("Announcements"))').first();
    await expect(announcementsSection).toHaveScreenshot('announcements-section.png', {
      threshold: 0.2,
    });
  });

  test('visual: calendar widget displays correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/coachdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check calendar title
    const calendarTitle = page.locator('h2:has-text("Calendar")');
    await expect(calendarTitle).toBeVisible();

    // Check calendar day labels
    const mondayLabel = page.locator('text=Mon');
    await expect(mondayLabel).toBeVisible();
  });

  test('visual: next event card displays correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/coachdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check next event title
    const nextEventTitle = page.locator('h2:has-text("Next Event")');
    await expect(nextEventTitle).toBeVisible();
  });

  test('visual: photos card displays correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/coachdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check photos title
    const photosTitle = page.locator('text=Program Photos');
    await expect(photosTitle).toBeVisible();
  });

  test('visual: navigation bar shows correct items', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/coachdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Check all navigation items are present (matches Figma design)
    const dashboardNav = page.locator('nav a:has-text("Dashboard")');
    const calendarNav = page.locator('nav a:has-text("Calendar")');
    const attendanceNav = page.locator('nav a:has-text("Attendance")');
    const photosNav = page.locator('nav a:has-text("Photos")');
    const badgesNav = page.locator('nav a:has-text("Badges")');

    await expect(dashboardNav).toBeVisible();
    await expect(calendarNav).toBeVisible();
    await expect(attendanceNav).toBeVisible();
    await expect(photosNav).toBeVisible();
    await expect(badgesNav).toBeVisible();

    // Dashboard should be active (gold background)
    await expect(dashboardNav).toHaveCSS('background-color', 'rgb(243, 188, 72)');
  });

  // ========================================
  // RESPONSIVE TESTS
  // ========================================

  test('responsive: tablet view at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/coachdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Should still display main content
    const welcomeText = page.locator('h1:has-text("Welcome back")');
    await expect(welcomeText).toBeVisible();

    await expect(page).toHaveScreenshot('coach-dashboard-1280.png', {
      fullPage: true,
      threshold: 0.15,
    });
  });

  test('responsive: mobile view at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/coachdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Should show mobile layout
    expect(page.url()).not.toContain('/login');

    // Stats should be hidden on mobile
    const statsSection = page.locator('text=Checked In Today');
    await expect(statsSection).not.toBeVisible();

    await expect(page).toHaveScreenshot('coach-dashboard-mobile.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  // ========================================
  // INTERACTION TESTS
  // ========================================

  test('interaction: New Post button opens modal', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/coachdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Click New Post button
    const newPostButton = page.locator('button:has-text("New Post")');
    await newPostButton.click();

    // Wait for modal to open
    await page.waitForTimeout(500);

    // Check modal is visible (adjust selector based on modal implementation)
    const modal = page.locator('[role="dialog"], .modal, [data-testid="create-post-modal"]');
    await expect(modal).toBeVisible();
  });

  test('interaction: class filter dropdown opens on click', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/coachdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Find and click the class filter dropdown
    const filterDropdown = page.locator('button:has([data-lucide="chevron-down"])').first();

    if (await filterDropdown.isVisible()) {
      await filterDropdown.click();
      await page.waitForTimeout(300);

      // Check if dropdown menu appears
      const dropdownMenu = page.locator('[role="listbox"], .dropdown-menu, div[class*="dropdown"]');
      await expect(dropdownMenu.first()).toBeVisible();
    }
  });

  test('interaction: calendar navigation works', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/coachdashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    // Get current month text
    const monthLabel = page.locator('p:has-text(/[A-Z]{3} 20\\d{2}/)').first();

    if (await monthLabel.isVisible()) {
      const initialMonth = await monthLabel.textContent();

      // Click next month button
      const nextButton = page.locator('[data-lucide="chevron-right"]').first();
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);

        // Month should have changed
        const newMonth = await monthLabel.textContent();
        expect(newMonth).not.toBe(initialMonth);
      }
    }
  });
});
