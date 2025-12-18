/**
 * @file useUpdateChild Hook - React Query mutation hook for updating a child
 *
 * This hook implements the React Query mutation pattern for write operations:
 * - Uses `useMutation` for PUT/PATCH operations (update)
 * - Provides optimistic updates for instant UI feedback
 * - Handles automatic cache invalidation and rollback on error
 * - Integrates with toast notifications for user feedback
 *
 * @module hooks/children/useUpdateChild
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { childService } from '../../services/child.service';
import { queryKeys } from '../../constants/query-keys';
import { cacheInvalidation } from '../../utils/cache-utils';
import type { Child, UpdateChildRequest } from '../../types/child.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Configuration options for the useUpdateChild hook
 *
 * @interface UseUpdateChildOptions
 * @property {UseMutationOptions} [mutationOptions] - Additional React Query mutation options
 */
interface UseUpdateChildOptions {
  mutationOptions?: Omit<
    UseMutationOptions<
      Child,
      ApiErrorResponse,
      { id: string; data: UpdateChildRequest },
      { previousChild: Child | undefined }
    >,
    'mutationFn'
  >;
}

/**
 * React Query mutation hook to update a child with optimistic updates
 *
 * This hook uses `useMutation` to update a child and manage cache updates. It implements:
 *
 * **Optimistic Updates:**
 * - Immediately updates the cached child data before the API responds
 * - Provides instant UI feedback without waiting for network latency
 * - Merges the update data with the existing child data
 *
 * **Cache Management:**
 * - Cancels any in-flight queries for the specific child detail to prevent race conditions
 * - Stores a snapshot of the previous child state for potential rollback
 * - Updates the cache optimistically with the merged data
 * - On error: Rolls back to the previous state
 * - On success: Invalidates queries to fetch the updated data from the server
 *
 * **Mutation Key:** Not explicitly set (uses default mutation behavior)
 *
 * **Cache Invalidation on Success:**
 * - Invalidates the specific child detail query: `['children', 'detail', childId]`
 * - Invalidates all children list queries: `['children', 'list']`
 * - Ensures updated data appears in both detail and list views
 * - Related queries are also invalidated via `cacheInvalidation.onChildMutation`
 *
 * **Error Handling:**
 * - Automatically rolls back optimistic updates on failure
 * - Displays error toast notification with the error message
 * - Preserves the previous cache state
 *
 * @param {UseUpdateChildOptions} [options={}] - Configuration options for the hook
 * @param {UseMutationOptions} [options.mutationOptions] - Additional React Query mutation options
 *
 * @returns {UseMutationResult<Child, ApiErrorResponse, {id: string, data: UpdateChildRequest}>} React Query mutation result containing:
 * - `mutate`: Function to trigger the mutation
 * - `mutateAsync`: Promise-based version of mutate
 * - `isPending`: True while the mutation is in progress
 * - `isError`: True if the mutation resulted in an error
 * - `isSuccess`: True if the mutation completed successfully
 * - `error`: The error object if an error occurred
 * - `data`: The updated child data (undefined until success)
 * - `reset`: Function to reset the mutation state
 *
 * @example
 * Basic usage - Update child information
 * ```tsx
 * function EditChildForm({ child }: { child: Child }) {
 *   const { mutate: updateChild, isPending } = useUpdateChild();
 *
 *   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
 *     e.preventDefault();
 *     const formData = new FormData(e.currentTarget);
 *
 *     updateChild({
 *       id: child.id,
 *       data: {
 *         first_name: formData.get('firstName') as string,
 *         last_name: formData.get('lastName') as string,
 *         date_of_birth: formData.get('dateOfBirth') as string,
 *       },
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="firstName" defaultValue={child.first_name} required />
 *       <input name="lastName" defaultValue={child.last_name} required />
 *       <input name="dateOfBirth" type="date" defaultValue={child.date_of_birth} required />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? 'Updating...' : 'Update Child'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @example
 * Partial update - Only update specific fields
 * ```tsx
 * function QuickEditChildName({ childId, currentName }: Props) {
 *   const { mutate: updateChild, isPending } = useUpdateChild();
 *   const [name, setName] = useState(currentName);
 *
 *   const handleSave = () => {
 *     // Only send changed fields
 *     updateChild({
 *       id: childId,
 *       data: { first_name: name },
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <input value={name} onChange={(e) => setName(e.target.value)} />
 *       <button onClick={handleSave} disabled={isPending}>
 *         {isPending ? 'Saving...' : 'Save'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * With async/await and navigation
 * ```tsx
 * function EditChildPage({ childId }: { childId: string }) {
 *   const navigate = useNavigate();
 *   const { mutateAsync: updateChild, isPending } = useUpdateChild();
 *
 *   const handleUpdate = async (data: UpdateChildRequest) => {
 *     try {
 *       const updatedChild = await updateChild({ id: childId, data });
 *       console.log('Child updated:', updatedChild);
 *       navigate(`/children/${childId}`);
 *     } catch (error) {
 *       console.error('Failed to update:', error);
 *     }
 *   };
 *
 *   return <ChildEditForm onSubmit={handleUpdate} isSubmitting={isPending} />;
 * }
 * ```
 *
 * @example
 * Toggle field - Update boolean field
 * ```tsx
 * function ChildStatusToggle({ child }: { child: Child }) {
 *   const { mutate: updateChild } = useUpdateChild();
 *
 *   const toggleActiveStatus = () => {
 *     updateChild({
 *       id: child.id,
 *       data: { is_active: !child.is_active },
 *     });
 *   };
 *
 *   return (
 *     <label>
 *       <input
 *         type="checkbox"
 *         checked={child.is_active}
 *         onChange={toggleActiveStatus}
 *       />
 *       Active Status
 *     </label>
 *   );
 * }
 * ```
 *
 * @example
 * With custom success callback
 * ```tsx
 * function ChildProfileEditor({ childId }: { childId: string }) {
 *   const [isEditing, setIsEditing] = useState(false);
 *
 *   const { mutate: updateChild, isPending } = useUpdateChild({
 *     mutationOptions: {
 *       onSuccess: (updatedChild) => {
 *         console.log('Updated child:', updatedChild);
 *         setIsEditing(false); // Exit edit mode
 *       },
 *       onError: (error) => {
 *         console.error('Update failed:', error);
 *       },
 *     },
 *   });
 *
 *   const handleSave = (data: UpdateChildRequest) => {
 *     updateChild({ id: childId, data });
 *   };
 *
 *   return (
 *     <div>
 *       {isEditing ? (
 *         <EditMode onSave={handleSave} isSubmitting={isPending} />
 *       ) : (
 *         <ViewMode onEdit={() => setIsEditing(true)} />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Observing optimistic update behavior
 * ```tsx
 * function ChildDetailWithOptimisticUI({ childId }: { childId: string }) {
 *   const { data: child } = useChild(childId);
 *   const { mutate: updateChild } = useUpdateChild();
 *
 *   // The child data will update immediately in the UI
 *   // before the server responds
 *
 *   const handleQuickEdit = () => {
 *     updateChild({
 *       id: childId,
 *       data: { first_name: 'Updated Name' },
 *     });
 *     // UI updates instantly! No loading spinner needed.
 *   };
 *
 *   return (
 *     <div>
 *       <h2>{child?.first_name} {child?.last_name}</h2>
 *       <button onClick={handleQuickEdit}>Quick Edit</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Batch updates - Update multiple fields
 * ```tsx
 * function ChildProfileForm({ child }: { child: Child }) {
 *   const { mutate: updateChild, isPending } = useUpdateChild();
 *
 *   const handleUpdateAll = () => {
 *     updateChild({
 *       id: child.id,
 *       data: {
 *         first_name: 'Updated First',
 *         last_name: 'Updated Last',
 *         date_of_birth: '2015-03-15',
 *         emergency_contacts: [
 *           { name: 'Parent', phone: '123-456-7890', relation: 'Parent' }
 *         ],
 *       },
 *     });
 *   };
 *
 *   return (
 *     <button onClick={handleUpdateAll} disabled={isPending}>
 *       Save All Changes
 *     </button>
 *   );
 * }
 * ```
 */
export function useUpdateChild(options: UseUpdateChildOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChildRequest }) =>
      childService.update(id, data),

    onMutate: async ({ id, data: updatedData }): Promise<{ previousChild: Child | undefined }> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.children.detail(id) });

      // Snapshot previous value
      const previousChild = queryClient.getQueryData<Child>(
        queryKeys.children.detail(id)
      );

      // Optimistically update to the new value
      if (previousChild) {
        queryClient.setQueryData<Child>(queryKeys.children.detail(id), {
          ...previousChild,
          ...updatedData,
        });
      }

      return { previousChild };
    },

    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousChild) {
        queryClient.setQueryData(
          queryKeys.children.detail(id),
          context.previousChild
        );
      }
      toast.error(error.message || 'Failed to update child');
    },

    onSuccess: (child) => {
      // Invalidate children queries
      cacheInvalidation.onChildMutation(queryClient, child.id);

      toast.success('Child updated successfully!');
    },

    ...mutationOptions,
  });
}
