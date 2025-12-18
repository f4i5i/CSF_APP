/**
 * @file useLogin.ts
 * @description React Query mutation hook for user authentication and login.
 *
 * This hook wraps the authService.login() method and provides a fully-typed,
 * declarative interface for handling user login with automatic state management,
 * error handling, and cache invalidation.
 *
 * **Key Features:**
 * - Automatic loading and error states via React Query
 * - Type-safe mutation with TypeScript generics
 * - Automatic toast notifications for success/error states
 * - Cache invalidation for user data on successful login
 * - Extensible callback support (onSuccess, onError, onMutate)
 * - Integrates seamlessly with React Query's global cache
 *
 * **Cache Strategy:**
 * - On successful login, invalidates `queryKeys.users.me()` to trigger a fresh fetch
 * - This ensures the current user data is immediately updated across the app
 *
 * **Error Handling:**
 * - Displays user-friendly error messages via react-hot-toast
 * - Exposes structured error objects for custom handling
 *
 * @example
 * Basic usage in a login form component:
 * ```tsx
 * function LoginForm() {
 *   const { mutate: login, isPending, error } = useLogin();
 *   const navigate = useNavigate();
 *
 *   const handleSubmit = (e: FormEvent) => {
 *     e.preventDefault();
 *     login(
 *       { email: 'user@example.com', password: 'password123' },
 *       {
 *         onSuccess: (response) => {
 *           console.log('Logged in user:', response.user);
 *           navigate('/dashboard');
 *         }
 *       }
 *     );
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {isPending && <p>Logging in...</p>}
 *       {error && <p>Error: {error.message}</p>}
 *       <button type="submit" disabled={isPending}>Login</button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @example
 * Advanced usage with custom callbacks and error handling:
 * ```tsx
 * function AdvancedLoginForm() {
 *   const { mutate: login, isPending } = useLogin({
 *     mutationOptions: {
 *       onSuccess: (data) => {
 *         // Custom success handling
 *         analytics.track('user_login', { userId: data.user.id });
 *       },
 *       onError: (error) => {
 *         // Custom error handling
 *         if (error.status === 429) {
 *           console.error('Rate limit exceeded');
 *         }
 *       }
 *     }
 *   });
 *
 *   return <LoginFormUI onSubmit={login} isLoading={isPending} />;
 * }
 * ```
 *
 * @module hooks/auth
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import { queryKeys } from '../../constants/query-keys';
import type { LoginRequest, LoginResponse } from '../../types/auth.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Configuration options for the useLogin hook.
 *
 * @interface UseLoginOptions
 * @property {Object} [mutationOptions] - Additional React Query mutation options.
 *   Allows customization of the mutation behavior without overriding core functionality.
 *   Common options include onSuccess, onError, onMutate, and onSettled callbacks.
 */
interface UseLoginOptions {
  mutationOptions?: Omit<
    UseMutationOptions<LoginResponse, ApiErrorResponse, LoginRequest>,
    'mutationFn'
  >;
}

/**
 * React Query mutation hook for user login authentication.
 *
 * Handles the complete login flow including credential submission, response handling,
 * cache invalidation, and user feedback via toast notifications.
 *
 * **Mutation Flow:**
 * 1. User submits credentials via `mutate()` or `mutateAsync()`
 * 2. Hook calls `authService.login()` with the credentials
 * 3. On success:
 *    - Invalidates user cache (`queryKeys.users.me()`)
 *    - Displays success toast
 *    - Triggers custom onSuccess callback if provided
 * 4. On error:
 *    - Displays error toast with API error message
 *    - Triggers custom onError callback if provided
 *
 * **Return Values:**
 * @returns {Object} React Query mutation result object
 * @returns {Function} returns.mutate - Trigger the login mutation with credentials
 * @returns {Function} returns.mutateAsync - Async version that returns a promise
 * @returns {boolean} returns.isPending - True while the mutation is in progress
 * @returns {boolean} returns.isSuccess - True if the mutation succeeded
 * @returns {boolean} returns.isError - True if the mutation failed
 * @returns {LoginResponse|undefined} returns.data - The login response data (user + tokens)
 * @returns {ApiErrorResponse|null} returns.error - Error object if mutation failed
 * @returns {Function} returns.reset - Reset the mutation to idle state
 *
 * @param {UseLoginOptions} [options={}] - Configuration options for the hook
 * @param {Object} [options.mutationOptions] - React Query mutation options for custom callbacks
 *
 * @example
 * Simple login with navigation on success:
 * ```tsx
 * const { mutate: login, isPending } = useLogin();
 *
 * const handleLogin = (credentials: LoginRequest) => {
 *   login(credentials, {
 *     onSuccess: () => navigate('/dashboard')
 *   });
 * };
 * ```
 *
 * @example
 * Using async/await pattern:
 * ```tsx
 * const { mutateAsync: loginAsync } = useLogin();
 *
 * const handleLogin = async (credentials: LoginRequest) => {
 *   try {
 *     const response = await loginAsync(credentials);
 *     console.log('User:', response.user);
 *     navigate('/dashboard');
 *   } catch (error) {
 *     console.error('Login failed:', error);
 *   }
 * };
 * ```
 */
export function useLogin(options: UseLoginOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),

    onSuccess: async () => {
      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });

      toast.success('Welcome back!');
    },

    onError: (error: ApiErrorResponse) => {
      toast.error(error.message || 'Login failed');
    },

    ...mutationOptions,
  });
}
