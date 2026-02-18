/**
 * Unit Tests for src/api/utils/cache-utils.ts
 * Tests cacheInvalidation and cachePrefetch utilities
 */

import { QueryClient } from '@tanstack/react-query';
import { cacheInvalidation, cachePrefetch } from '../../../api/utils/cache-utils';
import { queryKeys } from '../../../api/constants/query-keys';

describe('cache-utils', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    // Spy on invalidateQueries, prefetchQuery, clear
    jest.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined);
    jest.spyOn(queryClient, 'prefetchQuery').mockResolvedValue(undefined);
    jest.spyOn(queryClient, 'clear').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // =========================================================================
  // cacheInvalidation.onChildMutation
  // =========================================================================
  describe('onChildMutation', () => {
    it('should invalidate children lists', () => {
      cacheInvalidation.onChildMutation(queryClient);

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.children.lists(),
      });
    });

    it('should invalidate specific child detail and related queries when childId provided', () => {
      cacheInvalidation.onChildMutation(queryClient, 'c1');

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.children.detail('c1'),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.children.emergencyContacts('c1'),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.enrollments.byChild('c1'),
      });
    });

    it('should not invalidate specific queries when no childId', () => {
      cacheInvalidation.onChildMutation(queryClient);

      // Only 1 call for lists
      expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // cacheInvalidation.onEnrollmentMutation
  // =========================================================================
  describe('onEnrollmentMutation', () => {
    const enrollment = { child_id: 'ch1', class_id: 'cls1', id: 'e1' };

    it('should invalidate enrollment lists, byChild, byClass, class detail and capacity', () => {
      cacheInvalidation.onEnrollmentMutation(queryClient, enrollment);

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.enrollments.lists(),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.enrollments.byChild('ch1'),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.enrollments.byClass('cls1'),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.classes.detail('cls1'),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.classes.capacity('cls1'),
      });
    });

    it('should invalidate specific enrollment detail when id is provided', () => {
      cacheInvalidation.onEnrollmentMutation(queryClient, enrollment);

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.enrollments.detail('e1'),
      });
    });

    it('should not invalidate enrollment detail when id is not provided', () => {
      cacheInvalidation.onEnrollmentMutation(queryClient, { child_id: 'ch1', class_id: 'cls1' });

      const calls = (queryClient.invalidateQueries as jest.Mock).mock.calls;
      const detailCall = calls.find(
        (c: any) => JSON.stringify(c[0]?.queryKey) === JSON.stringify(queryKeys.enrollments.detail('e1'))
      );
      expect(detailCall).toBeUndefined();
    });
  });

  // =========================================================================
  // cacheInvalidation.onAttendanceMutation
  // =========================================================================
  describe('onAttendanceMutation', () => {
    it('should invalidate attendance and badge queries for enrollment', () => {
      cacheInvalidation.onAttendanceMutation(queryClient, 'enr1');

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.attendance.byEnrollment('enr1'),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.attendance.history('enr1'),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.attendance.stats('enr1'),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.attendance.streak('enr1'),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.badges.byEnrollment('enr1'),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.badges.progress('enr1'),
      });
    });
  });

  // =========================================================================
  // cacheInvalidation.onBadgeAwarded
  // =========================================================================
  describe('onBadgeAwarded', () => {
    it('should invalidate badge enrollment and progress queries', () => {
      cacheInvalidation.onBadgeAwarded(queryClient, 'enr1');

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.badges.byEnrollment('enr1'),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.badges.progress('enr1'),
      });
    });
  });

  // =========================================================================
  // cacheInvalidation.onCheckInMutation
  // =========================================================================
  describe('onCheckInMutation', () => {
    it('should invalidate check-in and coach queries for class', () => {
      cacheInvalidation.onCheckInMutation(queryClient, 'cls1');

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.checkIn.byClass('cls1'),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.checkIn.status('cls1'),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.coach.checkInStatus('cls1'),
      });
    });

    it('should invalidate check-in history when enrollmentId provided', () => {
      cacheInvalidation.onCheckInMutation(queryClient, 'cls1', 'enr1');

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.checkIn.history('enr1'),
      });
    });

    it('should not invalidate check-in history when enrollmentId not provided', () => {
      cacheInvalidation.onCheckInMutation(queryClient, 'cls1');

      // 3 calls: byClass, status, coachCheckInStatus
      expect(queryClient.invalidateQueries).toHaveBeenCalledTimes(3);
    });
  });

  // =========================================================================
  // cacheInvalidation.onAdminAction
  // =========================================================================
  describe('onAdminAction', () => {
    it('should invalidate admin metrics and all admin queries', () => {
      cacheInvalidation.onAdminAction(queryClient);

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.admin.metrics(),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.admin.all,
      });
    });
  });

  // =========================================================================
  // cacheInvalidation.onPaymentMutation
  // =========================================================================
  describe('onPaymentMutation', () => {
    it('should invalidate orders, payments, installments, and admin metrics', () => {
      cacheInvalidation.onPaymentMutation(queryClient);

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.orders.all,
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.payments.all,
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.installments.all,
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.admin.metrics(),
      });
    });

    it('should also invalidate user-specific lists when userId provided', () => {
      cacheInvalidation.onPaymentMutation(queryClient, 'u1');

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.orders.lists(),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.payments.lists(),
      });
    });
  });

  // =========================================================================
  // cacheInvalidation.onClassMutation
  // =========================================================================
  describe('onClassMutation', () => {
    it('should invalidate class lists', () => {
      cacheInvalidation.onClassMutation(queryClient);

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.classes.lists(),
      });
    });

    it('should invalidate detail, capacity, schedule, and enrollments when classId provided', () => {
      cacheInvalidation.onClassMutation(queryClient, 'cls1');

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.classes.detail('cls1'),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.classes.capacity('cls1'),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.classes.schedule('cls1'),
      });
      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.enrollments.byClass('cls1'),
      });
    });
  });

  // =========================================================================
  // cacheInvalidation.onContentMutation
  // =========================================================================
  describe('onContentMutation', () => {
    it('should invalidate announcement lists for announcement type', () => {
      cacheInvalidation.onContentMutation(queryClient, 'announcement');

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.announcements.lists(),
      });
    });

    it('should invalidate event lists for event type', () => {
      cacheInvalidation.onContentMutation(queryClient, 'event');

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.events.lists(),
      });
    });

    it('should invalidate byClass for event type when classId provided', () => {
      cacheInvalidation.onContentMutation(queryClient, 'event', 'cls1');

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: queryKeys.events.byClass('cls1'),
      });
    });

    it('should not invalidate byClass for announcement type even with classId', () => {
      cacheInvalidation.onContentMutation(queryClient, 'announcement', 'cls1');

      const calls = (queryClient.invalidateQueries as jest.Mock).mock.calls;
      const byClassCall = calls.find(
        (c: any) => JSON.stringify(c[0]?.queryKey) === JSON.stringify(queryKeys.events.byClass('cls1'))
      );
      expect(byClassCall).toBeUndefined();
    });
  });

  // =========================================================================
  // cacheInvalidation.invalidateAll
  // =========================================================================
  describe('invalidateAll', () => {
    it('should call queryClient.invalidateQueries with no args', () => {
      cacheInvalidation.invalidateAll(queryClient);

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith();
    });
  });

  // =========================================================================
  // cacheInvalidation.clearAll
  // =========================================================================
  describe('clearAll', () => {
    it('should call queryClient.clear', () => {
      cacheInvalidation.clearAll(queryClient);

      expect(queryClient.clear).toHaveBeenCalled();
    });
  });

  // =========================================================================
  // cachePrefetch.prefetchClassDetails
  // =========================================================================
  describe('prefetchClassDetails', () => {
    it('should call prefetchQuery with correct key and staleTime', async () => {
      const fetchFn = jest.fn().mockResolvedValue({ id: 'cls1', name: 'Test' });

      await cachePrefetch.prefetchClassDetails(queryClient, 'cls1', fetchFn);

      expect(queryClient.prefetchQuery).toHaveBeenCalledWith({
        queryKey: queryKeys.classes.detail('cls1'),
        queryFn: fetchFn,
        staleTime: 5 * 60 * 1000,
      });
    });
  });

  // =========================================================================
  // cachePrefetch.prefetchEnrollmentDetails
  // =========================================================================
  describe('prefetchEnrollmentDetails', () => {
    it('should call prefetchQuery with correct key and staleTime', async () => {
      const fetchFn = jest.fn().mockResolvedValue({ id: 'e1' });

      await cachePrefetch.prefetchEnrollmentDetails(queryClient, 'e1', fetchFn);

      expect(queryClient.prefetchQuery).toHaveBeenCalledWith({
        queryKey: queryKeys.enrollments.detail('e1'),
        queryFn: fetchFn,
        staleTime: 5 * 60 * 1000,
      });
    });
  });
});
