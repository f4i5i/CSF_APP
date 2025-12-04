/**
 * Cache Utilities
 * Helper functions for cache invalidation and management
 */

import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '../constants/query-keys';
import {
  ChildId,
  ClassId,
  EnrollmentId,
  UserId,
} from '../types/common.types';

/**
 * Cache invalidation utilities
 * Centralized functions to invalidate related queries after mutations
 */
export const cacheInvalidation = {
  /**
   * Invalidate cache after creating/updating/deleting a child
   * @param queryClient - React Query client instance
   * @param childId - Optional child ID for targeted invalidation
   */
  onChildMutation: (queryClient: QueryClient, childId?: ChildId): void => {
    // Invalidate all children lists
    queryClient.invalidateQueries({ queryKey: queryKeys.children.lists() });

    if (childId) {
      // Invalidate specific child detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.children.detail(childId),
      });

      // Invalidate emergency contacts for this child
      queryClient.invalidateQueries({
        queryKey: queryKeys.children.emergencyContacts(childId),
      });

      // Invalidate enrollments for this child
      queryClient.invalidateQueries({
        queryKey: queryKeys.enrollments.byChild(childId),
      });
    }
  },

  /**
   * Invalidate cache after enrollment mutation
   * @param queryClient - React Query client instance
   * @param enrollment - Enrollment data with child_id and class_id
   */
  onEnrollmentMutation: (
    queryClient: QueryClient,
    enrollment: {
      child_id: ChildId;
      class_id: ClassId;
      id?: EnrollmentId;
    }
  ): void => {
    // Invalidate all enrollment lists
    queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.lists() });

    // Invalidate enrollments for this child
    queryClient.invalidateQueries({
      queryKey: queryKeys.enrollments.byChild(enrollment.child_id),
    });

    // Invalidate enrollments for this class
    queryClient.invalidateQueries({
      queryKey: queryKeys.enrollments.byClass(enrollment.class_id),
    });

    // Invalidate class details (capacity may have changed)
    queryClient.invalidateQueries({
      queryKey: queryKeys.classes.detail(enrollment.class_id),
    });

    // Invalidate class capacity
    queryClient.invalidateQueries({
      queryKey: queryKeys.classes.capacity(enrollment.class_id),
    });

    if (enrollment.id) {
      // Invalidate specific enrollment detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.enrollments.detail(enrollment.id),
      });
    }
  },

  /**
   * Invalidate cache after attendance is marked
   * @param queryClient - React Query client instance
   * @param enrollmentId - Enrollment ID
   */
  onAttendanceMutation: (
    queryClient: QueryClient,
    enrollmentId: EnrollmentId
  ): void => {
    // Invalidate attendance for this enrollment
    queryClient.invalidateQueries({
      queryKey: queryKeys.attendance.byEnrollment(enrollmentId),
    });

    // Invalidate attendance history
    queryClient.invalidateQueries({
      queryKey: queryKeys.attendance.history(enrollmentId),
    });

    // Invalidate attendance stats
    queryClient.invalidateQueries({
      queryKey: queryKeys.attendance.stats(enrollmentId),
    });

    // Invalidate attendance streak
    queryClient.invalidateQueries({
      queryKey: queryKeys.attendance.streak(enrollmentId),
    });

    // Invalidate badges (attendance may trigger badge awards)
    queryClient.invalidateQueries({
      queryKey: queryKeys.badges.byEnrollment(enrollmentId),
    });

    // Invalidate badge progress
    queryClient.invalidateQueries({
      queryKey: queryKeys.badges.progress(enrollmentId),
    });
  },

  /**
   * Invalidate cache after badge is awarded
   * @param queryClient - React Query client instance
   * @param enrollmentId - Enrollment ID
   */
  onBadgeAwarded: (
    queryClient: QueryClient,
    enrollmentId: EnrollmentId
  ): void => {
    // Invalidate badges for this enrollment
    queryClient.invalidateQueries({
      queryKey: queryKeys.badges.byEnrollment(enrollmentId),
    });

    // Invalidate badge progress
    queryClient.invalidateQueries({
      queryKey: queryKeys.badges.progress(enrollmentId),
    });
  },

  /**
   * Invalidate cache after check-in
   * @param queryClient - React Query client instance
   * @param classId - Class ID
   * @param enrollmentId - Optional enrollment ID
   */
  onCheckInMutation: (
    queryClient: QueryClient,
    classId: ClassId,
    enrollmentId?: EnrollmentId
  ): void => {
    // Invalidate check-in status for class
    queryClient.invalidateQueries({
      queryKey: queryKeys.checkIn.byClass(classId),
    });

    // Invalidate check-in status
    queryClient.invalidateQueries({
      queryKey: queryKeys.checkIn.status(classId),
    });

    // Invalidate coach check-in status
    queryClient.invalidateQueries({
      queryKey: queryKeys.coach.checkInStatus(classId),
    });

    if (enrollmentId) {
      // Invalidate check-in history for enrollment
      queryClient.invalidateQueries({
        queryKey: queryKeys.checkIn.history(enrollmentId),
      });
    }
  },

  /**
   * Invalidate cache after admin action
   * Refreshes dashboard metrics and related data
   * @param queryClient - React Query client instance
   */
  onAdminAction: (queryClient: QueryClient): void => {
    // Invalidate admin metrics
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.metrics() });

    // Invalidate all admin queries
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
  },

  /**
   * Invalidate cache after payment/order mutation
   * @param queryClient - React Query client instance
   * @param userId - Optional user ID
   */
  onPaymentMutation: (queryClient: QueryClient, userId?: UserId): void => {
    // Invalidate all orders and payments
    queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.installments.all });

    // Invalidate admin metrics (revenue may have changed)
    queryClient.invalidateQueries({ queryKey: queryKeys.admin.metrics() });

    if (userId) {
      // Invalidate user's orders and payments
      queryClient.invalidateQueries({
        queryKey: queryKeys.orders.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.payments.lists(),
      });
    }
  },

  /**
   * Invalidate cache after class mutation
   * @param queryClient - React Query client instance
   * @param classId - Optional class ID
   */
  onClassMutation: (queryClient: QueryClient, classId?: ClassId): void => {
    // Invalidate all class lists
    queryClient.invalidateQueries({ queryKey: queryKeys.classes.lists() });

    if (classId) {
      // Invalidate specific class detail
      queryClient.invalidateQueries({
        queryKey: queryKeys.classes.detail(classId),
      });

      // Invalidate class capacity
      queryClient.invalidateQueries({
        queryKey: queryKeys.classes.capacity(classId),
      });

      // Invalidate class schedule
      queryClient.invalidateQueries({
        queryKey: queryKeys.classes.schedule(classId),
      });

      // Invalidate enrollments for this class
      queryClient.invalidateQueries({
        queryKey: queryKeys.enrollments.byClass(classId),
      });
    }
  },

  /**
   * Invalidate cache after announcement/event mutation
   * @param queryClient - React Query client instance
   * @param type - Type of content ('announcement' or 'event')
   * @param classId - Optional class ID for targeted invalidation
   */
  onContentMutation: (
    queryClient: QueryClient,
    type: 'announcement' | 'event',
    classId?: ClassId
  ): void => {
    const keys = type === 'announcement' ? queryKeys.announcements : queryKeys.events;

    // Invalidate all content lists
    queryClient.invalidateQueries({ queryKey: keys.lists() });

    if (classId) {
      // Invalidate content for specific class
      if (type === 'event') {
        queryClient.invalidateQueries({
          queryKey: queryKeys.events.byClass(classId),
        });
      }
    }
  },

  /**
   * Invalidate all cache
   * Use sparingly - only when absolutely necessary
   * @param queryClient - React Query client instance
   */
  invalidateAll: (queryClient: QueryClient): void => {
    queryClient.invalidateQueries();
  },

  /**
   * Clear all cache
   * Use very sparingly - typically only on logout
   * @param queryClient - React Query client instance
   */
  clearAll: (queryClient: QueryClient): void => {
    queryClient.clear();
  },
};

/**
 * Prefetch utilities
 * Helper functions to prefetch data before it's needed
 */
export const cachePrefetch = {
  /**
   * Prefetch class details when hovering over class card
   * @param queryClient - React Query client instance
   * @param classId - Class ID to prefetch
   * @param fetchFn - Function to fetch class details
   */
  prefetchClassDetails: async (
    queryClient: QueryClient,
    classId: ClassId,
    fetchFn: () => Promise<any>
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.classes.detail(classId),
      queryFn: fetchFn,
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  },

  /**
   * Prefetch enrollment details
   * @param queryClient - React Query client instance
   * @param enrollmentId - Enrollment ID to prefetch
   * @param fetchFn - Function to fetch enrollment details
   */
  prefetchEnrollmentDetails: async (
    queryClient: QueryClient,
    enrollmentId: EnrollmentId,
    fetchFn: () => Promise<any>
  ): Promise<void> => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.enrollments.detail(enrollmentId),
      queryFn: fetchFn,
      staleTime: 5 * 60 * 1000,
    });
  },
};
