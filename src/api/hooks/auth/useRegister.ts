/**
 * @file useRegister.ts
 * @description React Query mutation hook for user registration and account creation.
 *
 * This hook wraps the authService.register() method and provides a complete registration
 * flow with automatic authentication, state management, and user feedback.
 *
 * **Key Features:**
 * - Automatic loading and error states via React Query
 * - Type-safe mutation with TypeScript generics
 * - Automatic toast notifications for success/error feedback
 * - Cache invalidation for user data on successful registration
 * - Immediate user authentication after registration
 * - Extensible callback support (onSuccess, onError, onMutate)
 * - Form validation error handling
 *
 * **Authentication Flow:**
 * - On successful registration, the user is automatically logged in
 * - Returns a LoginResponse containing user data and authentication tokens
 * - Invalidates `queryKeys.users.me()` to trigger fresh user data fetch
 *
 * **Cache Strategy:**
 * - Invalidates user cache after successful registration
 * - Ensures the newly created user data is fetched and cached
 * - Provides immediate access to authenticated user state
 *
 * **Error Handling:**
 * - Displays user-friendly error messages via react-hot-toast
 * - Handles validation errors from the API
 * - Exposes structured error objects for custom form field errors
 *
 * @example
 * Basic usage in a registration form:
 * ```tsx
 * function RegisterForm() {
 *   const { mutate: register, isPending, error } = useRegister();
 *   const navigate = useNavigate();
 *
 *   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
 *     e.preventDefault();
 *     const formData = new FormData(e.currentTarget);
 *
 *     register(
 *       {
 *         email: formData.get('email') as string,
 *         password: formData.get('password') as string,
 *         first_name: formData.get('firstName') as string,
 *         last_name: formData.get('lastName') as string,
 *       },
 *       {
 *         onSuccess: (response) => {
 *           console.log('Registered user:', response.user);
 *           navigate('/dashboard');
 *         }
 *       }
 *     );
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       {isPending && <p>Creating account...</p>}
 *       {error && <p className="error">{error.message}</p>}
 *       <button type="submit" disabled={isPending}>Register</button>
 *     </form>
 *   );
 * }
 * ```
 *
 * @example
 * Advanced usage with form library and error handling:
 * ```tsx
 * function AdvancedRegisterForm() {
 *   const { mutate: register, isPending } = useRegister({
 *     mutationOptions: {
 *       onSuccess: (data) => {
 *         // Track registration event
 *         analytics.track('user_registered', {
 *           userId: data.user.id,
 *           email: data.user.email
 *         });
 *         navigate('/onboarding');
 *       },
 *       onError: (error) => {
 *         // Handle specific error cases
 *         if (error.status === 409) {
 *           setFormError('email', 'Email already registered');
 *         }
 *       }
 *     }
 *   });
 *
 *   return <RegistrationFormUI onSubmit={register} isLoading={isPending} />;
 * }
 * ```
 *
 * @example
 * Registration with async/await pattern:
 * ```tsx
 * function RegisterWithAsync() {
 *   const { mutateAsync: registerAsync } = useRegister();
 *
 *   const handleRegister = async (userData: RegisterRequest) => {
 *     try {
 *       const response = await registerAsync(userData);
 *       // Registration successful and user is logged in
 *       await loadUserPreferences(response.user.id);
 *       navigate('/dashboard');
 *     } catch (error) {
 *       console.error('Registration failed:', error);
 *     }
 *   };
 *
 *   return <RegisterForm onSubmit={handleRegister} />;
 * }
 * ```
 *
 * @module hooks/auth
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authService } from '../../services/auth.service';
import { queryKeys } from '../../constants/query-keys';
import type { RegisterRequest, LoginResponse } from '../../types/auth.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Configuration options for the useRegister hook.
 *
 * @interface UseRegisterOptions
 * @property {Object} [mutationOptions] - Additional React Query mutation options.
 *   Allows customization of the mutation behavior without overriding core functionality.
 *   Common options include onSuccess, onError, onMutate, and onSettled callbacks.
 */
interface UseRegisterOptions {
  mutationOptions?: Omit<
    UseMutationOptions<LoginResponse, ApiErrorResponse, RegisterRequest>,
    'mutationFn'
  >;
}

/**
 * React Query mutation hook for user registration.
 *
 * Handles the complete registration flow including user creation, automatic authentication,
 * cache invalidation, and user feedback via toast notifications.
 *
 * **Mutation Flow:**
 * 1. User submits registration data via `mutate()` or `mutateAsync()`
 * 2. Hook calls `authService.register()` with the user data
 * 3. On success:
 *    - User is automatically logged in (receives auth tokens)
 *    - Invalidates user cache (`queryKeys.users.me()`)
 *    - Displays success toast notification
 *    - Triggers custom onSuccess callback if provided
 * 4. On error:
 *    - Displays error toast with API error message
 *    - Handles validation errors (e.g., duplicate email)
 *    - Triggers custom onError callback if provided
 *
 * **Return Values:**
 * @returns {Object} React Query mutation result object
 * @returns {Function} returns.mutate - Trigger the registration mutation with user data
 * @returns {Function} returns.mutateAsync - Async version that returns a promise
 * @returns {boolean} returns.isPending - True while the mutation is in progress
 * @returns {boolean} returns.isSuccess - True if the mutation succeeded
 * @returns {boolean} returns.isError - True if the mutation failed
 * @returns {LoginResponse|undefined} returns.data - The registration response (user + tokens)
 * @returns {ApiErrorResponse|null} returns.error - Error object if mutation failed
 * @returns {Function} returns.reset - Reset the mutation to idle state
 *
 * @param {UseRegisterOptions} [options={}] - Configuration options for the hook
 * @param {Object} [options.mutationOptions] - React Query mutation options for custom callbacks
 *
 * @example
 * Simple registration with navigation:
 * ```tsx
 * const { mutate: register, isPending } = useRegister();
 *
 * const handleRegister = (userData: RegisterRequest) => {
 *   register(userData, {
 *     onSuccess: () => navigate('/dashboard')
 *   });
 * };
 * ```
 *
 * @example
 * Registration with validation error handling:
 * ```tsx
 * const { mutate: register, error } = useRegister();
 *
 * const handleRegister = (userData: RegisterRequest) => {
 *   register(userData, {
 *     onError: (err) => {
 *       if (err.status === 409) {
 *         showFieldError('email', 'Email already exists');
 *       }
 *     }
 *   });
 * };
 * ```
 */
export function useRegister(options: UseRegisterOptions = {}) {
  const queryClient = useQueryClient();
  const { mutationOptions } = options;

  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),

    onSuccess: async () => {
      // Invalidate and refetch user data
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });

      toast.success('Account created successfully!');
    },

    onError: (error: ApiErrorResponse) => {
      toast.error(error.message || 'Registration failed');
    },

    ...mutationOptions,
  });
}
