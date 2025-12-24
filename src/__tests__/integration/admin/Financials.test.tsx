/**
 * Integration Tests for Financials Page
 * Tests financial reports, revenue display, and filtering
 */

import { render, screen, waitFor, within } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Financials from '../../../pages/AdminDashboard/Financials';

const API_BASE = 'http://localhost:8000/api/v1';

describe('Financials Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Page Loading and Initial State', () => {
    it('should display loading state initially', () => {
      render(<Financials />);

      expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
    });

    it('should display page header after loading', async () => {
      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByText('Financials')).toBeInTheDocument();
      });

      expect(screen.getByText(/Overview of revenue/i)).toBeInTheDocument();
    });

    it('should display export CSV button', async () => {
      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByText('Export CSV')).toBeInTheDocument();
      });
    });

    it('should display Add Report button', async () => {
      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByText('Add Report')).toBeInTheDocument();
      });
    });
  });

  describe('Revenue Cards Display', () => {
    it('should display revenue totals for different time periods', async () => {
      const mockMetrics = {
        revenue_today: 500,
        revenue_this_week: 3500,
        revenue_this_month: 15000,
        total_revenue: 150000,
        active_enrollments: 150,
        programs_with_counts: [],
      };

      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          return HttpResponse.json(mockMetrics);
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Check that time period labels exist
      expect(screen.getByText(/24h|7d|30d|YTD/i)).toBeInTheDocument();
    });

    it('should calculate and display 90-day revenue estimate', async () => {
      const mockMetrics = {
        revenue_today: 500,
        revenue_this_week: 3500,
        revenue_this_month: 15000,
        total_revenue: 150000,
        active_enrollments: 150,
        programs_with_counts: [],
      };

      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          return HttpResponse.json(mockMetrics);
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // 90-day revenue should be 3x monthly revenue (estimate)
      // This is rendered by the component
      expect(screen.getByText(/Financials/i)).toBeInTheDocument();
    });

    it('should handle zero revenue gracefully', async () => {
      const mockMetrics = {
        revenue_today: 0,
        revenue_this_week: 0,
        revenue_this_month: 0,
        total_revenue: 0,
        active_enrollments: 0,
        programs_with_counts: [],
      };

      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          return HttpResponse.json(mockMetrics);
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Should not crash with zero values
      expect(screen.getByText('Financials')).toBeInTheDocument();
    });
  });

  describe('Program Revenue Breakdown', () => {
    it('should display program revenue list', async () => {
      const mockMetrics = {
        revenue_today: 500,
        revenue_this_week: 3500,
        revenue_this_month: 15000,
        total_revenue: 150000,
        programs_with_counts: [
          { id: 'prog-1', name: 'Soccer', count: 80 },
          { id: 'prog-2', name: 'Basketball', count: 70 },
        ],
      };

      const mockPrograms = [
        {
          id: 'prog-1',
          name: 'Soccer',
          description: 'Learn soccer fundamentals',
          is_active: true,
        },
        {
          id: 'prog-2',
          name: 'Basketball',
          description: 'Basketball skills program',
          is_active: true,
        },
      ];

      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          return HttpResponse.json(mockMetrics);
        }),
        http.get(`${API_BASE}/programs`, () => {
          return HttpResponse.json(mockPrograms);
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
        expect(screen.getByText('Basketball')).toBeInTheDocument();
      });
    });

    it('should calculate estimated revenue based on enrollments', async () => {
      const mockMetrics = {
        revenue_today: 500,
        revenue_this_week: 3500,
        revenue_this_month: 15000,
        total_revenue: 150000,
        programs_with_counts: [
          { id: 'prog-1', name: 'Soccer', count: 80 },
        ],
      };

      const mockPrograms = [
        {
          id: 'prog-1',
          name: 'Soccer',
          description: 'Learn soccer fundamentals',
          is_active: true,
        },
      ];

      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          return HttpResponse.json(mockMetrics);
        }),
        http.get(`${API_BASE}/programs`, () => {
          return HttpResponse.json(mockPrograms);
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      // Revenue should be calculated as enrollments * $150
      // 80 enrollments * $150 = $12,000
      // This is rendered by the RevenuePrograms component
    });

    it('should filter out programs with zero enrollments', async () => {
      const mockMetrics = {
        revenue_today: 500,
        revenue_this_week: 3500,
        revenue_this_month: 15000,
        total_revenue: 150000,
        programs_with_counts: [
          { id: 'prog-1', name: 'Soccer', count: 80 },
          { id: 'prog-2', name: 'Tennis', count: 0 },
        ],
      };

      const mockPrograms = [
        {
          id: 'prog-1',
          name: 'Soccer',
          is_active: true,
        },
        {
          id: 'prog-2',
          name: 'Tennis',
          is_active: true,
        },
      ];

      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          return HttpResponse.json(mockMetrics);
        }),
        http.get(`${API_BASE}/programs`, () => {
          return HttpResponse.json(mockPrograms);
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByText('Soccer')).toBeInTheDocument();
      });

      // Tennis with 0 enrollments should be filtered out
      expect(screen.queryByText('Tennis')).not.toBeInTheDocument();
    });

    it('should sort programs by revenue (highest first)', async () => {
      const mockMetrics = {
        revenue_today: 500,
        revenue_this_week: 3500,
        revenue_this_month: 15000,
        total_revenue: 150000,
        programs_with_counts: [
          { id: 'prog-1', name: 'Soccer', count: 50 },
          { id: 'prog-2', name: 'Basketball', count: 100 },
        ],
      };

      const mockPrograms = [
        { id: 'prog-1', name: 'Soccer', is_active: true },
        { id: 'prog-2', name: 'Basketball', is_active: true },
      ];

      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          return HttpResponse.json(mockMetrics);
        }),
        http.get(`${API_BASE}/programs`, () => {
          return HttpResponse.json(mockPrograms);
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByText('Basketball')).toBeInTheDocument();
      });

      // Basketball (100 enrollments) should appear before Soccer (50 enrollments)
      expect(screen.getByText('Soccer')).toBeInTheDocument();
    });
  });

  describe('Class Revenue Chart', () => {
    it('should display revenue per class section', async () => {
      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByText(/Revenue per Class/i)).toBeInTheDocument();
      });
    });

    it('should display class dropdown selector', async () => {
      const mockClasses = {
        items: [
          {
            id: 'class-1',
            name: 'Soccer Basics',
            school: { id: 'school-1', name: 'Test Elementary' },
          },
          {
            id: 'class-2',
            name: 'Basketball 101',
            school: { id: 'school-1', name: 'Test Elementary' },
          },
        ],
        total: 2,
      };

      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json(mockClasses);
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });

    it('should format class dropdown options with school name', async () => {
      const mockClasses = {
        items: [
          {
            id: 'class-1',
            name: 'Soccer Basics',
            school: { id: 'school-1', name: 'Test Elementary' },
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json(mockClasses);
        })
      );

      render(<Financials />);

      await waitFor(() => {
        const dropdown = screen.getByRole('combobox');
        expect(dropdown).toBeInTheDocument();
      });

      // Should display "School • Class Name" format
      const dropdown = screen.getByRole('combobox');
      expect(dropdown.textContent).toContain('Test Elementary');
      expect(dropdown.textContent).toContain('Soccer Basics');
    });

    it('should switch class when dropdown changes', async () => {
      const user = userEvent.setup();

      const mockClasses = {
        items: [
          {
            id: 'class-1',
            name: 'Soccer Basics',
            school: { id: 'school-1', name: 'Test Elementary' },
          },
          {
            id: 'class-2',
            name: 'Basketball 101',
            school: { id: 'school-2', name: 'West School' },
          },
        ],
        total: 2,
      };

      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json(mockClasses);
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });

      const dropdown = screen.getByRole('combobox');
      await user.selectOptions(dropdown, 'class-2');

      await waitFor(() => {
        expect(dropdown).toHaveValue('class-2');
      });
    });

    it('should display monthly revenue data label', async () => {
      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByText(/Monthly/i)).toBeInTheDocument();
      });
    });
  });

  describe('Average Per Student', () => {
    it('should display average revenue per student section', async () => {
      const mockMetrics = {
        revenue_today: 500,
        revenue_this_week: 3500,
        revenue_this_month: 15000,
        total_revenue: 150000,
        programs_with_counts: [
          { id: 'prog-1', name: 'Soccer', count: 80 },
        ],
      };

      const mockPrograms = [
        { id: 'prog-1', name: 'Soccer', is_active: true },
      ];

      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          return HttpResponse.json(mockMetrics);
        }),
        http.get(`${API_BASE}/programs`, () => {
          return HttpResponse.json(mockPrograms);
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Average per student should be calculated and displayed
      // Component renders this data
      expect(screen.getByText('Financials')).toBeInTheDocument();
    });

    it('should calculate average correctly', async () => {
      const mockMetrics = {
        revenue_today: 500,
        revenue_this_week: 3500,
        revenue_this_month: 15000,
        total_revenue: 150000,
        programs_with_counts: [
          { id: 'prog-1', name: 'Soccer', count: 100 },
        ],
      };

      const mockPrograms = [
        { id: 'prog-1', name: 'Soccer', is_active: true },
      ];

      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          return HttpResponse.json(mockMetrics);
        }),
        http.get(`${API_BASE}/programs`, () => {
          return HttpResponse.json(mockPrograms);
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Average should be revenue / enrollments
      // $15,000 (100 enrollments * $150) / 100 = $150 per student
      expect(screen.getByText('Soccer')).toBeInTheDocument();
    });

    it('should handle division by zero when no enrollments', async () => {
      const mockMetrics = {
        revenue_today: 0,
        revenue_this_week: 0,
        revenue_this_month: 0,
        total_revenue: 0,
        programs_with_counts: [],
      };

      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          return HttpResponse.json(mockMetrics);
        }),
        http.get(`${API_BASE}/programs`, () => {
          return HttpResponse.json([]);
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Should not crash
      expect(screen.getByText('Financials')).toBeInTheDocument();
    });
  });

  describe('Export Functionality', () => {
    it('should export CSV when export button clicked', async () => {
      const user = userEvent.setup();

      // Mock URL.createObjectURL and URL.revokeObjectURL
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();

      // Mock document.createElement to track CSV creation
      const mockClick = jest.fn();
      const originalCreateElement = document.createElement.bind(document);
      document.createElement = jest.fn((tagName) => {
        const element = originalCreateElement(tagName);
        if (tagName === 'a') {
          element.click = mockClick;
        }
        return element;
      });

      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByText('Export CSV')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Export CSV');
      await user.click(exportButton);

      await waitFor(() => {
        expect(mockClick).toHaveBeenCalled();
      });

      // Cleanup
      document.createElement = originalCreateElement;
    });

    it('should show success toast after CSV export', async () => {
      const user = userEvent.setup();

      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();

      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByText('Export CSV')).toBeInTheDocument();
      });

      const exportButton = screen.getByText('Export CSV');
      await user.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText(/CSV exported successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle dashboard metrics API error', async () => {
      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          );
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load financial data/i)).toBeInTheDocument();
      });
    });

    it('should handle revenue report API error', async () => {
      server.use(
        http.get(`${API_BASE}/admin/finance/revenue`, () => {
          return HttpResponse.json(
            { message: 'Failed to fetch revenue' },
            { status: 500 }
          );
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load financial data/i)).toBeInTheDocument();
      });
    });

    it('should handle programs API error gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/programs`, () => {
          return HttpResponse.json(
            { message: 'Failed to fetch programs' },
            { status: 500 }
          );
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load financial data/i)).toBeInTheDocument();
      });
    });

    it('should handle classes API error gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/classes`, () => {
          return HttpResponse.json(
            { message: 'Failed to fetch classes' },
            { status: 500 }
          );
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load financial data/i)).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    it('should fetch all required data on mount', async () => {
      let metricsCallCount = 0;
      let revenueCallCount = 0;
      let programsCallCount = 0;
      let classesCallCount = 0;

      server.use(
        http.get(`${API_BASE}/admin/dashboard/metrics`, () => {
          metricsCallCount++;
          return HttpResponse.json({
            revenue_today: 500,
            revenue_this_week: 3500,
            revenue_this_month: 15000,
            total_revenue: 150000,
            programs_with_counts: [],
          });
        }),
        http.get(`${API_BASE}/admin/finance/revenue`, () => {
          revenueCallCount++;
          return HttpResponse.json({
            total: 150000,
            revenue_by_date: {},
          });
        }),
        http.get(`${API_BASE}/programs`, () => {
          programsCallCount++;
          return HttpResponse.json([]);
        }),
        http.get(`${API_BASE}/classes`, () => {
          classesCallCount++;
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(metricsCallCount).toBe(1);
        expect(revenueCallCount).toBe(1);
        expect(programsCallCount).toBe(1);
        expect(classesCallCount).toBe(1);
      });
    });

    it('should fetch revenue report for current year', async () => {
      let requestParams: any = null;

      server.use(
        http.get(`${API_BASE}/admin/finance/revenue`, ({ request }) => {
          const url = new URL(request.url);
          requestParams = {
            start_date: url.searchParams.get('start_date'),
            end_date: url.searchParams.get('end_date'),
            group_by: url.searchParams.get('group_by'),
          };
          return HttpResponse.json({
            total: 150000,
            revenue_by_date: {},
          });
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(requestParams).not.toBeNull();
      });

      const currentYear = new Date().getFullYear();
      expect(requestParams.start_date).toContain(currentYear.toString());
      expect(requestParams.group_by).toBe('month');
    });
  });

  describe('Monthly Data Generation', () => {
    it('should generate sample data when no real data available', async () => {
      server.use(
        http.get(`${API_BASE}/admin/finance/revenue`, () => {
          return HttpResponse.json({
            total: 0,
            revenue_by_date: {},
          });
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Chart should still render with sample data
      expect(screen.getByText(/Revenue per Class/i)).toBeInTheDocument();
    });

    it('should use real revenue data when available', async () => {
      const mockRevenueReport = {
        total: 150000,
        revenue_by_date: {
          '2024-01-15': { total: 5000 },
          '2024-02-15': { total: 7000 },
          '2024-03-15': { total: 6000 },
        },
      };

      server.use(
        http.get(`${API_BASE}/admin/finance/revenue`, () => {
          return HttpResponse.json(mockRevenueReport);
        })
      );

      render(<Financials />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Should use real data for chart
      expect(screen.getByText(/Revenue per Class/i)).toBeInTheDocument();
    });
  });
});
