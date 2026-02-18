/**
 * Integration Tests for Admin Dashboard Page
 * Tests dashboard metrics display, loading states, and data rendering
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminDashboard from '../../../pages/AdminDashboard/AdminDashboard';

// ==========================================
// MOCKS
// ==========================================

// Mock the auth context
const mockUser = { id: 'user-admin-1', email: 'admin@test.com', first_name: 'Test', last_name: 'Admin', role: 'ADMIN' };
let mockAuthUser: any = mockUser;
jest.mock('../../../context/auth', () => ({
  useAuth: () => ({ user: mockAuthUser, loading: false }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Header to avoid side effects
jest.mock('../../../components/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

// Mock toast
const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
  success: (...args: unknown[]) => mockToastSuccess(...args),
  error: (...args: unknown[]) => mockToastError(...args),
}));

// Mock sub-components that may use complex chart libraries
jest.mock('../../../components/AdminDashboard/MembersBarChart', () => ({
  __esModule: true,
  default: ({ data }: { data: any[] }) => (
    <div data-testid="bar-chart">{data?.length || 0} data points</div>
  ),
}));

// Mock admin service
const mockGetDashboardMetrics = jest.fn();
jest.mock('../../../api/services/admin.service', () => ({
  __esModule: true,
  default: {
    getDashboardMetrics: (...args: any[]) => mockGetDashboardMetrics(...args),
  },
}));

// ==========================================
// TEST SETUP
// ==========================================

const defaultMetrics = {
  active_enrollments: 150,
  total_students: 200,
  total_schools: 5,
  programs_with_counts: [
    { name: 'Soccer', count: 80 },
    { name: 'Basketball', count: 70 },
  ],
  registrations_24h: 5,
  registrations_7d: 25,
  registrations_30d: 100,
  cancellations_24h: 1,
  cancellations_7d: 5,
  cancellations_30d: 15,
  monthly_enrollments: [
    { month: 'Jan', count: 30 },
    { month: 'Feb', count: 45 },
    { month: 'Mar', count: 60 },
  ],
  today_classes: [
    {
      id: 'class-1',
      name: 'Soccer Basics',
      school_name: 'Test Elementary',
      start_time: '3:00 PM',
      end_time: '4:00 PM',
      enrolled_count: 15,
    },
  ],
  checked_in_today: 42,
  total_classes: 10,
  total_programs: 2,
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('AdminDashboard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthUser = mockUser;
    mockGetDashboardMetrics.mockResolvedValue({ ...defaultMetrics });
  });

  const waitForLoaded = async () => {
    await waitFor(() => {
      expect(screen.getByText(/Welcome back,/i)).toBeInTheDocument();
    });
  };

  describe('Dashboard Metrics Display', () => {
    it('should display loading state initially', () => {
      mockGetDashboardMetrics.mockReturnValue(new Promise(() => {})); // never resolves

      render(<AdminDashboard />, { wrapper: createWrapper() });

      // The loading state renders an animate-spin div
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('should display dashboard metrics after loading', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitForLoaded();

      // Check welcome message with user name
      expect(screen.getByText(/Welcome back,/i)).toBeInTheDocument();

      // Check key metrics display
      expect(screen.getByText(/Managing/i)).toBeInTheDocument();
      expect(screen.getAllByText(/active students/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Checked In Today/i)).toBeInTheDocument();
    });

    it('should display active and total student counts', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitForLoaded();

      // Active students should be displayed
      expect(screen.getAllByText(/150/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/active students/i).length).toBeGreaterThan(0);
    });

    it('should display program breakdown', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitForLoaded();

      // Programs should be displayed with counts
      expect(screen.getAllByText(/Soccer/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Basketball/i).length).toBeGreaterThan(0);
    });

    it('should display registration and cancellation metrics', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitForLoaded();

      // Check for time-based metrics (24h, 7d, 30d)
      const cards = screen.getAllByText(/24h|7d|30d/i);
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should display monthly enrollments chart', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitForLoaded();

      expect(screen.getByText(/Enrollments \(monthly\)/i)).toBeInTheDocument();
    });

    it('should display today\'s classes section', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitForLoaded();

      // Today's date should be displayed
      const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      expect(screen.getByText(today)).toBeInTheDocument();
    });

    it('should display total classes and programs summary', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitForLoaded();

      // Summary cards should show program and class counts
      expect(screen.getAllByText(/Programs|Classes/i).length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should call error toast when API fails', async () => {
      mockGetDashboardMetrics.mockRejectedValue(new Error('Server error'));

      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to load dashboard data');
      });
    });

    it('should handle empty metrics gracefully', async () => {
      mockGetDashboardMetrics.mockResolvedValue({
        active_enrollments: 0,
        total_students: 0,
        total_schools: 0,
        programs_with_counts: [],
        registrations_24h: 0,
        registrations_7d: 0,
        registrations_30d: 0,
        cancellations_24h: 0,
        cancellations_7d: 0,
        cancellations_30d: 0,
        monthly_enrollments: [],
        today_classes: [],
        checked_in_today: 0,
      });

      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitForLoaded();

      // Should display zeros gracefully
      expect(screen.getByText(/0 active students/i)).toBeInTheDocument();
    });
  });

  describe('Data Transformation', () => {
    it('should transform API data correctly for components', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitForLoaded();

      // Verify transformed data is displayed
      expect(screen.getAllByText(/150/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/42/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Soccer Basics/i).length).toBeGreaterThan(0);
    });

    it('should handle missing today_classes gracefully', async () => {
      mockGetDashboardMetrics.mockResolvedValue({
        active_enrollments: 150,
        total_students: 200,
        programs_with_counts: [],
        registrations_24h: 5,
        registrations_7d: 25,
        registrations_30d: 100,
        cancellations_24h: 1,
        cancellations_7d: 5,
        cancellations_30d: 15,
        monthly_enrollments: [],
        today_classes: null,
        checked_in_today: 0,
      });

      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitForLoaded();

      // Should not crash
      expect(screen.getByText(/Welcome back,/i)).toBeInTheDocument();
    });
  });

  describe('User Display', () => {
    it('should display user first name in welcome message', async () => {
      mockAuthUser = { id: 'user-admin-1', email: 'admin@test.com', first_name: 'John', last_name: 'Admin', role: 'admin' };

      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/Welcome back, John!/i)).toBeInTheDocument();
      });
    });

    it('should fallback to "Admin" when no name available', async () => {
      mockAuthUser = { id: 'user-admin-1', email: 'admin@test.com', role: 'admin' };

      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Admin!/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render grid layout for dashboard components', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitForLoaded();

      // Check that major sections exist
      const dashboard = screen.getByText(/Welcome back,/i).closest('div');
      expect(dashboard).toBeInTheDocument();
    });
  });

  describe('Metrics Refresh', () => {
    it('should fetch metrics on component mount', async () => {
      render(<AdminDashboard />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockGetDashboardMetrics).toHaveBeenCalled();
      });
    });
  });
});
