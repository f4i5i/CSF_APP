/**
 * Authentication Context
 * Provides authentication state and actions using React Query
 */

import React, { createContext, useContext, useCallback } from 'react';
import { useUser } from '../api/hooks/users/useUser';
import { useLogin } from '../api/hooks/auth/useLogin';
import { useRegister } from '../api/hooks/auth/useRegister';
import { useLogout } from '../api/hooks/auth/useLogout';
import { authService } from '../api/services/auth.service';
import type { User, LoginRequest, RegisterRequest } from '../api/types/auth.types';

/**
 * Auth context value
 */
interface AuthContextValue {
  user: User | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Auth Provider Component
 * Wraps app to provide authentication context
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Fetch current user (only if authenticated)
  const {
    data: user,
    isLoading: isUserLoading,
    isError,
  } = useUser({
    enabled: authService.isAuthenticated(),
  });

  // Login mutation
  const { mutateAsync: loginMutation, isPending: isLoginPending } = useLogin();

  // Register mutation
  const { mutateAsync: registerMutation, isPending: isRegisterPending } = useRegister();

  // Logout mutation
  const { mutate: logoutMutation } = useLogout();

  /**
   * Login handler
   */
  const login = useCallback(
    async (credentials: LoginRequest) => {
      await loginMutation(credentials);
    },
    [loginMutation]
  );

  /**
   * Register handler
   */
  const register = useCallback(
    async (data: RegisterRequest) => {
      await registerMutation(data);
    },
    [registerMutation]
  );

  /**
   * Logout handler
   */
  const logout = useCallback(() => {
    logoutMutation();
  }, [logoutMutation]);

  /**
   * Determine overall loading state
   */
  const isLoading = isUserLoading || isLoginPending || isRegisterPending;

  /**
   * Determine authentication state
   */
  const isAuthenticated = !!user && !isError;

  const value: AuthContextValue = {
    user: user ?? null,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * Access authentication context
 *
 * @example
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * if (!isAuthenticated) {
 *   return <LoginForm onSubmit={login} />;
 * }
 *
 * return <div>Welcome, {user?.first_name}!</div>;
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
