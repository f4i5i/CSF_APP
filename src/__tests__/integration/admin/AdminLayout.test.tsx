/**
 * Integration Tests for AdminLayout.jsx
 * Tests: layout rendering, sidebar collapse/expand, mobile overlay, Outlet rendering
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../../../context/auth';
import { StateProvider } from '../../../context/StateProvider';
import { initialState } from '../../../context/initialState';
import reducer from '../../../context/reducer';

// Mock the AdminSidebar component to simplify layout tests
jest.mock('../../../components/AdminSidebar/AdminSidebar', () => {
  return function MockAdminSidebar({ collapsed, setCollapsed, onNavigate }: any) {
    return (
      <div data-testid="admin-sidebar" data-collapsed={collapsed}>
        <button data-testid="toggle-sidebar" onClick={() => setCollapsed(!collapsed)}>
          Toggle
        </button>
        <button data-testid="navigate-action" onClick={onNavigate}>
          Navigate
        </button>
      </div>
    );
  };
});

// Lazy import to get the component after mocks are set
import AdminLayout from '../../../layouts/AdminLayout';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

const renderLayout = (initialRoute = '/admin') => {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <StateProvider initialState={initialState} reducer={reducer}>
            <Routes>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<div data-testid="admin-home">Admin Home</div>} />
                <Route path="users" element={<div data-testid="admin-users">Users Page</div>} />
              </Route>
            </Routes>
          </StateProvider>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

describe('AdminLayout', () => {
  describe('Rendering', () => {
    it('should render the layout with sidebar and main content', () => {
      renderLayout();
      expect(screen.getByTestId('admin-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('admin-home')).toBeInTheDocument();
    });

    it('should render the Outlet content for nested routes', () => {
      renderLayout('/admin/users');
      expect(screen.getByTestId('admin-users')).toBeInTheDocument();
    });

    it('should start with sidebar not collapsed', () => {
      renderLayout();
      const sidebar = screen.getByTestId('admin-sidebar');
      expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    });
  });

  describe('Sidebar Collapse', () => {
    it('should toggle sidebar collapsed state', () => {
      renderLayout();
      const sidebar = screen.getByTestId('admin-sidebar');
      expect(sidebar).toHaveAttribute('data-collapsed', 'false');

      fireEvent.click(screen.getByTestId('toggle-sidebar'));
      expect(sidebar).toHaveAttribute('data-collapsed', 'true');

      fireEvent.click(screen.getByTestId('toggle-sidebar'));
      expect(sidebar).toHaveAttribute('data-collapsed', 'false');
    });
  });

  describe('Main Content Area', () => {
    it('should render main content area', () => {
      renderLayout();
      const main = document.querySelector('main');
      expect(main).toBeInTheDocument();
    });

    it('should adjust margin based on sidebar state', () => {
      renderLayout();
      const main = document.querySelector('main');
      expect(main?.className).toContain('md:ml-64');

      fireEvent.click(screen.getByTestId('toggle-sidebar'));
      expect(main?.className).toContain('md:ml-20');
    });
  });
});
