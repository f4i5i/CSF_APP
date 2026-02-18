/**
 * Unit Tests for ServiceAuth Context (serviceauth.js)
 * Tests the ServiceAuthProvider and useAuth hook for legacy service provider authentication
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { render, screen } from '@testing-library/react';
import { ServiceAuthProvider, useAuth } from '../serviceauth';

// ==========================================
// WRAPPER
// ==========================================

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ServiceAuthProvider>{children}</ServiceAuthProvider>
);

describe('ServiceAuth Context', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===========================================
  // EXPORTS TESTS
  // ===========================================

  describe('Exports', () => {
    it('should export ServiceAuthProvider', () => {
      expect(ServiceAuthProvider).toBeDefined();
    });

    it('should export useAuth hook', () => {
      expect(useAuth).toBeDefined();
      expect(typeof useAuth).toBe('function');
    });
  });

  // ===========================================
  // INITIAL STATE TESTS
  // ===========================================

  describe('Initial State', () => {
    it('should initialize with undefined serviceprovider when localStorage is empty', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.serviceprovider).toBeUndefined();
    });

    it('should initialize with localStorage value if present', () => {
      localStorage.setItem('serviceprovider', 'stored-provider-token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.serviceprovider).toBe('stored-provider-token');
    });

    it('should provide login function', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.login).toBeDefined();
      expect(typeof result.current.login).toBe('function');
    });

    it('should provide logout function', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.logout).toBeDefined();
      expect(typeof result.current.logout).toBe('function');
    });
  });

  // ===========================================
  // LOGIN TESTS
  // ===========================================

  describe('Login', () => {
    it('should set serviceprovider on login', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.login('service-provider-token-123');
      });

      expect(result.current.serviceprovider).toBe('service-provider-token-123');
    });

    it('should update serviceprovider on subsequent logins', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.login('token-1');
      });
      expect(result.current.serviceprovider).toBe('token-1');

      act(() => {
        result.current.login('token-2');
      });
      expect(result.current.serviceprovider).toBe('token-2');
    });

    it('should accept any value type for serviceprovider', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const providerData = {
        id: 'provider-1',
        name: 'Test Provider',
        token: 'abc123',
      };

      act(() => {
        result.current.login(providerData);
      });

      expect(result.current.serviceprovider).toEqual(providerData);
    });
  });

  // ===========================================
  // LOGOUT TESTS
  // ===========================================

  describe('Logout', () => {
    it('should clear serviceprovider on logout', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Login first
      act(() => {
        result.current.login('some-token');
      });
      expect(result.current.serviceprovider).toBe('some-token');

      // Logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.serviceprovider).toBeNull();
    });

    it('should remove serviceprovider from localStorage on logout', () => {
      localStorage.setItem('serviceprovider', 'stored-token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.logout();
      });

      expect(localStorage.getItem('serviceprovider')).toBeNull();
    });

    it('should handle logout when not logged in', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Should not throw
      act(() => {
        result.current.logout();
      });

      expect(result.current.serviceprovider).toBeNull();
    });
  });

  // ===========================================
  // CONSUMER COMPONENT TESTS
  // ===========================================

  describe('Consumer Component Integration', () => {
    it('should provide auth values to child components', () => {
      const TestConsumer = () => {
        const { serviceprovider } = useAuth();
        return (
          <div data-testid="provider">
            {serviceprovider ? String(serviceprovider) : 'not-logged-in'}
          </div>
        );
      };

      render(
        <ServiceAuthProvider>
          <TestConsumer />
        </ServiceAuthProvider>
      );

      expect(screen.getByTestId('provider').textContent).toBe('not-logged-in');
    });

    it('should update consumer when login is called', () => {
      const TestConsumer = () => {
        const { serviceprovider, login } = useAuth();
        return (
          <div>
            <span data-testid="provider">
              {serviceprovider ? String(serviceprovider) : 'not-logged-in'}
            </span>
            <button onClick={() => login('test-provider')} data-testid="login-btn">
              Login
            </button>
          </div>
        );
      };

      render(
        <ServiceAuthProvider>
          <TestConsumer />
        </ServiceAuthProvider>
      );

      expect(screen.getByTestId('provider').textContent).toBe('not-logged-in');

      act(() => {
        screen.getByTestId('login-btn').click();
      });

      expect(screen.getByTestId('provider').textContent).toBe('test-provider');
    });

    it('should update consumer when logout is called', () => {
      localStorage.setItem('serviceprovider', 'existing-provider');

      const TestConsumer = () => {
        const { serviceprovider, logout } = useAuth();
        return (
          <div>
            <span data-testid="provider">
              {serviceprovider ? String(serviceprovider) : 'not-logged-in'}
            </span>
            <button onClick={logout} data-testid="logout-btn">
              Logout
            </button>
          </div>
        );
      };

      render(
        <ServiceAuthProvider>
          <TestConsumer />
        </ServiceAuthProvider>
      );

      expect(screen.getByTestId('provider').textContent).toBe('existing-provider');

      act(() => {
        screen.getByTestId('logout-btn').click();
      });

      expect(screen.getByTestId('provider').textContent).toBe('not-logged-in');
    });
  });

  // ===========================================
  // CONTEXT VALUE SHAPE TESTS
  // ===========================================

  describe('Context Value Shape', () => {
    it('should return serviceprovider, login, and logout', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toHaveProperty('serviceprovider');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');

      const keys = Object.keys(result.current);
      expect(keys).toHaveLength(3);
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================

  describe('Edge Cases', () => {
    it('should handle login with null', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.login(null);
      });

      expect(result.current.serviceprovider).toBeNull();
    });

    it('should handle login with empty string', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.login('');
      });

      expect(result.current.serviceprovider).toBe('');
    });

    it('should handle multiple login/logout cycles', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Cycle 1
      act(() => result.current.login('token-1'));
      expect(result.current.serviceprovider).toBe('token-1');
      act(() => result.current.logout());
      expect(result.current.serviceprovider).toBeNull();

      // Cycle 2
      act(() => result.current.login('token-2'));
      expect(result.current.serviceprovider).toBe('token-2');
      act(() => result.current.logout());
      expect(result.current.serviceprovider).toBeNull();

      // Cycle 3
      act(() => result.current.login('token-3'));
      expect(result.current.serviceprovider).toBe('token-3');
    });
  });
});
