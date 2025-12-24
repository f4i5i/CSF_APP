/**
 * Integration Tests for Admin Dashboard Page
 * Tests dashboard metrics display, loading states, and data rendering
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import AdminDashboard from '../../../pages/AdminDashboard/AdminDashboard';

const API_BASE = 'http://localhost:8000/api/v1';

describe('AdminDashboard Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Dashboard Metrics Display', () => {
    it('should display loading state initially', () => {
      render(<AdminDashboard />);

      expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
    });

    it('should display dashboard metrics after loading', async () => {
      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Check welcome message with user name
      expect(screen.getByText(/Welcome back,/i)).toBeInTheDocument();

      // Check key metrics display
      expect(screen.getByText(/Managing/i)).toBeInTheDocument();
      expect(screen.getByText(/active students/i)).toBeInTheDocument();
      expect(screen.getByText(/Checked In Today/i)).toBeInTheDocument();
    });

    it('should display active and total student counts', async () => {
      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Active students should be displayed
      expect(screen.getByText(/150/i)).toBeInTheDocument();
      expect(screen.getByText(/active students/i)).toBeInTheDocument();
    });

    it('should display program breakdown', async () => {
      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Programs should be displayed with counts
      expect(screen.getByText(/Soccer/i)).toBeInTheDocument();
      expect(screen.getByText(/Basketball/i)).toBeInTheDocument();
    });

    it('should display registration and cancellation metrics', async () => {
      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Check for time-based metrics (24h, 7d, 30d)
      const cards = screen.getAllByText(/24h|7d|30d/i);
      expect(cards.length).toBeGreaterThan(0);
    });

    it('should display monthly enrollments chart', async () => {
      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      expect(screen.getByText(/Enrollments \(monthly\)/i)).toBeInTheDocument();
    });

    it('should display today\'s classes section', async () => {
      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

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
      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Summary cards should show program and class counts
      expect(screen.getByText(/Programs|Classes/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error toast when API fails', async () => {
      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load dashboard data/i)).toBeInTheDocument();
      });
    });

    it('should handle empty metrics gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          return HttpResponse.json({
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
        })
      );

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Should display zeros gracefully
      expect(screen.getByText(/0 active students/i)).toBeInTheDocument();
    });
  });

  describe('Data Transformation', () => {
    it('should transform API data correctly for components', async () => {
      const mockMetrics = {
        active_enrollments: 150,
        total_students: 200,
        total_schools: 5,
        programs_with_counts: [
          { id: 'prog-1', name: 'Soccer', count: 80 },
          { id: 'prog-2', name: 'Basketball', count: 70 },
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

      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          return HttpResponse.json(mockMetrics);
        })
      );

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Verify transformed data is displayed
      expect(screen.getByText(/150/i)).toBeInTheDocument();
      expect(screen.getByText(/42/i)).toBeInTheDocument();
      expect(screen.getByText(/Soccer Basics/i)).toBeInTheDocument();
    });

    it('should handle missing today_classes gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          return HttpResponse.json({
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
        })
      );

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Should not crash
      expect(screen.getByText(/Welcome back,/i)).toBeInTheDocument();
    });
  });

  describe('User Display', () => {
    it('should display user first name in welcome message', async () => {
      server.use(
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'user-admin-1',
            email: 'admin@test.com',
            first_name: 'John',
            last_name: 'Admin',
            role: 'admin',
          });
        })
      );

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome back, John!/i)).toBeInTheDocument();
      });
    });

    it('should fallback to "Admin" when no name available', async () => {
      server.use(
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'user-admin-1',
            email: 'admin@test.com',
            role: 'admin',
          });
        })
      );

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Welcome back, Admin!/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render grid layout for dashboard components', async () => {
      render(<AdminDashboard />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Check that major sections exist
      const dashboard = screen.getByText(/Welcome back,/i).closest('div');
      expect(dashboard).toBeInTheDocument();
    });
  });

  describe('Metrics Refresh', () => {
    it('should fetch metrics on component mount', async () => {
      let callCount = 0;

      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          callCount++;
          return HttpResponse.json({
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
            today_classes: [],
            checked_in_today: 42,
          });
        })
      );

      render(<AdminDashboard />);

      await waitFor(() => {
        expect(callCount).toBe(1);
      });
    });
  });
});
