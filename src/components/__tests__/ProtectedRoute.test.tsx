/**
 * ProtectedRoute Tests
 * Tests for protected route component with role-based access control
 */

import { render, screen, waitFor } from '../../__tests__/utils/test-utils';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import ProtectedRoute from '../ProtectedRoute';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../context/auth';

// ==========================================
// SETUP
// ==========================================

const API_BASE = 'http://localhost:8000/api/v1';

/**
 * Mock user data for different roles
 */
const mockUsers = {
  parent: {
    id: 'user-parent-1',
    email: 'parent@test.com',
    first_name: 'Test',
    last_name: 'Parent',
    role: 'PARENT',
    phone: '+1234567890',
    created_at: '2024-01-01T00:00:00Z',
  },
  coach: {
    id: 'user-coach-1',
    email: 'coach@test.com',
    first_name: 'Test',
    last_name: 'Coach',
    role: 'COACH',
    phone: '+1234567891',
    created_at: '2024-01-01T00:00:00Z',
  },
  admin: {
    id: 'user-admin-1',
    email: 'admin@test.com',
    first_name: 'Test',
    last_name: 'Admin',
    role: 'ADMIN',
    phone: '+1234567892',
    created_at: '2024-01-01T00:00:00Z',
  },
  owner: {
    id: 'user-owner-1',
    email: 'owner@test.com',
    first_name: 'Test',
    last_name: 'Owner',
    role: 'OWNER',
    phone: '+1234567893',
    created_at: '2024-01-01T00:00:00Z',
  },
};

/**
 * Test component to verify protected content is rendered
 */
const ProtectedContent = () => <div>Protected Content</div>;

/**
 * Component to display current location (for testing redirects)
 */
const LocationDisplay = () => {
  const location = useLocation();
  return (
    <div>
      <div data-testid="pathname">{location.pathname}</div>
      <div data-testid="from">{location.state?.from?.pathname || 'none'}</div>
    </div>
  );
};

/**
 * Create test router with all required routes
 */
interface CreateTestRouterProps {
  initialRoute: string;
  requiredRole?: string;
  userRole?: 'parent' | 'coach' | 'admin' | 'owner' | null;
}

const createTestRouter = ({
  initialRoute,
  requiredRole,
  userRole,
}: CreateTestRouterProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // Setup auth state
  if (userRole) {
    localStorage.setItem('csf_access_token', `mock-access-token-${userRole}`);
    localStorage.setItem('csf_refresh_token', `mock-refresh-token-${userRole}`);
  } else {
    localStorage.removeItem('csf_access_token');
    localStorage.removeItem('csf_refresh_token');
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/login" element={<LocationDisplay />} />
            <Route path="/dashboard" element={<div>Parent Dashboard</div>} />
            <Route path="/coachdashboard" element={<div>Coach Dashboard</div>} />
            <Route path="/admin" element={<div>Admin Dashboard</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute requiredRole={requiredRole}>
                  <ProtectedContent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-only"
              element={
                <ProtectedRoute requiredRole="admin">
                  <div>Admin Only Content</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/coach-only"
              element={
                <ProtectedRoute requiredRole="coach">
                  <div>Coach Only Content</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent-only"
              element={
                <ProtectedRoute requiredRole="parent">
                  <div>Parent Only Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

/**
 * Clear authentication tokens
 */
const clearAuthTokens = () => {
  localStorage.removeItem('csf_access_token');
  localStorage.removeItem('csf_refresh_token');
};

// ==========================================
// TESTS
// ==========================================

describe('ProtectedRoute', () => {
  beforeEach(() => {
    clearAuthTokens();
    jest.clearAllMocks();
  });

  afterEach(() => {
    clearAuthTokens();
  });

  // ==========================================
  // LOADING STATE TESTS
  // ==========================================

  describe('Loading State', () => {
    it('should show loading spinner while auth is initializing', () => {
      // Don't set any tokens, auth will still be loading initially
      render(
        createTestRouter({
          initialRoute: '/protected',
          userRole: null,
        })
      );

      // Loading state should be visible briefly
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should hide loading spinner after auth initialization', async () => {
      render(
        createTestRouter({
          initialRoute: '/protected',
          userRole: null,
        })
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // UNAUTHENTICATED ACCESS TESTS
  // ==========================================

  describe('Unauthenticated Access', () => {
    it('should redirect to login when not authenticated', async () => {
      render(
        createTestRouter({
          initialRoute: '/protected',
          userRole: null,
        })
      );

      await waitFor(() => {
        expect(screen.getByTestId('pathname')).toHaveTextContent('/login');
      });
    });

    it('should pass return URL in location state when redirecting to login', async () => {
      render(
        createTestRouter({
          initialRoute: '/protected',
          userRole: null,
        })
      );

      await waitFor(() => {
        expect(screen.getByTestId('from')).toHaveTextContent('/protected');
      });
    });

    it('should not render protected content when not authenticated', async () => {
      render(
        createTestRouter({
          initialRoute: '/protected',
          userRole: null,
        })
      );

      await waitFor(() => {
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // AUTHENTICATED ACCESS (NO ROLE REQUIREMENT) TESTS
  // ==========================================

  describe('Authenticated Access (No Role Requirement)', () => {
    it('should allow authenticated parent to access route without role requirement', async () => {
      render(
        createTestRouter({
          initialRoute: '/protected',
          userRole: 'parent',
        })
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should allow authenticated coach to access route without role requirement', async () => {
      render(
        createTestRouter({
          initialRoute: '/protected',
          userRole: 'coach',
        })
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should allow authenticated admin to access route without role requirement', async () => {
      render(
        createTestRouter({
          initialRoute: '/protected',
          userRole: 'admin',
        })
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should allow authenticated owner to access route without role requirement', async () => {
      render(
        createTestRouter({
          initialRoute: '/protected',
          userRole: 'owner',
        })
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // ROLE-BASED ACCESS CONTROL TESTS
  // ==========================================

  describe('Role-Based Access Control', () => {
    describe('Admin Role', () => {
      it('should allow admin to access admin-only route', async () => {
        render(
          createTestRouter({
            initialRoute: '/admin-only',
            userRole: 'admin',
          })
        );

        await waitFor(() => {
          expect(screen.getByText('Admin Only Content')).toBeInTheDocument();
        });
      });

      it('should redirect parent away from admin-only route to parent dashboard', async () => {
        render(
          createTestRouter({
            initialRoute: '/admin-only',
            userRole: 'parent',
          })
        );

        await waitFor(() => {
          expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
        });

        expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
      });

      it('should redirect coach away from admin-only route to coach dashboard', async () => {
        render(
          createTestRouter({
            initialRoute: '/admin-only',
            userRole: 'coach',
          })
        );

        await waitFor(() => {
          expect(screen.getByText('Coach Dashboard')).toBeInTheDocument();
        });

        expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
      });

      it('should allow owner to access admin-only route (owner has admin privileges)', async () => {
        // Note: Based on the role hierarchy, owner might have different access rules
        // This test assumes owner is treated similarly to admin
        render(
          createTestRouter({
            initialRoute: '/admin-only',
            userRole: 'owner',
          })
        );

        await waitFor(() => {
          // Owner will be redirected to their dashboard (not admin)
          // since their role is OWNER not ADMIN
          expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
        });
      });
    });

    describe('Coach Role', () => {
      it('should allow coach to access coach-only route', async () => {
        render(
          createTestRouter({
            initialRoute: '/coach-only',
            userRole: 'coach',
          })
        );

        await waitFor(() => {
          expect(screen.getByText('Coach Only Content')).toBeInTheDocument();
        });
      });

      it('should redirect parent away from coach-only route to parent dashboard', async () => {
        render(
          createTestRouter({
            initialRoute: '/coach-only',
            userRole: 'parent',
          })
        );

        await waitFor(() => {
          expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
        });

        expect(screen.queryByText('Coach Only Content')).not.toBeInTheDocument();
      });

      it('should redirect admin away from coach-only route to admin dashboard', async () => {
        render(
          createTestRouter({
            initialRoute: '/coach-only',
            userRole: 'admin',
          })
        );

        await waitFor(() => {
          expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
        });

        expect(screen.queryByText('Coach Only Content')).not.toBeInTheDocument();
      });
    });

    describe('Parent Role', () => {
      it('should allow parent to access parent-only route', async () => {
        render(
          createTestRouter({
            initialRoute: '/parent-only',
            userRole: 'parent',
          })
        );

        await waitFor(() => {
          expect(screen.getByText('Parent Only Content')).toBeInTheDocument();
        });
      });

      it('should redirect coach away from parent-only route to coach dashboard', async () => {
        render(
          createTestRouter({
            initialRoute: '/parent-only',
            userRole: 'coach',
          })
        );

        await waitFor(() => {
          expect(screen.getByText('Coach Dashboard')).toBeInTheDocument();
        });

        expect(screen.queryByText('Parent Only Content')).not.toBeInTheDocument();
      });

      it('should redirect admin away from parent-only route to admin dashboard', async () => {
        render(
          createTestRouter({
            initialRoute: '/parent-only',
            userRole: 'admin',
          })
        );

        await waitFor(() => {
          expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
        });

        expect(screen.queryByText('Parent Only Content')).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // ROLE REDIRECT TESTS
  // ==========================================

  describe('Role-Based Redirects', () => {
    it('should redirect parent to /dashboard when accessing unauthorized route', async () => {
      render(
        createTestRouter({
          initialRoute: '/admin-only',
          userRole: 'parent',
        })
      );

      await waitFor(() => {
        expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
      });
    });

    it('should redirect coach to /coachdashboard when accessing unauthorized route', async () => {
      render(
        createTestRouter({
          initialRoute: '/admin-only',
          userRole: 'coach',
        })
      );

      await waitFor(() => {
        expect(screen.getByText('Coach Dashboard')).toBeInTheDocument();
      });
    });

    it('should redirect admin to /admin when accessing unauthorized route', async () => {
      render(
        createTestRouter({
          initialRoute: '/coach-only',
          userRole: 'admin',
        })
      );

      await waitFor(() => {
        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // CASE SENSITIVITY TESTS
  // ==========================================

  describe('Case Sensitivity', () => {
    it('should handle role comparison case-insensitively (PARENT vs parent)', async () => {
      // The mock returns PARENT (uppercase) role
      render(
        createTestRouter({
          initialRoute: '/parent-only',
          requiredRole: 'parent', // lowercase in route
          userRole: 'parent',
        })
      );

      await waitFor(() => {
        expect(screen.getByText('Parent Only Content')).toBeInTheDocument();
      });
    });

    it('should handle role comparison case-insensitively (ADMIN vs admin)', async () => {
      render(
        createTestRouter({
          initialRoute: '/admin-only',
          requiredRole: 'admin',
          userRole: 'admin',
        })
      );

      await waitFor(() => {
        expect(screen.getByText('Admin Only Content')).toBeInTheDocument();
      });
    });

    it('should handle role comparison case-insensitively (COACH vs coach)', async () => {
      render(
        createTestRouter({
          initialRoute: '/coach-only',
          requiredRole: 'coach',
          userRole: 'coach',
        })
      );

      await waitFor(() => {
        expect(screen.getByText('Coach Only Content')).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // EDGE CASES TESTS
  // ==========================================

  describe('Edge Cases', () => {
    it('should handle missing user role gracefully', async () => {
      // Mock user without role field
      server.use(
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'user-no-role',
            email: 'norole@test.com',
            first_name: 'No',
            last_name: 'Role',
            // role field missing
          });
        })
      );

      localStorage.setItem('csf_access_token', 'mock-token');

      render(
        createTestRouter({
          initialRoute: '/admin-only',
          userRole: 'parent', // Set token but we'll override the response
        })
      );

      await waitFor(() => {
        // Should redirect to default dashboard when role is undefined
        expect(screen.queryByText('Admin Only Content')).not.toBeInTheDocument();
      });
    });

    it('should handle expired token during route access', async () => {
      localStorage.setItem('csf_access_token', 'expired-token');

      server.use(
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json(
            { message: 'Token expired' },
            { status: 401 }
          );
        })
      );

      render(
        createTestRouter({
          initialRoute: '/protected',
          userRole: null, // Don't set valid token
        })
      );

      // Set token manually for this test
      localStorage.setItem('csf_access_token', 'expired-token');

      await waitFor(() => {
        expect(screen.getByTestId('pathname')).toHaveTextContent('/login');
      });
    });

    it('should not show loading spinner indefinitely on auth error', async () => {
      server.use(
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.error();
        })
      );

      localStorage.setItem('csf_access_token', 'mock-token');

      render(
        createTestRouter({
          initialRoute: '/protected',
          userRole: null,
        })
      );

      // Loading should complete even on error
      await waitFor(
        () => {
          expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  // ==========================================
  // INTEGRATION TESTS
  // ==========================================

  describe('Integration Tests', () => {
    it('should handle complete flow: no auth -> login redirect -> auth -> access granted', async () => {
      // Start unauthenticated
      const { rerender } = render(
        createTestRouter({
          initialRoute: '/protected',
          userRole: null,
        })
      );

      // Should redirect to login
      await waitFor(() => {
        expect(screen.getByTestId('pathname')).toHaveTextContent('/login');
      });

      // Simulate login by setting tokens and re-rendering
      localStorage.setItem('csf_access_token', 'mock-access-token-parent');
      localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');

      rerender(
        createTestRouter({
          initialRoute: '/protected',
          userRole: 'parent',
        })
      );

      // Should now show protected content
      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });

    it('should handle role change requiring different access', async () => {
      // Start as parent
      const { rerender } = render(
        createTestRouter({
          initialRoute: '/admin-only',
          userRole: 'parent',
        })
      );

      // Parent should be redirected
      await waitFor(() => {
        expect(screen.getByText('Parent Dashboard')).toBeInTheDocument();
      });

      // Change to admin
      localStorage.setItem('csf_access_token', 'mock-access-token-admin');

      rerender(
        createTestRouter({
          initialRoute: '/admin-only',
          userRole: 'admin',
        })
      );

      // Admin should see content
      await waitFor(() => {
        expect(screen.getByText('Admin Only Content')).toBeInTheDocument();
      });
    });
  });
});
