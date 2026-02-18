/**
 * Unit Tests for src/api/constants/endpoints.ts
 * Tests all endpoint paths and dynamic endpoint generators.
 */

import { ENDPOINTS } from '../../../api/constants/endpoints';

describe('ENDPOINTS (constants/endpoints.ts)', () => {
  // =========================================================================
  // AUTH
  // =========================================================================
  describe('AUTH', () => {
    it('should define all auth endpoints', () => {
      expect(ENDPOINTS.AUTH.LOGIN).toBe('/auth/login');
      expect(ENDPOINTS.AUTH.REGISTER).toBe('/auth/register');
      expect(ENDPOINTS.AUTH.REFRESH).toBe('/auth/refresh');
      expect(ENDPOINTS.AUTH.TOKEN).toBe('/auth/token');
      expect(ENDPOINTS.AUTH.GOOGLE).toBe('/auth/google');
      expect(ENDPOINTS.AUTH.LOGOUT).toBe('/auth/logout');
    });
  });

  // =========================================================================
  // USERS
  // =========================================================================
  describe('USERS', () => {
    it('should define user endpoints', () => {
      expect(ENDPOINTS.USERS.ME).toBe('/users/me');
      expect(ENDPOINTS.USERS.UPDATE_ME).toBe('/users/me');
    });
  });

  // =========================================================================
  // CHILDREN
  // =========================================================================
  describe('CHILDREN', () => {
    it('should define static children endpoints', () => {
      expect(ENDPOINTS.CHILDREN.MY).toBe('/children/my');
      expect(ENDPOINTS.CHILDREN.LIST).toBe('/children');
      expect(ENDPOINTS.CHILDREN.CREATE).toBe('/children');
    });

    it('should generate dynamic children endpoints', () => {
      expect(ENDPOINTS.CHILDREN.BY_ID('c1')).toBe('/children/c1');
      expect(ENDPOINTS.CHILDREN.UPDATE('c2')).toBe('/children/c2');
      expect(ENDPOINTS.CHILDREN.DELETE('c3')).toBe('/children/c3');
      expect(ENDPOINTS.CHILDREN.EMERGENCY_CONTACTS('c4')).toBe('/children/c4/emergency-contacts');
      expect(ENDPOINTS.CHILDREN.EMERGENCY_CONTACT('c5', 'ec1')).toBe('/children/c5/emergency-contacts/ec1');
    });
  });

  // =========================================================================
  // PROGRAMS
  // =========================================================================
  describe('PROGRAMS', () => {
    it('should define static and dynamic program endpoints', () => {
      expect(ENDPOINTS.PROGRAMS.LIST).toBe('/programs/');
      expect(ENDPOINTS.PROGRAMS.CREATE).toBe('/programs/');
      expect(ENDPOINTS.PROGRAMS.BY_ID('p1')).toBe('/programs/p1/');
      expect(ENDPOINTS.PROGRAMS.UPDATE('p2')).toBe('/programs/p2/');
      expect(ENDPOINTS.PROGRAMS.DELETE('p3')).toBe('/programs/p3/');
    });
  });

  // =========================================================================
  // AREAS
  // =========================================================================
  describe('AREAS', () => {
    it('should define static and dynamic area endpoints', () => {
      expect(ENDPOINTS.AREAS.LIST).toBe('/areas/');
      expect(ENDPOINTS.AREAS.CREATE).toBe('/areas/');
      expect(ENDPOINTS.AREAS.BY_ID('a1')).toBe('/areas/a1/');
      expect(ENDPOINTS.AREAS.UPDATE('a2')).toBe('/areas/a2/');
      expect(ENDPOINTS.AREAS.DELETE('a3')).toBe('/areas/a3/');
    });
  });

  // =========================================================================
  // CLASSES
  // =========================================================================
  describe('CLASSES', () => {
    it('should define static class endpoints', () => {
      expect(ENDPOINTS.CLASSES.LIST).toBe('/classes/');
      expect(ENDPOINTS.CLASSES.CREATE).toBe('/classes/');
    });

    it('should generate dynamic class endpoints', () => {
      expect(ENDPOINTS.CLASSES.BY_ID('cl1')).toBe('/classes/cl1/');
      expect(ENDPOINTS.CLASSES.UPDATE('cl2')).toBe('/classes/cl2/');
      expect(ENDPOINTS.CLASSES.DELETE('cl3')).toBe('/classes/cl3/');
      expect(ENDPOINTS.CLASSES.CAPACITY('cl4')).toBe('/classes/cl4/capacity/');
      expect(ENDPOINTS.CLASSES.SCHEDULE('cl5')).toBe('/classes/cl5/schedule/');
      expect(ENDPOINTS.CLASSES.ENROLLMENTS('cl6')).toBe('/classes/cl6/enrollments/');
    });
  });

  // =========================================================================
  // ENROLLMENTS
  // =========================================================================
  describe('ENROLLMENTS', () => {
    it('should define static enrollment endpoints', () => {
      expect(ENDPOINTS.ENROLLMENTS.MY).toBe('/enrollments/my');
      expect(ENDPOINTS.ENROLLMENTS.LIST).toBe('/enrollments');
      expect(ENDPOINTS.ENROLLMENTS.CREATE).toBe('/enrollments');
      expect(ENDPOINTS.ENROLLMENTS.WAITLIST_JOIN).toBe('/enrollments/waitlist/join');
    });

    it('should generate dynamic enrollment endpoints', () => {
      expect(ENDPOINTS.ENROLLMENTS.BY_ID('e1')).toBe('/enrollments/e1');
      expect(ENDPOINTS.ENROLLMENTS.UPDATE('e2')).toBe('/enrollments/e2');
      expect(ENDPOINTS.ENROLLMENTS.DELETE('e3')).toBe('/enrollments/e3');
      expect(ENDPOINTS.ENROLLMENTS.CANCEL('e4')).toBe('/enrollments/e4/cancel');
      expect(ENDPOINTS.ENROLLMENTS.TRANSFER('e5')).toBe('/enrollments/e5/transfer');
      expect(ENDPOINTS.ENROLLMENTS.ACTIVATE('e6')).toBe('/enrollments/e6/activate');
      expect(ENDPOINTS.ENROLLMENTS.PAUSE('e7')).toBe('/enrollments/e7/pause');
      expect(ENDPOINTS.ENROLLMENTS.RESUME('e8')).toBe('/enrollments/e8/resume');
      expect(ENDPOINTS.ENROLLMENTS.CANCELLATION_PREVIEW('e9')).toBe('/enrollments/e9/cancellation-preview');
      expect(ENDPOINTS.ENROLLMENTS.WAITLIST_CLAIM('e10')).toBe('/enrollments/e10/waitlist/claim');
      expect(ENDPOINTS.ENROLLMENTS.WAITLIST_CLASS('cls1')).toBe('/enrollments/waitlist/class/cls1');
      expect(ENDPOINTS.ENROLLMENTS.WAITLIST_PROMOTE('e11')).toBe('/enrollments/e11/waitlist/promote');
    });
  });

  // =========================================================================
  // ORDERS
  // =========================================================================
  describe('ORDERS', () => {
    it('should define static order endpoints', () => {
      expect(ENDPOINTS.ORDERS.MY).toBe('/orders/my');
      expect(ENDPOINTS.ORDERS.LIST).toBe('/orders');
      expect(ENDPOINTS.ORDERS.CALCULATE).toBe('/orders/calculate');
      expect(ENDPOINTS.ORDERS.CREATE).toBe('/orders');
    });

    it('should generate dynamic order endpoints', () => {
      expect(ENDPOINTS.ORDERS.BY_ID('o1')).toBe('/orders/o1');
      expect(ENDPOINTS.ORDERS.CHECKOUT('o2')).toBe('/orders/o2/checkout');
      expect(ENDPOINTS.ORDERS.CONFIRM('o3')).toBe('/orders/o3/confirm');
      expect(ENDPOINTS.ORDERS.CANCEL('o4')).toBe('/orders/o4/cancel');
    });
  });

  // =========================================================================
  // PAYMENTS
  // =========================================================================
  describe('PAYMENTS', () => {
    it('should define static payment endpoints', () => {
      expect(ENDPOINTS.PAYMENTS.MY).toBe('/payments/my');
      expect(ENDPOINTS.PAYMENTS.LIST).toBe('/payments');
      expect(ENDPOINTS.PAYMENTS.SETUP_INTENT).toBe('/payments/setup-intent');
      expect(ENDPOINTS.PAYMENTS.METHODS).toBe('/payments/methods');
      expect(ENDPOINTS.PAYMENTS.ATTACH_METHOD).toBe('/payments/methods/attach');
      expect(ENDPOINTS.PAYMENTS.REFUND).toBe('/payments/refund');
    });

    it('should generate dynamic payment endpoints', () => {
      expect(ENDPOINTS.PAYMENTS.BY_ID('p1')).toBe('/payments/p1');
      expect(ENDPOINTS.PAYMENTS.SET_DEFAULT_METHOD('m1')).toBe('/payments/methods/m1/default');
      expect(ENDPOINTS.PAYMENTS.DELETE_METHOD('m2')).toBe('/payments/methods/m2');
      expect(ENDPOINTS.PAYMENTS.INVOICE_DOWNLOAD('p2')).toBe('/payments/p2/invoice/download');
    });
  });

  // =========================================================================
  // INSTALLMENTS
  // =========================================================================
  describe('INSTALLMENTS', () => {
    it('should define static installment endpoints', () => {
      expect(ENDPOINTS.INSTALLMENTS.MY).toBe('/installments/my');
      expect(ENDPOINTS.INSTALLMENTS.LIST).toBe('/installments');
      expect(ENDPOINTS.INSTALLMENTS.PREVIEW).toBe('/installments/preview');
      expect(ENDPOINTS.INSTALLMENTS.CREATE).toBe('/installments');
      expect(ENDPOINTS.INSTALLMENTS.SUMMARY).toBe('/installments/my/summary');
    });

    it('should generate dynamic installment endpoints', () => {
      expect(ENDPOINTS.INSTALLMENTS.BY_ID('i1')).toBe('/installments/i1');
      expect(ENDPOINTS.INSTALLMENTS.DELETE('i2')).toBe('/installments/i2');
      expect(ENDPOINTS.INSTALLMENTS.PAYMENTS('i3')).toBe('/installments/i3/payments');
      expect(ENDPOINTS.INSTALLMENTS.ATTEMPT_PAYMENT('i4', 'pay1')).toBe('/installments/i4/payments/pay1/attempt');
    });
  });

  // =========================================================================
  // DISCOUNTS
  // =========================================================================
  describe('DISCOUNTS', () => {
    it('should define static discount endpoints', () => {
      expect(ENDPOINTS.DISCOUNTS.VALIDATE).toBe('/discounts/validate');
      expect(ENDPOINTS.DISCOUNTS.CODES_LIST).toBe('/discounts/codes');
      expect(ENDPOINTS.DISCOUNTS.CODES_CREATE).toBe('/discounts/codes');
      expect(ENDPOINTS.DISCOUNTS.SCHOLARSHIPS_LIST).toBe('/discounts/scholarships');
      expect(ENDPOINTS.DISCOUNTS.SCHOLARSHIPS_CREATE).toBe('/discounts/scholarships');
    });

    it('should generate dynamic discount endpoints', () => {
      expect(ENDPOINTS.DISCOUNTS.CODES_BY_ID('dc1')).toBe('/discounts/codes/dc1');
      expect(ENDPOINTS.DISCOUNTS.CODES_UPDATE('dc2')).toBe('/discounts/codes/dc2');
      expect(ENDPOINTS.DISCOUNTS.CODES_DELETE('dc3')).toBe('/discounts/codes/dc3');
      expect(ENDPOINTS.DISCOUNTS.SCHOLARSHIPS_BY_ID('s1')).toBe('/discounts/scholarships/s1');
      expect(ENDPOINTS.DISCOUNTS.SCHOLARSHIPS_UPDATE('s2')).toBe('/discounts/scholarships/s2');
      expect(ENDPOINTS.DISCOUNTS.SCHOLARSHIPS_DELETE('s3')).toBe('/discounts/scholarships/s3');
    });
  });

  // =========================================================================
  // WAIVERS
  // =========================================================================
  describe('WAIVERS', () => {
    it('should define static waiver endpoints', () => {
      expect(ENDPOINTS.WAIVERS.ACCEPT).toBe('/waivers/accept');
      expect(ENDPOINTS.WAIVERS.MY_ACCEPTANCES).toBe('/waivers/my-acceptances');
      expect(ENDPOINTS.WAIVERS.STATUS).toBe('/waivers/status');
      expect(ENDPOINTS.WAIVERS.TEMPLATES_LIST).toBe('/waivers/templates');
      expect(ENDPOINTS.WAIVERS.TEMPLATES_CREATE).toBe('/waivers/templates');
    });

    it('should generate dynamic waiver endpoints', () => {
      expect(ENDPOINTS.WAIVERS.TEMPLATES_BY_ID('wt1')).toBe('/waivers/templates/wt1');
      expect(ENDPOINTS.WAIVERS.TEMPLATES_UPDATE('wt2')).toBe('/waivers/templates/wt2');
      expect(ENDPOINTS.WAIVERS.TEMPLATES_DELETE('wt3')).toBe('/waivers/templates/wt3');
    });
  });

  // =========================================================================
  // ATTENDANCE
  // =========================================================================
  describe('ATTENDANCE', () => {
    it('should define static attendance endpoints', () => {
      expect(ENDPOINTS.ATTENDANCE.LIST).toBe('/attendance');
      expect(ENDPOINTS.ATTENDANCE.CREATE).toBe('/attendance');
      expect(ENDPOINTS.ATTENDANCE.MARK).toBe('/attendance/mark');
      expect(ENDPOINTS.ATTENDANCE.BULK_CREATE).toBe('/attendance/bulk');
      expect(ENDPOINTS.ATTENDANCE.SUMMARY).toBe('/attendance/summary/');
    });

    it('should generate dynamic attendance endpoints', () => {
      expect(ENDPOINTS.ATTENDANCE.BY_ID('at1')).toBe('/attendance/at1');
      expect(ENDPOINTS.ATTENDANCE.STATS('ch1')).toBe('/attendance/child/ch1/stats');
      expect(ENDPOINTS.ATTENDANCE.STREAK('enr1')).toBe('/attendance/enrollment/enr1/streak');
      expect(ENDPOINTS.ATTENDANCE.ENROLLMENT_HISTORY('enr2')).toBe('/attendance/enrollment/enr2/history');
      expect(ENDPOINTS.ATTENDANCE.ENROLLMENT_STATS('enr3')).toBe('/attendance/enrollment/enr3/stats');
      expect(ENDPOINTS.ATTENDANCE.ENROLLMENT_STREAK('enr4')).toBe('/attendance/enrollment/enr4/streak');
      expect(ENDPOINTS.ATTENDANCE.CLASS('cls1')).toBe('/attendance/class/cls1');
    });
  });

  // =========================================================================
  // BADGES
  // =========================================================================
  describe('BADGES', () => {
    it('should define static badge endpoints', () => {
      expect(ENDPOINTS.BADGES.LIST).toBe('/badges');
      expect(ENDPOINTS.BADGES.AWARD).toBe('/badges/award');
    });

    it('should generate dynamic badge endpoints', () => {
      expect(ENDPOINTS.BADGES.BY_ID('b1')).toBe('/badges/b1');
      expect(ENDPOINTS.BADGES.ENROLLMENT('enr1')).toBe('/badges/enrollment/enr1');
      expect(ENDPOINTS.BADGES.PROGRESS('enr2')).toBe('/badges/enrollment/enr2/progress');
    });
  });

  // =========================================================================
  // CHECKIN
  // =========================================================================
  describe('CHECKIN', () => {
    it('should define static check-in endpoints', () => {
      expect(ENDPOINTS.CHECKIN.CREATE).toBe('/check-in');
      expect(ENDPOINTS.CHECKIN.BULK).toBe('/check-in/bulk');
      expect(ENDPOINTS.CHECKIN.TEXT).toBe('/check-in/text');
    });

    it('should generate dynamic check-in endpoints', () => {
      expect(ENDPOINTS.CHECKIN.CLASS('cls1')).toBe('/check-in/class/cls1');
      expect(ENDPOINTS.CHECKIN.STATUS('cls2')).toBe('/check-in/class/cls2/status');
    });
  });

  // =========================================================================
  // ANNOUNCEMENTS
  // =========================================================================
  describe('ANNOUNCEMENTS', () => {
    it('should define static announcement endpoints', () => {
      expect(ENDPOINTS.ANNOUNCEMENTS.LIST).toBe('/announcements');
      expect(ENDPOINTS.ANNOUNCEMENTS.CREATE).toBe('/announcements');
      expect(ENDPOINTS.ANNOUNCEMENTS.MARK_ALL_READ).toBe('/announcements/mark-all-read');
      expect(ENDPOINTS.ANNOUNCEMENTS.UNREAD_COUNT).toBe('/announcements/unread-count');
      expect(ENDPOINTS.ANNOUNCEMENTS.PINNED).toBe('/announcements/pinned');
    });

    it('should generate dynamic announcement endpoints', () => {
      expect(ENDPOINTS.ANNOUNCEMENTS.BY_ID('ann1')).toBe('/announcements/ann1');
      expect(ENDPOINTS.ANNOUNCEMENTS.UPDATE('ann2')).toBe('/announcements/ann2');
      expect(ENDPOINTS.ANNOUNCEMENTS.DELETE('ann3')).toBe('/announcements/ann3');
      expect(ENDPOINTS.ANNOUNCEMENTS.ATTACHMENTS('ann4')).toBe('/announcements/ann4/attachments');
      expect(ENDPOINTS.ANNOUNCEMENTS.MARK_READ('ann5')).toBe('/announcements/ann5/mark-read');
      expect(ENDPOINTS.ANNOUNCEMENTS.PIN('ann6')).toBe('/announcements/ann6/pin');
      expect(ENDPOINTS.ANNOUNCEMENTS.UNPIN('ann7')).toBe('/announcements/ann7/unpin');
    });
  });

  // =========================================================================
  // EVENTS
  // =========================================================================
  describe('EVENTS', () => {
    it('should define static event endpoints', () => {
      expect(ENDPOINTS.EVENTS.LIST).toBe('/events');
      expect(ENDPOINTS.EVENTS.CREATE).toBe('/events');
      expect(ENDPOINTS.EVENTS.CALENDAR).toBe('/events/calendar');
    });

    it('should generate dynamic event endpoints', () => {
      expect(ENDPOINTS.EVENTS.CLASS('cls1')).toBe('/events/class/cls1');
      expect(ENDPOINTS.EVENTS.BY_ID('ev1')).toBe('/events/ev1');
      expect(ENDPOINTS.EVENTS.UPDATE('ev2')).toBe('/events/ev2');
      expect(ENDPOINTS.EVENTS.DELETE('ev3')).toBe('/events/ev3');
    });
  });

  // =========================================================================
  // PHOTOS
  // =========================================================================
  describe('PHOTOS', () => {
    it('should define static photo endpoints', () => {
      expect(ENDPOINTS.PHOTOS.UPLOAD).toBe('/photos/upload');
      expect(ENDPOINTS.PHOTOS.LIST).toBe('/photos');
      expect(ENDPOINTS.PHOTOS.CATEGORIES).toBe('/photos/categories');
    });

    it('should generate dynamic photo endpoints', () => {
      expect(ENDPOINTS.PHOTOS.BY_ID('ph1')).toBe('/photos/ph1');
      expect(ENDPOINTS.PHOTOS.DELETE('ph2')).toBe('/photos/ph2');
    });
  });

  // =========================================================================
  // ADMIN
  // =========================================================================
  describe('ADMIN', () => {
    it('should define static admin endpoints', () => {
      expect(ENDPOINTS.ADMIN.DASHBOARD_METRICS).toBe('/admin/dashboard/metrics');
      expect(ENDPOINTS.ADMIN.REVENUE).toBe('/admin/reports/revenue');
      expect(ENDPOINTS.ADMIN.CLIENTS).toBe('/admin/clients');
      expect(ENDPOINTS.ADMIN.REFUNDS_PENDING).toBe('/admin/refunds/pending');
    });

    it('should generate dynamic admin endpoints', () => {
      expect(ENDPOINTS.ADMIN.CLIENT('u1')).toBe('/admin/clients/u1');
      expect(ENDPOINTS.ADMIN.ROSTER('cls1')).toBe('/admin/class/cls1/roster');
      expect(ENDPOINTS.ADMIN.REFUNDS_APPROVE('r1')).toBe('/admin/refunds/r1/approve');
      expect(ENDPOINTS.ADMIN.REFUNDS_REJECT('r2')).toBe('/admin/refunds/r2/reject');
    });
  });

  // =========================================================================
  // WEBHOOKS
  // =========================================================================
  describe('WEBHOOKS', () => {
    it('should define webhook endpoints', () => {
      expect(ENDPOINTS.WEBHOOKS.STRIPE).toBe('/webhooks/stripe');
    });
  });
});
