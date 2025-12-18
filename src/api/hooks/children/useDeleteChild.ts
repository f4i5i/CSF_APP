/**
 * @file useDeleteChild Hook - React Query mutation hook for deleting a child
 *
 * This hook implements the React Query mutation pattern for delete operations:
 * - Uses `useMutation` for DELETE operations (remove)
 * - Handles automatic cache invalidation to remove deleted data
 * - Invalidates related queries (enrollments, etc.)
 * - Integrates with toast notifications for user feedback
 *
 * @module hooks/children/useDeleteChild
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { childService } from '../../services/child.service';
import { queryKeys } from '../../constants/query-keys';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Configuration options for the useDeleteChild hook
 *
 * @interface UseDeleteChildOptions
 * @property {UseMutationOptions} [mutationOptions] - Additional React Query mutation options
 */
interface UseDeleteChildOptions {
  mutationOptions?: Omit<
    UseMutationOptions<{ message: string }, ApiErrorResponse, string>,
    'mutationFn'
  >;
}

/**
 * React Query mutation hook to delete a child
 *
 * This hook uses `useMutation` to delete a child and manage cache cleanup. It implements:
 *
 * **Cache Management:**
 * - Does NOT perform optimistic updates (deletion is final)
 * - Waits for server confirmation before updating the cache
 * - On success: Invalidates all related queries to remove stale data
 * - Removes the child from list views and detail views
 *
 * **Mutation Key:** Not explicitly set (uses default mutation behavior)
 *
 * **Cache Invalidation on Success:**
 * - Invalidates all children list queries: `['children', 'list']`
 * - Invalidates the specific child detail query: `['children', 'detail', childId]`
 * - Invalidates child's enrollments: `['enrollments', 'by-child', childId]`
 * - Ensures deleted child is removed from all views immediately
 * - Related components will automatically refetch their data
 *
 * **Error Handling:**
 * - No rollback needed (no optimistic updates)
 * - Displays error toast notification with the error message
 * - Allows the user to retry the deletion
 *
 * **Important Notes:**
 * - Deletion is permanent and cannot be undone
 * - Always confirm with the user before calling this mutation
 * - Consider soft deletes (marking as inactive) as an alternative
 * - Cascading deletes may affect related data (enrollments, etc.)
 *
 * @param {UseDeleteChildOptions} [options={}] - Configuration options for the hook
 * @param {UseMutationOptions} [options.mutationOptions] - Additional React Query mutation options
 *
 * @returns {UseMutationResult<{message: string}, ApiErrorResponse, string>} React Query mutation result containing:
 * - `mutate`: Function to trigger the mutation
 * - `mutateAsync`: Promise-based version of mutate
 * - `isPending`: True while the mutation is in progress
 * - `isError`: True if the mutation resulted in an error
 * - `isSuccess`: True if the mutation completed successfully
 * - `error`: The error object if an error occurred
 * - `data`: Success message from the server (undefined until success)
 * - `reset`: Function to reset the mutation state
 *
 * @example
 * Basic usage - Delete with confirmation
 * ```tsx
 * function DeleteChildButton({ childId, childName }: Props) {
 *   const { mutate: deleteChild, isPending } = useDeleteChild();
 *
 *   const handleDelete = () => {
 *     if (window.confirm(`Are you sure you want to delete ${childName}? This action cannot be undone.`)) {
 *       deleteChild(childId);
 *     }
 *   };
 *
 *   return (
 *     <button
 *       onClick={handleDelete}
 *       disabled={isPending}
 *       className="btn-danger"
 *     >
 *       {isPending ? 'Deleting...' : 'Delete Child'}
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * With custom confirmation modal
 * ```tsx
 * function DeleteChildWithModal({ child }: { child: Child }) {
 *   const [showConfirm, setShowConfirm] = useState(false);
 *   const { mutate: deleteChild, isPending } = useDeleteChild();
 *
 *   const handleConfirmDelete = () => {
 *     deleteChild(child.id);
 *     setShowConfirm(false);
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={() => setShowConfirm(true)}>Delete</button>
 *
 *       {showConfirm && (
 *         <ConfirmDialog
 *           title="Delete Child"
 *           message={`Are you sure you want to delete ${child.first_name} ${child.last_name}?`}
 *           confirmLabel="Delete"
 *           onConfirm={handleConfirmDelete}
 *           onCancel={() => setShowConfirm(false)}
 *           isLoading={isPending}
 *           variant="danger"
 *         />
 *       )}
 *     </>
 *   );
 * }
 * ```
 *
 * @example
 * With async/await and navigation
 * ```tsx
 * function ChildDetailPage({ childId }: { childId: string }) {
 *   const navigate = useNavigate();
 *   const { mutateAsync: deleteChild, isPending } = useDeleteChild();
 *
 *   const handleDelete = async () => {
 *     if (!window.confirm('Delete this child?')) return;
 *
 *     try {
 *       await deleteChild(childId);
 *       console.log('Child deleted successfully');
 *       navigate('/children'); // Redirect to children list
 *     } catch (error) {
 *       console.error('Failed to delete:', error);
 *       // Error is already shown in toast
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <ChildDetails childId={childId} />
 *       <button onClick={handleDelete} disabled={isPending}>
 *         Delete Child
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Bulk delete - Delete multiple children
 * ```tsx
 * function BulkDeleteChildren({ childIds }: { childIds: string[] }) {
 *   const { mutateAsync: deleteChild } = useDeleteChild();
 *   const [deleting, setDeleting] = useState(false);
 *
 *   const handleBulkDelete = async () => {
 *     if (!window.confirm(`Delete ${childIds.length} children?`)) return;
 *
 *     setDeleting(true);
 *     try {
 *       // Delete children sequentially
 *       for (const id of childIds) {
 *         await deleteChild(id);
 *       }
 *       toast.success('All children deleted successfully');
 *     } catch (error) {
 *       toast.error('Some deletions failed');
 *     } finally {
 *       setDeleting(false);
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleBulkDelete} disabled={deleting}>
 *       {deleting ? 'Deleting...' : `Delete ${childIds.length} Children`}
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * With custom success callback
 * ```tsx
 * function ChildListItem({ child }: { child: Child }) {
 *   const { mutate: deleteChild, isPending } = useDeleteChild({
 *     mutationOptions: {
 *       onSuccess: () => {
 *         console.log('Child deleted:', child.id);
 *         // Custom analytics tracking
 *         analytics.track('child_deleted', { childId: child.id });
 *       },
 *       onError: (error) => {
 *         console.error('Delete failed:', error);
 *       },
 *     },
 *   });
 *
 *   return (
 *     <div className="child-item">
 *       <span>{child.first_name} {child.last_name}</span>
 *       <button
 *         onClick={() => {
 *           if (confirm('Delete?')) deleteChild(child.id);
 *         }}
 *         disabled={isPending}
 *       >
 *         {isPending ? '...' : 'Delete'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Delete with undo option (soft delete alternative)
 * ```tsx
 * function ChildCardWithUndo({ child }: { child: Child }) {
 *   const [isDeleted, setIsDeleted] = useState(false);
 *   const { mutate: deleteChild } = useDeleteChild();
 *   const timeoutRef = useRef<NodeJS.Timeout>();
 *
 *   const handleDelete = () => {
 *     setIsDeleted(true);
 *
 *     // Give user 5 seconds to undo
 *     timeoutRef.current = setTimeout(() => {
 *       deleteChild(child.id); // Actually delete after timeout
 *     }, 5000);
 *   };
 *
 *   const handleUndo = () => {
 *     if (timeoutRef.current) {
 *       clearTimeout(timeoutRef.current);
 *       setIsDeleted(false);
 *     }
 *   };
 *
 *   if (isDeleted) {
 *     return (
 *       <div className="deleted-notice">
 *         Child will be deleted...
 *         <button onClick={handleUndo}>Undo</button>
 *       </div>
 *     );
 *   }
 *
 *   return (
 *     <div>
 *       <ChildCard child={child} />
 *       <button onClick={handleDelete}>Delete</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Delete with loading state and error display
 * ```tsx
 * function ChildManagementRow({ child }: { child: Child }) {
 *   const { mutate: deleteChild, isPending, isError, error } = useDeleteChild();
 *
 *   return (
 *     <tr>
 *       <td>{child.first_name} {child.last_name}</td>
 *       <td>
 *         {isPending && <Spinner size="sm" />}
 *         {isError && <span className="error">{error?.message}</span>}
 *         <button
 *           onClick={() => {
 *             if (confirm('Delete this child?')) {
 *               deleteChild(child.id);
 *             }
 *           }}
 *           disabled={isPending}
 *         >
 *           Delete
 *         </button>
 *       </td>
 *     </tr>
 *   );
 * }
 * ```
 */
export function useDeleteChild(options: UseDeleteChildOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: (childId: string) => childService.delete(childId),

    onSuccess: (_data, childId) => {
      // Invalidate all children queries
      queryClient.invalidateQueries({ queryKey: queryKeys.children.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.children.detail(childId) });

      // Also invalidate enrollments for this child
      queryClient.invalidateQueries({ queryKey: queryKeys.enrollments.byChild(childId) });

      toast.success('Child deleted successfully');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to delete child');
    },

    ...mutationOptions,
  });
}
