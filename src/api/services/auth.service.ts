/**
 * @file auth.service.ts
 * @description Authentication service for the CSF application.
 *
 * This module provides a comprehensive authentication service that handles:
 * - User login with email/password credentials
 * - User registration and account creation
 * - Google OAuth authentication
 * - JWT token management (access and refresh tokens)
 * - Token refresh operations
 * - User logout and session cleanup
 * - Authentication state checking
 *
 * Key Features:
 *
 * 1. TOKEN MANAGEMENT
 *    - Stores JWT access tokens and refresh tokens in localStorage
 *    - Automatically handles token storage after login/register/refresh
 *    - Provides utility methods to retrieve stored tokens
 *    - Clears tokens on logout for security
 *
 * 2. AUTHENTICATION METHODS
 *    - Email/Password Login: Traditional credential-based authentication
 *    - User Registration: Create new accounts with validation
 *    - Google OAuth: Third-party authentication via Google
 *    - Token Refresh: Obtain new access tokens without re-login
 *
 * 3. SESSION MANAGEMENT
 *    - Stores tokens securely in localStorage
 *    - Provides authentication state checking
 *    - Handles logout with backend notification and local cleanup
 *    - Clears Authorization header on logout
 *
 * Token Storage:
 * - Access Token: localStorage key from API_CONFIG.TOKEN_STORAGE_KEY
 *   - Used for authenticating API requests
 *   - Short-lived (typically expires in minutes/hours)
 *   - Automatically attached to requests by axios-client interceptor
 *
 * - Refresh Token: localStorage key from API_CONFIG.REFRESH_TOKEN_STORAGE_KEY
 *   - Used to obtain new access tokens when they expire
 *   - Long-lived (typically expires in days/weeks)
 *   - Sent to /auth/refresh endpoint when access token expires
 *
 * Security Considerations:
 * - Tokens stored in localStorage (accessible to JavaScript)
 * - Always use HTTPS in production to prevent token interception
 * - Logout clears all tokens and Authorization headers
 * - Backend should validate and blacklist tokens on logout
 *
 * @requires ../client/axios-client
 * @requires ../config/endpoints
 * @requires ../config/api.config
 * @requires ../types/auth.types
 *
 * @example
 * // Import the authentication service
 * import { authService } from '@/api/services/auth.service';
 *
 * // Login user
 * const tokens = await authService.login({
 *   email: 'user@example.com',
 *   password: 'securePassword123'
 * });
 *
 * // Check authentication status
 * if (authService.isAuthenticated()) {
 *   // User is logged in
 * }
 *
 * // Logout user
 * await authService.logout();
 */

// ========================================
// IMPORTS
// ========================================
import apiClient from '../client/axios-client';
import { ENDPOINTS } from '../config/endpoints';
import { API_CONFIG } from '../config/api.config';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  GoogleAuthRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../types/auth.types';

// ========================================
// INTERNAL UTILITIES
// ========================================

/**
 * Store authentication tokens in localStorage
 *
 * Internal utility function that saves access and refresh tokens to localStorage.
 * This function is called after successful login, registration, token refresh,
 * and Google OAuth authentication.
 *
 * Token Storage Keys:
 * - Access Token: Defined in API_CONFIG.TOKEN_STORAGE_KEY
 * - Refresh Token: Defined in API_CONFIG.REFRESH_TOKEN_STORAGE_KEY
 *
 * @param {Partial<LoginResponse>} [tokens] - Object containing access_token and/or refresh_token
 * @returns {void}
 *
 * @example
 * // Store both tokens
 * storeTokens({
 *   access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
 *   refresh_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
 * });
 *
 * @example
 * // Store only access token (during token refresh)
 * storeTokens({
 *   access_token: 'newAccessToken123'
 * });
 */
const storeTokens = (tokens?: Partial<LoginResponse>): void => {
  if (!tokens) return;

  // Store access token if provided
  if (tokens.access_token) {
    localStorage.setItem(API_CONFIG.TOKEN_STORAGE_KEY, tokens.access_token);
  }

  // Store refresh token if provided
  if (tokens.refresh_token) {
    localStorage.setItem(
      API_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
      tokens.refresh_token
    );
  }
};

// ========================================
// AUTHENTICATION SERVICE
// ========================================

/**
 * Authentication Service
 *
 * Provides methods for user authentication, registration, and session management.
 * All methods are pure API functions with no React dependencies.
 */
export const authService = {
  /**
   * Login with email and password
   *
   * Authenticates a user using their email and password credentials.
   * On successful authentication, stores the access and refresh tokens
   * in localStorage for subsequent API requests.
   *
   * API Endpoint: POST /auth/login
   * - Sends email and password in request body
   * - Returns authentication tokens on success
   * - Returns 401 error for invalid credentials
   *
   * Response Handling:
   * - Backend may return tokens directly or wrapped in a 'tokens' property
   * - Function normalizes both response formats
   * - Tokens are automatically stored in localStorage
   *
   * @param {LoginRequest} credentials - User login credentials
   * @param {string} credentials.email - User's email address
   * @param {string} credentials.password - User's password
   * @returns {Promise<LoginResponse>} Authentication tokens and user info
   * @returns {string} return.access_token - JWT access token for API authentication
   * @returns {string} return.refresh_token - JWT refresh token for token renewal
   * @throws {Error} Network error or connection timeout
   * @throws {Error} 401 - Invalid email or password
   * @throws {Error} 422 - Validation error (invalid email format, etc.)
   * @throws {Error} 500 - Server error during authentication
   *
   * @example
   * // Basic login
   * try {
   *   const tokens = await authService.login({
   *     email: 'john.doe@example.com',
   *     password: 'securePassword123'
   *   });
   *   console.log('Login successful:', tokens.access_token);
   * } catch (error) {
   *   console.error('Login failed:', error.message);
   * }
   *
   * @example
   * // Login with error handling
   * try {
   *   await authService.login({ email, password });
   *   router.push('/dashboard'); // Redirect on success
   * } catch (error) {
   *   if (error.response?.status === 401) {
   *     alert('Invalid email or password');
   *   } else {
   *     alert('Login failed. Please try again.');
   *   }
   * }
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Call login endpoint with email and password
    const { data } = await apiClient.post<LoginResponse | { tokens: LoginResponse }>(
      ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    // Normalize response: Extract tokens whether they're at root or nested
    const tokens = 'tokens' in data ? data.tokens : data;

    // Store tokens in localStorage for subsequent requests
    storeTokens(tokens);

    return tokens;
  },

  /**
   * Register new user
   *
   * Creates a new user account with the provided information.
   * On successful registration, automatically logs in the user by storing
   * the authentication tokens in localStorage.
   *
   * API Endpoint: POST /auth/register
   * - Sends user registration data in request body
   * - Validates email format and password strength
   * - Checks for duplicate email addresses
   * - Creates user account and returns authentication tokens
   *
   * Response Handling:
   * - Backend may return tokens directly or wrapped in a 'tokens' property
   * - Function normalizes both response formats
   * - Tokens are automatically stored for immediate authentication
   *
   * @param {RegisterRequest} userData - User registration information
   * @param {string} userData.email - User's email address (must be unique)
   * @param {string} userData.password - User's password (must meet requirements)
   * @param {string} [userData.first_name] - User's first name (optional)
   * @param {string} [userData.last_name] - User's last name (optional)
   * @returns {Promise<LoginResponse>} Authentication tokens for the new user
   * @returns {string} return.access_token - JWT access token for API authentication
   * @returns {string} return.refresh_token - JWT refresh token for token renewal
   * @throws {Error} Network error or connection timeout
   * @throws {Error} 400 - Email already registered
   * @throws {Error} 422 - Validation error (weak password, invalid email, etc.)
   * @throws {Error} 500 - Server error during registration
   *
   * @example
   * // Basic registration
   * try {
   *   const tokens = await authService.register({
   *     email: 'newuser@example.com',
   *     password: 'SecurePass123!',
   *     first_name: 'John',
   *     last_name: 'Doe'
   *   });
   *   console.log('Registration successful:', tokens.access_token);
   * } catch (error) {
   *   console.error('Registration failed:', error.message);
   * }
   *
   * @example
   * // Registration with error handling
   * try {
   *   await authService.register({ email, password, first_name, last_name });
   *   router.push('/dashboard'); // Auto-logged in after registration
   * } catch (error) {
   *   if (error.response?.status === 400) {
   *     alert('Email already registered');
   *   } else if (error.response?.status === 422) {
   *     alert('Invalid registration data. Check your inputs.');
   *   } else {
   *     alert('Registration failed. Please try again.');
   *   }
   * }
   */
  async register(userData: RegisterRequest): Promise<LoginResponse> {
    // Call registration endpoint with user data
    const { data } = await apiClient.post<{ user: any; tokens: LoginResponse } | LoginResponse>(
      ENDPOINTS.AUTH.REGISTER,
      userData
    );

    // Normalize response: Extract tokens whether they're at root or nested
    const tokens = 'tokens' in data ? data.tokens : data;

    // Store tokens in localStorage to auto-login the user
    storeTokens(tokens);

    return tokens;
  },

  /**
   * Refresh access token using refresh token
   *
   * Obtains a new access token using the stored refresh token.
   * This method is typically called automatically by the axios-client
   * response interceptor when a 401 error is received, but can also
   * be called manually to proactively refresh tokens.
   *
   * API Endpoint: POST /auth/refresh
   * - Sends refresh_token in request body
   * - Returns new access_token and refresh_token
   * - Returns 401 if refresh token is invalid or expired
   *
   * Token Flow:
   * 1. Retrieve refresh token from localStorage
   * 2. Send refresh token to backend
   * 3. Receive new access token and refresh token
   * 4. Store new tokens in localStorage
   * 5. Subsequent requests use new access token
   *
   * Note: The axios-client interceptor handles this automatically on 401 errors.
   * Manual calls are only needed for proactive token refresh.
   *
   * @returns {Promise<RefreshTokenResponse>} New authentication tokens
   * @returns {string} return.access_token - New JWT access token
   * @returns {string} return.refresh_token - New JWT refresh token
   * @throws {Error} 'No refresh token available' - No refresh token in localStorage
   * @throws {Error} 401 - Refresh token is invalid or expired
   * @throws {Error} 500 - Server error during token refresh
   *
   * @example
   * // Manual token refresh
   * try {
   *   const newTokens = await authService.refreshToken();
   *   console.log('Token refreshed successfully');
   * } catch (error) {
   *   if (error.message === 'No refresh token available') {
   *     // User needs to login
   *     router.push('/login');
   *   } else {
   *     console.error('Token refresh failed:', error);
   *   }
   * }
   *
   * @example
   * // Proactive token refresh before expiration
   * // (Usually handled automatically by axios interceptor)
   * const tokenExpiresIn5Min = checkTokenExpiry();
   * if (tokenExpiresIn5Min) {
   *   await authService.refreshToken();
   * }
   */
  async refreshToken(): Promise<RefreshTokenResponse> {
    // Retrieve refresh token from localStorage
    const refreshToken = localStorage.getItem(
      API_CONFIG.REFRESH_TOKEN_STORAGE_KEY
    );

    // Throw error if no refresh token is available
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Call refresh endpoint with current refresh token
    const { data } = await apiClient.post<RefreshTokenResponse>(
      ENDPOINTS.AUTH.REFRESH,
      { refresh_token: refreshToken } as RefreshTokenRequest
    );

    // Store new tokens in localStorage
    storeTokens(data);

    return data;
  },

  /**
   * Google OAuth authentication
   *
   * Authenticates a user using Google OAuth. This method accepts a Google
   * authentication token (obtained from Google's OAuth flow) and exchanges
   * it for application authentication tokens.
   *
   * API Endpoint: POST /auth/google
   * - Sends Google OAuth token in request body
   * - Backend validates token with Google servers
   * - Creates or retrieves user account linked to Google account
   * - Returns user information and authentication tokens
   *
   * OAuth Flow:
   * 1. Frontend initiates Google OAuth flow (via Google Sign-In button)
   * 2. User authenticates with Google and grants permissions
   * 3. Google returns OAuth token to frontend
   * 4. Frontend calls this method with Google token
   * 5. Backend validates token with Google
   * 6. Backend creates/updates user account
   * 7. Backend returns user data and authentication tokens
   * 8. Tokens are stored in localStorage
   *
   * @param {string} googleToken - Google OAuth token from Google Sign-In
   * @returns {Promise<{user: any, tokens: LoginResponse}>} User data and auth tokens
   * @returns {object} return.user - User account information from database
   * @returns {LoginResponse} return.tokens - Authentication tokens
   * @returns {string} return.tokens.access_token - JWT access token
   * @returns {string} return.tokens.refresh_token - JWT refresh token
   * @throws {Error} Network error or connection timeout
   * @throws {Error} 401 - Invalid Google token or verification failed
   * @throws {Error} 500 - Server error during Google authentication
   *
   * @example
   * // Google Sign-In integration
   * import { GoogleLogin } from '@react-oauth/google';
   *
   * function LoginPage() {
   *   const handleGoogleSuccess = async (credentialResponse) => {
   *     try {
   *       const result = await authService.googleAuth(
   *         credentialResponse.credential
   *       );
   *       console.log('Google login successful:', result.user);
   *       router.push('/dashboard');
   *     } catch (error) {
   *       console.error('Google login failed:', error);
   *     }
   *   };
   *
   *   return (
   *     <GoogleLogin
   *       onSuccess={handleGoogleSuccess}
   *       onError={() => console.log('Login Failed')}
   *     />
   *   );
   * }
   *
   * @example
   * // Manual Google OAuth with error handling
   * try {
   *   const { user, tokens } = await authService.googleAuth(googleToken);
   *   console.log(`Welcome ${user.email}!`);
   *   console.log('Access token:', tokens.access_token);
   * } catch (error) {
   *   if (error.response?.status === 401) {
   *     alert('Google authentication failed. Please try again.');
   *   } else {
   *     alert('Login failed. Please use email/password instead.');
   *   }
   * }
   */
  async googleAuth(googleToken: string): Promise<{ user: any; tokens: LoginResponse }> {
    // Call Google OAuth endpoint with Google token
    const { data } = await apiClient.post<{ user: any; tokens: LoginResponse }>(
      ENDPOINTS.AUTH.GOOGLE,
      { token: googleToken } as GoogleAuthRequest
    );

    // Store authentication tokens in localStorage
    storeTokens(data.tokens);

    return data;
  },

  /**
   * Logout - notify backend and clear all authentication data
   *
   * Logs out the current user by notifying the backend (which may blacklist
   * the tokens) and clearing all authentication data from localStorage.
   * This method always clears local storage, even if the API call fails,
   * to ensure the user is logged out on the client side.
   *
   * API Endpoint: POST /auth/logout
   * - Sends request to backend to invalidate tokens
   * - Backend may add tokens to blacklist/revocation list
   * - Clears authentication state regardless of API response
   *
   * Cleanup Operations:
   * 1. Call logout endpoint to notify backend
   * 2. Remove access token from localStorage
   * 3. Remove refresh token from localStorage
   * 4. Clear Authorization header from axios client
   *
   * Error Handling:
   * - Uses try/finally to ensure local cleanup happens even if API fails
   * - Network errors or backend failures won't prevent local logout
   * - User is always logged out locally, regardless of backend response
   *
   * @returns {Promise<void>} Resolves when logout is complete
   * @throws {Error} Never throws - errors are silently handled
   *
   * @example
   * // Basic logout
   * const handleLogout = async () => {
   *   await authService.logout();
   *   router.push('/login');
   * };
   *
   * @example
   * // Logout with confirmation
   * const handleLogout = async () => {
   *   if (confirm('Are you sure you want to logout?')) {
   *     await authService.logout();
   *     window.location.href = '/login'; // Full page reload
   *   }
   * };
   *
   * @example
   * // Logout with user feedback
   * const handleLogout = async () => {
   *   try {
   *     await authService.logout();
   *     toast.success('Logged out successfully');
   *     router.push('/login');
   *   } catch (error) {
   *     // This won't actually throw, but good practice
   *     toast.info('Logged out locally');
   *     router.push('/login');
   *   }
   * };
   */
  async logout(): Promise<void> {
    try {
      // Notify backend to invalidate/blacklist tokens
      await apiClient.post<void>(ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // CRITICAL: Always clear local auth state even if the API call fails
      // This ensures user is logged out locally regardless of backend status

      // Remove access token from localStorage
      localStorage.removeItem(API_CONFIG.TOKEN_STORAGE_KEY);

      // Remove refresh token from localStorage
      localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY);

      // Clear Authorization header from axios client
      // Prevents subsequent requests from using old token
      if (apiClient.defaults.headers.common) {
        delete apiClient.defaults.headers.common['Authorization'];
      }
    }
  },

  /**
   * Check if user is authenticated
   *
   * Determines if a user is currently authenticated by checking for the
   * presence of an access token in localStorage. This is a simple check
   * that doesn't verify token validity or expiration.
   *
   * Note: This only checks for token presence, not validity.
   * The token may be expired or invalid, but the axios-client interceptor
   * will handle token refresh automatically on 401 errors.
   *
   * @returns {boolean} true if access token exists, false otherwise
   *
   * @example
   * // Basic authentication check
   * if (authService.isAuthenticated()) {
   *   console.log('User is logged in');
   * } else {
   *   console.log('User is not logged in');
   * }
   *
   * @example
   * // Route protection
   * const ProtectedRoute = ({ children }) => {
   *   if (!authService.isAuthenticated()) {
   *     return <Navigate to="/login" />;
   *   }
   *   return children;
   * };
   *
   * @example
   * // Conditional rendering
   * function Header() {
   *   return (
   *     <nav>
   *       {authService.isAuthenticated() ? (
   *         <button onClick={handleLogout}>Logout</button>
   *       ) : (
   *         <Link to="/login">Login</Link>
   *       )}
   *     </nav>
   *   );
   * }
   */
  isAuthenticated(): boolean {
    // Check for presence of access token in localStorage
    // Double negation (!!) converts string | null to boolean
    return !!localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
  },

  /**
   * Get stored access token
   *
   * Retrieves the current access token from localStorage.
   * This token is used to authenticate API requests via the Authorization header.
   *
   * Token Usage:
   * - The axios-client request interceptor automatically attaches this token
   * - Token is sent as: Authorization: Bearer <access_token>
   * - Typically expires in minutes to hours (backend configured)
   *
   * Note: This method doesn't validate the token. It may be expired or invalid.
   * The axios-client will automatically refresh expired tokens on 401 errors.
   *
   * @returns {string | null} JWT access token or null if not logged in
   *
   * @example
   * // Get current access token
   * const token = authService.getAccessToken();
   * if (token) {
   *   console.log('Current token:', token);
   * } else {
   *   console.log('No token available - user not logged in');
   * }
   *
   * @example
   * // Manual API request with token (not recommended - use apiClient instead)
   * const token = authService.getAccessToken();
   * if (token) {
   *   fetch('https://api.example.com/data', {
   *     headers: {
   *       'Authorization': `Bearer ${token}`
   *     }
   *   });
   * }
   *
   * @example
   * // Decode token payload (requires jwt-decode library)
   * import jwtDecode from 'jwt-decode';
   *
   * const token = authService.getAccessToken();
   * if (token) {
   *   const payload = jwtDecode(token);
   *   console.log('User ID:', payload.sub);
   *   console.log('Expires:', new Date(payload.exp * 1000));
   * }
   */
  getAccessToken(): string | null {
    // Retrieve access token from localStorage
    return localStorage.getItem(API_CONFIG.TOKEN_STORAGE_KEY);
  },

  /**
   * Get stored refresh token
   *
   * Retrieves the current refresh token from localStorage.
   * This token is used to obtain new access tokens when they expire.
   *
   * Token Usage:
   * - Sent to /auth/refresh endpoint when access token expires
   * - axios-client response interceptor handles refresh automatically
   * - Typically long-lived (days to weeks, backend configured)
   * - More secure than access token due to limited use
   *
   * Note: Refresh tokens should be treated as sensitive credentials.
   * Never log or expose refresh tokens in client-side code.
   *
   * @returns {string | null} JWT refresh token or null if not logged in
   *
   * @example
   * // Check for refresh token
   * const refreshToken = authService.getRefreshToken();
   * if (refreshToken) {
   *   console.log('Refresh token available');
   * } else {
   *   console.log('No refresh token - user needs to login');
   * }
   *
   * @example
   * // Manual token refresh (not recommended - use authService.refreshToken())
   * const refreshToken = authService.getRefreshToken();
   * if (refreshToken) {
   *   const response = await fetch('/api/v1/auth/refresh', {
   *     method: 'POST',
   *     body: JSON.stringify({ refresh_token: refreshToken })
   *   });
   *   const newTokens = await response.json();
   * }
   *
   * @example
   * // Decode refresh token (for debugging only)
   * import jwtDecode from 'jwt-decode';
   *
   * const refreshToken = authService.getRefreshToken();
   * if (refreshToken) {
   *   const payload = jwtDecode(refreshToken);
   *   console.log('Refresh token expires:', new Date(payload.exp * 1000));
   * }
   */
  getRefreshToken(): string | null {
    // Retrieve refresh token from localStorage
    return localStorage.getItem(API_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
  },
};

// ========================================
// EXPORT
// ========================================

// Export as named export for use throughout the application
