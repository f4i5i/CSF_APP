/**
 * useCreateEnrollment Hook
 * React Query mutation hook to create enrollment with optimistic updates
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { enrollmentService } from '../../services/enrollment.service';
import { queryKeys } from '../../constants/query-keys';
import { cacheInvalidation } from '../../utils/cache-utils';
import type { Enrollment, CreateEnrollmentRequest } from '../../types/enrollment.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook options
 */
interface UseCreateEnrollmentOptions {
  mutationOptions?: Omit<
    UseMutationOptions<Enrollment, ApiErrorResponse, CreateEnrollmentRequest, { previousEnrollments: Enrollment[] | undefined }>,
    'mutationFn'
  >;
}

/**
 * Hook to create enrollment with optimistic updates
 *
 * @example
 * ```tsx
 * const { mutate: createEnrollment, isPending } = useCreateEnrollment();
 *
 * createEnrollment({
 *   child_id: '123',
 *   class_id: '456',
 * });
 * ```
 */
export function useCreateEnrollment(options: UseCreateEnrollmentOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: (enrollmentData: CreateEnrollmentRequest) =>
      enrollmentService.create(enrollmentData),

    onMutate: async (newEnrollment): Promise<{ previousEnrollments: Enrollment[] | undefined }> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.enrollments.lists() });

      // Snapshot previous value
      const previousEnrollments = queryClient.getQueryData<Enrollment[]>(
        queryKeys.enrollments.lists()
      );

      // Optimistically update
      const now = new Date().toISOString();
      queryClient.setQueryData<Enrollment[]>(
        queryKeys.enrollments.lists(),
        (old = []) => [
          ...old,
          {
            id: 'temp-' + Date.now(),
            ...newEnrollment,
            user_id: '',
            status: 'PENDING' as const,
            base_price: 0,
            discount_amount: 0,
            final_price: 0,
            enrollment_date: now,
            payment_completed: false,
            created_at: now,
            updated_at: now,
          } as Enrollment,
        ]
      );

      return { previousEnrollments };
    },

    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousEnrollments) {
        queryClient.setQueryData(
          queryKeys.enrollments.lists(),
          context.previousEnrollments
        );
      }
      toast.error(error.message || 'Failed to create enrollment');
    },

    onSuccess: (enrollment) => {
      // Invalidate related queries
      cacheInvalidation.onEnrollmentMutation(queryClient, {
        child_id: enrollment.child_id,
        class_id: enrollment.class_id,
        id: enrollment.id,
      });

      toast.success('Enrollment created successfully!');
    },

    ...mutationOptions,
  });
}
