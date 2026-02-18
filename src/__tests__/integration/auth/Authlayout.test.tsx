/**
 * AuthLayout Integration Tests
 * Tests the auth layout wrapper component including Outlet rendering and Footer
 */

import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../utils/test-utils';
import AuthLayout from '../../../pages/Authlayout';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { render } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../context/auth';
import { StateProvider } from '../../../context/StateProvider';
import { initialState } from '../../../context/initialState';
import reducer from '../../../context/reducer';
import { createTestQueryClient } from '../../utils/test-utils';

// Mock Footer component
jest.mock('../../../components/Footer', () => ({
  __esModule: true,
  default: ({ isFixed }: { isFixed?: boolean }) => (
    <div data-testid="footer" data-fixed={isFixed}>
      Footer
    </div>
  ),
}));

describe('AuthLayout', () => {
  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the layout container', () => {
      renderWithRouter(<AuthLayout />);

      // The layout should render with its background gradient
      const container = document.querySelector('.min-h-screen');
      expect(container).toBeInTheDocument();
    });

    it('should render the Footer component', () => {
      renderWithRouter(<AuthLayout />);

      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should pass isFixed={false} to Footer', () => {
      renderWithRouter(<AuthLayout />);

      const footer = screen.getByTestId('footer');
      expect(footer).toHaveAttribute('data-fixed', 'false');
    });

    it('should render a main content area for child routes', () => {
      renderWithRouter(<AuthLayout />);

      // The flex container for the outlet should exist
      const mainContent = document.querySelector('.flex-1.flex');
      expect(mainContent).toBeInTheDocument();
    });
  });

  // ===========================================
  // OUTLET RENDERING TESTS
  // ===========================================
  describe('Outlet Rendering', () => {
    it('should render child route content via Outlet', () => {
      const TestChild = () => <div data-testid="test-child">Login Form Here</div>;

      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <AuthProvider>
            <MemoryRouter initialEntries={['/auth/login']}>
              <StateProvider initialState={initialState} reducer={reducer}>
                <Routes>
                  <Route element={<AuthLayout />}>
                    <Route path="auth/login" element={<TestChild />} />
                  </Route>
                </Routes>
              </StateProvider>
            </MemoryRouter>
          </AuthProvider>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Login Form Here')).toBeInTheDocument();
    });

    it('should render different child routes', () => {
      const RegisterChild = () => <div data-testid="register-child">Register Form Here</div>;

      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <AuthProvider>
            <MemoryRouter initialEntries={['/auth/register']}>
              <StateProvider initialState={initialState} reducer={reducer}>
                <Routes>
                  <Route element={<AuthLayout />}>
                    <Route path="auth/register" element={<RegisterChild />} />
                  </Route>
                </Routes>
              </StateProvider>
            </MemoryRouter>
          </AuthProvider>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('register-child')).toBeInTheDocument();
      expect(screen.getByText('Register Form Here')).toBeInTheDocument();
    });

    it('should render Footer alongside child route content', () => {
      const TestChild = () => <div data-testid="test-child">Content</div>;

      render(
        <QueryClientProvider client={createTestQueryClient()}>
          <AuthProvider>
            <MemoryRouter initialEntries={['/auth/test']}>
              <StateProvider initialState={initialState} reducer={reducer}>
                <Routes>
                  <Route element={<AuthLayout />}>
                    <Route path="auth/test" element={<TestChild />} />
                  </Route>
                </Routes>
              </StateProvider>
            </MemoryRouter>
          </AuthProvider>
        </QueryClientProvider>
      );

      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  // ===========================================
  // LAYOUT STRUCTURE TESTS
  // ===========================================
  describe('Layout Structure', () => {
    it('should have proper background gradient styling', () => {
      renderWithRouter(<AuthLayout />);

      const container = document.querySelector('.bg-gradient-to-b');
      expect(container).toBeInTheDocument();
    });

    it('should have full-screen layout (min-h-screen)', () => {
      renderWithRouter(<AuthLayout />);

      const container = document.querySelector('.min-h-screen');
      expect(container).toBeInTheDocument();
    });

    it('should use flex column layout', () => {
      renderWithRouter(<AuthLayout />);

      const container = document.querySelector('.flex.flex-col');
      expect(container).toBeInTheDocument();
    });

    it('should have justify-between for footer placement', () => {
      renderWithRouter(<AuthLayout />);

      const container = document.querySelector('.justify-between');
      expect(container).toBeInTheDocument();
    });

    it('should center the main content area', () => {
      renderWithRouter(<AuthLayout />);

      const mainContent = document.querySelector('.flex-1.flex.justify-center.items-center');
      expect(mainContent).toBeInTheDocument();
    });
  });
});
