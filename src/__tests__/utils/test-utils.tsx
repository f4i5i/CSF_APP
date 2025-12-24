/**
 * Test Utilities
 * Custom render function that wraps components with all providers
 */

import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../context/auth';
import { StateProvider } from '../../context/StateProvider';
import { initialState } from '../../context/initialState';
import reducer from '../../context/reducer';

// ==========================================
// TEST QUERY CLIENT
// ==========================================

/**
 * Create a fresh QueryClient for each test
 * Disables retries and caching for predictable tests
 */
export const createTestQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

// ==========================================
// PROVIDER WRAPPER COMPONENTS
// ==========================================

interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  initialEntries?: string[];
}

/**
 * All Providers wrapper with BrowserRouter
 * Use for most component tests
 */
const AllProviders = ({
  children,
  queryClient = createTestQueryClient(),
}: AllProvidersProps): React.ReactElement => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <StateProvider initialState={initialState} reducer={reducer}>
            {children}
          </StateProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

/**
 * All Providers wrapper with MemoryRouter
 * Use for tests that need specific route history
 */
const AllProvidersWithMemoryRouter = ({
  children,
  queryClient = createTestQueryClient(),
  initialEntries = ['/'],
}: AllProvidersProps): React.ReactElement => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <StateProvider initialState={initialState} reducer={reducer}>
            {children}
          </StateProvider>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

// ==========================================
// CUSTOM RENDER FUNCTIONS
// ==========================================

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialEntries?: string[];
  route?: string;
}

/**
 * Custom render with all providers
 * Default render function for most tests
 */
const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const { queryClient, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllProviders queryClient={queryClient}>{children}</AllProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Render with specific route for testing route-aware components
 */
const renderWithRouter = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
): RenderResult => {
  const { queryClient, initialEntries = ['/'], ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <AllProvidersWithMemoryRouter
      queryClient={queryClient}
      initialEntries={initialEntries}
    >
      {children}
    </AllProvidersWithMemoryRouter>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

/**
 * Render a component at a specific route path
 * Use for testing page components with route params
 */
const renderAtRoute = (
  ui: ReactElement,
  path: string,
  route: string,
  options: CustomRenderOptions = {}
): RenderResult => {
  const { queryClient, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient ?? createTestQueryClient()}>
      <AuthProvider>
        <MemoryRouter initialEntries={[route]}>
          <StateProvider initialState={initialState} reducer={reducer}>
            <Routes>
              <Route path={path} element={children} />
            </Routes>
          </StateProvider>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// ==========================================
// AUTH HELPERS
// ==========================================

type UserRole = 'parent' | 'coach' | 'admin' | 'owner';

/**
 * Mock authenticated state by setting localStorage tokens
 */
export const mockAuthenticatedUser = (role: UserRole = 'parent'): void => {
  localStorage.setItem('csf_access_token', `mock-access-token-${role}`);
  localStorage.setItem('csf_refresh_token', `mock-refresh-token-${role}`);
};

/**
 * Clear all auth state from localStorage
 */
export const clearAuthState = (): void => {
  localStorage.removeItem('csf_access_token');
  localStorage.removeItem('csf_refresh_token');
};

/**
 * Setup authenticated test environment
 * Returns cleanup function
 */
export const setupAuthenticatedTest = (role: UserRole = 'parent'): (() => void) => {
  mockAuthenticatedUser(role);
  return () => {
    clearAuthState();
  };
};

// ==========================================
// WAIT HELPERS
// ==========================================

/**
 * Wait for loading states to resolve
 */
export const waitForLoadingToFinish = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Flush all pending promises
 */
export const flushPromises = (): Promise<void> =>
  new Promise((resolve) => setImmediate(resolve));

// ==========================================
// RE-EXPORTS
// ==========================================

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Export custom render as default render
export { customRender as render, renderWithRouter, renderAtRoute };

// Export providers for manual wrapping
export { AllProviders, AllProvidersWithMemoryRouter };
