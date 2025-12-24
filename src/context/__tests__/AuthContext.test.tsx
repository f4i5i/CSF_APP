/**
 * AuthContext Tests
 * Tests for authentication context provider
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { server } from '../../mocks/server';
import { http, HttpResponse } from 'msw';
import { useAuth, AuthProvider } from '../auth';
import authService from '../../api/services/auth.service';
import usersService from '../../api/services/users.service';

// ==========================================
// SETUP
// ==========================================

const API_BASE = 'http://localhost:8000/api/v1';

/**
 * Create a test wrapper with all providers
 */
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
};

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
 * Clear authentication tokens from localStorage
 */
const clearAuthTokens = () => {
  localStorage.removeItem('csf_access_token');
  localStorage.removeItem('csf_refresh_token');
};

// ==========================================
// TESTS
// ==========================================

describe('AuthContext', () => {
  beforeEach(() => {
    clearAuthTokens();
    jest.clearAllMocks();
  });

  afterEach(() => {
    clearAuthTokens();
  });

  // ==========================================
  // INITIALIZATION TESTS
  // ==========================================

  describe('Initialization', () => {
    it('should start with loading state true and user null', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      expect(result.current.loading).toBe(true);
      expect(result.current.user).toBeNull();
    });

    it('should set loading to false after initialization when no token exists', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
    });

    it('should restore session when valid token exists', async () => {
      // Setup: Add valid token to localStorage
      localStorage.setItem('csf_access_token', 'mock-access-token-parent');
      localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUsers.parent);
    });

    it('should clear auth data when token is invalid', async () => {
      // Setup: Add token to localStorage
      localStorage.setItem('csf_access_token', 'invalid-token');
      localStorage.setItem('csf_refresh_token', 'invalid-refresh-token');

      // Mock API to return 401
      server.use(
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('csf_access_token')).toBeNull();
      expect(localStorage.getItem('csf_refresh_token')).toBeNull();
    });
  });

  // ==========================================
  // LOGIN TESTS
  // ==========================================

  describe('Login', () => {
    it('should successfully login as parent', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let userData;
      await act(async () => {
        userData = await result.current.login('parent@test.com', 'password123');
      });

      expect(userData).toEqual(mockUsers.parent);
      expect(result.current.user).toEqual(mockUsers.parent);
      expect(localStorage.getItem('csf_access_token')).toBe('mock-access-token-parent');
      expect(localStorage.getItem('csf_refresh_token')).toBe('mock-refresh-token-parent');
    });

    it('should successfully login as coach', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let userData;
      await act(async () => {
        userData = await result.current.login('coach@test.com', 'password123');
      });

      expect(userData).toEqual(mockUsers.coach);
      expect(result.current.user).toEqual(mockUsers.coach);
      expect(localStorage.getItem('csf_access_token')).toBe('mock-access-token-coach');
    });

    it('should successfully login as admin', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let userData;
      await act(async () => {
        userData = await result.current.login('admin@test.com', 'password123');
      });

      expect(userData).toEqual(mockUsers.admin);
      expect(result.current.user).toEqual(mockUsers.admin);
      expect(localStorage.getItem('csf_access_token')).toBe('mock-access-token-admin');
    });

    it('should successfully login as owner', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let userData;
      await act(async () => {
        userData = await result.current.login('owner@test.com', 'password123');
      });

      expect(userData).toEqual(mockUsers.owner);
      expect(result.current.user).toEqual(mockUsers.owner);
      expect(localStorage.getItem('csf_access_token')).toBe('mock-access-token-owner');
    });

    it('should handle login error with invalid credentials', async () => {
      server.use(
        http.post(`${API_BASE}/auth/login`, () => {
          return HttpResponse.json(
            { message: 'Invalid credentials' },
            { status: 401 }
          );
        })
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await expect(
          result.current.login('wrong@test.com', 'wrongpassword')
        ).rejects.toThrow();
      });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('csf_access_token')).toBeNull();
    });

    it('should handle network error during login', async () => {
      server.use(
        http.post(`${API_BASE}/auth/login`, () => {
          return HttpResponse.error();
        })
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await expect(
          result.current.login('parent@test.com', 'password123')
        ).rejects.toThrow();
      });

      expect(result.current.user).toBeNull();
    });
  });

  // ==========================================
  // GOOGLE LOGIN TESTS
  // ==========================================

  describe('Google Login', () => {
    it('should successfully login with Google', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let userData;
      await act(async () => {
        userData = await result.current.loginWithGoogle('mock-google-credential');
      });

      expect(userData).toEqual(mockUsers.parent);
      expect(result.current.user).toEqual(mockUsers.parent);
      expect(localStorage.getItem('csf_access_token')).toBe('mock-google-access-token');
      expect(localStorage.getItem('csf_refresh_token')).toBe('mock-google-refresh-token');
    });

    it('should handle Google login error', async () => {
      server.use(
        http.post(`${API_BASE}/auth/google`, () => {
          return HttpResponse.json(
            { message: 'Invalid Google token' },
            { status: 401 }
          );
        })
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await expect(
          result.current.loginWithGoogle('invalid-credential')
        ).rejects.toThrow();
      });

      expect(result.current.user).toBeNull();
    });
  });

  // ==========================================
  // REGISTRATION TESTS
  // ==========================================

  describe('Registration', () => {
    it('should successfully register new user', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newUserData = {
        email: 'newuser@test.com',
        password: 'password123',
        confirm_password: 'password123',
        first_name: 'New',
        last_name: 'User',
        phone: '+1234567899',
      };

      let userData;
      await act(async () => {
        userData = await result.current.register(newUserData);
      });

      expect(userData).toBeDefined();
      expect(userData.email).toBe('newuser@test.com');
      expect(userData.first_name).toBe('New');
      expect(userData.last_name).toBe('User');
      expect(result.current.user).toBeDefined();
      expect(localStorage.getItem('csf_access_token')).toBe('mock-access-token-new');
    });

    it('should handle registration error with existing email', async () => {
      server.use(
        http.post(`${API_BASE}/auth/register`, () => {
          return HttpResponse.json(
            { message: 'Email already exists' },
            { status: 400 }
          );
        })
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const userData = {
        email: 'existing@test.com',
        password: 'password123',
        confirm_password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      };

      await act(async () => {
        await expect(result.current.register(userData)).rejects.toThrow();
      });

      expect(result.current.user).toBeNull();
    });
  });

  // ==========================================
  // LOGOUT TESTS
  // ==========================================

  describe('Logout', () => {
    it('should successfully logout', async () => {
      // Setup: Login first
      localStorage.setItem('csf_access_token', 'mock-access-token-parent');
      localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      // Wait for session restoration
      await waitFor(() => {
        expect(result.current.user).toEqual(mockUsers.parent);
      });

      // Logout
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('csf_access_token')).toBeNull();
      expect(localStorage.getItem('csf_refresh_token')).toBeNull();
    });

    it('should clear user state even if logout API fails', async () => {
      // Setup: Login first
      localStorage.setItem('csf_access_token', 'mock-access-token-parent');
      localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');

      server.use(
        http.post(`${API_BASE}/auth/logout`, () => {
          return HttpResponse.json(
            { message: 'Server error' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUsers.parent);
      });

      // Logout should still clear user state
      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('csf_access_token')).toBeNull();
      expect(localStorage.getItem('csf_refresh_token')).toBeNull();
    });
  });

  // ==========================================
  // UPDATE USER TESTS
  // ==========================================

  describe('Update User', () => {
    it('should update user data in context', async () => {
      // Setup: Login first
      localStorage.setItem('csf_access_token', 'mock-access-token-parent');
      localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUsers.parent);
      });

      const updatedUser = {
        ...mockUsers.parent,
        first_name: 'Updated',
        last_name: 'Name',
      };

      act(() => {
        result.current.updateUser(updatedUser);
      });

      expect(result.current.user.first_name).toBe('Updated');
      expect(result.current.user.last_name).toBe('Name');
    });
  });

  // ==========================================
  // SESSION RESTORATION TESTS
  // ==========================================

  describe('Session Restoration', () => {
    it('should restore parent session', async () => {
      localStorage.setItem('csf_access_token', 'mock-access-token-parent');
      localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUsers.parent);
    });

    it('should restore coach session', async () => {
      localStorage.setItem('csf_access_token', 'mock-access-token-coach');
      localStorage.setItem('csf_refresh_token', 'mock-refresh-token-coach');

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUsers.coach);
    });

    it('should restore admin session', async () => {
      localStorage.setItem('csf_access_token', 'mock-access-token-admin');
      localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUsers.admin);
    });

    it('should restore owner session', async () => {
      localStorage.setItem('csf_access_token', 'mock-access-token-owner');
      localStorage.setItem('csf_refresh_token', 'mock-refresh-token-owner');

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUsers.owner);
    });
  });

  // ==========================================
  // ERROR HANDLING TESTS
  // ==========================================

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      server.use(
        http.post(`${API_BASE}/auth/login`, () => {
          return HttpResponse.error();
        })
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await expect(
          result.current.login('parent@test.com', 'password123')
        ).rejects.toThrow();
      });
    });

    it('should handle server errors during login', async () => {
      server.use(
        http.post(`${API_BASE}/auth/login`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await expect(
          result.current.login('parent@test.com', 'password123')
        ).rejects.toThrow();
      });
    });

    it('should handle malformed response from /users/me', async () => {
      localStorage.setItem('csf_access_token', 'mock-access-token-parent');

      server.use(
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json(null);
        })
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should clear auth on malformed response
      expect(localStorage.getItem('csf_access_token')).toBeNull();
    });
  });

  // ==========================================
  // LOADING STATE TESTS
  // ==========================================

  describe('Loading States', () => {
    it('should maintain loading=true during session restoration', () => {
      localStorage.setItem('csf_access_token', 'mock-access-token-parent');

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      expect(result.current.loading).toBe(true);
    });

    it('should set loading=false after successful session restoration', async () => {
      localStorage.setItem('csf_access_token', 'mock-access-token-parent');

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeDefined();
    });

    it('should set loading=false after failed session restoration', async () => {
      localStorage.setItem('csf_access_token', 'invalid-token');

      server.use(
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
    });
  });
});
