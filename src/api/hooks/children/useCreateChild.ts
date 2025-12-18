/**
 * @file useCreateChild Hook - React Query mutation hook for creating a new child
 *
 * This hook implements the React Query mutation pattern for write operations:
 * - Uses `useMutation` for POST operations (create)
 * - Provides optimistic updates for instant UI feedback
 * - Handles automatic cache invalidation and rollback on error
 * - Integrates with toast notifications for user feedback
 *
 * @module hooks/children/useCreateChild
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { childService } from '../../services/child.service';
import { queryKeys } from '../../constants/query-keys';
import { cacheInvalidation } from '../../utils/cache-utils';
import type { Child, CreateChildRequest } from '../../types/child.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Configuration options for the useCreateChild hook
 *
 * @interface UseCreateChildOptions
 * @property {UseMutationOptions} [mutationOptions] - Additional React Query mutation options
 */
interface UseCreateChildOptions {
  mutationOptions?: Omit<
    UseMutationOptions<Child, ApiErrorResponse, CreateChildRequest, { previousChildren: Child[] | undefined }>,
    'mutationFn'
  >;
}

/**
 * React Query mutation hook to create a new child with optimistic updates
 *
 * This hook uses `useMutation` to create a child and manage cache updates. It implements:
 *
 * **Optimistic Updates:**
 * - Immediately adds a temporary child to the cache before the API responds
 * - Provides instant UI feedback without waiting for network latency
 * - Uses a temporary ID (`temp-{timestamp}`) that gets replaced with the real ID
 *
 * **Cache Management:**
 * - Cancels any in-flight queries for the children list to prevent race conditions
 * - Stores a snapshot of the previous state for potential rollback
 * - Updates the cache optimistically with the new child
 * - On error: Rolls back to the previous state
 * - On success: Invalidates queries to fetch the real data from the server
 *
 * **Mutation Key:** Not explicitly set (uses default mutation behavior)
 *
 * **Cache Invalidation on Success:**
 * - Invalidates all children list queries: `['children', 'list']`
 * - Ensures fresh data is fetched across all components
 * - Related queries (enrollments, etc.) are also invalidated via `cacheInvalidation.onChildMutation`
 *
 * **Error Handling:**
 * - Automatically rolls back optimistic updates on failure
 * - Displays error toast notification with the error message
 * - Preserves the previous cache state
 *
 * @param {UseCreateChildOptions} [options={}] - Configuration options for the hook
 * @param {UseMutationOptions} [options.mutationOptions] - Additional React Query mutation options
 *
 * @returns {UseMutationResult<Child, ApiErrorResponse, CreateChildRequest>} React Query mutation result containing:
 * - `mutate`: Function to trigger the mutation
 * - `mutateAsync`: Promise-based version of mutate
 * - `isPending`: True while the mutation is in progress
 * - `isError`: True if the mutation resulted in an error
 * - `isSuccess`: True if the mutation completed successfully
 * - `error`: The error object if an error occurred
 * - `data`: The created child data (undefined until success)
 * - `reset`: Function to reset the mutation state
 *
 * @example
 * Basic usage - Create a child with form data
 * ```tsx
 * function AddChildForm() {
 *   const { mutate: createChild, isPending } = useCreateChild();
 *
 *   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
 *     e.preventDefault();
 *     const formData = new FormData(e.currentTarget);
 *
 *     createChild({
 *       first_name: formData.get('firstName') as string,
 *       last_name: formData.get('lastName') as string,
 *       date_of_birth: formData.get('dateOfBirth') as string,
 *       emergency_contacts: [],
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="firstName" placeholder="First Name" required />
 *       <input name="lastName" placeholder="Last Name" required />
 *       <input name="dateOfBirth" type="date" required />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? 'Creating...' : 'Add Child'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @example
 * With async/await and custom success handling
 * ```tsx
 * function CreateChildModal({ onClose }: { onClose: () => void }) {
 *   const { mutateAsync: createChild, isPending, error } = useCreateChild();
 *   const [formError, setFormError] = useState<string | null>(null);
 *
 *   const handleCreate = async (childData: CreateChildRequest) => {
 *     try {
 *       setFormError(null);
 *       const newChild = await createChild(childData);
 *       console.log('Created child:', newChild);
 *       onClose(); // Close modal on success
 *     } catch (err) {
 *       setFormError('Failed to create child. Please try again.');
 *     }
 *   };
 *
 *   return (
 *     <Modal>
 *       {formError && <Alert variant="error">{formError}</Alert>}
 *       <ChildForm onSubmit={handleCreate} isSubmitting={isPending} />
 *     </Modal>
 *   );
 * }
 * ```
 *
 * @example
 * With custom success callback
 * ```tsx
 * function QuickAddChild() {
 *   const navigate = useNavigate();
 *
 *   const { mutate: createChild, isPending } = useCreateChild({
 *     mutationOptions: {
 *       onSuccess: (newChild) => {
 *         // Custom success handling
 *         console.log('Child created:', newChild.id);
 *         // Navigate to the child's detail page
 *         navigate(`/children/${newChild.id}`);
 *       },
 *     },
 *   });
 *
 *   return (
 *     <button
 *       onClick={() => createChild({
 *         first_name: 'Quick',
 *         last_name: 'Add',
 *         date_of_birth: '2020-01-01',
 *       })}
 *       disabled={isPending}
 *     >
 *       Quick Add Child
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * With validation before mutation
 * ```tsx
 * function ValidatedChildForm() {
 *   const { mutate: createChild, isPending } = useCreateChild();
 *
 *   const handleSubmit = (data: CreateChildRequest) => {
 *     // Validate before creating
 *     const age = calculateAge(data.date_of_birth);
 *     if (age < 0 || age > 18) {
 *       toast.error('Child must be between 0 and 18 years old');
 *       return;
 *     }
 *
 *     createChild(data);
 *   };
 *
 *   return <ChildFormFields onSubmit={handleSubmit} />;
 * }
 * ```
 *
 * @example
 * Observing optimistic update behavior
 * ```tsx
 * function ChildrenListWithOptimisticUI() {
 *   const { data: children } = useChildren();
 *   const { mutate: createChild } = useCreateChild();
 *
 *   // Children list will show the new child immediately with temp ID
 *   // Then update with the real ID once the server responds
 *
 *   return (
 *     <div>
 *       <button onClick={() => createChild({
 *         first_name: 'New',
 *         last_name: 'Child',
 *         date_of_birth: '2020-06-15',
 *       })}>
 *         Add Child (Watch Optimistic Update!)
 *       </button>
 *
 *       <ul>
 *         {children?.map((child) => (
 *           <li key={child.id}>
 *             {child.first_name} {child.last_name}
 *             {child.id.startsWith('temp-') && ' (Saving...)'}
 *           </li>
 *         ))}
 *       </ul>
 *     </div>
 *   );
 * }
 * ```
 */
export function useCreateChild(options: UseCreateChildOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: (childData: CreateChildRequest) => childService.create(childData),

    onMutate: async (_newChild: CreateChildRequest): Promise<{ previousChildren: Child[] | undefined }> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.children.lists() });

      // Snapshot previous value
      const previousChildren = queryClient.getQueryData<Child[]>(
        queryKeys.children.lists()
      );

      // Optimistically update to the new value
      if (previousChildren) {
        const now = new Date().toISOString();
        queryClient.setQueryData<Child[]>(
          queryKeys.children.lists(),
          (old = []) => [
            ...old,
            {
              id: 'temp-' + Date.now(),
              user_id: '',
              ..._newChild,
              age: new Date().getFullYear() - new Date(_newChild.date_of_birth).getFullYear(),
              emergency_contacts: [],
              created_at: now,
              updated_at: now,
            } as Child,
          ]
        );
      }

      return { previousChildren };
    },

    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousChildren) {
        queryClient.setQueryData(
          queryKeys.children.lists(),
          context.previousChildren
        );
      }
      toast.error(error.message || 'Failed to create child');
    },

    onSuccess: (child) => {
      // Invalidate children lists
      cacheInvalidation.onChildMutation(queryClient, child.id);

      toast.success('Child created successfully!');
    },

    ...mutationOptions,
  });
}
