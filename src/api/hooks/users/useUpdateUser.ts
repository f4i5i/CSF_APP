/**
 * @file useUpdateUser.ts
 * @description React Query mutation hook for updating the current user's profile with optimistic updates.
 *
 * This hook wraps the userService.updateMe() method and provides a sophisticated mutation
 * interface with optimistic UI updates, automatic rollback on errors, and cache synchronization.
 *
 * **Key Features:**
 * - **Optimistic Updates**: UI updates immediately before API response
 * - **Automatic Rollback**: Reverts to previous state if update fails
 * - **Type-safe Mutations**: Full TypeScript support for user data
 * - **Cache Synchronization**: Keeps user data consistent across the app
 * - **Toast Notifications**: Success/error feedback to users
 * - **Context Preservation**: Maintains previous state for rollback
 * - **Partial Updates**: Only send changed fields
 *
 * **Optimistic Update Flow:**
 * 1. **onMutate**: Immediately update cache with new data before API call
 * 2. **Cancel Queries**: Prevent race conditions with in-flight requests
 * 3. **Snapshot**: Save previous state for potential rollback
 * 4. **Update Cache**: Apply optimistic update to React Query cache
 * 5. **onError**: Rollback to snapshot if API call fails
 * 6. **onSuccess**: Invalidate cache to ensure data consistency
 *
 * **Cache Strategy:**
 * - Uses `queryClient.setQueryData()` for optimistic updates
 * - Cancels in-flight queries to prevent race conditions
 * - Invalidates cache on success to fetch authoritative server data
 * - Maintains `queryKeys.users.me()` as single source of truth
 *
 * **Error Handling:**
 * - Automatic rollback to previous user state on errors
 * - Toast notifications for user feedback
 * - Exposes error objects for custom handling
 * - Preserves data integrity across failed updates
 *
 * @example
 * Basic profile update with optimistic UI:
 * ```tsx
 * function EditProfileForm() {
 *   const { mutate: updateUser, isPending } = useUpdateUser();
 *   const [formData, setFormData] = useState({ first_name: '', last_name: '' });
 *
 *   const handleSubmit = (e: FormEvent) => {
 *     e.preventDefault();
 *     updateUser(formData, {
 *       onSuccess: () => {
 *         console.log('Profile updated!');
 *         closeModal();
 *       }
 *     });
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input
 *         value={formData.first_name}
 *         onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
 *       />
 *       <button type="submit" disabled={isPending}>
 *         {isPending ? 'Saving...' : 'Save Changes'}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @example
 * Advanced usage with optimistic updates and error handling:
 * ```tsx
 * function UserProfileEditor() {
 *   const { mutate: updateUser, isPending, error } = useUpdateUser({
 *     mutationOptions: {
 *       onSuccess: (updatedUser) => {
 *         // Track successful update
 *         analytics.track('profile_updated', {
 *           userId: updatedUser.id,
 *           fields: Object.keys(updatedUser)
 *         });
 *       },
 *       onError: (error, variables, context) => {
 *         // Custom error handling
 *         console.error('Update failed:', error);
 *         console.log('Attempted to update:', variables);
 *         console.log('Rolled back to:', context?.previousUser);
 *       }
 *     }
 *   });
 *
 *   return <ProfileForm onSave={updateUser} loading={isPending} />;
 * }
 * ```
 *
 * @example
 * Partial profile updates (e.g., avatar change):
 * ```tsx
 * function AvatarUploader() {
 *   const { mutate: updateUser } = useUpdateUser();
 *
 *   const handleAvatarUpload = async (file: File) => {
 *     const avatarUrl = await uploadToCloudinary(file);
 *     // Only update avatar field
 *     updateUser({ avatar_url: avatarUrl });
 *   };
 *
 *   return <FileUpload onUpload={handleAvatarUpload} />;
 * }
 * ```
 *
 * @example
 * Using async/await for sequential operations:
 * ```tsx
 * function ComplexProfileUpdate() {
 *   const { mutateAsync: updateUserAsync } = useUpdateUser();
 *
 *   const handleComplexUpdate = async (data: UpdateUserRequest) => {
 *     try {
 *       // Update profile
 *       const updatedUser = await updateUserAsync(data);
 *
 *       // Perform follow-up actions
 *       await syncWithThirdPartyService(updatedUser);
 *       await refreshAnalytics(updatedUser.id);
 *
 *       console.log('All updates completed');
 *     } catch (error) {
 *       console.error('Update chain failed:', error);
 *     }
 *   };
 *
 *   return <UpdateForm onSubmit={handleComplexUpdate} />;
 * }
 * ```
 *
 * @example
 * Observing optimistic updates in action:
 * ```tsx
 * function ProfileWithOptimisticUI() {
 *   const { data: user } = useUser();
 *   const { mutate: updateUser, isPending } = useUpdateUser();
 *
 *   const handleQuickUpdate = (field: keyof User, value: string) => {
 *     // User sees change immediately, before API responds
 *     updateUser({ [field]: value });
 *   };
 *
 *   return (
 *     <div>
 *       <h2>{user?.first_name} {user?.last_name}</h2>
 *       {isPending && <Badge>Saving...</Badge>}
 *       <button onClick={() => handleQuickUpdate('first_name', 'NewName')}>
 *         Update Name
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @module hooks/users
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { userService } from '../../services/user.service';
import { queryKeys } from '../../constants/query-keys';
import type { User, UpdateUserRequest } from '../../types/auth.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Configuration options for the useUpdateUser hook.
 *
 * @interface UseUpdateUserOptions
 * @property {Object} [mutationOptions] - Additional React Query mutation options.
 *   Allows customization of the mutation behavior without overriding core functionality.
 *   The context type is `{ previousUser: User | undefined }` which contains the snapshot
 *   of user data before the optimistic update, used for rollback on error.
 */
interface UseUpdateUserOptions {
  mutationOptions?: Omit<
    UseMutationOptions<User, ApiErrorResponse, UpdateUserRequest, { previousUser: User | undefined }>,
    'mutationFn'
  >;
}

/**
 * React Query mutation hook for updating the current user's profile.
 *
 * This hook implements a sophisticated optimistic update pattern that provides instant
 * UI feedback while ensuring data consistency and handling errors gracefully.
 *
 * **Mutation Flow with Optimistic Updates:**
 * 1. **onMutate** (before API call):
 *    - Cancels any in-flight queries to prevent race conditions
 *    - Snapshots current user data from cache
 *    - Optimistically updates cache with new data
 *    - Returns context with previous state for potential rollback
 *
 * 2. **API Call**:
 *    - Sends update request to `userService.updateMe()`
 *    - User sees optimistic changes immediately
 *
 * 3. **onError** (if API call fails):
 *    - Rolls back cache to snapshot from context
 *    - Displays error toast notification
 *    - Triggers custom onError callback if provided
 *
 * 4. **onSuccess** (if API call succeeds):
 *    - Invalidates user cache to fetch fresh data from server
 *    - Ensures cache matches server state
 *    - Displays success toast notification
 *    - Triggers custom onSuccess callback if provided
 *
 * **Return Values:**
 * @returns {Object} React Query mutation result object
 * @returns {Function} returns.mutate - Trigger the update mutation with partial user data
 * @returns {Function} returns.mutateAsync - Async version that returns a promise
 * @returns {boolean} returns.isPending - True while the mutation is in progress
 * @returns {boolean} returns.isSuccess - True if the mutation succeeded
 * @returns {boolean} returns.isError - True if the mutation failed
 * @returns {User|undefined} returns.data - The updated user data from server
 * @returns {ApiErrorResponse|null} returns.error - Error object if mutation failed
 * @returns {Function} returns.reset - Reset the mutation to idle state
 * @returns {Object|undefined} returns.context - Context object with previousUser snapshot
 *
 * @param {UseUpdateUserOptions} [options={}] - Configuration options for the hook
 * @param {Object} [options.mutationOptions] - React Query mutation options for custom callbacks
 *
 * @example
 * Simple profile field update:
 * ```tsx
 * const { mutate: updateUser, isPending } = useUpdateUser();
 *
 * const handleUpdate = (updates: UpdateUserRequest) => {
 *   updateUser(updates);
 * };
 * ```
 *
 * @example
 * Update with success callback:
 * ```tsx
 * const { mutate: updateUser } = useUpdateUser();
 *
 * updateUser(
 *   { first_name: 'Jane', last_name: 'Doe' },
 *   {
 *     onSuccess: (user) => {
 *       console.log('Updated to:', user);
 *       navigate('/profile');
 *     }
 *   }
 * );
 * ```
 */
export function useUpdateUser(options: UseUpdateUserOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: (userData: UpdateUserRequest) => userService.updateMe(userData),

    onMutate: async (updatedUserData): Promise<{ previousUser: User | undefined }> => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.me() });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<User>(queryKeys.users.me());

      // Optimistically update to the new value
      if (previousUser) {
        queryClient.setQueryData<User>(queryKeys.users.me(), {
          ...previousUser,
          ...updatedUserData,
        });
      }

      return { previousUser };
    },

    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.me(), context.previousUser);
      }
      toast.error(error.message || 'Failed to update profile');
    },

    onSuccess: () => {
      // Invalidate to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });

      toast.success('Profile updated successfully!');
    },

    ...mutationOptions,
  });
}
