/**
 * E2E Authentication Fixtures
 * Helper functions for authenticating in E2E tests
 */

import { Page } from '@playwright/test';

// ==========================================
// TEST CREDENTIALS
// ==========================================

export const testUsers = {
  parent: {
    email: 'parent@csf.com',
    password: 'Parent123!',
    role: 'PARENT',
  },
  coach: {
    email: 'coach@csf.com',
    password: 'Coach123!',
    role: 'COACH',
  },
  admin: {
    email: 'admin@csf.com',
    password: 'Admin123!',
    role: 'ADMIN',
  },
  owner: {
    email: 'admin@csf.com',
    password: 'Admin123!',
    role: 'OWNER',
  },
};

// ==========================================
// LOGIN HELPERS
// ==========================================

/**
 * Login as a parent user
 */
export async function loginAsParent(page: Page): Promise<void> {
  await login(page, testUsers.parent.email, testUsers.parent.password);
}

/**
 * Login as a coach user
 */
export async function loginAsCoach(page: Page): Promise<void> {
  await login(page, testUsers.coach.email, testUsers.coach.password);
}

/**
 * Login as an admin user
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await login(page, testUsers.admin.email, testUsers.admin.password);
}

/**
 * Login as an owner user
 */
export async function loginAsOwner(page: Page): Promise<void> {
  await login(page, testUsers.owner.email, testUsers.owner.password);
}

/**
 * Generic login function
 */
export async function login(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  // Navigate to login page
  await page.goto('/login');

  // Wait for the login form to be visible
  await page.waitForSelector('form');

  // Fill in credentials
  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for navigation to complete (redirect to dashboard)
  await page.waitForURL(/\/(dashboard|admin|coachdashboard)/);
}

/**
 * Login with specific role and wait for specific dashboard
 */
export async function loginWithRole(
  page: Page,
  role: 'parent' | 'coach' | 'admin' | 'owner'
): Promise<void> {
  const user = testUsers[role];
  await login(page, user.email, user.password);

  // Wait for role-specific dashboard
  const dashboardUrls: Record<string, RegExp> = {
    parent: /\/dashboard/,
    coach: /\/coachdashboard/,
    admin: /\/admin/,
    owner: /\/admin/,
  };

  await page.waitForURL(dashboardUrls[role]);
}

// ==========================================
// LOGOUT HELPER
// ==========================================

/**
 * Logout the current user
 */
export async function logout(page: Page): Promise<void> {
  // Click on user menu or logout button
  // Adjust selector based on your app's logout mechanism
  await page.click('[data-testid="logout-button"], [aria-label="Logout"]');

  // Wait for redirect to login page
  await page.waitForURL(/\/login/);
}

// ==========================================
// SESSION HELPERS
// ==========================================

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const token = await page.evaluate(() => {
    return localStorage.getItem('csf_access_token');
  });
  return !!token;
}

/**
 * Clear authentication state
 */
export async function clearAuth(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('csf_access_token');
    localStorage.removeItem('csf_refresh_token');
  });
}

/**
 * Set authentication tokens directly (for bypassing login UI)
 */
export async function setAuthTokens(
  page: Page,
  accessToken: string,
  refreshToken: string
): Promise<void> {
  await page.evaluate(
    ([access, refresh]) => {
      localStorage.setItem('csf_access_token', access);
      localStorage.setItem('csf_refresh_token', refresh);
    },
    [accessToken, refreshToken]
  );
}

// ==========================================
// REGISTRATION HELPER
// ==========================================

/**
 * Register a new user
 */
export async function registerUser(
  page: Page,
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }
): Promise<void> {
  await page.goto('/register');

  // Fill in registration form
  await page.fill('input[name="first_name"]', userData.firstName);
  await page.fill('input[name="last_name"]', userData.lastName);
  await page.fill('input[name="email"]', userData.email);
  await page.fill('input[name="password"]', userData.password);

  if (userData.phone) {
    await page.fill('input[name="phone"]', userData.phone);
  }

  // Confirm password if there's a field for it
  const confirmPasswordField = page.locator('input[name="confirm_password"]');
  if (await confirmPasswordField.isVisible()) {
    await confirmPasswordField.fill(userData.password);
  }

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL(/\/dashboard/);
}
