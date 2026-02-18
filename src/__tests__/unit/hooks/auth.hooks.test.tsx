/**
 * Unit Tests for Auth Hooks
 * Tests useLogin, useLogout, useRegister
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import toast from 'react-hot-toast';

import { useLogin } from '../../../api/hooks/auth/useLogin';
import { useLogout } from '../../../api/hooks/auth/useLogout';
import { useRegister } from '../../../api/hooks/auth/useRegister';

jest.mock('../../../api/services/auth.service', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

import { authService } from '../../../api/services/auth.service';

const mockedService = authService as jest.Mocked<typeof authService>;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0, refetchOnWindowFocus: false, refetchOnMount: false, refetchOnReconnect: false },
      mutations: { retry: false },
    },
  });
}

function createWrapper(qc: QueryClient) {
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

// Mock window.location
const originalLocation = window.location;

describe('Auth Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    jest.clearAllMocks();

    // Mock window.location.href for logout redirect
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...originalLocation, href: '' },
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation,
    });
  });

  // =========================================================================
  // useLogin
  // =========================================================================
  describe('useLogin', () => {
    it('should have idle state initially', () => {
      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should login successfully and show success toast', async () => {
      const mockResponse = { user: { id: 'user-1', email: 'test@test.com' }, access_token: 'token' };
      mockedService.login.mockResolvedValueOnce(mockResponse as any);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ email: 'test@test.com', password: 'password' } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockedService.login).toHaveBeenCalledWith({ email: 'test@test.com', password: 'password' });
      expect(toast.success).toHaveBeenCalledWith('Welcome back!');
    });

    it('should show error toast on login failure', async () => {
      mockedService.login.mockRejectedValueOnce({ message: 'Invalid credentials' });

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ email: 'test@test.com', password: 'wrong' } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
    });

    it('should show default error message when error has no message', async () => {
      mockedService.login.mockRejectedValueOnce({});

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ email: 'test@test.com', password: 'wrong' } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Login failed');
    });

    it('should accept custom mutationOptions', async () => {
      const customOnSuccess = jest.fn();
      mockedService.login.mockResolvedValueOnce({ user: { id: 'user-1' } } as any);

      const { result } = renderHook(
        () => useLogin({ mutationOptions: { onSuccess: customOnSuccess } }),
        { wrapper: createWrapper(queryClient) }
      );

      await act(async () => {
        result.current.mutate({ email: 'test@test.com', password: 'password' } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });

  // =========================================================================
  // useLogout
  // =========================================================================
  describe('useLogout', () => {
    it('should logout successfully and show success toast', async () => {
      mockedService.logout.mockResolvedValueOnce(undefined as any);

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalledWith('Logged out successfully');
    });

    it('should redirect to /login on settled', async () => {
      mockedService.logout.mockResolvedValueOnce(undefined as any);

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(window.location.href).toBe('/login');
      });
    });

    it('should redirect to /login even on error', async () => {
      mockedService.logout.mockRejectedValueOnce({ message: 'Network error' });

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => {
        expect(window.location.href).toBe('/login');
      });

      expect(toast.error).toHaveBeenCalledWith('Network error');
    });

    it('should show error toast on failure', async () => {
      mockedService.logout.mockRejectedValueOnce({ message: 'Server error' });

      const { result } = renderHook(() => useLogout(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate();
      });

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Server error'));
    });
  });

  // =========================================================================
  // useRegister
  // =========================================================================
  describe('useRegister', () => {
    it('should register successfully and show success toast', async () => {
      const mockResponse = { user: { id: 'user-new', email: 'new@test.com' }, access_token: 'token' };
      mockedService.register.mockResolvedValueOnce(mockResponse as any);

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          email: 'new@test.com',
          password: 'password123',
          first_name: 'New',
          last_name: 'User',
        } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(toast.success).toHaveBeenCalledWith('Account created successfully!');
    });

    it('should show error toast on registration failure', async () => {
      mockedService.register.mockRejectedValueOnce({ message: 'Email already exists' });

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({
          email: 'existing@test.com',
          password: 'password',
          first_name: 'Test',
          last_name: 'User',
        } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Email already exists');
    });

    it('should show default error message when error has no message', async () => {
      mockedService.register.mockRejectedValueOnce({});

      const { result } = renderHook(() => useRegister(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        result.current.mutate({ email: '', password: '', first_name: '', last_name: '' } as any);
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Registration failed');
    });

    it('should accept custom mutationOptions', async () => {
      const customOnSuccess = jest.fn();
      mockedService.register.mockResolvedValueOnce({ user: { id: 'user-new' } } as any);

      const { result } = renderHook(
        () => useRegister({ mutationOptions: { onSuccess: customOnSuccess } }),
        { wrapper: createWrapper(queryClient) }
      );

      await act(async () => {
        result.current.mutate({
          email: 'new@test.com',
          password: 'password',
          first_name: 'New',
          last_name: 'User',
        } as any);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });
});
