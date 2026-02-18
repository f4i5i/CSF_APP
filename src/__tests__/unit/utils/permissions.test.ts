/**
 * Unit Tests for permissions.js utility
 * Tests: ROLE_HIERARCHY, ROLE_LABELS, ROLE_PERMISSIONS, hasPermission,
 *        hasAnyPermission, hasAllPermissions, isRoleAtLeast, canAccessAdmin,
 *        getRolePermissions, getRoleLabel, filterMenuByRole
 */

import {
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
} from '../../../utils/permissions';

describe('permissions utilities', () => {
  // ==========================================
  // ROLE_HIERARCHY
  // ==========================================
  describe('ROLE_HIERARCHY', () => {
    it('should define correct hierarchy levels', () => {
      expect(ROLE_HIERARCHY.PARENT).toBe(0);
      expect(ROLE_HIERARCHY.COACH).toBe(1);
      expect(ROLE_HIERARCHY.ADMIN).toBe(2);
      expect(ROLE_HIERARCHY.OWNER).toBe(3);
    });

    it('should have OWNER as highest level', () => {
      const maxLevel = Math.max(...Object.values(ROLE_HIERARCHY));
      expect(ROLE_HIERARCHY.OWNER).toBe(maxLevel);
    });

    it('should have PARENT as lowest level', () => {
      const minLevel = Math.min(...Object.values(ROLE_HIERARCHY));
      expect(ROLE_HIERARCHY.PARENT).toBe(minLevel);
    });
  });

  // ==========================================
  // ROLE_LABELS
  // ==========================================
  describe('ROLE_LABELS', () => {
    it('should have display labels for all roles', () => {
      expect(ROLE_LABELS.PARENT).toBe('Parent');
      expect(ROLE_LABELS.COACH).toBe('Coach');
      expect(ROLE_LABELS.ADMIN).toBe('Admin');
      expect(ROLE_LABELS.OWNER).toBe('Owner');
    });
  });

  // ==========================================
  // ROLE_PERMISSIONS
  // ==========================================
  describe('ROLE_PERMISSIONS', () => {
    it('should give OWNER all permissions', () => {
      const ownerPerms = ROLE_PERMISSIONS.OWNER;
      expect(ownerPerms.canManageUsers).toBe(true);
      expect(ownerPerms.canManageAdmins).toBe(true);
      expect(ownerPerms.canViewFinancials).toBe(true);
      expect(ownerPerms.canManageFinancials).toBe(true);
      expect(ownerPerms.canProcessRefunds).toBe(true);
      expect(ownerPerms.canManageSystemSettings).toBe(true);
    });

    it('should restrict ADMIN from financial and system settings', () => {
      const adminPerms = ROLE_PERMISSIONS.ADMIN;
      expect(adminPerms.canManageUsers).toBe(true);
      expect(adminPerms.canManageClasses).toBe(true);
      expect(adminPerms.canManageAdmins).toBe(false);
      expect(adminPerms.canViewFinancials).toBe(false);
      expect(adminPerms.canManageFinancials).toBe(false);
      expect(adminPerms.canProcessRefunds).toBe(false);
      expect(adminPerms.canManageSystemSettings).toBe(false);
    });

    it('should give COACH limited permissions', () => {
      const coachPerms = ROLE_PERMISSIONS.COACH;
      expect(coachPerms.canManageUsers).toBe(false);
      expect(coachPerms.canManageClasses).toBe(false);
      expect(coachPerms.canViewRosters).toBe(true);
      expect(coachPerms.canCheckInStudents).toBe(true);
      expect(coachPerms.canUploadPhotos).toBe(true);
      expect(coachPerms.canAwardBadges).toBe(true);
    });

    it('should give PARENT minimal permissions', () => {
      const parentPerms = ROLE_PERMISSIONS.PARENT;
      expect(parentPerms.canManageUsers).toBe(false);
      expect(parentPerms.canViewFinancials).toBe(false);
      expect(parentPerms.canEnrollChildren).toBe(true);
      expect(parentPerms.canViewOwnChildren).toBe(true);
      expect(parentPerms.canViewOwnPayments).toBe(true);
      expect(parentPerms.canCancelOwnEnrollments).toBe(true);
    });
  });

  // ==========================================
  // hasPermission
  // ==========================================
  describe('hasPermission', () => {
    it('should return true when role has the permission', () => {
      expect(hasPermission('OWNER', 'canManageUsers')).toBe(true);
    });

    it('should return false when role lacks the permission', () => {
      expect(hasPermission('PARENT', 'canManageUsers')).toBe(false);
    });

    it('should handle lowercase role names', () => {
      expect(hasPermission('owner', 'canManageUsers')).toBe(true);
    });

    it('should handle mixed case role names', () => {
      expect(hasPermission('Admin', 'canManageClasses')).toBe(true);
    });

    it('should return false for unknown role', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      expect(hasPermission('SUPERUSER', 'canManageUsers')).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith('Unknown role: SUPERUSER');
      warnSpy.mockRestore();
    });

    it('should return false for null role', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      expect(hasPermission(null, 'canManageUsers')).toBe(false);
      warnSpy.mockRestore();
    });

    it('should return false for undefined permission key', () => {
      expect(hasPermission('OWNER', 'nonExistentPermission')).toBe(false);
    });
  });

  // ==========================================
  // hasAnyPermission
  // ==========================================
  describe('hasAnyPermission', () => {
    it('should return true if role has at least one permission', () => {
      expect(hasAnyPermission('ADMIN', ['canManageUsers', 'canViewFinancials'])).toBe(true);
    });

    it('should return false if role has none of the permissions', () => {
      expect(hasAnyPermission('PARENT', ['canManageUsers', 'canViewFinancials'])).toBe(false);
    });

    it('should return false for empty permissions array', () => {
      expect(hasAnyPermission('OWNER', [])).toBe(false);
    });
  });

  // ==========================================
  // hasAllPermissions
  // ==========================================
  describe('hasAllPermissions', () => {
    it('should return true if role has all permissions', () => {
      expect(hasAllPermissions('OWNER', ['canManageUsers', 'canViewFinancials'])).toBe(true);
    });

    it('should return false if role lacks one permission', () => {
      expect(hasAllPermissions('ADMIN', ['canManageUsers', 'canViewFinancials'])).toBe(false);
    });

    it('should return true for empty permissions array', () => {
      expect(hasAllPermissions('PARENT', [])).toBe(true);
    });
  });

  // ==========================================
  // isRoleAtLeast
  // ==========================================
  describe('isRoleAtLeast', () => {
    it('should return true when user role equals minimum role', () => {
      expect(isRoleAtLeast('ADMIN', 'ADMIN')).toBe(true);
    });

    it('should return true when user role is above minimum', () => {
      expect(isRoleAtLeast('OWNER', 'ADMIN')).toBe(true);
    });

    it('should return false when user role is below minimum', () => {
      expect(isRoleAtLeast('COACH', 'ADMIN')).toBe(false);
    });

    it('should handle lowercase roles', () => {
      expect(isRoleAtLeast('owner', 'admin')).toBe(true);
    });

    it('should return false for unknown user role', () => {
      expect(isRoleAtLeast('UNKNOWN', 'ADMIN')).toBe(false);
    });

    it('should return false for unknown minimum role', () => {
      expect(isRoleAtLeast('OWNER', 'SUPERADMIN')).toBe(false);
    });

    it('should return false for null user role', () => {
      expect(isRoleAtLeast(null, 'ADMIN')).toBe(false);
    });
  });

  // ==========================================
  // canAccessAdmin
  // ==========================================
  describe('canAccessAdmin', () => {
    it('should return true for OWNER', () => {
      expect(canAccessAdmin('OWNER')).toBe(true);
    });

    it('should return true for ADMIN', () => {
      expect(canAccessAdmin('ADMIN')).toBe(true);
    });

    it('should return false for COACH', () => {
      expect(canAccessAdmin('COACH')).toBe(false);
    });

    it('should return false for PARENT', () => {
      expect(canAccessAdmin('PARENT')).toBe(false);
    });
  });

  // ==========================================
  // getRolePermissions
  // ==========================================
  describe('getRolePermissions', () => {
    it('should return permissions object for valid role', () => {
      const perms = getRolePermissions('OWNER');
      expect(perms.canManageUsers).toBe(true);
    });

    it('should handle lowercase roles', () => {
      const perms = getRolePermissions('admin');
      expect(perms.canManageClasses).toBe(true);
    });

    it('should return empty object for unknown role', () => {
      const perms = getRolePermissions('UNKNOWN');
      expect(perms).toEqual({});
    });

    it('should return empty object for null role', () => {
      const perms = getRolePermissions(null);
      expect(perms).toEqual({});
    });
  });

  // ==========================================
  // getRoleLabel
  // ==========================================
  describe('getRoleLabel', () => {
    it('should return display label for valid roles', () => {
      expect(getRoleLabel('OWNER')).toBe('Owner');
      expect(getRoleLabel('ADMIN')).toBe('Admin');
      expect(getRoleLabel('COACH')).toBe('Coach');
      expect(getRoleLabel('PARENT')).toBe('Parent');
    });

    it('should handle lowercase roles', () => {
      expect(getRoleLabel('owner')).toBe('Owner');
    });

    it('should return raw role for unknown roles', () => {
      expect(getRoleLabel('SUPERUSER')).toBe('SUPERUSER');
    });
  });

  // ==========================================
  // ADMIN_MENU_ITEMS
  // ==========================================
  describe('ADMIN_MENU_ITEMS', () => {
    it('should define dashboard with no permission', () => {
      expect(ADMIN_MENU_ITEMS.dashboard.permission).toBeNull();
    });

    it('should define classes with canManageClasses', () => {
      expect(ADMIN_MENU_ITEMS.classes.permission).toBe('canManageClasses');
    });

    it('should define settings with canManageSystemSettings and OWNER minRole', () => {
      expect(ADMIN_MENU_ITEMS.settings.permission).toBe('canManageSystemSettings');
      expect(ADMIN_MENU_ITEMS.settings.minRole).toBe('OWNER');
    });
  });

  // ==========================================
  // filterMenuByRole
  // ==========================================
  describe('filterMenuByRole', () => {
    const menuItems = [
      { name: 'Dashboard' },
      { name: 'Users', permission: 'canManageUsers' },
      { name: 'Settings', permission: 'canManageSystemSettings', minRole: 'OWNER' },
      { name: 'Classes', permission: 'canManageClasses' },
    ];

    it('should show all items for OWNER', () => {
      const filtered = filterMenuByRole('OWNER', menuItems);
      expect(filtered).toHaveLength(4);
    });

    it('should hide settings for ADMIN (not OWNER)', () => {
      const filtered = filterMenuByRole('ADMIN', menuItems);
      const names = filtered.map((i: any) => i.name);
      expect(names).toContain('Dashboard');
      expect(names).toContain('Users');
      expect(names).toContain('Classes');
      expect(names).not.toContain('Settings');
    });

    it('should hide all items for COACH (not admin level)', () => {
      const filtered = filterMenuByRole('COACH', menuItems);
      expect(filtered).toHaveLength(0);
    });

    it('should hide all items for PARENT', () => {
      const filtered = filterMenuByRole('PARENT', menuItems);
      expect(filtered).toHaveLength(0);
    });

    it('should handle empty menu items', () => {
      const filtered = filterMenuByRole('OWNER', []);
      expect(filtered).toHaveLength(0);
    });
  });
});
