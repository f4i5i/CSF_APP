/**
 * Unit Tests for src/api/constants/query-keys.ts
 * Tests the queryKeys factory object: all, lists, detail, and parameter-based keys
 */

import { queryKeys } from '../../../api/constants/query-keys';

describe('queryKeys', () => {
  // =========================================================================
  // AUTH
  // =========================================================================
  describe('auth', () => {
    it('should have correct base key', () => {
      expect(queryKeys.auth.all).toEqual(['auth']);
    });

    it('should build user key', () => {
      expect(queryKeys.auth.user()).toEqual(['auth', 'user']);
    });
  });

  // =========================================================================
  // USERS
  // =========================================================================
  describe('users', () => {
    it('should have correct base key', () => {
      expect(queryKeys.users.all).toEqual(['users']);
    });

    it('should build me key', () => {
      expect(queryKeys.users.me()).toEqual(['users', 'me']);
    });
  });

  // =========================================================================
  // CHILDREN
  // =========================================================================
  describe('children', () => {
    it('should have correct base key', () => {
      expect(queryKeys.children.all).toEqual(['children']);
    });

    it('should build lists key', () => {
      expect(queryKeys.children.lists()).toEqual(['children', 'list']);
    });

    it('should build list key with filters', () => {
      const filters = { status: 'ACTIVE' };
      expect(queryKeys.children.list(filters)).toEqual(['children', 'list', filters]);
    });

    it('should build list key without filters', () => {
      expect(queryKeys.children.list()).toEqual(['children', 'list', undefined]);
    });

    it('should build details key', () => {
      expect(queryKeys.children.details()).toEqual(['children', 'detail']);
    });

    it('should build detail key with id', () => {
      expect(queryKeys.children.detail('c123')).toEqual(['children', 'detail', 'c123']);
    });

    it('should build emergencyContacts key', () => {
      expect(queryKeys.children.emergencyContacts('c123')).toEqual([
        'children', 'detail', 'c123', 'emergencyContacts',
      ]);
    });
  });

  // =========================================================================
  // PROGRAMS
  // =========================================================================
  describe('programs', () => {
    it('should have correct base key', () => {
      expect(queryKeys.programs.all).toEqual(['programs']);
    });

    it('should build lists and detail keys', () => {
      expect(queryKeys.programs.lists()).toEqual(['programs', 'list']);
      expect(queryKeys.programs.list({ active: true })).toEqual(['programs', 'list', { active: true }]);
      expect(queryKeys.programs.details()).toEqual(['programs', 'detail']);
      expect(queryKeys.programs.detail('p1')).toEqual(['programs', 'detail', 'p1']);
    });
  });

  // =========================================================================
  // AREAS
  // =========================================================================
  describe('areas', () => {
    it('should have correct base key', () => {
      expect(queryKeys.areas.all).toEqual(['areas']);
    });

    it('should build lists and detail keys', () => {
      expect(queryKeys.areas.lists()).toEqual(['areas', 'list']);
      expect(queryKeys.areas.detail('a1')).toEqual(['areas', 'detail', 'a1']);
    });
  });

  // =========================================================================
  // CLASSES
  // =========================================================================
  describe('classes', () => {
    it('should have correct base key', () => {
      expect(queryKeys.classes.all).toEqual(['classes']);
    });

    it('should build lists, detail, capacity, and schedule keys', () => {
      expect(queryKeys.classes.lists()).toEqual(['classes', 'list']);
      expect(queryKeys.classes.list({ program_id: 'p1' })).toEqual(['classes', 'list', { program_id: 'p1' }]);
      expect(queryKeys.classes.detail('cl1')).toEqual(['classes', 'detail', 'cl1']);
      expect(queryKeys.classes.capacity('cl1')).toEqual(['classes', 'detail', 'cl1', 'capacity']);
      expect(queryKeys.classes.schedule('cl1')).toEqual(['classes', 'detail', 'cl1', 'schedule']);
    });
  });

  // =========================================================================
  // ENROLLMENTS
  // =========================================================================
  describe('enrollments', () => {
    it('should have correct base key', () => {
      expect(queryKeys.enrollments.all).toEqual(['enrollments']);
    });

    it('should build standard CRUD keys', () => {
      expect(queryKeys.enrollments.lists()).toEqual(['enrollments', 'list']);
      expect(queryKeys.enrollments.detail('e1')).toEqual(['enrollments', 'detail', 'e1']);
    });

    it('should build byChild key', () => {
      expect(queryKeys.enrollments.byChild('ch1')).toEqual(['enrollments', 'list', { child_id: 'ch1' }]);
    });

    it('should build byClass key', () => {
      expect(queryKeys.enrollments.byClass('cls1')).toEqual(['enrollments', 'list', { class_id: 'cls1' }]);
    });

    it('should build active key', () => {
      expect(queryKeys.enrollments.active()).toEqual(['enrollments', 'list', { status: 'ACTIVE' }]);
    });

    it('should build waitlist key', () => {
      expect(queryKeys.enrollments.waitlist('cls1')).toEqual(['enrollments', 'waitlist', 'cls1']);
    });
  });

  // =========================================================================
  // ORDERS
  // =========================================================================
  describe('orders', () => {
    it('should have correct base key', () => {
      expect(queryKeys.orders.all).toEqual(['orders']);
    });

    it('should build standard keys', () => {
      expect(queryKeys.orders.lists()).toEqual(['orders', 'list']);
      expect(queryKeys.orders.detail('o1')).toEqual(['orders', 'detail', 'o1']);
    });
  });

  // =========================================================================
  // PAYMENTS
  // =========================================================================
  describe('payments', () => {
    it('should have correct base key', () => {
      expect(queryKeys.payments.all).toEqual(['payments']);
    });

    it('should build methods key', () => {
      expect(queryKeys.payments.methods()).toEqual(['payments', 'methods']);
    });
  });

  // =========================================================================
  // PAYMENT METHODS
  // =========================================================================
  describe('paymentMethods', () => {
    it('should have correct base and lists keys', () => {
      expect(queryKeys.paymentMethods.all).toEqual(['paymentMethods']);
      expect(queryKeys.paymentMethods.lists()).toEqual(['paymentMethods', 'list']);
    });
  });

  // =========================================================================
  // INSTALLMENT PLANS
  // =========================================================================
  describe('installmentPlans', () => {
    it('should have correct keys', () => {
      expect(queryKeys.installmentPlans.all).toEqual(['installmentPlans']);
      expect(queryKeys.installmentPlans.lists()).toEqual(['installmentPlans', 'list']);
      expect(queryKeys.installmentPlans.detail('ip1')).toEqual(['installmentPlans', 'detail', 'ip1']);
    });
  });

  // =========================================================================
  // INSTALLMENTS
  // =========================================================================
  describe('installments', () => {
    it('should have correct keys', () => {
      expect(queryKeys.installments.all).toEqual(['installments']);
      expect(queryKeys.installments.summary()).toEqual(['installments', 'summary']);
      expect(queryKeys.installments.detail('i1')).toEqual(['installments', 'detail', 'i1']);
    });
  });

  // =========================================================================
  // DISCOUNTS
  // =========================================================================
  describe('discounts', () => {
    it('should have correct keys', () => {
      expect(queryKeys.discounts.all).toEqual(['discounts']);
      expect(queryKeys.discounts.codes()).toEqual(['discounts', 'codes']);
      expect(queryKeys.discounts.scholarships()).toEqual(['discounts', 'scholarships']);
    });
  });

  // =========================================================================
  // WAIVERS
  // =========================================================================
  describe('waivers', () => {
    it('should have correct keys', () => {
      expect(queryKeys.waivers.all).toEqual(['waivers']);
      expect(queryKeys.waivers.templates()).toEqual(['waivers', 'templates']);
      expect(queryKeys.waivers.acceptances()).toEqual(['waivers', 'acceptances']);
      expect(queryKeys.waivers.status()).toEqual(['waivers', 'status']);
    });
  });

  // =========================================================================
  // ATTENDANCE
  // =========================================================================
  describe('attendance', () => {
    it('should have correct base key', () => {
      expect(queryKeys.attendance.all).toEqual(['attendance']);
    });

    it('should build enrollment-scoped keys', () => {
      expect(queryKeys.attendance.byEnrollment('enr1')).toEqual(['attendance', 'enrollment', 'enr1']);
      expect(queryKeys.attendance.history('enr1')).toEqual(['attendance', 'enrollment', 'enr1', 'history']);
      expect(queryKeys.attendance.stats('enr1')).toEqual(['attendance', 'enrollment', 'enr1', 'stats']);
      expect(queryKeys.attendance.streak('enr1')).toEqual(['attendance', 'enrollment', 'enr1', 'streak']);
    });
  });

  // =========================================================================
  // BADGES
  // =========================================================================
  describe('badges', () => {
    it('should have correct keys', () => {
      expect(queryKeys.badges.all).toEqual(['badges']);
      expect(queryKeys.badges.lists()).toEqual(['badges', 'list']);
      expect(queryKeys.badges.detail('b1')).toEqual(['badges', 'detail', 'b1']);
      expect(queryKeys.badges.byEnrollment('enr1')).toEqual(['badges', 'enrollment', 'enr1']);
      expect(queryKeys.badges.progress('enr1')).toEqual(['badges', 'enrollment', 'enr1', 'progress']);
    });
  });

  // =========================================================================
  // CHECK-IN
  // =========================================================================
  describe('checkIn', () => {
    it('should have correct keys', () => {
      expect(queryKeys.checkIn.all).toEqual(['checkIn']);
      expect(queryKeys.checkIn.byClass('cls1')).toEqual(['checkIn', 'class', 'cls1']);
      expect(queryKeys.checkIn.status('cls1')).toEqual(['checkIn', 'class', 'cls1', 'status']);
      expect(queryKeys.checkIn.history('enr1')).toEqual(['checkIn', 'history', 'enr1']);
    });
  });

  // =========================================================================
  // ANNOUNCEMENTS
  // =========================================================================
  describe('announcements', () => {
    it('should have correct keys', () => {
      expect(queryKeys.announcements.all).toEqual(['announcements']);
      expect(queryKeys.announcements.lists()).toEqual(['announcements', 'list']);
      expect(queryKeys.announcements.detail('ann1')).toEqual(['announcements', 'detail', 'ann1']);
    });
  });

  // =========================================================================
  // EVENTS
  // =========================================================================
  describe('events', () => {
    it('should have correct keys', () => {
      expect(queryKeys.events.all).toEqual(['events']);
      expect(queryKeys.events.lists()).toEqual(['events', 'list']);
      expect(queryKeys.events.detail('ev1')).toEqual(['events', 'detail', 'ev1']);
      expect(queryKeys.events.calendar('03', '2025')).toEqual(['events', 'calendar', '03', '2025']);
      expect(queryKeys.events.byClass('cls1')).toEqual(['events', 'list', { class_id: 'cls1' }]);
    });
  });

  // =========================================================================
  // PHOTOS
  // =========================================================================
  describe('photos', () => {
    it('should have correct keys', () => {
      expect(queryKeys.photos.all).toEqual(['photos']);
      expect(queryKeys.photos.lists()).toEqual(['photos', 'list']);
      expect(queryKeys.photos.detail('ph1')).toEqual(['photos', 'detail', 'ph1']);
      expect(queryKeys.photos.byClass('cls1')).toEqual(['photos', 'list', { class_id: 'cls1' }]);
      expect(queryKeys.photos.categories()).toEqual(['photos', 'categories']);
    });
  });

  // =========================================================================
  // ADMIN
  // =========================================================================
  describe('admin', () => {
    it('should have correct keys', () => {
      expect(queryKeys.admin.all).toEqual(['admin']);
      expect(queryKeys.admin.metrics()).toEqual(['admin', 'metrics']);
      expect(queryKeys.admin.revenue({ month: '01' })).toEqual(['admin', 'revenue', { month: '01' }]);
      expect(queryKeys.admin.clients()).toEqual(['admin', 'clients', undefined]);
      expect(queryKeys.admin.client('u1')).toEqual(['admin', 'client', 'u1']);
      expect(queryKeys.admin.roster('cls1')).toEqual(['admin', 'roster', 'cls1']);
      expect(queryKeys.admin.refunds()).toEqual(['admin', 'refunds', undefined]);
    });
  });

  // =========================================================================
  // COACH
  // =========================================================================
  describe('coach', () => {
    it('should have correct keys', () => {
      expect(queryKeys.coach.all).toEqual(['coach']);
      expect(queryKeys.coach.classes()).toEqual(['coach', 'classes']);
      expect(queryKeys.coach.checkInStatus('cls1')).toEqual(['coach', 'checkInStatus', 'cls1']);
    });
  });

  // =========================================================================
  // KEY HIERARCHY
  // =========================================================================
  describe('key hierarchy', () => {
    it('should ensure detail keys extend all keys for proper invalidation', () => {
      // detail keys should start with the 'all' key prefix
      const detailKey = queryKeys.children.detail('c1');
      expect(detailKey[0]).toBe(queryKeys.children.all[0]);
    });

    it('should ensure list keys extend all keys', () => {
      const listsKey = queryKeys.enrollments.lists();
      expect(listsKey[0]).toBe(queryKeys.enrollments.all[0]);
    });
  });
});
