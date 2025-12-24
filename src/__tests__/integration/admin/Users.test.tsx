/**
 * Integration Tests for Users Management Page
 * Tests user management, role-based access, filtering, and CRUD operations
 */

import { render, screen, waitFor, within } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Users from '../../../pages/AdminDashboard/Users';

const API_BASE = 'http://localhost:8000/api/v1';

describe('Users Management Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Page Loading and Initial State', () => {
    it('should display page header', async () => {
      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('Users Management')).toBeInTheDocument();
      });

      expect(screen.getByText(/Create and manage user accounts/i)).toBeInTheDocument();
    });

    it('should display Create User button', async () => {
      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('Create User')).toBeInTheDocument();
      });
    });

    it('should display search input', async () => {
      render(<Users />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search by name or email/i)).toBeInTheDocument();
      });
    });

    it('should load users on mount', async () => {
      const mockUsers = {
        items: [
          {
            id: 'user-1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@test.com',
            phone: '+1234567890',
            role: 'parent',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('Doe')).toBeInTheDocument();
      });
    });
  });

  describe('Users Table Display', () => {
    it('should display user information in table', async () => {
      const mockUsers = {
        items: [
          {
            id: 'user-1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@test.com',
            phone: '+1234567890',
            role: 'parent',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'user-2',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane@test.com',
            phone: '+1234567891',
            role: 'coach',
            is_active: true,
            is_verified: false,
            created_at: '2024-01-02T00:00:00Z',
          },
        ],
        total: 2,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('John')).toBeInTheDocument();
        expect(screen.getByText('Jane')).toBeInTheDocument();
      });

      expect(screen.getByText('john@test.com')).toBeInTheDocument();
      expect(screen.getByText('jane@test.com')).toBeInTheDocument();
    });

    it('should display user initials in avatar', async () => {
      const mockUsers = {
        items: [
          {
            id: 'user-1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@test.com',
            role: 'parent',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('JD')).toBeInTheDocument();
      });
    });

    it('should display role badges with correct styling', async () => {
      const mockUsers = {
        items: [
          {
            id: 'user-1',
            first_name: 'Owner',
            last_name: 'User',
            email: 'owner@test.com',
            role: 'owner',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'user-2',
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@test.com',
            role: 'admin',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'user-3',
            first_name: 'Coach',
            last_name: 'User',
            email: 'coach@test.com',
            role: 'coach',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'user-4',
            first_name: 'Parent',
            last_name: 'User',
            email: 'parent@test.com',
            role: 'parent',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 4,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        })
      );

      render(<Users />);

      await waitFor(() => {
        const roles = screen.getAllByText(/owner|admin|coach|parent/i);
        expect(roles.length).toBeGreaterThan(0);
      });
    });

    it('should display verification status', async () => {
      const mockUsers = {
        items: [
          {
            id: 'user-1',
            first_name: 'Verified',
            last_name: 'User',
            email: 'verified@test.com',
            role: 'parent',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'user-2',
            first_name: 'Pending',
            last_name: 'User',
            email: 'pending@test.com',
            role: 'parent',
            is_active: true,
            is_verified: false,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 2,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('Verified')).toBeInTheDocument();
        expect(screen.getByText('Pending')).toBeInTheDocument();
      });
    });

    it('should display active/inactive status', async () => {
      const mockUsers = {
        items: [
          {
            id: 'user-1',
            first_name: 'Active',
            last_name: 'User',
            email: 'active@test.com',
            role: 'parent',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'user-2',
            first_name: 'Inactive',
            last_name: 'User',
            email: 'inactive@test.com',
            role: 'parent',
            is_active: false,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 2,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        })
      );

      render(<Users />);

      await waitFor(() => {
        const statuses = screen.getAllByText(/Active|Inactive/i);
        expect(statuses.length).toBeGreaterThan(0);
      });
    });

    it('should display phone number or dash for missing', async () => {
      const mockUsers = {
        items: [
          {
            id: 'user-1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@test.com',
            phone: '+1234567890',
            role: 'parent',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'user-2',
            first_name: 'Jane',
            last_name: 'Smith',
            email: 'jane@test.com',
            phone: null,
            role: 'parent',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 2,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('+1234567890')).toBeInTheDocument();
        expect(screen.getByText('—')).toBeInTheDocument();
      });
    });

    it('should display formatted join date', async () => {
      const mockUsers = {
        items: [
          {
            id: 'user-1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john@test.com',
            role: 'parent',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText(/Jan/i)).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should display role filter dropdown', async () => {
      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('All Roles')).toBeInTheDocument();
      });
    });

    it('should display status filter dropdown', async () => {
      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('All Statuses')).toBeInTheDocument();
      });
    });

    it('should filter by role when selected', async () => {
      const user = userEvent.setup();

      let requestParams: any = null;

      server.use(
        http.get(`${API_BASE}/users`, ({ request }) => {
          const url = new URL(request.url);
          requestParams = {
            role: url.searchParams.get('role'),
          };
          return HttpResponse.json({
            items: [],
            total: 0,
          });
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('All Roles')).toBeInTheDocument();
      });

      const roleFilter = screen.getByDisplayValue('All Roles').closest('select');
      if (roleFilter) {
        await user.selectOptions(roleFilter, 'coach');
      }

      await waitFor(() => {
        expect(requestParams?.role).toBe('coach');
      });
    });

    it('should filter by status when selected', async () => {
      const user = userEvent.setup();

      let requestParams: any = null;

      server.use(
        http.get(`${API_BASE}/users`, ({ request }) => {
          const url = new URL(request.url);
          requestParams = {
            is_active: url.searchParams.get('is_active'),
          };
          return HttpResponse.json({
            items: [],
            total: 0,
          });
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('All Statuses')).toBeInTheDocument();
      });

      const statusFilter = screen.getAllByDisplayValue('All Statuses')[1]?.closest('select');
      if (statusFilter) {
        await user.selectOptions(statusFilter, 'true');
      }

      await waitFor(() => {
        expect(requestParams?.is_active).toBe('true');
      });
    });

    it('should search by name or email', async () => {
      const user = userEvent.setup();

      let requestParams: any = null;

      server.use(
        http.get(`${API_BASE}/users`, ({ request }) => {
          const url = new URL(request.url);
          requestParams = {
            search: url.searchParams.get('search'),
          };
          return HttpResponse.json({
            items: [],
            total: 0,
          });
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search by name or email/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by name or email/i);
      await user.type(searchInput, 'john');

      await waitFor(() => {
        expect(requestParams?.search).toBe('john');
      });
    });

    it('should show clear filters button when filters are active', async () => {
      const user = userEvent.setup();

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search by name or email/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by name or email/i);
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(screen.getByText(/Clear/i)).toBeInTheDocument();
      });
    });

    it('should clear all filters when clear button clicked', async () => {
      const user = userEvent.setup();

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search by name or email/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by name or email/i);
      await user.type(searchInput, 'test');

      await waitFor(() => {
        expect(screen.getByText(/Clear/i)).toBeInTheDocument();
      });

      const clearButton = screen.getByText(/Clear/i);
      await user.click(clearButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue('');
      });
    });
  });

  describe('Create User', () => {
    it('should open modal when Create User button clicked', async () => {
      const user = userEvent.setup();

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('Create User')).toBeInTheDocument();
      });

      const createButton = screen.getByText('Create User');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Edit User', () => {
    it('should display Edit button for editable users', async () => {
      const mockUsers = {
        items: [
          {
            id: 'user-1',
            first_name: 'Coach',
            last_name: 'User',
            email: 'coach@test.com',
            role: 'coach',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        }),
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'current-user',
            role: 'admin',
            first_name: 'Admin',
            last_name: 'User',
          });
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Edit/i)).toBeInTheDocument();
      });
    });

    it('should not display Edit button for owner users when logged in as admin', async () => {
      const mockUsers = {
        items: [
          {
            id: 'user-1',
            first_name: 'Owner',
            last_name: 'User',
            email: 'owner@test.com',
            role: 'owner',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        }),
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'current-user',
            role: 'admin',
            first_name: 'Admin',
            last_name: 'User',
          });
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('Owner')).toBeInTheDocument();
      });

      expect(screen.queryByLabelText(/Edit/i)).not.toBeInTheDocument();
    });

    it('should not display Edit button for current user', async () => {
      const mockUsers = {
        items: [
          {
            id: 'current-user',
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@test.com',
            role: 'admin',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        }),
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'current-user',
            role: 'admin',
            first_name: 'Admin',
            last_name: 'User',
          });
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('Admin')).toBeInTheDocument();
      });

      expect(screen.queryByLabelText(/Edit/i)).not.toBeInTheDocument();
    });

    it('should open edit modal when edit button clicked', async () => {
      const user = userEvent.setup();

      const mockUsers = {
        items: [
          {
            id: 'user-1',
            first_name: 'Coach',
            last_name: 'User',
            email: 'coach@test.com',
            role: 'coach',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        }),
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'current-user',
            role: 'admin',
            first_name: 'Admin',
            last_name: 'User',
          });
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Edit/i)).toBeInTheDocument();
      });

      const editButton = screen.getByLabelText(/Edit/i);
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Delete User', () => {
    it('should display Delete button for deletable users', async () => {
      const mockUsers = {
        items: [
          {
            id: 'user-1',
            first_name: 'Parent',
            last_name: 'User',
            email: 'parent@test.com',
            role: 'parent',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        }),
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'current-user',
            role: 'admin',
            first_name: 'Admin',
            last_name: 'User',
          });
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Delete/i)).toBeInTheDocument();
      });
    });

    it('should not display Delete button for owner users when logged in as admin', async () => {
      const mockUsers = {
        items: [
          {
            id: 'user-1',
            first_name: 'Owner',
            last_name: 'User',
            email: 'owner@test.com',
            role: 'owner',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        }),
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'current-user',
            role: 'admin',
            first_name: 'Admin',
            last_name: 'User',
          });
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('Owner')).toBeInTheDocument();
      });

      expect(screen.queryByLabelText(/Delete/i)).not.toBeInTheDocument();
    });

    it('should show confirmation dialog when delete button clicked', async () => {
      const user = userEvent.setup();

      const mockUsers = {
        items: [
          {
            id: 'user-1',
            first_name: 'Parent',
            last_name: 'User',
            email: 'parent@test.com',
            role: 'parent',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        }),
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'current-user',
            role: 'admin',
            first_name: 'Admin',
            last_name: 'User',
          });
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Delete/i)).toBeInTheDocument();
      });

      const deleteButton = screen.getByLabelText(/Delete/i);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/Delete User/i)).toBeInTheDocument();
        expect(screen.getByText(/deactivate their account/i)).toBeInTheDocument();
      });
    });

    it('should delete user when confirmed', async () => {
      const user = userEvent.setup();

      const mockUsers = {
        items: [
          {
            id: 'user-1',
            first_name: 'Parent',
            last_name: 'User',
            email: 'parent@test.com',
            role: 'parent',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        }),
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'current-user',
            role: 'admin',
            first_name: 'Admin',
            last_name: 'User',
          });
        }),
        http.delete(`${API_BASE}/users/user-1`, () => {
          return HttpResponse.json({ success: true });
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Delete/i)).toBeInTheDocument();
      });

      const deleteButton = screen.getByLabelText(/Delete/i);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/User deleted successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination controls when data exceeds page size', async () => {
      const mockUsers = {
        items: Array.from({ length: 10 }, (_, i) => ({
          id: `user-${i + 1}`,
          first_name: `User`,
          last_name: `${i + 1}`,
          email: `user${i + 1}@test.com`,
          role: 'parent',
          is_active: true,
          is_verified: true,
          created_at: '2024-01-01T00:00:00Z',
        })),
        total: 25,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('User')).toBeInTheDocument();
      });

      const pagination = screen.getByRole('navigation', { name: /pagination/i });
      expect(pagination).toBeInTheDocument();
    });

    it('should change page when pagination controls clicked', async () => {
      const user = userEvent.setup();

      let requestedPage = 1;

      server.use(
        http.get(`${API_BASE}/users`, ({ request }) => {
          const url = new URL(request.url);
          const skip = parseInt(url.searchParams.get('skip') || '0');
          requestedPage = Math.floor(skip / 10) + 1;

          return HttpResponse.json({
            items: Array.from({ length: 10 }, (_, i) => ({
              id: `user-${requestedPage * 10 + i}`,
              first_name: `User`,
              last_name: `${requestedPage * 10 + i}`,
              email: `user${requestedPage * 10 + i}@test.com`,
              role: 'parent',
              is_active: true,
              is_verified: true,
              created_at: '2024-01-01T00:00:00Z',
            })),
            total: 25,
          });
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: /pagination/i })).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(requestedPage).toBe(2);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error toast when fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(
            { message: 'Failed to fetch users' },
            { status: 500 }
          );
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText(/Failed to load users/i)).toBeInTheDocument();
      });
    });

    it('should handle empty users list', async () => {
      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json({
            items: [],
            total: 0,
          });
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText(/No users found/i)).toBeInTheDocument();
      });
    });

    it('should display error when delete fails', async () => {
      const user = userEvent.setup();

      const mockUsers = {
        items: [
          {
            id: 'user-1',
            first_name: 'Parent',
            last_name: 'User',
            email: 'parent@test.com',
            role: 'parent',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        }),
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'current-user',
            role: 'admin',
            first_name: 'Admin',
            last_name: 'User',
          });
        }),
        http.delete(`${API_BASE}/users/user-1`, () => {
          return HttpResponse.json(
            { message: 'Failed to delete user' },
            { status: 500 }
          );
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByLabelText(/Delete/i)).toBeInTheDocument();
      });

      const deleteButton = screen.getByLabelText(/Delete/i);
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to delete user/i)).toBeInTheDocument();
      });
    });
  });

  describe('Role-Based Access Control', () => {
    it('should allow owner to edit all users except themselves', async () => {
      const mockUsers = {
        items: [
          {
            id: 'other-owner',
            first_name: 'Other',
            last_name: 'Owner',
            email: 'other@test.com',
            role: 'owner',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'current-owner',
            first_name: 'Current',
            last_name: 'Owner',
            email: 'current@test.com',
            role: 'owner',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 2,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        }),
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'current-owner',
            role: 'owner',
            first_name: 'Current',
            last_name: 'Owner',
          });
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('Other')).toBeInTheDocument();
      });

      // Should have Edit button for other owner (not self)
      const editButtons = screen.getAllByLabelText(/Edit/i);
      expect(editButtons).toHaveLength(1);
    });

    it('should prevent admin from editing owner or admin accounts', async () => {
      const mockUsers = {
        items: [
          {
            id: 'user-owner',
            first_name: 'Owner',
            last_name: 'User',
            email: 'owner@test.com',
            role: 'owner',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'user-admin',
            first_name: 'Admin',
            last_name: 'User',
            email: 'admin@test.com',
            role: 'admin',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
          {
            id: 'user-coach',
            first_name: 'Coach',
            last_name: 'User',
            email: 'coach@test.com',
            role: 'coach',
            is_active: true,
            is_verified: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 3,
      };

      server.use(
        http.get(`${API_BASE}/users`, () => {
          return HttpResponse.json(mockUsers);
        }),
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'current-admin',
            role: 'admin',
            first_name: 'Current',
            last_name: 'Admin',
          });
        })
      );

      render(<Users />);

      await waitFor(() => {
        expect(screen.getByText('Coach')).toBeInTheDocument();
      });

      // Should only have Edit button for coach (not owner or admin)
      const editButtons = screen.getAllByLabelText(/Edit/i);
      expect(editButtons).toHaveLength(1);
    });
  });
});
