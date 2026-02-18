/**
 * Unit Tests for api.constants.js
 * Tests: API_ENDPOINTS structure, dynamic endpoint functions, QUERY_PARAMS, HTTP_METHODS
 */

import { API_ENDPOINTS, QUERY_PARAMS, HTTP_METHODS } from '../../../constants/api.constants';

describe('API Constants', () => {
  // ==========================================
  // API_ENDPOINTS structure
  // ==========================================
  describe('API_ENDPOINTS', () => {
    it('should define AUTH endpoints', () => {
      expect(API_ENDPOINTS.AUTH.LOGIN).toBe('/auth/login');
      expect(API_ENDPOINTS.AUTH.REGISTER).toBe('/auth/register');
      expect(API_ENDPOINTS.AUTH.REFRESH).toBe('/auth/refresh');
      expect(API_ENDPOINTS.AUTH.GOOGLE).toBe('/auth/google');
      expect(API_ENDPOINTS.AUTH.LOGOUT).toBe('/auth/logout');
      expect(API_ENDPOINTS.AUTH.CHANGE_PASSWORD).toBe('/auth/change-password');
      expect(API_ENDPOINTS.AUTH.FORGOT_PASSWORD).toBe('/auth/forgot-password');
      expect(API_ENDPOINTS.AUTH.RESET_PASSWORD).toBe('/auth/reset-password');
    });

    it('should define USERS endpoints with dynamic BY_ID', () => {
      expect(API_ENDPOINTS.USERS.ME).toBe('/users/me');
      expect(API_ENDPOINTS.USERS.LIST).toBe('/users');
      expect(API_ENDPOINTS.USERS.BY_ID('user-123')).toBe('/users/user-123');
    });

    it('should define CHILDREN endpoints with dynamic functions', () => {
      expect(API_ENDPOINTS.CHILDREN.MY).toBe('/children/my');
      expect(API_ENDPOINTS.CHILDREN.LIST).toBe('/children');
      expect(API_ENDPOINTS.CHILDREN.BY_ID('child-1')).toBe('/children/child-1');
      expect(API_ENDPOINTS.CHILDREN.EMERGENCY_CONTACTS('child-1')).toBe('/children/child-1/emergency-contacts');
      expect(API_ENDPOINTS.CHILDREN.EMERGENCY_CONTACT_BY_ID('ec-1')).toBe('/children/emergency-contacts/ec-1');
    });

    it('should define PROGRAMS endpoints', () => {
      expect(API_ENDPOINTS.PROGRAMS.LIST).toBe('/programs/');
      expect(API_ENDPOINTS.PROGRAMS.BY_ID('prog-1')).toBe('/programs/prog-1/');
      expect(API_ENDPOINTS.PROGRAMS.CREATE).toBe('/programs/');
    });

    it('should define AREAS endpoints', () => {
      expect(API_ENDPOINTS.AREAS.LIST).toBe('/areas/');
      expect(API_ENDPOINTS.AREAS.BY_ID('area-1')).toBe('/areas/area-1/');
    });

    it('should define SCHOOLS endpoints', () => {
      expect(API_ENDPOINTS.SCHOOLS.LIST).toBe('/schools/');
      expect(API_ENDPOINTS.SCHOOLS.BY_ID('school-1')).toBe('/schools/school-1/');
    });

    it('should define CLASSES endpoints', () => {
      expect(API_ENDPOINTS.CLASSES.LIST).toBe('/classes');
      expect(API_ENDPOINTS.CLASSES.BY_ID('class-1')).toBe('/classes/class-1');
      expect(API_ENDPOINTS.CLASSES.IMAGE_UPLOAD('class-1')).toBe('/classes/class-1/image');
    });

    it('should define ENROLLMENTS endpoints', () => {
      expect(API_ENDPOINTS.ENROLLMENTS.MY).toBe('/enrollments/my');
      expect(API_ENDPOINTS.ENROLLMENTS.LIST).toBe('/enrollments');
      expect(API_ENDPOINTS.ENROLLMENTS.BY_ID('enroll-1')).toBe('/enrollments/enroll-1');
      expect(API_ENDPOINTS.ENROLLMENTS.CANCEL('enroll-1')).toBe('/enrollments/enroll-1/cancel');
      expect(API_ENDPOINTS.ENROLLMENTS.TRANSFER('enroll-1')).toBe('/enrollments/enroll-1/transfer');
      expect(API_ENDPOINTS.ENROLLMENTS.ACTIVATE('enroll-1')).toBe('/enrollments/enroll-1/activate');
    });

    it('should define ORDERS endpoints', () => {
      expect(API_ENDPOINTS.ORDERS.MY).toBe('/orders/my');
      expect(API_ENDPOINTS.ORDERS.CREATE).toBe('/orders');
      expect(API_ENDPOINTS.ORDERS.CALCULATE).toBe('/orders/calculate');
      expect(API_ENDPOINTS.ORDERS.PAY('order-1')).toBe('/orders/order-1/pay');
      expect(API_ENDPOINTS.ORDERS.CANCEL('order-1')).toBe('/orders/order-1/cancel');
    });

    it('should define INVOICES endpoints', () => {
      expect(API_ENDPOINTS.INVOICES.MY).toBe('/invoices/my');
      expect(API_ENDPOINTS.INVOICES.DOWNLOAD('inv-1')).toBe('/invoices/inv-1/download');
      expect(API_ENDPOINTS.INVOICES.BILLING_SUMMARY).toBe('/invoices/billing-summary');
    });

    it('should define PAYMENTS endpoints', () => {
      expect(API_ENDPOINTS.PAYMENTS.MY).toBe('/payments/my');
      expect(API_ENDPOINTS.PAYMENTS.METHODS).toBe('/payments/methods');
      expect(API_ENDPOINTS.PAYMENTS.SETUP_INTENT).toBe('/payments/setup-intent');
      expect(API_ENDPOINTS.PAYMENTS.REFUND('pay-1')).toBe('/payments/pay-1/refund');
      expect(API_ENDPOINTS.PAYMENTS.RECEIPT('pay-1')).toBe('/payments/pay-1/receipt');
    });

    it('should define INSTALLMENTS endpoints', () => {
      expect(API_ENDPOINTS.INSTALLMENTS.MY).toBe('/installments/my');
      expect(API_ENDPOINTS.INSTALLMENTS.PREVIEW).toBe('/installments/preview');
      expect(API_ENDPOINTS.INSTALLMENTS.SCHEDULE('inst-1')).toBe('/installments/inst-1/schedule');
      expect(API_ENDPOINTS.INSTALLMENTS.CANCEL('inst-1')).toBe('/installments/inst-1/cancel');
    });

    it('should define DISCOUNTS endpoints', () => {
      expect(API_ENDPOINTS.DISCOUNTS.VALIDATE).toBe('/discounts/validate');
      expect(API_ENDPOINTS.DISCOUNTS.CODES).toBe('/discounts/codes');
      expect(API_ENDPOINTS.DISCOUNTS.CODE_BY_ID('dc-1')).toBe('/discounts/codes/dc-1');
      expect(API_ENDPOINTS.DISCOUNTS.DEACTIVATE('dc-1')).toBe('/discounts/codes/dc-1/deactivate');
      expect(API_ENDPOINTS.DISCOUNTS.ACTIVATE('dc-1')).toBe('/discounts/codes/dc-1/activate');
      expect(API_ENDPOINTS.DISCOUNTS.USAGE_STATS('dc-1')).toBe('/discounts/codes/dc-1/usage');
      expect(API_ENDPOINTS.DISCOUNTS.SIBLING_ELIGIBILITY('child-1')).toBe('/discounts/sibling-eligibility/child-1');
    });

    it('should define WAIVERS endpoints', () => {
      expect(API_ENDPOINTS.WAIVERS.BASE).toBe('/waivers');
      expect(API_ENDPOINTS.WAIVERS.REQUIRED).toBe('/waivers/required');
      expect(API_ENDPOINTS.WAIVERS.PENDING).toBe('/waivers/pending');
      expect(API_ENDPOINTS.WAIVERS.TEMPLATES).toBe('/waivers/templates');
      expect(API_ENDPOINTS.WAIVERS.TEMPLATE_BY_ID('w-1')).toBe('/waivers/templates/w-1');
    });

    it('should define ANNOUNCEMENTS endpoints', () => {
      expect(API_ENDPOINTS.ANNOUNCEMENTS.LIST).toBe('/announcements');
      expect(API_ENDPOINTS.ANNOUNCEMENTS.BY_ID('ann-1')).toBe('/announcements/ann-1');
      expect(API_ENDPOINTS.ANNOUNCEMENTS.ATTACHMENTS('ann-1')).toBe('/announcements/ann-1/attachments');
    });

    it('should define ATTENDANCE endpoints', () => {
      expect(API_ENDPOINTS.ATTENDANCE.LIST).toBe('/attendance');
      expect(API_ENDPOINTS.ATTENDANCE.MARK).toBe('/attendance/mark');
      expect(API_ENDPOINTS.ATTENDANCE.STREAK('enroll-1')).toBe('/attendance/enrollment/enroll-1/streak');
      expect(API_ENDPOINTS.ATTENDANCE.STATS('child-1')).toBe('/attendance/child/child-1/stats');
      expect(API_ENDPOINTS.ATTENDANCE.CLASS('class-1')).toBe('/attendance/class/class-1');
    });

    it('should define EVENTS endpoints', () => {
      expect(API_ENDPOINTS.EVENTS.LIST).toBe('/events');
      expect(API_ENDPOINTS.EVENTS.BY_CLASS('class-1')).toBe('/events/class/class-1');
      expect(API_ENDPOINTS.EVENTS.RSVP('event-1')).toBe('/events/event-1/rsvp');
      expect(API_ENDPOINTS.EVENTS.RSVPS('event-1')).toBe('/events/event-1/rsvps');
      expect(API_ENDPOINTS.EVENTS.RSVP_BY_ID('event-1', 'rsvp-1')).toBe('/events/event-1/rsvps/rsvp-1');
    });

    it('should define PHOTOS endpoints', () => {
      expect(API_ENDPOINTS.PHOTOS.UPLOAD).toBe('/photos/upload');
      expect(API_ENDPOINTS.PHOTOS.BULK_UPLOAD).toBe('/photos/bulk');
      expect(API_ENDPOINTS.PHOTOS.BY_CLASS('class-1')).toBe('/photos/class/class-1');
      expect(API_ENDPOINTS.PHOTOS.TAG_CHILD('photo-1')).toBe('/photos/photo-1/tag');
    });

    it('should define BADGES endpoints', () => {
      expect(API_ENDPOINTS.BADGES.LIST).toBe('/badges');
      expect(API_ENDPOINTS.BADGES.BY_ENROLLMENT('enroll-1')).toBe('/badges/enrollment/enroll-1');
      expect(API_ENDPOINTS.BADGES.AWARD).toBe('/badges/award');
      expect(API_ENDPOINTS.BADGES.PROGRESS('enroll-1')).toBe('/badges/enrollment/enroll-1/progress');
    });

    it('should define CHECKIN endpoints', () => {
      expect(API_ENDPOINTS.CHECKIN.SINGLE).toBe('/check-in');
      expect(API_ENDPOINTS.CHECKIN.BULK).toBe('/check-in/bulk');
      expect(API_ENDPOINTS.CHECKIN.BY_CLASS('class-1')).toBe('/check-in/class/class-1');
      expect(API_ENDPOINTS.CHECKIN.STATUS('class-1')).toBe('/check-in/class/class-1/status');
    });

    it('should define ADMIN endpoints', () => {
      expect(API_ENDPOINTS.ADMIN.METRICS).toBe('/admin/dashboard/metrics');
      expect(API_ENDPOINTS.ADMIN.REVENUE).toBe('/admin/finance/revenue');
      expect(API_ENDPOINTS.ADMIN.CLIENTS).toBe('/admin/clients');
      expect(API_ENDPOINTS.ADMIN.ROSTER('class-1')).toBe('/admin/classes/class-1/roster');
      expect(API_ENDPOINTS.ADMIN.REFUND_APPROVE('pay-1')).toBe('/admin/refunds/pay-1/approve');
      expect(API_ENDPOINTS.ADMIN.BULK_EMAIL).toBe('/admin/bulk/email');
    });

    it('should define WEBHOOKS endpoints', () => {
      expect(API_ENDPOINTS.WEBHOOKS.STRIPE).toBe('/webhooks/stripe');
    });
  });

  // ==========================================
  // QUERY_PARAMS
  // ==========================================
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

  // ==========================================
  // HTTP_METHODS
  // ==========================================
  describe('HTTP_METHODS', () => {
    it('should define all standard HTTP methods', () => {
      expect(HTTP_METHODS.GET).toBe('GET');
      expect(HTTP_METHODS.POST).toBe('POST');
      expect(HTTP_METHODS.PUT).toBe('PUT');
      expect(HTTP_METHODS.PATCH).toBe('PATCH');
      expect(HTTP_METHODS.DELETE).toBe('DELETE');
    });
  });
});
