/**
 * usePermissions Hook
 * Provides role-based permission checking for components
 */

import { useMemo } from 'react';
import { useAuth } from '../context/auth';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isRoleAtLeast,
  canAccessAdmin,
  getRolePermissions,
  getRoleLabel,
  filterMenuByRole,
} from '../utils/permissions';

/**
 * Hook for checking user permissions
 * @returns {Object} Permission checking utilities
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const role = user?.role;

  // Memoize permissions object for performance
  const permissions = useMemo(() => getRolePermissions(role), [role]);

  return {
    // Current user's role
    role,
    roleLabel: getRoleLabel(role),

    // All permissions for current role
    permissions,

    /**
     * Check if user has a specific permission
     * @param {string} permission - Permission key
     * @returns {boolean}
     */
    can: (permission) => hasPermission(role, permission),

    /**
     * Check if user has any of the specified permissions
     * @param {string[]} perms - Array of permission keys
     * @returns {boolean}
     */
    canAny: (perms) => hasAnyPermission(role, perms),

    /**
     * Check if user has all of the specified permissions
     * @param {string[]} perms - Array of permission keys
     * @returns {boolean}
     */
    canAll: (perms) => hasAllPermissions(role, perms),

    /**
     * Check if user's role is at or above a minimum role
     * @param {string} minRole - Minimum role required
     * @returns {boolean}
     */
    isAtLeast: (minRole) => isRoleAtLeast(role, minRole),

    /**
     * Check if user can access admin features
     * @returns {boolean}
     */
    isAdmin: canAccessAdmin(role),

    /**
     * Check if user is owner
     * @returns {boolean}
     */
    isOwner: role?.toUpperCase() === 'OWNER',

    /**
     * Check if user is a coach
     * @returns {boolean}
     */
    isCoach: role?.toUpperCase() === 'COACH',

    /**
     * Check if user is a parent
     * @returns {boolean}
     */
    isParent: role?.toUpperCase() === 'PARENT',

    /**
     * Filter menu items based on user's permissions
     * @param {Array} menuItems - Array of menu items
     * @returns {Array} Filtered menu items
     */
    filterMenu: (menuItems) => filterMenuByRole(role, menuItems),
  };
};

export default usePermissions;
