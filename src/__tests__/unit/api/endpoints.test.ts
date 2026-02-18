/**
 * Unit Tests for src/api/config/endpoints.ts
 * Tests that all endpoint paths, dynamic endpoint functions,
 * QUERY_PARAMS, and HTTP_METHODS are correctly defined.
 */

import { ENDPOINTS, QUERY_PARAMS, HTTP_METHODS } from '../../../api/config/endpoints';

describe('ENDPOINTS (config/endpoints.ts)', () => {
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
      expect(ENDPOINTS.AUTH.FORGOT_PASSWORD).toBe('/auth/forgot-password');
      expect(ENDPOINTS.AUTH.RESET_PASSWORD).toBe('/auth/reset-password');
    });
  });

  // =========================================================================
  // USERS
  // =========================================================================
  describe('USERS', () => {
    it('should define all user endpoints', () => {
      expect(ENDPOINTS.USERS.ME).toBe('/users/me');
      expect(ENDPOINTS.USERS.UPDATE).toBe('/users/me');
    });
  });

  // =========================================================================
  // CHILDREN
  // =========================================================================
  describe('CHILDREN', () => {
    it('should define static children endpoints', () => {
      expect(ENDPOINTS.CHILDREN.LIST).toBe('/children');
      expect(ENDPOINTS.CHILDREN.MY).toBe('/children/my');
      expect(ENDPOINTS.CHILDREN.CREATE).toBe('/children');
    });

    it('should generate dynamic children endpoints', () => {
      expect(ENDPOINTS.CHILDREN.BY_ID('abc-123')).toBe('/children/abc-123');
      expect(ENDPOINTS.CHILDREN.EMERGENCY_CONTACTS('c1')).toBe('/children/c1/emergency-contacts');
      expect(ENDPOINTS.CHILDREN.EMERGENCY_CONTACT_BY_ID('ec1')).toBe('/children/emergency-contacts/ec1');
    });
  });

  // =========================================================================
  // PROGRAMS
  // =========================================================================
  describe('PROGRAMS', () => {
    it('should define static program endpoints', () => {
      expect(ENDPOINTS.PROGRAMS.LIST).toBe('/programs/');
      expect(ENDPOINTS.PROGRAMS.CREATE).toBe('/programs/');
    });

    it('should generate dynamic program endpoints', () => {
      expect(ENDPOINTS.PROGRAMS.BY_ID('p1')).toBe('/programs/p1/');
      expect(ENDPOINTS.PROGRAMS.UPDATE('p2')).toBe('/programs/p2/');
      expect(ENDPOINTS.PROGRAMS.DELETE('p3')).toBe('/programs/p3/');
    });
  });

  // =========================================================================
  // AREAS
  // =========================================================================
  describe('AREAS', () => {
    it('should define static area endpoints', () => {
      expect(ENDPOINTS.AREAS.LIST).toBe('/areas/');
      expect(ENDPOINTS.AREAS.CREATE).toBe('/areas/');
    });

    it('should generate dynamic area endpoints', () => {
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
      expect(ENDPOINTS.CLASSES.LIST).toBe('/classes');
      expect(ENDPOINTS.CLASSES.CREATE).toBe('/classes');
    });

    it('should generate dynamic class endpoints', () => {
      expect(ENDPOINTS.CLASSES.BY_ID('cl1')).toBe('/classes/cl1');
      expect(ENDPOINTS.CLASSES.UPDATE('cl2')).toBe('/classes/cl2');
      expect(ENDPOINTS.CLASSES.DELETE('cl3')).toBe('/classes/cl3');
    });
  });

  // =========================================================================
  // ENROLLMENTS
  // =========================================================================
  describe('ENROLLMENTS', () => {
    it('should define static enrollment endpoints', () => {
      expect(ENDPOINTS.ENROLLMENTS.MY).toBe('/enrollments/my');
      expect(ENDPOINTS.ENROLLMENTS.LIST).toBe('/enrollments');
    });

    it('should generate dynamic enrollment endpoints', () => {
      expect(ENDPOINTS.ENROLLMENTS.BY_ID('e1')).toBe('/enrollments/e1');
      expect(ENDPOINTS.ENROLLMENTS.CANCEL('e2')).toBe('/enrollments/e2/cancel');
      expect(ENDPOINTS.ENROLLMENTS.CANCELLATION_PREVIEW('e3')).toBe('/enrollments/e3/cancellation-preview');
      expect(ENDPOINTS.ENROLLMENTS.TRANSFER('e4')).toBe('/enrollments/e4/transfer');
      expect(ENDPOINTS.ENROLLMENTS.ACTIVATE('e5')).toBe('/enrollments/e5/activate');
    });
  });

  // =========================================================================
  // ORDERS
  // =========================================================================
  describe('ORDERS', () => {
    it('should define static order endpoints', () => {
      expect(ENDPOINTS.ORDERS.MY).toBe('/orders/my');
      expect(ENDPOINTS.ORDERS.LIST).toBe('/orders');
      expect(ENDPOINTS.ORDERS.CREATE).toBe('/orders');
      expect(ENDPOINTS.ORDERS.CALCULATE).toBe('/orders/calculate');
    });

    it('should generate dynamic order endpoints', () => {
      expect(ENDPOINTS.ORDERS.BY_ID('o1')).toBe('/orders/o1');
      expect(ENDPOINTS.ORDERS.PAY('o2')).toBe('/orders/o2/pay');
      expect(ENDPOINTS.ORDERS.CHECKOUT('o3')).toBe('/orders/o3/pay');
      expect(ENDPOINTS.ORDERS.CONFIRM('o4')).toBe('/orders/o4/confirm');
      expect(ENDPOINTS.ORDERS.CANCEL('o5')).toBe('/orders/o5/cancel');
      expect(ENDPOINTS.ORDERS.UPDATE_STATUS('o6')).toBe('/orders/o6/status');
    });
  });

  // =========================================================================
  // PAYMENTS
  // =========================================================================
  describe('PAYMENTS', () => {
    it('should define static payment endpoints', () => {
      expect(ENDPOINTS.PAYMENTS.MY).toBe('/payments/my');
      expect(ENDPOINTS.PAYMENTS.LIST).toBe('/payments');
      expect(ENDPOINTS.PAYMENTS.METHODS).toBe('/payments/methods');
      expect(ENDPOINTS.PAYMENTS.SETUP_INTENT).toBe('/payments/setup-intent');
      expect(ENDPOINTS.PAYMENTS.REFUND).toBe('/payments/refund');
    });

    it('should generate dynamic payment endpoints', () => {
      expect(ENDPOINTS.PAYMENTS.BY_ID('pay1')).toBe('/payments/pay1');
      expect(ENDPOINTS.PAYMENTS.METHOD_BY_ID('m1')).toBe('/payments/methods/m1');
      expect(ENDPOINTS.PAYMENTS.INVOICE_DOWNLOAD('pay2')).toBe('/payments/pay2/invoice/download');
    });
  });

  // =========================================================================
  // INSTALLMENTS
  // =========================================================================
  describe('INSTALLMENTS', () => {
    it('should define static installment endpoints', () => {
      expect(ENDPOINTS.INSTALLMENTS.MY).toBe('/installments/my');
      expect(ENDPOINTS.INSTALLMENTS.SUMMARY).toBe('/installments/my');
      expect(ENDPOINTS.INSTALLMENTS.LIST).toBe('/installments');
      expect(ENDPOINTS.INSTALLMENTS.CREATE).toBe('/installments');
      expect(ENDPOINTS.INSTALLMENTS.PREVIEW).toBe('/installments/preview');
      expect(ENDPOINTS.INSTALLMENTS.UPCOMING_DUE).toBe('/installments/upcoming/due');
    });

    it('should generate dynamic installment endpoints', () => {
      expect(ENDPOINTS.INSTALLMENTS.BY_ID('i1')).toBe('/installments/i1');
      expect(ENDPOINTS.INSTALLMENTS.SCHEDULE('i2')).toBe('/installments/i2/schedule');
      expect(ENDPOINTS.INSTALLMENTS.CANCEL('i3')).toBe('/installments/i3/cancel');
      expect(ENDPOINTS.INSTALLMENTS.CANCEL_ADMIN('i4')).toBe('/installments/i4/cancel-admin');
    });
  });

  // =========================================================================
  // DISCOUNTS
  // =========================================================================
  describe('DISCOUNTS', () => {
    it('should define static discount endpoints', () => {
      expect(ENDPOINTS.DISCOUNTS.VALIDATE).toBe('/discounts/validate');
      expect(ENDPOINTS.DISCOUNTS.MY_SCHOLARSHIPS).toBe('/discounts/my-scholarships');
      expect(ENDPOINTS.DISCOUNTS.CODES).toBe('/discounts/codes');
      expect(ENDPOINTS.DISCOUNTS.SCHOLARSHIPS).toBe('/discounts/scholarships');
    });

    it('should generate dynamic discount endpoints', () => {
      expect(ENDPOINTS.DISCOUNTS.CODE_BY_ID('dc1')).toBe('/discounts/codes/dc1');
      expect(ENDPOINTS.DISCOUNTS.SCHOLARSHIP_BY_ID('s1')).toBe('/discounts/scholarships/s1');
    });
  });

  // =========================================================================
  // WAIVERS
  // =========================================================================
  describe('WAIVERS', () => {
    it('should define static waiver endpoints', () => {
      expect(ENDPOINTS.WAIVERS.REQUIRED).toBe('/waivers/required');
      expect(ENDPOINTS.WAIVERS.PENDING).toBe('/waivers/required');
      expect(ENDPOINTS.WAIVERS.ACCEPT).toBe('/waivers/accept');
      expect(ENDPOINTS.WAIVERS.MY_ACCEPTANCES).toBe('/waivers/my-acceptances');
      expect(ENDPOINTS.WAIVERS.TEMPLATES).toBe('/waivers/templates');
    });

    it('should generate dynamic waiver endpoints', () => {
      expect(ENDPOINTS.WAIVERS.ACCEPTANCE_BY_ID('wa1')).toBe('/waivers/acceptances/wa1');
      expect(ENDPOINTS.WAIVERS.TEMPLATE_BY_ID('wt1')).toBe('/waivers/templates/wt1');
    });
  });

  // =========================================================================
  // ANNOUNCEMENTS
  // =========================================================================
  describe('ANNOUNCEMENTS', () => {
    it('should define static announcement endpoints', () => {
      expect(ENDPOINTS.ANNOUNCEMENTS.LIST).toBe('/announcements');
      expect(ENDPOINTS.ANNOUNCEMENTS.CREATE).toBe('/announcements');
      expect(ENDPOINTS.ANNOUNCEMENTS.UNREAD_COUNT).toBe('/announcements/unread/count');
      expect(ENDPOINTS.ANNOUNCEMENTS.MARK_ALL_READ).toBe('/announcements/mark-all-read');
      expect(ENDPOINTS.ANNOUNCEMENTS.PINNED).toBe('/announcements/pinned');
    });

    it('should generate dynamic announcement endpoints', () => {
      expect(ENDPOINTS.ANNOUNCEMENTS.BY_ID('ann1')).toBe('/announcements/ann1');
      expect(ENDPOINTS.ANNOUNCEMENTS.UPDATE('ann2')).toBe('/announcements/ann2');
      expect(ENDPOINTS.ANNOUNCEMENTS.DELETE('ann3')).toBe('/announcements/ann3');
      expect(ENDPOINTS.ANNOUNCEMENTS.ATTACHMENTS('ann4')).toBe('/announcements/ann4/attachments');
      expect(ENDPOINTS.ANNOUNCEMENTS.MARK_READ('ann5')).toBe('/announcements/ann5/read');
      expect(ENDPOINTS.ANNOUNCEMENTS.PIN('ann6')).toBe('/announcements/ann6/pin');
      expect(ENDPOINTS.ANNOUNCEMENTS.UNPIN('ann7')).toBe('/announcements/ann7/unpin');
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
      expect(ENDPOINTS.ATTENDANCE.HISTORY('enr1')).toBe('/attendance/enrollment/enr1/history');
      expect(ENDPOINTS.ATTENDANCE.STREAK('enr2')).toBe('/attendance/enrollment/enr2/streak');
      expect(ENDPOINTS.ATTENDANCE.STATS('child1')).toBe('/attendance/child/child1/stats');
      expect(ENDPOINTS.ATTENDANCE.CLASS('cls1')).toBe('/attendance/class/cls1');
    });
  });

  // =========================================================================
  // EVENTS
  // =========================================================================
  describe('EVENTS', () => {
    it('should define static event endpoints', () => {
      expect(ENDPOINTS.EVENTS.LIST).toBe('/events/calendar');
      expect(ENDPOINTS.EVENTS.CALENDAR).toBe('/events/calendar');
    });

    it('should generate dynamic event endpoints', () => {
      expect(ENDPOINTS.EVENTS.BY_ID('ev1')).toBe('/events/ev1');
      expect(ENDPOINTS.EVENTS.UPDATE('ev2')).toBe('/events/ev2');
      expect(ENDPOINTS.EVENTS.DELETE('ev3')).toBe('/events/ev3');
      expect(ENDPOINTS.EVENTS.BY_CLASS('cls1')).toBe('/events/class/cls1');
      expect(ENDPOINTS.EVENTS.RSVP('ev4')).toBe('/events/ev4/rsvp');
      expect(ENDPOINTS.EVENTS.CANCEL_RSVP('ev5')).toBe('/events/ev5/rsvp/cancel');
      expect(ENDPOINTS.EVENTS.RSVPS('ev6')).toBe('/events/ev6/rsvps');
      expect(ENDPOINTS.EVENTS.RSVP_BY_ID('ev7', 'r1')).toBe('/events/ev7/rsvps/r1');
      expect(ENDPOINTS.EVENTS.MY_RSVP('ev8')).toBe('/events/ev8/my-rsvp');
      expect(ENDPOINTS.EVENTS.ATTENDEE_SUMMARY('ev9')).toBe('/events/ev9/attendee-summary');
    });
  });

  // =========================================================================
  // PHOTOS
  // =========================================================================
  describe('PHOTOS', () => {
    it('should define static photo endpoints', () => {
      expect(ENDPOINTS.PHOTOS.UPLOAD).toBe('/photos/upload');
      expect(ENDPOINTS.PHOTOS.LIST).toBe('/photos');
      expect(ENDPOINTS.PHOTOS.GALLERY).toBe('/photos/gallery');
      expect(ENDPOINTS.PHOTOS.BULK_UPLOAD).toBe('/photos/bulk-upload');
      expect(ENDPOINTS.PHOTOS.ALBUMS).toBe('/photos/albums');
      expect(ENDPOINTS.PHOTOS.CREATE_ALBUM).toBe('/photos/albums');
      expect(ENDPOINTS.PHOTOS.CATEGORIES).toBe('/photos/categories');
    });

    it('should generate dynamic photo endpoints', () => {
      expect(ENDPOINTS.PHOTOS.BY_CLASS('cls1')).toBe('/photos/class/cls1');
      expect(ENDPOINTS.PHOTOS.BY_ID('ph1')).toBe('/photos/ph1');
      expect(ENDPOINTS.PHOTOS.TAG_CHILD('ph2')).toBe('/photos/ph2/tag-child');
      expect(ENDPOINTS.PHOTOS.UNTAG_CHILD('ph3', 'ch1')).toBe('/photos/ph3/untag-child/ch1');
      expect(ENDPOINTS.PHOTOS.ALBUM_BY_ID('alb1')).toBe('/photos/albums/alb1');
      expect(ENDPOINTS.PHOTOS.ALBUM_PHOTOS('alb2')).toBe('/photos/albums/alb2/photos');
      expect(ENDPOINTS.PHOTOS.CATEGORIES_BY_CLASS('cls2')).toBe('/photos/categories/class/cls2');
      expect(ENDPOINTS.PHOTOS.CATEGORY_BY_ID('cat1')).toBe('/photos/categories/cat1');
    });
  });

  // =========================================================================
  // BADGES
  // =========================================================================
  describe('BADGES', () => {
    it('should define static badge endpoints', () => {
      expect(ENDPOINTS.BADGES.LIST).toBe('/badges');
      expect(ENDPOINTS.BADGES.CREATE).toBe('/badges');
      expect(ENDPOINTS.BADGES.MY_CHILDREN).toBe('/badges/my-children');
      expect(ENDPOINTS.BADGES.AWARD).toBe('/badges/award');
      expect(ENDPOINTS.BADGES.CHECK_ELIGIBILITY).toBe('/badges/check-eligibility');
      expect(ENDPOINTS.BADGES.LEADERBOARD).toBe('/badges/leaderboard');
      expect(ENDPOINTS.BADGES.STATS_OVERALL).toBe('/badges/stats');
      expect(ENDPOINTS.BADGES.RECENT_AWARDS).toBe('/badges/recent-awards');
    });

    it('should generate dynamic badge endpoints', () => {
      expect(ENDPOINTS.BADGES.BY_ID('b1')).toBe('/badges/b1');
      expect(ENDPOINTS.BADGES.BY_ENROLLMENT('enr1')).toBe('/badges/enrollment/enr1');
      expect(ENDPOINTS.BADGES.BY_CHILD('ch1')).toBe('/badges/child/ch1');
      expect(ENDPOINTS.BADGES.REVOKE('aw1')).toBe('/badges/awards/aw1/revoke');
      expect(ENDPOINTS.BADGES.PROGRESS('ch2', 'b2')).toBe('/badges/child/ch2/progress/b2');
      expect(ENDPOINTS.BADGES.STATS('b3')).toBe('/badges/b3/stats');
      expect(ENDPOINTS.BADGES.BY_PROGRAM('pr1')).toBe('/badges/program/pr1');
    });
  });

  // =========================================================================
  // CHECKIN
  // =========================================================================
  describe('CHECKIN', () => {
    it('should define static check-in endpoints', () => {
      expect(ENDPOINTS.CHECKIN.SINGLE).toBe('/check-in');
      expect(ENDPOINTS.CHECKIN.BULK).toBe('/check-in/bulk');
    });

    it('should generate dynamic check-in endpoints', () => {
      expect(ENDPOINTS.CHECKIN.BY_CLASS('cls1')).toBe('/check-in/class/cls1');
      expect(ENDPOINTS.CHECKIN.STATUS('cls2')).toBe('/check-in/class/cls2/status');
    });
  });

  // =========================================================================
  // ADMIN
  // =========================================================================
  describe('ADMIN', () => {
    it('should define static admin endpoints', () => {
      expect(ENDPOINTS.ADMIN.METRICS).toBe('/admin/dashboard/metrics');
      expect(ENDPOINTS.ADMIN.REVENUE).toBe('/admin/finance/revenue');
      expect(ENDPOINTS.ADMIN.CLIENTS).toBe('/admin/clients');
      expect(ENDPOINTS.ADMIN.REFUNDS).toBe('/admin/refunds');
    });

    it('should generate dynamic admin endpoints', () => {
      expect(ENDPOINTS.ADMIN.CLIENT_BY_ID('u1')).toBe('/admin/clients/u1');
      expect(ENDPOINTS.ADMIN.ROSTER('cls1')).toBe('/admin/classes/cls1/roster');
      expect(ENDPOINTS.ADMIN.REFUND_BY_ID('r1')).toBe('/admin/refunds/r1');
      expect(ENDPOINTS.ADMIN.APPROVE_REFUND('r2')).toBe('/admin/refunds/r2/approve');
      expect(ENDPOINTS.ADMIN.REJECT_REFUND('r3')).toBe('/admin/refunds/r3/reject');
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

// ===========================================================================
// QUERY_PARAMS
// ===========================================================================
describe('QUERY_PARAMS', () => {
  it('should define pagination params', () => {
    expect(QUERY_PARAMS.SKIP).toBe('skip');
    expect(QUERY_PARAMS.LIMIT).toBe('limit');
  });

  it('should define filter params', () => {
    expect(QUERY_PARAMS.PROGRAM_ID).toBe('program_id');
    expect(QUERY_PARAMS.SCHOOL_ID).toBe('school_id');
    expect(QUERY_PARAMS.AREA_ID).toBe('area_id');
    expect(QUERY_PARAMS.CLASS_ID).toBe('class_id');
    expect(QUERY_PARAMS.STATUS).toBe('status');
  });

  it('should define date filter params', () => {
    expect(QUERY_PARAMS.START_DATE).toBe('start_date');
    expect(QUERY_PARAMS.END_DATE).toBe('end_date');
    expect(QUERY_PARAMS.YEAR).toBe('year');
    expect(QUERY_PARAMS.MONTH).toBe('month');
  });

  it('should define other params', () => {
    expect(QUERY_PARAMS.HAS_CAPACITY).toBe('has_capacity');
    expect(QUERY_PARAMS.MIN_AGE).toBe('min_age');
    expect(QUERY_PARAMS.MAX_AGE).toBe('max_age');
  });
});

// ===========================================================================
// HTTP_METHODS
// ===========================================================================
describe('HTTP_METHODS', () => {
  it('should define all standard HTTP methods', () => {
    expect(HTTP_METHODS.GET).toBe('GET');
    expect(HTTP_METHODS.POST).toBe('POST');
    expect(HTTP_METHODS.PUT).toBe('PUT');
    expect(HTTP_METHODS.PATCH).toBe('PATCH');
    expect(HTTP_METHODS.DELETE).toBe('DELETE');
  });
});
