/**
 * Unit Tests for usePermissions Hook
 * Tests role-based permission checking for all roles: PARENT, COACH, ADMIN, OWNER
 */

import { renderHook } from '@testing-library/react';
import { usePermissions } from '../usePermissions';

// ==========================================
// MOCK SETUP
// ==========================================

// Track the mock user value so we can change it per test
let mockUser: { role: string } | null = null;

jest.mock('../../context/auth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// We do NOT mock utils/permissions - we test the real integration
// between the hook and the permissions utility

describe('usePermissions Hook', () => {
  beforeEach(() => {
    mockUser = null;
  });

  // ===========================================
  // ROLE DETECTION TESTS
  // ===========================================

  describe('Role Detection', () => {
    it('should return the current user role', () => {
      mockUser = { role: 'ADMIN' };
      const { result } = renderHook(() => usePermissions());

      expect(result.current.role).toBe('ADMIN');
    });

    it('should return undefined role when user is null', () => {
      mockUser = null;
      const { result } = renderHook(() => usePermissions());

      expect(result.current.role).toBeUndefined();
    });
  });

  // ===========================================
  // ROLE LABEL TESTS
  // ===========================================

  describe('roleLabel', () => {
    it.each([
      ['PARENT', 'Parent'],
      ['COACH', 'Coach'],
      ['ADMIN', 'Admin'],
      ['OWNER', 'Owner'],
    ])('should return "%s" label as "%s"', (role, expected) => {
      mockUser = { role };
      const { result } = renderHook(() => usePermissions());

      expect(result.current.roleLabel).toBe(expected);
    });

    it('should return raw role when unknown', () => {
      mockUser = { role: 'UNKNOWN_ROLE' };
      const { result } = renderHook(() => usePermissions());

      // getRoleLabel returns the raw role if not in ROLE_LABELS
      expect(result.current.roleLabel).toBe('UNKNOWN_ROLE');
    });
  });

  // ===========================================
  // isOwner / isCoach / isParent / isAdmin TESTS
  // ===========================================

  describe('Role Boolean Checks', () => {
    describe('isOwner', () => {
      it('should be true for OWNER role', () => {
        mockUser = { role: 'OWNER' };
        const { result } = renderHook(() => usePermissions());
        expect(result.current.isOwner).toBe(true);
      });

      it('should be true for lowercase owner role', () => {
        mockUser = { role: 'owner' };
        const { result } = renderHook(() => usePermissions());
        expect(result.current.isOwner).toBe(true);
      });

      it('should be false for non-OWNER roles', () => {
        mockUser = { role: 'ADMIN' };
        const { result } = renderHook(() => usePermissions());
        expect(result.current.isOwner).toBe(false);
      });
    });

    describe('isCoach', () => {
      it('should be true for COACH role', () => {
        mockUser = { role: 'COACH' };
        const { result } = renderHook(() => usePermissions());
        expect(result.current.isCoach).toBe(true);
      });

      it('should be false for non-COACH roles', () => {
        mockUser = { role: 'PARENT' };
        const { result } = renderHook(() => usePermissions());
        expect(result.current.isCoach).toBe(false);
      });
    });

    describe('isParent', () => {
      it('should be true for PARENT role', () => {
        mockUser = { role: 'PARENT' };
        const { result } = renderHook(() => usePermissions());
        expect(result.current.isParent).toBe(true);
      });

      it('should be false for non-PARENT roles', () => {
        mockUser = { role: 'OWNER' };
        const { result } = renderHook(() => usePermissions());
        expect(result.current.isParent).toBe(false);
      });
    });

    describe('isAdmin', () => {
      it('should be true for ADMIN role', () => {
        mockUser = { role: 'ADMIN' };
        const { result } = renderHook(() => usePermissions());
        expect(result.current.isAdmin).toBe(true);
      });

      it('should be true for OWNER role (owner is at least admin)', () => {
        mockUser = { role: 'OWNER' };
        const { result } = renderHook(() => usePermissions());
        expect(result.current.isAdmin).toBe(true);
      });

      it('should be false for COACH role', () => {
        mockUser = { role: 'COACH' };
        const { result } = renderHook(() => usePermissions());
        expect(result.current.isAdmin).toBe(false);
      });

      it('should be false for PARENT role', () => {
        mockUser = { role: 'PARENT' };
        const { result } = renderHook(() => usePermissions());
        expect(result.current.isAdmin).toBe(false);
      });
    });
  });

  // ===========================================
  // can() FUNCTION TESTS
  // ===========================================

  describe('can() - Permission Checking', () => {
    describe('OWNER permissions', () => {
      beforeEach(() => {
        mockUser = { role: 'OWNER' };
      });

      it('should have canManageUsers', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canManageUsers')).toBe(true);
      });

      it('should have canManageAdmins', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canManageAdmins')).toBe(true);
      });

      it('should have canViewFinancials', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canViewFinancials')).toBe(true);
      });

      it('should have canManageSystemSettings', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canManageSystemSettings')).toBe(true);
      });

      it('should have canProcessRefunds', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canProcessRefunds')).toBe(true);
      });

      it('should have canDeleteClients', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canDeleteClients')).toBe(true);
      });
    });

    describe('ADMIN permissions', () => {
      beforeEach(() => {
        mockUser = { role: 'ADMIN' };
      });

      it('should have canManageUsers', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canManageUsers')).toBe(true);
      });

      it('should NOT have canManageAdmins', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canManageAdmins')).toBe(false);
      });

      it('should NOT have canViewFinancials', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canViewFinancials')).toBe(false);
      });

      it('should NOT have canManageSystemSettings', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canManageSystemSettings')).toBe(false);
      });

      it('should have canManageClasses', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canManageClasses')).toBe(true);
      });

      it('should have canExportData', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canExportData')).toBe(true);
      });
    });

    describe('COACH permissions', () => {
      beforeEach(() => {
        mockUser = { role: 'COACH' };
      });

      it('should have canViewRosters', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canViewRosters')).toBe(true);
      });

      it('should have canCheckInStudents', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canCheckInStudents')).toBe(true);
      });

      it('should have canAwardBadges', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canAwardBadges')).toBe(true);
      });

      it('should NOT have canManageClasses', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canManageClasses')).toBe(false);
      });

      it('should NOT have canManageUsers', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canManageUsers')).toBe(false);
      });
    });

    describe('PARENT permissions', () => {
      beforeEach(() => {
        mockUser = { role: 'PARENT' };
      });

      it('should have canEnrollChildren', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canEnrollChildren')).toBe(true);
      });

      it('should have canViewOwnChildren', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canViewOwnChildren')).toBe(true);
      });

      it('should have canViewOwnPayments', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canViewOwnPayments')).toBe(true);
      });

      it('should NOT have canManageClasses', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canManageClasses')).toBe(false);
      });

      it('should NOT have canViewRosters', () => {
        const { result } = renderHook(() => usePermissions());
        expect(result.current.can('canViewRosters')).toBe(false);
      });
    });

    it('should return false for unknown permission', () => {
      mockUser = { role: 'OWNER' };
      const { result } = renderHook(() => usePermissions());
      expect(result.current.can('canDoSomethingFake')).toBe(false);
    });
  });

  // ===========================================
  // canAny() TESTS
  // ===========================================

  describe('canAny() - Any Permission Check', () => {
    it('should return true if user has at least one of the permissions', () => {
      mockUser = { role: 'COACH' };
      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.canAny(['canManageClasses', 'canViewRosters'])
      ).toBe(true);
    });

    it('should return false if user has none of the permissions', () => {
      mockUser = { role: 'PARENT' };
      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.canAny(['canManageClasses', 'canManageUsers'])
      ).toBe(false);
    });
  });

  // ===========================================
  // canAll() TESTS
  // ===========================================

  describe('canAll() - All Permissions Check', () => {
    it('should return true if user has all requested permissions', () => {
      mockUser = { role: 'OWNER' };
      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.canAll(['canManageClasses', 'canManageUsers', 'canViewFinancials'])
      ).toBe(true);
    });

    it('should return false if user is missing any permission', () => {
      mockUser = { role: 'ADMIN' };
      const { result } = renderHook(() => usePermissions());

      expect(
        result.current.canAll(['canManageClasses', 'canViewFinancials'])
      ).toBe(false);
    });
  });

  // ===========================================
  // isAtLeast() TESTS
  // ===========================================

  describe('isAtLeast() - Role Hierarchy', () => {
    it('OWNER should be at least ADMIN', () => {
      mockUser = { role: 'OWNER' };
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAtLeast('ADMIN')).toBe(true);
    });

    it('OWNER should be at least OWNER', () => {
      mockUser = { role: 'OWNER' };
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAtLeast('OWNER')).toBe(true);
    });

    it('ADMIN should be at least COACH', () => {
      mockUser = { role: 'ADMIN' };
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAtLeast('COACH')).toBe(true);
    });

    it('ADMIN should NOT be at least OWNER', () => {
      mockUser = { role: 'ADMIN' };
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAtLeast('OWNER')).toBe(false);
    });

    it('COACH should be at least PARENT', () => {
      mockUser = { role: 'COACH' };
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAtLeast('PARENT')).toBe(true);
    });

    it('COACH should NOT be at least ADMIN', () => {
      mockUser = { role: 'COACH' };
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAtLeast('ADMIN')).toBe(false);
    });

    it('PARENT should be at least PARENT', () => {
      mockUser = { role: 'PARENT' };
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAtLeast('PARENT')).toBe(true);
    });

    it('PARENT should NOT be at least COACH', () => {
      mockUser = { role: 'PARENT' };
      const { result } = renderHook(() => usePermissions());
      expect(result.current.isAtLeast('COACH')).toBe(false);
    });
  });

  // ===========================================
  // permissions OBJECT TESTS
  // ===========================================

  describe('permissions Object', () => {
    it('should return all permissions for the OWNER role', () => {
      mockUser = { role: 'OWNER' };
      const { result } = renderHook(() => usePermissions());

      expect(result.current.permissions).toBeDefined();
      expect(result.current.permissions.canManageUsers).toBe(true);
      expect(result.current.permissions.canManageAdmins).toBe(true);
      expect(result.current.permissions.canManageSystemSettings).toBe(true);
    });

    it('should return all permissions for the PARENT role', () => {
      mockUser = { role: 'PARENT' };
      const { result } = renderHook(() => usePermissions());

      expect(result.current.permissions.canEnrollChildren).toBe(true);
      expect(result.current.permissions.canManageClasses).toBe(false);
    });

    it('should return empty object for unknown role', () => {
      mockUser = { role: 'UNKNOWN' };
      const { result } = renderHook(() => usePermissions());

      expect(result.current.permissions).toEqual({});
    });
  });

  // ===========================================
  // filterMenu() TESTS
  // ===========================================

  describe('filterMenu() - Menu Filtering', () => {
    const menuItems = [
      { name: 'Dashboard' }, // no permission = admin access
      { name: 'Classes', permission: 'canManageClasses' },
      { name: 'Financials', permission: 'canViewFinancials' },
      { name: 'Settings', permission: 'canManageSystemSettings', minRole: 'OWNER' },
    ];

    it('OWNER should see all menu items', () => {
      mockUser = { role: 'OWNER' };
      const { result } = renderHook(() => usePermissions());

      const filtered = result.current.filterMenu(menuItems);
      expect(filtered).toHaveLength(4);
    });

    it('ADMIN should see Dashboard and Classes but not Financials or Settings', () => {
      mockUser = { role: 'ADMIN' };
      const { result } = renderHook(() => usePermissions());

      const filtered = result.current.filterMenu(menuItems);
      const names = filtered.map((item: { name: string }) => item.name);
      expect(names).toContain('Dashboard');
      expect(names).toContain('Classes');
      expect(names).not.toContain('Financials');
      expect(names).not.toContain('Settings');
    });

    it('PARENT should see no admin menu items', () => {
      mockUser = { role: 'PARENT' };
      const { result } = renderHook(() => usePermissions());

      const filtered = result.current.filterMenu(menuItems);
      expect(filtered).toHaveLength(0);
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================

  describe('Edge Cases', () => {
    it('should handle null user gracefully', () => {
      mockUser = null;
      const { result } = renderHook(() => usePermissions());

      expect(result.current.role).toBeUndefined();
      expect(result.current.isOwner).toBeFalsy();
      expect(result.current.isAdmin).toBe(false);
      expect(result.current.can('canManageUsers')).toBe(false);
      expect(result.current.permissions).toEqual({});
    });

    it('should handle case-insensitive roles', () => {
      mockUser = { role: 'admin' };
      const { result } = renderHook(() => usePermissions());

      expect(result.current.can('canManageClasses')).toBe(true);
      expect(result.current.isAtLeast('COACH')).toBe(true);
    });
  });
});
