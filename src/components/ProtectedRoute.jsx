/**
 * Protected Route Component
 * Guards routes that require authentication
 * Redirects to login if user is not authenticated
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-[#F3BC48] rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    // User doesn't have required role - redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated (and has correct role if required)
  return children;
}
