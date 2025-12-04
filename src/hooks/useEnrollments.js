/**
 * useEnrollments Hook
 * Manages enrollment data with create, update, and cancel operations
 *
 * @example
 * const {
 *   enrollments,
 *   activeEnrollments,
 *   loading,
 *   enrollChild,
 *   cancelEnrollment,
 *   checkEligibility
 * } = useEnrollments();
 */

import { useCallback } from 'react';
import { enrollmentsService } from '../api/services';
import { useApi } from './useApi';
import { useMutation } from './useMutation';
import toast from 'react-hot-toast';

export const useEnrollments = (options = {}) => {
  const {
    autoFetch = true,
    childId = null,
    status = null,
  } = options;

  // Build filters
  const filters = {};
  if (childId) filters.child_id = childId;
  if (status) filters.status = status;

  // Fetch enrollments
  const {
    data: enrollments,
    loading,
    error,
    refetch,
  } = useApi(
    () => enrollmentsService.getMy(filters),
    {
      autoFetch,
      initialData: [],
      dependencies: [childId, status],
    }
  );

  // Create enrollment mutation
  const {
    mutate: enrollChildMutation,
    loading: enrolling,
    error: enrollError,
  } = useMutation(enrollmentsService.create, {
    onSuccess: () => {
      toast.success('Successfully enrolled!');
      refetch();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  // Update enrollment mutation
  const {
    mutate: updateEnrollmentMutation,
    loading: updating,
  } = useMutation(
    ({ id, data }) => enrollmentsService.update(id, data),
    {
      onSuccess: () => {
        toast.success('Enrollment updated!');
        refetch();
      },
      onError: (error) => {
        toast.error(error);
      },
    }
  );

  // Cancel enrollment mutation
  const {
    mutate: cancelEnrollmentMutation,
    loading: cancelling,
    error: cancelError,
  } = useMutation(
    ({ id, reason }) => enrollmentsService.cancel(id, { reason }),
    {
      onSuccess: () => {
        toast.success('Enrollment cancelled');
        refetch();
      },
      onError: (error) => {
        toast.error(error);
      },
    }
  );

  // Check eligibility mutation
  const {
    mutate: checkEligibilityMutation,
    loading: checkingEligibility,
    data: eligibilityData,
  } = useMutation(
    ({ childId, classId }) => enrollmentsService.checkEligibility(childId, classId),
    {
      onError: (error) => {
        toast.error(error);
      },
    }
  );

  // Helper functions
  const enrollChild = useCallback(
    (enrollmentData) => {
      return enrollChildMutation(enrollmentData);
    },
    [enrollChildMutation]
  );

  const updateEnrollment = useCallback(
    (id, enrollmentData) => {
      return updateEnrollmentMutation({ id, data: enrollmentData });
    },
    [updateEnrollmentMutation]
  );

  const cancelEnrollment = useCallback(
    (id, reason = '') => {
      return cancelEnrollmentMutation({ id, reason });
    },
    [cancelEnrollmentMutation]
  );

  const checkEligibility = useCallback(
    (childId, classId) => {
      return checkEligibilityMutation({ childId, classId });
    },
    [checkEligibilityMutation]
  );

  // Get enrollment by ID from cached enrollments
  const getEnrollmentById = useCallback(
    (id) => {
      return enrollments?.find((enrollment) => enrollment.id === id);
    },
    [enrollments]
  );

  // Get enrollments by child ID
  const getEnrollmentsByChild = useCallback(
    (childId) => {
      return enrollments?.filter((enrollment) => enrollment.child_id === childId) || [];
    },
    [enrollments]
  );

  // Computed values
  const activeEnrollments = enrollments?.filter(
    (enrollment) => enrollment.status === 'active'
  ) || [];

  const completedEnrollments = enrollments?.filter(
    (enrollment) => enrollment.status === 'completed'
  ) || [];

  const cancelledEnrollments = enrollments?.filter(
    (enrollment) => enrollment.status === 'cancelled'
  ) || [];

  return {
    // Data
    enrollments: enrollments || [],
    activeEnrollments,
    completedEnrollments,
    cancelledEnrollments,
    eligibilityData,

    // Loading states
    loading,
    enrolling,
    updating,
    cancelling,
    checkingEligibility,
    isLoading: loading || enrolling || updating || cancelling,

    // Errors
    error,
    enrollError,
    cancelError,

    // Operations
    enrollChild,
    updateEnrollment,
    cancelEnrollment,
    checkEligibility,
    refetch,

    // Helpers
    getEnrollmentById,
    getEnrollmentsByChild,

    // Computed values
    hasEnrollments: enrollments && enrollments.length > 0,
    enrollmentCount: enrollments?.length || 0,
    activeCount: activeEnrollments.length,
    completedCount: completedEnrollments.length,
    cancelledCount: cancelledEnrollments.length,
  };
};

export default useEnrollments;
