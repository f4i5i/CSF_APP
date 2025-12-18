/**
 * @file user.service.ts
 * @description User profile management service for the CSF application.
 *
 * This module provides a service layer for managing user profiles and account information.
 * It handles all user-related API operations including retrieving and updating user data.
 *
 * Key Features:
 *
 * 1. PROFILE RETRIEVAL
 *    - Fetch authenticated user's profile information
 *    - Returns complete user object with all profile fields
 *    - Uses JWT authentication via axios-client
 *
 * 2. PROFILE UPDATES
 *    - Update user profile information
 *    - Partial updates supported (only modified fields required)
 *    - Returns updated user object after successful modification
 *
 * Architecture:
 *
 * Service Layer Pattern:
 * - Pure API functions without business logic
 * - Each function maps to a single API endpoint
 * - Returns typed responses using TypeScript interfaces
 * - All requests automatically include authentication headers
 * - Errors are handled by axios-client interceptors
 *
 * Authentication:
 * - All requests require valid JWT access token
 * - Token automatically attached by axios-client request interceptor
 * - 401 errors trigger automatic token refresh
 * - Unauthenticated requests redirect to login
 *
 * @requires ../client/axios-client - Configured Axios instance with auth interceptors
 * @requires ../constants/endpoints - API endpoint constants
 * @requires ../types/auth.types - TypeScript type definitions for user data
 *
 * @example
 * // Import the service
 * import { userService } from '@/api/services/user.service';
 *
 * // Get current user profile
 * const user = await userService.getMe();
 * console.log(user.email, user.first_name);
 *
 * // Update user profile
 * const updatedUser = await userService.updateMe({
 *   first_name: 'John',
 *   last_name: 'Doe',
 *   phone_number: '+1234567890'
 * });
 */

// ========================================
// IMPORTS
// ========================================
import apiClient from '../client/axios-client';
import { ENDPOINTS } from '../constants/endpoints';
import type { User, UpdateUserRequest } from '../types/auth.types';

// ========================================
// USER SERVICE
// ========================================

/**
 * User Service Object
 *
 * Provides methods for user profile management operations.
 * All methods are async and return typed Promise objects.
 * Authentication is handled automatically by apiClient.
 *
 * Available Operations:
 * - getMe(): Retrieve current user profile
 * - updateMe(): Update current user profile
 */
export const userService = {
  // ========================================
  // READ OPERATIONS
  // ========================================

  /**
   * Get Current User Profile
   *
   * Retrieves the complete profile information for the authenticated user.
   * This endpoint uses the JWT token to identify the user, so no ID parameter is needed.
   *
   * API Endpoint: GET /users/me
   *
   * Authentication:
   * - Requires valid JWT access token in Authorization header
   * - Token automatically attached by axios-client interceptor
   * - Returns 401 if token is invalid or expired (triggers auto-refresh)
   *
   * Response Data:
   * - id: User's unique identifier (UUID)
   * - email: User's email address
   * - first_name: User's first name
   * - last_name: User's last name
   * - role: User's role (parent, admin, instructor)
   * - phone_number: User's contact phone number
   * - created_at: Account creation timestamp
   * - updated_at: Last profile update timestamp
   * - is_active: Account active status
   *
   * @returns {Promise<User>} Promise that resolves to the user object
   *
   * @throws {Error} If user is not authenticated (401)
   * @throws {Error} If server error occurs (500)
   * @throws {Error} If network error occurs
   *
   * @example
   * // Basic usage
   * try {
   *   const user = await userService.getMe();
   *   console.log(`Welcome, ${user.first_name} ${user.last_name}!`);
   *   console.log(`Email: ${user.email}`);
   *   console.log(`Role: ${user.role}`);
   * } catch (error) {
   *   console.error('Failed to fetch user profile:', error.message);
   * }
   *
   * @example
   * // Using in a React component
   * const ProfilePage = () => {
   *   const [user, setUser] = useState(null);
   *
   *   useEffect(() => {
   *     const fetchProfile = async () => {
   *       try {
   *         const userData = await userService.getMe();
   *         setUser(userData);
   *       } catch (error) {
   *         toast.error('Failed to load profile');
   *       }
   *     };
   *     fetchProfile();
   *   }, []);
   *
   *   return <div>{user?.first_name}</div>;
   * };
   */
  async getMe(): Promise<User> {
    // Make GET request to /users/me endpoint
    const { data } = await apiClient.get<User>(ENDPOINTS.USERS.ME);
    return data;
  },

  // ========================================
  // UPDATE OPERATIONS
  // ========================================

  /**
   * Update Current User Profile
   *
   * Updates the profile information for the authenticated user.
   * Supports partial updates - only include fields you want to modify.
   * The JWT token identifies the user, so no ID parameter is needed.
   *
   * API Endpoint: PUT /users/me
   *
   * Authentication:
   * - Requires valid JWT access token in Authorization header
   * - Token automatically attached by axios-client interceptor
   * - Returns 401 if token is invalid or expired (triggers auto-refresh)
   *
   * Updatable Fields:
   * - first_name: User's first name (string)
   * - last_name: User's last name (string)
   * - phone_number: User's contact phone (string, formatted)
   * - email: Cannot be updated via this endpoint (requires email verification)
   * - role: Cannot be updated by user (admin-only operation)
   *
   * Validation:
   * - Phone numbers must be in valid format
   * - Names must not be empty strings
   * - Returns 400 for validation errors
   *
   * @param {UpdateUserRequest} userData - Object containing fields to update
   * @param {string} [userData.first_name] - Updated first name
   * @param {string} [userData.last_name] - Updated last name
   * @param {string} [userData.phone_number] - Updated phone number
   *
   * @returns {Promise<User>} Promise that resolves to the updated user object
   *
   * @throws {Error} If user is not authenticated (401)
   * @throws {Error} If validation fails (400)
   * @throws {Error} If server error occurs (500)
   * @throws {Error} If network error occurs
   *
   * @example
   * // Update single field
   * try {
   *   const updatedUser = await userService.updateMe({
   *     phone_number: '+1-555-123-4567'
   *   });
   *   console.log('Phone updated:', updatedUser.phone_number);
   * } catch (error) {
   *   console.error('Update failed:', error.message);
   * }
   *
   * @example
   * // Update multiple fields
   * try {
   *   const updatedUser = await userService.updateMe({
   *     first_name: 'John',
   *     last_name: 'Doe',
   *     phone_number: '+1-555-987-6543'
   *   });
   *   console.log('Profile updated successfully');
   * } catch (error) {
   *   if (error.status === 400) {
   *     console.error('Invalid data:', error.message);
   *   }
   * }
   *
   * @example
   * // Using in a form submission handler
   * const handleSubmit = async (formData) => {
   *   try {
   *     const updatedUser = await userService.updateMe({
   *       first_name: formData.firstName,
   *       last_name: formData.lastName,
   *       phone_number: formData.phone
   *     });
   *     toast.success('Profile updated successfully!');
   *     navigate('/profile');
   *   } catch (error) {
   *     toast.error(error.message || 'Update failed');
   *   }
   * };
   */
  async updateMe(userData: UpdateUserRequest): Promise<User> {
    // Make PUT request to /users/me endpoint with update data
    const { data } = await apiClient.put<User>(
      ENDPOINTS.USERS.UPDATE_ME,
      userData
    );
    return data;
  },
};
