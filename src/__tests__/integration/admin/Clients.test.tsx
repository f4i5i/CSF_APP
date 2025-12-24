/**
 * Integration Tests for Clients Page
 * Tests client management, tabs switching, search, and filtering
 */

import { render, screen, waitFor, within } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Clients from '../../../pages/AdminDashboard/Clients';

const API_BASE = 'http://localhost:8000/api/v1';

describe('Clients Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Page Loading and Initial State', () => {
    it('should display loading state initially', () => {
      render(<Clients />);

      expect(screen.getByRole('progressbar', { hidden: true })).toBeInTheDocument();
    });

    it('should display page header after loading', async () => {
      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByText('Clients')).toBeInTheDocument();
      });

      expect(screen.getByText(/Manage accounts and members/i)).toBeInTheDocument();
    });

    it('should display search input', async () => {
      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });
    });

    it('should default to Accounts tab', async () => {
      render(<Clients />);

      await waitFor(() => {
        const accountTab = screen.getByRole('button', { name: /account/i });
        expect(accountTab).toHaveClass(/active|selected/i);
      });
    });
  });

  describe('Accounts Tab', () => {
    it('should display accounts table with client data', async () => {
      const mockClients = {
        items: [
          {
            id: 'client-1',
            full_name: 'John Doe',
            email: 'john@test.com',
            phone: '+1234567890',
            active_enrollments: 2,
            children_count: 2,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'client-2',
            full_name: 'Jane Smith',
            email: 'jane@test.com',
            phone: '+1234567891',
            active_enrollments: 0,
            children_count: 1,
            created_at: '2024-01-02T00:00:00Z',
          },
        ],
        total: 2,
        skip: 0,
        limit: 50,
      };

      server.use(
        http.get(`${API_BASE}/admin/clients`, () => {
          return HttpResponse.json(mockClients);
        })
      );

      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('Doe')).toBeInTheDocument();
      });

      expect(screen.getByText('john@test.com')).toBeInTheDocument();
      expect(screen.getByText('Jane')).toBeInTheDocument();
      expect(screen.getByText('jane@test.com')).toBeInTheDocument();
    });

    it('should display account status based on active enrollments', async () => {
      const mockClients = {
        items: [
          {
            id: 'client-1',
            full_name: 'Active Parent',
            email: 'active@test.com',
            phone: '+1234567890',
            active_enrollments: 2,
            children_count: 2,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'client-2',
            full_name: 'Inactive Parent',
            email: 'inactive@test.com',
            phone: '+1234567891',
            active_enrollments: 0,
            children_count: 1,
            created_at: '2024-01-02T00:00:00Z',
          },
        ],
        total: 2,
      };

      server.use(
        http.get(`${API_BASE}/admin/clients`, () => {
          return HttpResponse.json(mockClients);
        })
      );

      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
        expect(screen.getByText('Inactive')).toBeInTheDocument();
      });
    });

    it('should display enrollment counts', async () => {
      const mockClients = {
        items: [
          {
            id: 'client-1',
            full_name: 'John Doe',
            email: 'john@test.com',
            phone: '+1234567890',
            active_enrollments: 2,
            children_count: 2,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/admin/clients`, () => {
          return HttpResponse.json(mockClients);
        })
      );

      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByText(/2 enrollment\(s\)/i)).toBeInTheDocument();
      });
    });

    it('should display "None" for clients without enrollments', async () => {
      const mockClients = {
        items: [
          {
            id: 'client-2',
            full_name: 'Jane Smith',
            email: 'jane@test.com',
            phone: '+1234567891',
            active_enrollments: 0,
            children_count: 1,
            created_at: '2024-01-02T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/admin/clients`, () => {
          return HttpResponse.json(mockClients);
        })
      );

      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByText('None')).toBeInTheDocument();
      });
    });
  });

  describe('Members Tab', () => {
    it('should switch to members tab when clicked', async () => {
      const user = userEvent.setup();

      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /members/i })).toBeInTheDocument();
      });

      const membersTab = screen.getByRole('button', { name: /members/i });
      await user.click(membersTab);

      await waitFor(() => {
        expect(membersTab).toHaveClass(/active|selected/i);
      });
    });

    it('should display members table with enrollment data', async () => {
      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_first_name: 'Johnny',
            child_last_name: 'Doe',
            child_dob: '2015-05-15',
            parent_email: 'parent@test.com',
            parent_phone: '+1234567890',
            class_name: 'Soccer Basics',
            coach_name: 'Coach Smith',
            status: 'active',
            created_at: '2024-01-01T00:00:00Z',
            last_check_in: '2024-03-01T00:00:00Z',
          },
          {
            id: 'enroll-2',
            child_first_name: 'Jenny',
            child_last_name: 'Doe',
            child_dob: '2017-03-20',
            parent_email: 'parent@test.com',
            parent_phone: '+1234567890',
            class_name: 'Basketball 101',
            coach_name: 'Coach Johnson',
            status: 'pending',
            created_at: '2024-01-02T00:00:00Z',
          },
        ],
        total: 2,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      const user = userEvent.setup();
      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /members/i })).toBeInTheDocument();
      });

      const membersTab = screen.getByRole('button', { name: /members/i });
      await user.click(membersTab);

      await waitFor(() => {
        expect(screen.getByText('Johnny')).toBeInTheDocument();
        expect(screen.getByText('Jenny')).toBeInTheDocument();
      });

      expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      expect(screen.getByText('Basketball 101')).toBeInTheDocument();
    });

    it('should display member status badges', async () => {
      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_first_name: 'Active Child',
            child_last_name: 'Smith',
            status: 'active',
            class_name: 'Soccer',
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'enroll-2',
            child_first_name: 'Pending Child',
            child_last_name: 'Jones',
            status: 'pending',
            class_name: 'Basketball',
            created_at: '2024-01-02T00:00:00Z',
          },
        ],
        total: 2,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      const user = userEvent.setup();
      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /members/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /members/i }));

      await waitFor(() => {
        const statuses = screen.getAllByText(/Active|Pending/i);
        expect(statuses.length).toBeGreaterThan(0);
      });
    });

    it('should display coach information', async () => {
      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_first_name: 'Johnny',
            child_last_name: 'Doe',
            class_name: 'Soccer',
            coach_name: 'Coach Smith',
            status: 'active',
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      const user = userEvent.setup();
      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /members/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /members/i }));

      await waitFor(() => {
        expect(screen.getByText('Coach Smith')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should filter accounts by name', async () => {
      const user = userEvent.setup();

      const mockClients = {
        items: [
          {
            id: 'client-1',
            full_name: 'John Doe',
            email: 'john@test.com',
            phone: '+1234567890',
            active_enrollments: 2,
            children_count: 2,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'client-2',
            full_name: 'Jane Smith',
            email: 'jane@test.com',
            phone: '+1234567891',
            active_enrollments: 0,
            children_count: 1,
            created_at: '2024-01-02T00:00:00Z',
          },
        ],
        total: 2,
      };

      server.use(
        http.get(`${API_BASE}/admin/clients`, () => {
          return HttpResponse.json(mockClients);
        })
      );

      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('Jane')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'John');

      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.queryByText('Jane')).not.toBeInTheDocument();
      });
    });

    it('should filter accounts by email', async () => {
      const user = userEvent.setup();

      const mockClients = {
        items: [
          {
            id: 'client-1',
            full_name: 'John Doe',
            email: 'john@test.com',
            phone: '+1234567890',
            active_enrollments: 2,
            children_count: 2,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'client-2',
            full_name: 'Jane Smith',
            email: 'jane@test.com',
            phone: '+1234567891',
            active_enrollments: 0,
            children_count: 1,
            created_at: '2024-01-02T00:00:00Z',
          },
        ],
        total: 2,
      };

      server.use(
        http.get(`${API_BASE}/admin/clients`, () => {
          return HttpResponse.json(mockClients);
        })
      );

      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByText('john@test.com')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'jane@test');

      await waitFor(() => {
        expect(screen.getByText('jane@test.com')).toBeInTheDocument();
        expect(screen.queryByText('john@test.com')).not.toBeInTheDocument();
      });
    });

    it('should filter members by child name', async () => {
      const user = userEvent.setup();

      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_first_name: 'Johnny',
            child_last_name: 'Doe',
            class_name: 'Soccer',
            coach_name: 'Coach Smith',
            status: 'active',
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'enroll-2',
            child_first_name: 'Jenny',
            child_last_name: 'Doe',
            class_name: 'Basketball',
            coach_name: 'Coach Johnson',
            status: 'pending',
            created_at: '2024-01-02T00:00:00Z',
          },
        ],
        total: 2,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /members/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /members/i }));

      await waitFor(() => {
        expect(screen.getByText('Johnny')).toBeInTheDocument();
        expect(screen.getByText('Jenny')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.clear(searchInput);
      await user.type(searchInput, 'Johnny');

      await waitFor(() => {
        expect(screen.getByText('Johnny')).toBeInTheDocument();
        expect(screen.queryByText('Jenny')).not.toBeInTheDocument();
      });
    });

    it('should filter members by coach name', async () => {
      const user = userEvent.setup();

      const mockEnrollments = {
        items: [
          {
            id: 'enroll-1',
            child_first_name: 'Johnny',
            child_last_name: 'Doe',
            class_name: 'Soccer',
            coach_name: 'Coach Smith',
            status: 'active',
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'enroll-2',
            child_first_name: 'Jenny',
            child_last_name: 'Doe',
            class_name: 'Basketball',
            coach_name: 'Coach Johnson',
            status: 'pending',
            created_at: '2024-01-02T00:00:00Z',
          },
        ],
        total: 2,
      };

      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(mockEnrollments);
        })
      );

      render(<Clients />);

      await user.click(screen.getByRole('button', { name: /members/i }));

      await waitFor(() => {
        expect(screen.getByText('Coach Smith')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.clear(searchInput);
      await user.type(searchInput, 'Johnson');

      await waitFor(() => {
        expect(screen.getByText('Coach Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Coach Smith')).not.toBeInTheDocument();
      });
    });

    it('should show empty state when no results match search', async () => {
      const user = userEvent.setup();

      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search/i);
      await user.type(searchInput, 'NonExistentClient');

      await waitFor(() => {
        expect(screen.queryByText('john@test.com')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle clients API error gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/admin/clients`, () => {
          return HttpResponse.json(
            { message: 'Failed to fetch clients' },
            { status: 500 }
          );
        })
      );

      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load clients/i)).toBeInTheDocument();
      });
    });

    it('should handle members API error gracefully without showing toast', async () => {
      server.use(
        http.get(`${API_BASE}/enrollments`, () => {
          return HttpResponse.json(
            { message: 'Failed to fetch enrollments' },
            { status: 500 }
          );
        })
      );

      const user = userEvent.setup();
      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /members/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /members/i }));

      // Should not show error toast for members (accounts is primary)
      await waitFor(() => {
        expect(screen.queryByText(/Failed to load members/i)).not.toBeInTheDocument();
      });
    });

    it('should handle empty clients list', async () => {
      server.use(
        http.get(`${API_BASE}/admin/clients`, () => {
          return HttpResponse.json({
            items: [],
            total: 0,
          });
        })
      );

      render(<Clients />);

      await waitFor(() => {
        expect(screen.queryByRole('progressbar', { hidden: true })).not.toBeInTheDocument();
      });

      // Should display empty state
      expect(screen.getByText('Clients')).toBeInTheDocument();
    });
  });

  describe('Data Transformation', () => {
    it('should split full_name into firstName and lastName', async () => {
      const mockClients = {
        items: [
          {
            id: 'client-1',
            full_name: 'John Michael Doe',
            email: 'john@test.com',
            phone: '+1234567890',
            active_enrollments: 1,
            children_count: 1,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/admin/clients`, () => {
          return HttpResponse.json(mockClients);
        })
      );

      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('Michael Doe')).toBeInTheDocument();
      });
    });

    it('should display N/A for missing phone numbers', async () => {
      const mockClients = {
        items: [
          {
            id: 'client-1',
            full_name: 'John Doe',
            email: 'john@test.com',
            phone: null,
            active_enrollments: 1,
            children_count: 1,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/admin/clients`, () => {
          return HttpResponse.json(mockClients);
        })
      );

      render(<Clients />);

      await waitFor(() => {
        expect(screen.getByText('N/A')).toBeInTheDocument();
      });
    });
  });
});
