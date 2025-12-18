/**
 * @file auth.js
 * @description Authentication context provider for the CSF application.
 *
 * This module provides centralized authentication state management using React Context API.
 * It handles user login, registration, logout, and session restoration across the entire application.
 *
 * Key Features:
 * - User authentication state (user object, loading state)
 * - Login with email/password
 * - Login with Google OAuth
 * - User registration
 * - Logout with session cleanup
 * - Automatic session restoration on app load
 * - Profile update functionality
 * - Toast notifications for auth actions
 * - Centralized error handling
 *
 * Authentication Flow:
 * 1. On app load: Check localStorage for JWT token
 * 2. If token exists: Fetch user data from /users/me endpoint
 * 3. If successful: Set user state and mark as authenticated
 * 4. If failed: Clear auth data and redirect to login
 *
 * State Management:
 * - user: User object (null when not authenticated)
 * - loading: Boolean indicating auth initialization in progress
 *
 * Methods Provided:
 * - login(email, password): Authenticate with credentials
 * - loginWithGoogle(credential): Authenticate with Google OAuth
 * - register(userData): Create new user account
 * - logout(): Clear auth state and redirect to login
 * - updateUser(userData): Update user profile in context
 *
 * Usage:
 * ```jsx
 * import { useAuth } from '@/context/auth';
 *
 * function MyComponent() {
 *   const { user, login, logout, loading } = useAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *   if (!user) return <div>Please login</div>;
 *
 *   return <div>Welcome {user.first_name}!</div>;
 * }
 * ```
 *
 * @requires react
 * @requires ../api/services/auth.service
 * @requires ../api/services/users.service
 * @requires react-hot-toast
 * @requires ../lib/errorHandler
 */

// ========================================
// IMPORTS
// ========================================
import { createContext, useContext, useState, useEffect } from "react";
import authService from "../api/services/auth.service";
import usersService from "../api/services/users.service";
import toast from 'react-hot-toast';
import { getErrorMessage } from "../lib/errorHandler";

// ========================================
// CONTEXT CREATION
// ========================================

/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the component tree
 * Initial value is null, actual value provided by AuthProvider
 */
const AuthContext = createContext(null);

// ========================================
// AUTH PROVIDER COMPONENT
// ========================================

/**
 * AuthProvider Component
 *
 * Wraps the application to provide authentication state and methods to all child components.
 * Automatically restores user session on mount if valid JWT token exists in localStorage.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 *
 * @returns {JSX.Element} Context provider with auth state and methods
 *
 * @example
 * // Wrap your app with AuthProvider
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export const AuthProvider = (props) => {
  // ========================================
  // STATE
  // ========================================

  /**
   * User state
   * - null: Not authenticated
   * - Object: Authenticated user data
   *
   * User object structure:
   * {
   *   id: string,
   *   email: string,
   *   first_name: string,
   *   last_name: string,
   *   role: string (parent, coach, admin),
   *   phone: string,
   *   created_at: string,
   *   updated_at: string
   * }
   */
  const [user, setUser] = useState(null);

  /**
   * Loading state
   * - true: Auth initialization in progress
   * - false: Auth initialization complete
   *
   * Used to show loading spinner on app startup while checking for existing session
   */
  const [loading, setLoading] = useState(true);

  // ========================================
  // SESSION RESTORATION
  // ========================================

  /**
   * Initialize authentication on component mount
   *
   * Checks if user has valid JWT token in localStorage
   * If token exists, attempts to fetch user data from API
   * If successful, user is automatically logged in
   * If failed (token invalid/expired), auth data is cleared
   *
   * Flow:
   * 1. Check localStorage for JWT token (via authService.isAuthenticated())
   * 2. If token exists:
   *    a. Call /users/me endpoint to fetch user data
   *    b. On success: Set user state (user is logged in)
   *    c. On error: Clear auth data (token invalid/expired)
   * 3. Set loading to false (initialization complete)
   *
   * This effect runs only once on mount (empty dependency array)
   */
  useEffect(() => {
    const initAuth = async () => {
      // Check if JWT token exists in localStorage
      if (authService.isAuthenticated()) {
        try {
          // Fetch current user data from API
          const userData = await usersService.getMe();
          setUser(userData);
        } catch (error) {
          // Token invalid or expired - clear auth data
          authService.logout();
          setUser(null);
        }
      }
      // Mark auth initialization as complete
      setLoading(false);
    };

    initAuth();
  }, []); // Run only once on mount

  // ========================================
  // AUTHENTICATION METHODS
  // ========================================

  /**
   * Login with email and password
   *
   * Authenticates user with email/password credentials
   * On success, stores JWT tokens and fetches user data
   *
   * @param {string} email - User email address
   * @param {string} password - User password
   * @returns {Promise<Object>} User data object
   * @throws {Error} If login fails (invalid credentials, network error, etc.)
   *
   * @example
   * const { login } = useAuth();
   *
   * try {
   *   const userData = await login('user@example.com', 'password123');
   *   console.log('Logged in as:', userData.first_name);
   * } catch (error) {
   *   console.error('Login failed:', error);
   * }
   */
  const login = async (email, password) => {
    try {
      // Call login API - stores JWT tokens in localStorage
      await authService.login(email, password);

      // Fetch user data from /users/me endpoint
      const userData = await usersService.getMe();
      setUser(userData);

      // Show success notification
      toast.success('Welcome back!');
      return userData;
    } catch (error) {
      // Transform error to user-friendly message
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg);
      throw error;
    }
  };

  /**
   * Register new user
   *
   * Creates a new user account with provided data
   * On success, automatically logs in the new user
   *
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.first_name - User first name
   * @param {string} userData.last_name - User last name
   * @param {string} userData.phone - User phone number
   * @param {string} [userData.role] - User role (defaults to 'parent')
   * @returns {Promise<Object>} Created user data object
   * @throws {Error} If registration fails (email exists, validation error, etc.)
   *
   * @example
   * const { register } = useAuth();
   *
   * try {
   *   const newUser = await register({
   *     email: 'newuser@example.com',
   *     password: 'securePassword123',
   *     first_name: 'John',
   *     last_name: 'Doe',
   *     phone: '1234567890'
   *   });
   *   console.log('Account created:', newUser);
   * } catch (error) {
   *   console.error('Registration failed:', error);
   * }
   */
  const register = async (userData) => {
    try {
      // Call register API - creates user and stores JWT tokens
      await authService.register(userData);

      // Fetch user data from /users/me endpoint
      const user = await usersService.getMe();
      setUser(user);

      // Show success notification
      toast.success('Account created successfully!');
      return user;
    } catch (error) {
      // Transform error to user-friendly message
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg);
      throw error;
    }
  };

  /**
   * Login with Google OAuth credential
   *
   * Authenticates user using Google OAuth 2.0 ID token
   * On success, stores JWT tokens and fetches user data
   *
   * @param {string} credential - Google OAuth ID token
   * @returns {Promise<Object>} User data object
   * @throws {Error} If Google auth fails
   *
   * @example
   * const { loginWithGoogle } = useAuth();
   *
   * // After receiving credential from Google Sign-In button
   * try {
   *   const userData = await loginWithGoogle(googleCredential);
   *   console.log('Logged in via Google:', userData);
   * } catch (error) {
   *   console.error('Google login failed:', error);
   * }
   */
  const loginWithGoogle = async (credential) => {
    try {
      // Call Google auth API - verifies credential and stores JWT tokens
      await authService.googleAuth(credential);

      // Fetch user data from /users/me endpoint
      const userData = await usersService.getMe();
      setUser(userData);

      // Show success notification
      toast.success('Welcome back!');
      return userData;
    } catch (error) {
      // Transform error to user-friendly message
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg);
      throw error;
    }
  };

  /**
   * Logout - clear all auth data
   *
   * Logs out the current user by:
   * 1. Calling logout API endpoint (invalidates refresh token)
   * 2. Clearing JWT tokens from localStorage
   * 3. Clearing user state
   * 4. Showing success notification
   *
   * Note: Always clears user state even if API call fails (finally block)
   *
   * @returns {Promise<void>}
   *
   * @example
   * const { logout } = useAuth();
   *
   * const handleLogout = async () => {
   *   await logout();
   *   navigate('/login');
   * };
   */
  const logout = async () => {
    try {
      // Call logout API - invalidates refresh token on server
      await authService.logout();
      toast.success('Logged out successfully');
    } catch (error) {
      // Transform error to user-friendly message
      const errorMsg = getErrorMessage(error);
      toast.error(errorMsg);
    } finally {
      // Always clear user state, even if API call fails
      // authService.logout() also clears localStorage
      setUser(null);
    }
  };

  /**
   * Update user data in context
   *
   * Used after profile updates to sync context with updated user data
   * Does not make API call - assumes data is already updated on server
   *
   * @param {Object} userData - Updated user data object
   *
   * @example
   * const { updateUser } = useAuth();
   *
   * // After updating profile via API
   * const updatedUser = await usersService.updateMe(newData);
   * updateUser(updatedUser); // Sync context with updated data
   */
  const updateUser = (userData) => {
    setUser(userData);
  };

  // ========================================
  // CONTEXT PROVIDER
  // ========================================

  /**
   * Provide auth state and methods to child components
   *
   * Context Value:
   * - user: User object or null
   * - loading: Boolean indicating auth initialization
   * - login: Function to login with email/password
   * - loginWithGoogle: Function to login with Google OAuth
   * - register: Function to create new account
   * - logout: Function to logout and clear auth
   * - updateUser: Function to update user data in context
   */
  return (
    <AuthContext.Provider
      value={{ user, login, loginWithGoogle, register, logout, updateUser, loading }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

// ========================================
// HOOK FOR CONSUMING CONTEXT
// ========================================

/**
 * useAuth Hook
 *
 * Custom hook to access authentication context
 * Must be used within AuthProvider component tree
 *
 * @returns {Object} Auth context value
 * @returns {Object|null} returns.user - Current user object or null
 * @returns {boolean} returns.loading - Auth initialization loading state
 * @returns {Function} returns.login - Login with email/password
 * @returns {Function} returns.loginWithGoogle - Login with Google OAuth
 * @returns {Function} returns.register - Register new user
 * @returns {Function} returns.logout - Logout current user
 * @returns {Function} returns.updateUser - Update user data in context
 *
 * @throws {Error} If used outside AuthProvider
 *
 * @example
 * import { useAuth } from '@/context/auth';
 *
 * function MyComponent() {
 *   const { user, loading, login, logout } = useAuth();
 *
 *   if (loading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       {user ? (
 *         <div>
 *           <p>Welcome {user.first_name}!</p>
 *           <button onClick={logout}>Logout</button>
 *         </div>
 *       ) : (
 *         <button onClick={() => login(email, password)}>Login</button>
 *       )}
 *     </div>
 *   );
 * }
 */
export const useAuth = () => {
  return useContext(AuthContext);
};
