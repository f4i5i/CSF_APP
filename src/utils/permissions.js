/**
 * Role-Based Permissions Utility
 * Defines role hierarchy and permission checks for UI visibility
 */

// Role hierarchy (higher index = more privileges)
export const ROLE_HIERARCHY = {
  PARENT: 0,
  COACH: 1,
  ADMIN: 2,
  OWNER: 3,
};

// Role display names
export const ROLE_LABELS = {
  PARENT: 'Parent',
  COACH: 'Coach',
  ADMIN: 'Admin',
  OWNER: 'Owner',
};

// Permission definitions for each role
export const ROLE_PERMISSIONS = {
  OWNER: {
    // Owner has all permissions
    canManageUsers: true,
    canManageAdmins: true,
    canManageCoaches: true,
    canManageClasses: true,
    canManagePrograms: true,
    canManageSchools: true,
    canManageAreas: true,
    canManageWaivers: true,
    canManageBadges: true,
    canViewFinancials: true,
    canManageFinancials: true,
    canProcessRefunds: true,
    canViewAllClients: true,
    canDeleteClients: true,
    canViewRosters: true,
    canShareRosters: true,
    canViewReports: true,
    canExportData: true,
    canManageDiscounts: true,
    canManageSystemSettings: true,
  },
  ADMIN: {
    // Admin has most permissions but cannot manage other admins or view finances
    canManageUsers: true,
    canManageAdmins: false, // Only Owner can manage admins
    canManageCoaches: true,
    canManageClasses: true,
    canManagePrograms: true,
    canManageSchools: true,
    canManageAreas: true,
    canManageWaivers: true,
    canManageBadges: true,
    canViewFinancials: false, // Only Owner can view financials
    canManageFinancials: false, // Only Owner can manage financials
    canProcessRefunds: false, // Only Owner can process refunds
    canManageDiscounts: true, // Admin can manage discounts/coupons
    canViewAllClients: true,
    canDeleteClients: false, // Only Owner can delete clients
    canViewRosters: true,
    canShareRosters: true,
    canViewReports: true,
    canExportData: true,
    canManageSystemSettings: false, // Only Owner can manage system settings
  },
  COACH: {
    // Coach has limited permissions
    canManageUsers: false,
    canManageAdmins: false,
    canManageCoaches: false,
    canManageClasses: false,
    canManagePrograms: false,
    canManageSchools: false,
    canManageAreas: false,
    canManageWaivers: false,
    canManageBadges: false,
    canViewFinancials: false,
    canManageFinancials: false,
    canProcessRefunds: false,
    canManageDiscounts: false,
    canViewAllClients: false,
    canDeleteClients: false,
    canViewRosters: true, // Coaches can view rosters of their classes
    canShareRosters: false,
    canViewReports: false,
    canExportData: false,
    canManageSystemSettings: false,
    // Coach-specific permissions
    canCheckInStudents: true,
    canUploadPhotos: true,
    canViewAssignedClasses: true,
    canAwardBadges: true,
  },
  PARENT: {
    // Parent has minimal permissions
    canManageUsers: false,
    canManageAdmins: false,
    canManageCoaches: false,
    canManageClasses: false,
    canManagePrograms: false,
    canManageSchools: false,
    canManageAreas: false,
    canManageWaivers: false,
    canManageBadges: false,
    canViewFinancials: false,
    canManageFinancials: false,
    canProcessRefunds: false,
    canManageDiscounts: false,
    canViewAllClients: false,
    canDeleteClients: false,
    canViewRosters: false,
    canShareRosters: false,
    canViewReports: false,
    canExportData: false,
    canManageSystemSettings: false,
    // Parent-specific permissions
    canEnrollChildren: true,
    canViewOwnChildren: true,
    canViewOwnPayments: true,
    canCancelOwnEnrollments: true,
  },
};

/**
 * Check if a role has a specific permission
 * @param {string} role - User role (OWNER, ADMIN, COACH, PARENT)
 * @param {string} permission - Permission key to check
 * @returns {boolean}
 */
export const hasPermission = (role, permission) => {
  const normalizedRole = role?.toUpperCase();
  const rolePerms = ROLE_PERMISSIONS[normalizedRole];

  if (!rolePerms) {
    console.warn(`Unknown role: ${role}`);
    return false;
  }

  return rolePerms[permission] === true;
};

/**
 * Check if user has any of the specified permissions
 * @param {string} role - User role
 * @param {string[]} permissions - Array of permission keys
 * @returns {boolean}
 */
export const hasAnyPermission = (role, permissions) => {
  return permissions.some(perm => hasPermission(role, perm));
};

/**
 * Check if user has all of the specified permissions
 * @param {string} role - User role
 * @param {string[]} permissions - Array of permission keys
 * @returns {boolean}
 */
export const hasAllPermissions = (role, permissions) => {
  return permissions.every(perm => hasPermission(role, perm));
};

/**
 * Check if a role is at or above a minimum role level
 * @param {string} userRole - User's current role
 * @param {string} minimumRole - Minimum required role
 * @returns {boolean}
 */
export const isRoleAtLeast = (userRole, minimumRole) => {
  const userLevel = ROLE_HIERARCHY[userRole?.toUpperCase()] ?? -1;
  const minLevel = ROLE_HIERARCHY[minimumRole?.toUpperCase()] ?? 999;
  return userLevel >= minLevel;
};

/**
 * Check if user can access admin features
 * @param {string} role - User role
 * @returns {boolean}
 */
export const canAccessAdmin = (role) => {
  return isRoleAtLeast(role, 'ADMIN');
};

/**
 * Get all permissions for a role
 * @param {string} role - User role
 * @returns {Object}
 */
export const getRolePermissions = (role) => {
  const normalizedRole = role?.toUpperCase();
  return ROLE_PERMISSIONS[normalizedRole] || {};
};

/**
 * Get role display label
 * @param {string} role - User role
 * @returns {string}
 */
export const getRoleLabel = (role) => {
  const normalizedRole = role?.toUpperCase();
  return ROLE_LABELS[normalizedRole] || role;
};

// Admin sidebar menu items with required permissions
export const ADMIN_MENU_ITEMS = {
  dashboard: { permission: null }, // All admin roles
  classes: { permission: 'canManageClasses' },
  programs: { permission: 'canManagePrograms' },
  schools: { permission: 'canManageSchools' },
  areas: { permission: 'canManageAreas' },
  clients: { permission: 'canViewAllClients' },
  enrollments: { permission: 'canManageClasses' },
  waivers: { permission: 'canManageWaivers' },
  badges: { permission: 'canManageBadges' },
  users: { permission: 'canManageUsers', minRole: 'ADMIN' },
  financials: { permission: 'canViewFinancials' },
  reports: { permission: 'canViewReports' },
  settings: { permission: 'canManageSystemSettings', minRole: 'OWNER' },
};

/**
 * Filter menu items based on user role
 * @param {string} role - User role
 * @param {Array} menuItems - Array of menu item objects with { name, permission?, minRole? }
 * @returns {Array} Filtered menu items
 */
export const filterMenuByRole = (role, menuItems) => {
  return menuItems.filter(item => {
    // If no permission required, show to all admin roles
    if (!item.permission && !item.minRole) {
      return canAccessAdmin(role);
    }

    // Check minimum role requirement
    if (item.minRole && !isRoleAtLeast(role, item.minRole)) {
      return false;
    }

    // Check specific permission
    if (item.permission && !hasPermission(role, item.permission)) {
      return false;
    }

    return true;
  });
};

export default {
  ROLE_HIERARCHY,
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isRoleAtLeast,
  canAccessAdmin,
  getRolePermissions,
  getRoleLabel,
  filterMenuByRole,
  ADMIN_MENU_ITEMS,
};
