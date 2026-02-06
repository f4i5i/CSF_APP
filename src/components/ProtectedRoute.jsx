/**
 * @file ProtectedRoute.jsx
 * @description Route guard component that enforces authentication and role-based access control.
 *
 * This component wraps protected routes to ensure only authenticated users with appropriate
 * roles can access them. It handles three scenarios:
 * 1. Loading state - Shows loading spinner while auth status is being determined
 * 2. Unauthenticated - Redirects to login page with return URL
 * 3. Unauthorized role - Redirects to appropriate dashboard for user's actual role
 *
 * Key Features:
 * - Authentication check using useAuth context
 * - Role-based access control (RBAC)
 * - Loading state handling during auth initialization
 * - Automatic redirect to login for unauthenticated users
 * - Return URL preservation for post-login redirect
 * - Role-appropriate dashboard redirects for unauthorized access
 * - Prevents unauthorized access to admin, coach, or parent-only routes
 *
 * Usage Examples:
 * ```jsx
 * // Require any authenticated user
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 *
 * // Require specific role (admin only)
 * <ProtectedRoute requiredRole="admin">
 *   <AdminDashboard />
 * </ProtectedRoute>
 *
 * // In route definition
 * <Route path="/admin" element={
 *   <ProtectedRoute requiredRole="admin">
 *     <AdminDashboard />
 *   </ProtectedRoute>
 * } />
 * ```
 *
 * Authentication Flow:
 * 1. Component renders
 * 2. Check loading state from auth context
 * 3. If loading: Show loading spinner
 * 4. If not loading:
 *    a. Check if user exists (authenticated)
 *    b. If no user: Redirect to /login with return URL
 *    c. If user exists and requiredRole specified:
 *       - Check if user's role matches required role
 *       - If no match: Redirect to role-appropriate dashboard
 *    d. If authenticated and authorized: Render children
 *
 * Role Hierarchy:
 * - admin: Access to admin dashboard and management features
 * - coach: Access to coach dashboard and student check-in
 * - parent: Access to parent dashboard and class enrollment
 *
 * @component
 * @requires react-router-dom
 * @requires ../context/auth
 */

// ========================================
// IMPORTS
// ========================================
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { isRoleAtLeast, canAccessAdmin } from '../utils/permissions';

// ========================================
// PROTECTED ROUTE COMPONENT
// ========================================

/**
 * ProtectedRoute Component
 *
 * Guards routes that require authentication and optionally specific user roles.
 * Redirects unauthenticated users to login and unauthorized users to their appropriate dashboard.
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string} [props.requiredRole] - Required user role (admin, coach, parent). If not specified, any authenticated user can access.
 *
 * @returns {JSX.Element} Either the protected content, loading spinner, or redirect
 *
 * @example
 * // Protect any route (require authentication only)
 * <ProtectedRoute>
 *   <MyProtectedPage />
 * </ProtectedRoute>
 *
 * @example
 * // Protect admin-only route
 * <ProtectedRoute requiredRole="admin">
 *   <AdminDashboard />
 * </ProtectedRoute>
 *
 * @example
 * // In App.js routing
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 *
 * <Route path="/admin" element={
 *   <ProtectedRoute requiredRole="admin">
 *     <AdminDashboard />
 *   </ProtectedRoute>
 * } />
 */
export default function ProtectedRoute({ children, requiredRole }) {
  // ========================================
  // HOOKS
  // ========================================

  /**
   * Get authentication state from auth context
   * - user: User object if authenticated, null otherwise
   * - loading: Boolean indicating if auth status is still being determined
   */
  const { user, loading } = useAuth();

  /**
   * Get current location for return URL after login
   * Used to redirect user back to intended page after successful authentication
   */
  const location = useLocation();

  // ========================================
  // LOADING STATE
  // ========================================

  /**
   * Show loading spinner while auth status is being determined
   *
   * This occurs during:
   * - Initial app load while checking for existing JWT token
   * - Session restoration from localStorage
   * - User data fetch from /users/me endpoint
   *
   * Loading state prevents premature redirect to login page
   * before auth status is fully determined
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7]">
        <div className="text-center">
          {/* Animated spinner with brand color */}
          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#F3BC48] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ========================================
  // AUTHENTICATION CHECK
  // ========================================

  /**
   * Not authenticated - redirect to login
   *
   * If user object is null (not authenticated):
   * - Redirect to /login page
   * - Pass current location in state for post-login redirect
   * - Use replace=true to prevent back button issues
   *
   * Login page can read location state to redirect user back
   * to intended page after successful authentication
   */
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Force password change redirect
  if (user.must_change_password && location.pathname !== '/force-password-change') {
    return <Navigate to="/force-password-change" replace />;
  }

  // ========================================
  // ROLE-BASED ACCESS CONTROL (RBAC)
  // ========================================

  /**
   * Check role if required
   *
   * If requiredRole prop is specified:
   * 1. Extract user's role from user object
   * 2. Compare with required role (case-insensitive)
   * 3. If roles don't match:
   *    - User is authenticated but not authorized
   *    - Redirect to dashboard appropriate for their actual role
   *
   * Role Redirects:
   * - admin → /admin (Admin Dashboard)
   * - coach → /coachdashboard (Coach Dashboard)
   * - parent → /dashboard (Parent Dashboard)
   * - unknown → /dashboard (Default)
   *
   * Example Scenarios:
   * - Parent tries to access /admin → Redirected to /dashboard
   * - Coach tries to access /admin → Redirected to /coachdashboard
   * - Admin accesses /admin → Allowed (role matches)
   */
  if (requiredRole) {
    // Normalize roles for comparison
    const userRole = user.role?.toUpperCase();
    const requiredRoleUpper = requiredRole.toUpperCase();

    /**
     * Role-based access check using hierarchy
     *
     * Special handling for 'admin' required role:
     * - Both ADMIN and OWNER roles can access admin routes
     * - This uses isRoleAtLeast to check hierarchy
     *
     * For other required roles, check exact match or hierarchy
     */
    let hasAccess = false;

    if (requiredRoleUpper === 'ADMIN') {
      // Admin routes: Allow ADMIN and OWNER
      hasAccess = canAccessAdmin(userRole);
    } else {
      // Other routes: Check if user's role is at or above required role
      hasAccess = isRoleAtLeast(userRole, requiredRoleUpper);
    }

    if (!hasAccess) {
      /**
       * User doesn't have required role - redirect to appropriate dashboard
       *
       * Instead of showing "Access Denied" page, redirect user to
       * the dashboard appropriate for their role for better UX
       */
      const roleRedirects = {
        'OWNER': '/admin',
        'ADMIN': '/admin',
        'COACH': '/coachdashboard',
        'PARENT': '/dashboard',
      };

      // Get redirect path for user's role, default to parent dashboard
      const redirectPath = roleRedirects[userRole] || '/dashboard';

      // Redirect with replace to prevent back button issues
      return <Navigate to={redirectPath} replace />;
    }
  }

  // ========================================
  // AUTHORIZED ACCESS
  // ========================================

  /**
   * User is authenticated AND authorized
   *
   * Conditions met:
   * - User is authenticated (user object exists)
   * - If role required: User's role matches required role
   * - If no role required: Any authenticated user allowed
   *
   * Render the protected content (children)
   */
  return children;
}
