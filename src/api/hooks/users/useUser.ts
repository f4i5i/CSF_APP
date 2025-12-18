/**
 * @file useUser.ts
 * @description React Query hook for fetching and managing the current authenticated user's profile data.
 *
 * This hook wraps the userService.getMe() method and provides a reactive interface for
 * accessing the current user's profile information with automatic caching, background
 * refetching, and state management.
 *
 * **Key Features:**
 * - Automatic caching with intelligent stale-time configuration
 * - Background refetching to keep user data fresh
 * - Loading and error states for UI feedback
 * - Type-safe user data with TypeScript
 * - Configurable query behavior (enabled/disabled)
 * - Integration with authentication state management
 * - No automatic retry on auth failures to prevent loops
 *
 * **Cache Strategy:**
 * - **Stale Time**: 5 minutes - Data is considered fresh for 5 minutes
 * - **GC Time**: 10 minutes - Unused data is garbage collected after 10 minutes
 * - **Query Key**: `queryKeys.users.me()` - Consistent key for cache invalidation
 * - **Retry**: Disabled - Prevents retry loops on authentication failures
 *
 * **Common Use Cases:**
 * - Displaying user profile information in headers/navigation
 * - Accessing current user data in components
 * - Authentication state management
 * - Conditional rendering based on user roles/permissions
 * - Protecting routes based on authentication status
 *
 * @example
 * Basic usage for displaying user profile:
 * ```tsx
 * function UserProfile() {
 *   const { data: user, isLoading, error } = useUser();
 *
 *   if (isLoading) return <div>Loading profile...</div>;
 *   if (error) return <div>Failed to load profile</div>;
 *   if (!user) return <div>Not authenticated</div>;
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user.first_name} {user.last_name}!</h1>
 *       <p>Email: {user.email}</p>
 *       <p>Role: {user.role}</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Conditional rendering based on authentication:
 * ```tsx
 * function DashboardHeader() {
 *   const { data: user, isLoading } = useUser();
 *
 *   return (
 *     <header>
 *       {isLoading ? (
 *         <Skeleton width={200} />
 *       ) : user ? (
 *         <UserMenu user={user} />
 *       ) : (
 *         <LoginButton />
 *       )}
 *     </header>
 *   );
 * }
 * ```
 *
 * @example
 * Disabled query until needed (lazy loading):
 * ```tsx
 * function OptionalUserProfile() {
 *   const [showProfile, setShowProfile] = useState(false);
 *   const { data: user } = useUser({
 *     enabled: showProfile, // Only fetch when showProfile is true
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={() => setShowProfile(true)}>
 *         Show Profile
 *       </button>
 *       {showProfile && user && <ProfileDetails user={user} />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Advanced usage with custom options:
 * ```tsx
 * function UserWithRefetch() {
 *   const { data: user, refetch, isRefetching } = useUser({
 *     queryOptions: {
 *       refetchOnWindowFocus: true, // Refetch when window regains focus
 *       onSuccess: (userData) => {
 *         // Track user data loaded
 *         analytics.identify(userData.id, {
 *           email: userData.email,
 *           name: `${userData.first_name} ${userData.last_name}`
 *         });
 *       },
 *       onError: (error) => {
 *         // Handle authentication errors
 *         if (error.status === 401) {
 *           console.log('User not authenticated');
 *         }
 *       }
 *     }
 *   });
 *
 *   return (
 *     <div>
 *       {user && <UserCard user={user} />}
 *       <button onClick={() => refetch()} disabled={isRefetching}>
 *         {isRefetching ? 'Refreshing...' : 'Refresh Profile'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @module hooks/users
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import { queryKeys } from '../../constants/query-keys';
import type { User } from '../../types/auth.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Configuration options for the useUser hook.
 *
 * @interface UseUserOptions
 * @property {boolean} [enabled=true] - Whether the query should execute automatically.
 *   Set to false to disable the query until manually triggered. Useful for conditional fetching.
 * @property {Object} [queryOptions] - Additional React Query options.
 *   Allows customization of caching, refetching, and callback behaviors.
 */
interface UseUserOptions {
  enabled?: boolean;
  queryOptions?: Omit<
    UseQueryOptions<User, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * React Query hook for fetching the current authenticated user's profile.
 *
 * This hook manages the user profile data with intelligent caching and automatic
 * background updates. It's the primary hook for accessing authentication state
 * and user information throughout the application.
 *
 * **Query Behavior:**
 * - Automatically fetches user data on mount (unless disabled)
 * - Caches data for 5 minutes before considering it stale
 * - Keeps unused data in cache for 10 minutes
 * - Does not retry on failure to prevent authentication loops
 * - Can be manually refetched or invalidated
 *
 * **Cache Invalidation:**
 * This query is automatically invalidated by:
 * - `useLogin` - After successful login
 * - `useRegister` - After successful registration
 * - `useUpdateUser` - After successful profile update
 *
 * **Return Values:**
 * @returns {Object} React Query query result object
 * @returns {User|undefined} returns.data - The current user's profile data
 * @returns {boolean} returns.isLoading - True on initial load (no cached data)
 * @returns {boolean} returns.isFetching - True whenever data is being fetched
 * @returns {boolean} returns.isSuccess - True if the query succeeded
 * @returns {boolean} returns.isError - True if the query failed
 * @returns {ApiErrorResponse|null} returns.error - Error object if query failed
 * @returns {Function} returns.refetch - Manually trigger a refetch
 * @returns {boolean} returns.isRefetching - True during a manual refetch
 * @returns {string} returns.status - Query status: 'pending', 'error', or 'success'
 *
 * @param {UseUserOptions} [options={}] - Configuration options for the hook
 * @param {boolean} [options.enabled=true] - Whether to automatically fetch user data
 * @param {Object} [options.queryOptions] - React Query options for custom behavior
 *
 * @example
 * Simple authentication check:
 * ```tsx
 * const { data: user, isLoading } = useUser();
 * const isAuthenticated = !!user && !isLoading;
 * ```
 *
 * @example
 * Role-based access control:
 * ```tsx
 * const { data: user } = useUser();
 * const isAdmin = user?.role === 'admin';
 *
 * if (!isAdmin) {
 *   return <Unauthorized />;
 * }
 * ```
 *
 * @example
 * Manual refetch with loading state:
 * ```tsx
 * const { data: user, refetch, isRefetching } = useUser();
 *
 * return (
 *   <button onClick={() => refetch()} disabled={isRefetching}>
 *     Refresh Profile
 *   </button>
 * );
 * ```
 */
export function useUser(options: UseUserOptions = {}) {
  const { enabled = true, queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: userService.getMe,
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry on auth failure
    ...queryOptions,
  });
}
