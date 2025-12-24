/**
 * Enrollment Service Unit Tests
 * Tests for enrollment lifecycle management service methods
 */

import MockAdapter from 'axios-mock-adapter';
import apiClient from '../../../api/client/axios-client';
import { enrollmentService } from '../../../api/services/enrollment.service';

const mock = new MockAdapter(apiClient);

const mockEnrollment = {
  id: 'enroll-1',
  child_id: 'child-1',
  class_id: 'class-1',
  status: 'ACTIVE',
  payment_completed: true,
  final_price: 150,
  enrolled_at: '2024-01-15T00:00:00Z',
  created_at: '2024-01-15T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
};

const mockEnrollmentDetail = {
  ...mockEnrollment,
  child: {
    id: 'child-1',
    first_name: 'Johnny',
    last_name: 'Parent',
    date_of_birth: '2015-05-15',
  },
  class: {
    id: 'class-1',
    name: 'Soccer Basics',
    schedule: 'Mon/Wed 3:00 PM',
  },
  attendance_count: 10,
  attendance_percentage: 85,
};

const mockCancellationPreview = {
  refund_amount: 150,
  cancellation_fee: 25,
  net_refund: 125,
  refund_policy: 'Full refund minus $25 cancellation fee',
};

const mockWaitlistEntry = {
  enrollment_id: 'enroll-waitlist-1',
  position: 1,
  is_priority: false,
  notified_at: null,
  expires_at: null,
  created_at: '2024-01-15T00:00:00Z',
};

describe('enrollmentService', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('csf_access_token', 'mock-access-token');
    mock.reset();
  });

  afterAll(() => {
    mock.restore();
  });

  // ===========================================
  // GET MY ENROLLMENTS TESTS
  // ===========================================
  describe('getMy', () => {
    it('should return list of user enrollments', async () => {
      mock.onGet('/enrollments/my').reply(200, [mockEnrollment]);

      const result = await enrollmentService.getMy();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('enroll-1');
      expect(result[0].status).toBe('ACTIVE');
    });

    it('should return empty array when no enrollments', async () => {
      mock.onGet('/enrollments/my').reply(200, []);

      const result = await enrollmentService.getMy();

      expect(result).toEqual([]);
    });

    it('should filter by status', async () => {
      mock.onGet('/enrollments/my').reply((config) => {
        const params = config.params || {};
        if (params.status === 'ACTIVE') {
          return [200, [mockEnrollment]];
        }
        return [200, []];
      });

      const result = await enrollmentService.getMy({ status: 'ACTIVE' as any });

      expect(result.length).toBe(1);
    });

    it('should filter by child_id', async () => {
      mock.onGet('/enrollments/my').reply((config) => {
        const params = config.params || {};
        if (params.child_id === 'child-1') {
          return [200, [mockEnrollment]];
        }
        return [200, []];
      });

      const result = await enrollmentService.getMy({ child_id: 'child-1' });

      expect(result.length).toBe(1);
    });

    it('should throw error on 401 unauthorized', async () => {
      mock.onGet('/enrollments/my').reply(401, { message: 'Unauthorized' });

      await expect(enrollmentService.getMy()).rejects.toThrow();
    });

    it('should handle network errors', async () => {
      mock.onGet('/enrollments/my').networkError();

      await expect(enrollmentService.getMy()).rejects.toThrow();
    });
  });

  // ===========================================
  // GET ALL ENROLLMENTS TESTS (ADMIN)
  // ===========================================
  describe('getAll', () => {
    it('should return all enrollments for admin', async () => {
      mock.onGet('/enrollments').reply(200, [
        mockEnrollment,
        { ...mockEnrollment, id: 'enroll-2', child_id: 'child-2' },
      ]);

      const result = await enrollmentService.getAll();

      expect(result.length).toBe(2);
    });

    it('should filter by class_id', async () => {
      mock.onGet('/enrollments').reply((config) => {
        const params = config.params || {};
        if (params.class_id === 'class-1') {
          return [200, [mockEnrollment]];
        }
        return [200, []];
      });

      const result = await enrollmentService.getAll({ class_id: 'class-1' });

      expect(result.length).toBe(1);
    });

    it('should throw error on 403 forbidden (non-admin)', async () => {
      mock.onGet('/enrollments').reply(403, { message: 'Forbidden' });

      await expect(enrollmentService.getAll()).rejects.toThrow();
    });
  });

  // ===========================================
  // GET ENROLLMENT BY ID TESTS
  // ===========================================
  describe('getById', () => {
    it('should return enrollment details by ID', async () => {
      mock.onGet('/enrollments/enroll-1').reply(200, mockEnrollmentDetail);

      const result = await enrollmentService.getById('enroll-1');

      expect(result.id).toBe('enroll-1');
      expect(result.child).toBeDefined();
      expect(result.class).toBeDefined();
      expect(result.attendance_percentage).toBe(85);
    });

    it('should throw error when enrollment not found', async () => {
      mock.onGet('/enrollments/nonexistent').reply(404, { message: 'Enrollment not found' });

      await expect(enrollmentService.getById('nonexistent')).rejects.toThrow();
    });

    it('should throw error on 403 forbidden', async () => {
      mock.onGet('/enrollments/other-enrollment').reply(403, { message: 'Forbidden' });

      await expect(enrollmentService.getById('other-enrollment')).rejects.toThrow();
    });
  });

  // ===========================================
  // CREATE ENROLLMENT TESTS
  // ===========================================
  describe('create', () => {
    it('should create enrollment successfully', async () => {
      mock.onPost('/enrollments').reply((config) => {
        const body = JSON.parse(config.data);
        return [201, {
          id: 'new-enroll-id',
          child_id: body.child_id,
          class_id: body.class_id,
          status: 'PENDING',
          payment_completed: false,
          final_price: 150,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }];
      });

      const result = await enrollmentService.create({
        child_id: 'child-1',
        class_id: 'class-1',
      });

      expect(result.id).toBe('new-enroll-id');
      expect(result.status).toBe('PENDING');
      expect(result.payment_completed).toBe(false);
    });

    it('should create enrollment with discount code', async () => {
      mock.onPost('/enrollments').reply((config) => {
        const body = JSON.parse(config.data);
        return [201, {
          id: 'new-enroll-id',
          child_id: body.child_id,
          class_id: body.class_id,
          status: 'PENDING',
          payment_completed: false,
          final_price: 112.5, // 25% discount
          discount_applied: true,
          discount_code: body.discount_code,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }];
      });

      const result = await enrollmentService.create({
        child_id: 'child-1',
        class_id: 'class-1',
        discount_code: 'SUMMER25',
      });

      expect(result.final_price).toBe(112.5);
    });

    it('should throw error when child already enrolled', async () => {
      mock.onPost('/enrollments').reply(409, { message: 'Child is already enrolled in this class' });

      await expect(
        enrollmentService.create({
          child_id: 'child-1',
          class_id: 'class-1',
        })
      ).rejects.toThrow();
    });

    it('should throw error when class is full', async () => {
      mock.onPost('/enrollments').reply(400, { message: 'Class is full' });

      await expect(
        enrollmentService.create({
          child_id: 'child-1',
          class_id: 'full-class',
        })
      ).rejects.toThrow();
    });
  });

  // ===========================================
  // UPDATE ENROLLMENT TESTS
  // ===========================================
  describe('update', () => {
    it('should update enrollment successfully', async () => {
      mock.onPut('/enrollments/enroll-1').reply((config) => {
        const body = JSON.parse(config.data);
        return [200, {
          ...mockEnrollment,
          notes: body.notes || null,
          payment_completed: body.payment_completed ?? mockEnrollment.payment_completed,
          updated_at: new Date().toISOString(),
        }];
      });

      const result = await enrollmentService.update('enroll-1', {
        notes: 'Parent requested Wednesday pickup',
      });

      expect(result.notes).toBe('Parent requested Wednesday pickup');
    });

    it('should update payment status', async () => {
      mock.onPut('/enrollments/enroll-1').reply((config) => {
        const body = JSON.parse(config.data);
        return [200, {
          ...mockEnrollment,
          payment_completed: body.payment_completed,
          updated_at: new Date().toISOString(),
        }];
      });

      const result = await enrollmentService.update('enroll-1', {
        payment_completed: true,
      });

      expect(result.payment_completed).toBe(true);
    });

    it('should throw error when enrollment not found', async () => {
      mock.onPut('/enrollments/nonexistent').reply(404, { message: 'Enrollment not found' });

      await expect(
        enrollmentService.update('nonexistent', { notes: 'test' })
      ).rejects.toThrow();
    });
  });

  // ===========================================
  // CANCELLATION PREVIEW TESTS
  // ===========================================
  describe('getCancellationPreview', () => {
    it('should return cancellation preview with refund info', async () => {
      mock.onGet('/enrollments/enroll-1/cancellation-preview').reply(200, mockCancellationPreview);

      const result = await enrollmentService.getCancellationPreview('enroll-1');

      expect(result.refund_amount).toBe(150);
      expect(result.cancellation_fee).toBe(25);
      expect(result.net_refund).toBe(125);
      expect(result.refund_policy).toBeDefined();
    });

    it('should show no refund for late cancellation', async () => {
      mock.onGet('/enrollments/enroll-1/cancellation-preview').reply(200, {
        refund_amount: 150,
        cancellation_fee: 150,
        net_refund: 0,
        refund_policy: 'No refund available after class start',
      });

      const result = await enrollmentService.getCancellationPreview('enroll-1');

      expect(result.net_refund).toBe(0);
    });

    it('should throw error when enrollment not found', async () => {
      mock.onGet('/enrollments/nonexistent/cancellation-preview').reply(404, { message: 'Enrollment not found' });

      await expect(
        enrollmentService.getCancellationPreview('nonexistent')
      ).rejects.toThrow();
    });
  });

  // ===========================================
  // CANCEL ENROLLMENT TESTS
  // ===========================================
  describe('cancel', () => {
    it('should cancel enrollment successfully', async () => {
      mock.onPost('/enrollments/enroll-1/cancel').reply(200, {
        message: 'Enrollment cancelled successfully',
        refund_amount: 125,
      });

      const result = await enrollmentService.cancel('enroll-1', {
        reason: 'Schedule conflict',
        refund_requested: true,
      });

      expect(result.message).toBe('Enrollment cancelled successfully');
      expect(result.refund_amount).toBe(125);
    });

    it('should cancel without refund request', async () => {
      mock.onPost('/enrollments/enroll-1/cancel').reply(200, {
        message: 'Enrollment cancelled successfully',
      });

      const result = await enrollmentService.cancel('enroll-1');

      expect(result.message).toBe('Enrollment cancelled successfully');
      expect(result.refund_amount).toBeUndefined();
    });

    it('should throw error when already cancelled', async () => {
      mock.onPost('/enrollments/enroll-1/cancel').reply(400, { message: 'Enrollment is already cancelled' });

      await expect(enrollmentService.cancel('enroll-1')).rejects.toThrow();
    });
  });

  // ===========================================
  // TRANSFER ENROLLMENT TESTS
  // ===========================================
  describe('transfer', () => {
    it('should transfer enrollment successfully', async () => {
      mock.onPost('/enrollments/enroll-1/transfer').reply((config) => {
        const body = JSON.parse(config.data);
        return [200, {
          ...mockEnrollment,
          class_id: body.new_class_id,
          updated_at: new Date().toISOString(),
        }];
      });

      const result = await enrollmentService.transfer('enroll-1', {
        new_class_id: 'class-2',
        reason: 'Requested different time slot',
      });

      expect(result.class_id).toBe('class-2');
    });

    it('should throw error when new class is full', async () => {
      mock.onPost('/enrollments/enroll-1/transfer').reply(400, { message: 'Target class is full' });

      await expect(
        enrollmentService.transfer('enroll-1', {
          new_class_id: 'full-class',
        })
      ).rejects.toThrow();
    });

    it('should throw error when child already in new class', async () => {
      mock.onPost('/enrollments/enroll-1/transfer').reply(409, { message: 'Child already enrolled in target class' });

      await expect(
        enrollmentService.transfer('enroll-1', {
          new_class_id: 'class-already-enrolled',
        })
      ).rejects.toThrow();
    });
  });

  // ===========================================
  // ACTIVATE ENROLLMENT TESTS (ADMIN)
  // ===========================================
  describe('activate', () => {
    it('should activate pending enrollment', async () => {
      mock.onPost('/enrollments/enroll-1/activate').reply(200, {
        ...mockEnrollment,
        status: 'ACTIVE',
        payment_completed: true,
        updated_at: new Date().toISOString(),
      });

      const result = await enrollmentService.activate('enroll-1');

      expect(result.status).toBe('ACTIVE');
      expect(result.payment_completed).toBe(true);
    });

    it('should throw error when not in pending status', async () => {
      mock.onPost('/enrollments/enroll-1/activate').reply(400, { message: 'Enrollment is not in PENDING status' });

      await expect(enrollmentService.activate('enroll-1')).rejects.toThrow();
    });

    it('should throw error on 403 forbidden (non-admin)', async () => {
      mock.onPost('/enrollments/enroll-1/activate').reply(403, { message: 'Forbidden' });

      await expect(enrollmentService.activate('enroll-1')).rejects.toThrow();
    });
  });

  // ===========================================
  // WAITLIST TESTS
  // ===========================================
  describe('joinWaitlist', () => {
    it('should join waitlist successfully', async () => {
      mock.onPost('/enrollments/waitlist/join').reply((config) => {
        const body = JSON.parse(config.data);
        return [201, {
          enrollment_id: 'enroll-waitlist-1',
          position: 3,
          is_priority: body.is_priority || false,
          notified_at: null,
          expires_at: null,
          created_at: new Date().toISOString(),
        }];
      });

      const result = await enrollmentService.joinWaitlist({
        child_id: 'child-1',
        class_id: 'full-class',
      });

      expect(result.enrollment_id).toBe('enroll-waitlist-1');
      expect(result.position).toBe(3);
    });

    it('should join priority waitlist', async () => {
      mock.onPost('/enrollments/waitlist/join').reply((config) => {
        const body = JSON.parse(config.data);
        return [201, {
          enrollment_id: 'enroll-waitlist-1',
          position: 1,
          is_priority: body.is_priority,
          notified_at: null,
          expires_at: null,
          created_at: new Date().toISOString(),
        }];
      });

      const result = await enrollmentService.joinWaitlist({
        child_id: 'child-1',
        class_id: 'full-class',
        is_priority: true,
      });

      expect(result.is_priority).toBe(true);
      expect(result.position).toBe(1);
    });

    it('should throw error when already on waitlist', async () => {
      mock.onPost('/enrollments/waitlist/join').reply(409, { message: 'Child already on waitlist' });

      await expect(
        enrollmentService.joinWaitlist({
          child_id: 'child-1',
          class_id: 'class-1',
        })
      ).rejects.toThrow();
    });
  });

  describe('claimWaitlist', () => {
    it('should claim waitlist spot successfully', async () => {
      mock.onPost('/enrollments/enroll-waitlist-1/waitlist/claim').reply(200, {
        ...mockEnrollment,
        id: 'enroll-waitlist-1',
        status: 'PENDING',
        payment_completed: false,
      });

      const result = await enrollmentService.claimWaitlist('enroll-waitlist-1');

      expect(result.status).toBe('PENDING');
    });

    it('should throw error when claim window expired', async () => {
      mock.onPost('/enrollments/enroll-waitlist-1/waitlist/claim').reply(400, { message: 'Claim window has expired' });

      await expect(
        enrollmentService.claimWaitlist('enroll-waitlist-1')
      ).rejects.toThrow();
    });
  });

  describe('getClassWaitlist', () => {
    it('should return class waitlist for admin', async () => {
      mock.onGet('/enrollments/waitlist/class/class-1').reply(200, [
        mockWaitlistEntry,
        { ...mockWaitlistEntry, enrollment_id: 'enroll-waitlist-2', position: 2 },
      ]);

      const result = await enrollmentService.getClassWaitlist('class-1');

      expect(result.length).toBe(2);
      expect(result[0].position).toBe(1);
      expect(result[1].position).toBe(2);
    });

    it('should return empty array when no waitlist', async () => {
      mock.onGet('/enrollments/waitlist/class/class-1').reply(200, []);

      const result = await enrollmentService.getClassWaitlist('class-1');

      expect(result).toEqual([]);
    });

    it('should throw error on 403 forbidden (non-admin)', async () => {
      mock.onGet('/enrollments/waitlist/class/class-1').reply(403, { message: 'Forbidden' });

      await expect(
        enrollmentService.getClassWaitlist('class-1')
      ).rejects.toThrow();
    });
  });

  describe('promoteFromWaitlist', () => {
    it('should promote waitlist entry to active enrollment', async () => {
      mock.onPost('/enrollments/enroll-waitlist-1/waitlist/promote').reply(200, {
        ...mockEnrollment,
        id: 'enroll-waitlist-1',
        status: 'ACTIVE',
        payment_completed: true,
      });

      const result = await enrollmentService.promoteFromWaitlist('enroll-waitlist-1');

      expect(result.status).toBe('ACTIVE');
    });

    it('should throw error when class is still full', async () => {
      mock.onPost('/enrollments/enroll-waitlist-1/waitlist/promote').reply(409, { message: 'Class is still full' });

      await expect(
        enrollmentService.promoteFromWaitlist('enroll-waitlist-1')
      ).rejects.toThrow();
    });

    it('should throw error on 403 forbidden (non-admin)', async () => {
      mock.onPost('/enrollments/enroll-waitlist-1/waitlist/promote').reply(403, { message: 'Forbidden' });

      await expect(
        enrollmentService.promoteFromWaitlist('enroll-waitlist-1')
      ).rejects.toThrow();
    });
  });
});
