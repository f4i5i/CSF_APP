/**
 * @file useLogout.ts
 * @description React Query mutation hook for user logout and session termination.
 *
 * This hook wraps the authService.logout() method and handles the complete logout
 * process including cache clearing, user feedback, and application state reset.
 *
 * **Key Features:**
 * - Automatic loading states during logout process
 * - Complete cache invalidation on logout
 * - Automatic redirect to login page after logout
 * - Toast notifications for success/error feedback
 * - Guaranteed cleanup via onSettled callback
 * - Type-safe mutation with TypeScript
 *
 * **Cache Strategy:**
 * - Uses `queryClient.clear()` to remove ALL cached data from React Query
 * - This prevents any stale user data from persisting after logout
 * - Ensures a clean state for the next user session
 *
 * **Redirect Behavior:**
 * - Always redirects to /login page after logout (success or failure)
 * - Uses `window.location.href` for hard navigation to ensure full state reset
 * - Occurs in onSettled callback to guarantee execution regardless of API response
 *
 * **Error Handling:**
 * - Displays error messages if logout API call fails
 * - Still clears cache and redirects even on error
 * - Ensures user is always logged out from the client perspective
 *
 * @example
 * Basic usage in a navigation component:
 * ```tsx
 * function UserMenu() {
 *   const { mutate: logout, isPending } = useLogout();
 *
 *   return (
 *     <button onClick={() => logout()} disabled={isPending}>
 *       {isPending ? 'Logging out...' : 'Logout'}
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * Advanced usage with custom cleanup and analytics:
 * ```tsx
 * function LogoutButton() {
 *   const { mutate: logout } = useLogout({
 *     mutationOptions: {
 *       onMutate: () => {
 *         // Track logout event before API call
 *         analytics.track('user_logout_initiated');
 *       },
 *       onSuccess: () => {
 *         // Custom cleanup on successful logout
 *         localStorage.removeItem('preferences');
 *         sessionStorage.clear();
 *       },
 *       onError: (error) => {
 *         // Log errors but don't prevent logout
 *         console.error('Logout API error:', error);
 *       }
 *     }
 *   });
 *
 *   return <button onClick={() => logout()}>Sign Out</button>;
 * }
 * ```
 *
 * @example
 * Logout with confirmation dialog:
 * ```tsx
 * function LogoutWithConfirmation() {
 *   const { mutate: logout, isPending } = useLogout();
 *
 *   const handleLogout = () => {
 *     if (confirm('Are you sure you want to logout?')) {
 *       logout();
 *     }
 *   };
 *
 *   return (
 *     <button onClick={handleLogout} disabled={isPending}>
 *       Logout
 *     </button>
 *   );
 * }
 * ```
 *
 * @module hooks/auth
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Configuration options for the useLogout hook.
 *
 * @interface UseLogoutOptions
 * @property {Object} [mutationOptions] - Additional React Query mutation options.
 *   Allows customization of the mutation behavior without overriding core functionality.
 *   Common options include onSuccess, onError, onMutate, and onSettled callbacks.
 *   Note: The built-in onSettled always executes cache clearing and redirect.
 */
interface UseLogoutOptions {
  mutationOptions?: Omit<
    UseMutationOptions<void, ApiErrorResponse, void>,
    'mutationFn'
  >;
}

/**
 * React Query mutation hook for user logout.
 *
 * Handles the complete logout flow including API call, cache clearing, user feedback,
 * and redirect to login page. The logout process always completes client-side cleanup
 * even if the API call fails.
 *
 * **Mutation Flow:**
 * 1. User triggers logout via `mutate()`
 * 2. Hook calls `authService.logout()` to invalidate server session
 * 3. On success:
 *    - Displays success toast notification
 *    - Triggers custom onSuccess callback if provided
 * 4. On error:
 *    - Displays error toast with API error message
 *    - Triggers custom onError callback if provided
 * 5. On settled (always, regardless of success/error):
 *    - Clears entire React Query cache
 *    - Redirects to /login page
 *
 * **Return Values:**
 * @returns {Object} React Query mutation result object
 * @returns {Function} returns.mutate - Trigger the logout mutation
 * @returns {Function} returns.mutateAsync - Async version that returns a promise
 * @returns {boolean} returns.isPending - True while the mutation is in progress
 * @returns {boolean} returns.isSuccess - True if the logout API call succeeded
 * @returns {boolean} returns.isError - True if the logout API call failed
 * @returns {ApiErrorResponse|null} returns.error - Error object if mutation failed
 * @returns {Function} returns.reset - Reset the mutation to idle state
 *
 * @param {UseLogoutOptions} [options={}] - Configuration options for the hook
 * @param {Object} [options.mutationOptions] - React Query mutation options for custom callbacks
 *
 * @example
 * Simple logout button:
 * ```tsx
 * const { mutate: logout, isPending } = useLogout();
 *
 * return (
 *   <button onClick={() => logout()} disabled={isPending}>
 *     Logout
 *   </button>
 * );
 * ```
 *
 * @example
 * Logout with custom cleanup:
 * ```tsx
 * const { mutate: logout } = useLogout({
 *   mutationOptions: {
 *     onSuccess: () => {
 *       // Clear custom app state
 *       clearUserPreferences();
 *       analytics.track('logout_success');
 *     }
 *   }
 * });
 * ```
 */
export function useLogout(options: UseLogoutOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: () => authService.logout(),

    onSuccess: () => {
      toast.success('Logged out successfully');
    },

    onError: (error: ApiErrorResponse) => {
      toast.error(error.message || 'Logout failed');
    },

    onSettled: () => {
      // Clear all cached data and force redirect regardless of success
      queryClient.clear();
      window.location.href = '/login';
    },

    ...mutationOptions,
  });
}
