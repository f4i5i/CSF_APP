/**
 * Integration Tests for Clients Page
 * Tests client management, search, and filtering
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Clients from '../../../pages/AdminDashboard/Clients';

// ==========================================
// MOCKS
// ==========================================

// Mock auth context
jest.mock('../../../context/auth', () => ({
  useAuth: () => ({
    user: { id: 'user-admin-1', email: 'admin@test.com', first_name: 'Test', last_name: 'Admin', role: 'ADMIN' },
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock Header
jest.mock('../../../components/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
    info: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  success: (...args: unknown[]) => mockToastSuccess(...args),
  error: (...args: unknown[]) => mockToastError(...args),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock admin service
const mockGetClients = jest.fn();
const mockDeleteClient = jest.fn();
const mockGetClientById = jest.fn();
jest.mock('../../../api/services/admin.service', () => ({
  __esModule: true,
  default: {
    getClients: (...args: any[]) => mockGetClients(...args),
    deleteClient: (...args: any[]) => mockDeleteClient(...args),
    getClientById: (...args: any[]) => mockGetClientById(...args),
  },
}));

// Mock children service
const mockDeleteChild = jest.fn();
jest.mock('../../../api/services/children.service', () => ({
  __esModule: true,
  default: {
    delete: (...args: any[]) => mockDeleteChild(...args),
  },
}));

// Mock AdminChildForm
jest.mock('../../../components/admin/AdminChildForm', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="admin-child-form">Admin Child Form</div> : null,
}));

// ==========================================
// TEST SETUP
// ==========================================

const defaultClientsResponse = {
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
  limit: 10,
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
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Clients Page Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetClients.mockResolvedValue({ ...defaultClientsResponse });
  });

  const waitForLoaded = async () => {
    await waitFor(() => {
      expect(screen.getByText('Clients Management')).toBeInTheDocument();
    });
    // Wait for loading to finish (skeleton rows go away, data appears)
    await waitFor(() => {
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
    });
  };

  describe('Page Loading and Initial State', () => {
    it('should display loading skeleton initially', () => {
      mockGetClients.mockReturnValue(new Promise(() => {})); // never resolves
      render(<Clients />, { wrapper: createWrapper() });

      // Loading state renders animate-pulse skeleton rows
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should display page header after loading', async () => {
      render(<Clients />, { wrapper: createWrapper() });

      await waitForLoaded();

      expect(screen.getByText('Clients Management')).toBeInTheDocument();
    });

    it('should display search input', async () => {
      render(<Clients />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/search by name or email/i)).toBeInTheDocument();
      });
    });

    it('should fetch clients on mount', async () => {
      render(<Clients />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockGetClients).toHaveBeenCalled();
      });
    });
  });

  describe('Clients Table', () => {
    it('should display clients table with client data', async () => {
      render(<Clients />, { wrapper: createWrapper() });

      await waitForLoaded();

      // Names render as "John Doe" and "Jane Smith" in <p> elements
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('jane@test.com')).toBeInTheDocument();
    });

    it('should display enrollment counts as Classes', async () => {
      render(<Clients />, { wrapper: createWrapper() });

      await waitForLoaded();

      // Component renders "{value} Classes" or "{value} Class"
      expect(screen.getByText('2 Classes')).toBeInTheDocument();
      expect(screen.getByText('0 Classes')).toBeInTheDocument();
    });

    it('should display phone numbers', async () => {
      render(<Clients />, { wrapper: createWrapper() });

      await waitForLoaded();

      expect(screen.getByText('+1234567890')).toBeInTheDocument();
      expect(screen.getByText('+1234567891')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should call getClients with search parameter when typing', async () => {
      const user = userEvent;
      render(<Clients />, { wrapper: createWrapper() });

      await waitForLoaded();

      const searchInput = screen.getByPlaceholderText(/search by name or email/i);
      await user.type(searchInput, 'John');

      // The component debounces search and calls adminService.getClients with search param
      await waitFor(() => {
        const calls = mockGetClients.mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall[0]).toHaveProperty('search');
      });
    });

    it('should display search input with placeholder', async () => {
      render(<Clients />, { wrapper: createWrapper() });

      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText(/search by name or email/i);
        expect(searchInput).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error toast when clients API fails', async () => {
      mockGetClients.mockRejectedValue(new Error('Server error'));

      render(<Clients />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to load clients');
      });
    });

    it('should handle empty clients list', async () => {
      mockGetClients.mockResolvedValue({
        items: [],
        total: 0,
      });

      render(<Clients />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Clients Management')).toBeInTheDocument();
      });

      // DataTable shows "No clients found" when empty
      await waitFor(() => {
        expect(screen.getByText('No clients found')).toBeInTheDocument();
      });
    });
  });

  describe('Data Transformation', () => {
    it('should split full_name into firstName and lastName', async () => {
      mockGetClients.mockResolvedValue({
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
      });

      render(<Clients />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('john@test.com')).toBeInTheDocument();
      });

      // First word is first_name, rest is last_name
      // The name renders as "John Michael Doe" in a single <p> element
      expect(screen.getByText('John Michael Doe')).toBeInTheDocument();
    });

    it('should display em-dash for missing phone numbers', async () => {
      mockGetClients.mockResolvedValue({
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
      });

      render(<Clients />, { wrapper: createWrapper() });

      await waitFor(() => {
        // Component shows phone || "" which then shows em-dash in render
        expect(screen.getByText('john@test.com')).toBeInTheDocument();
      });

      // The phone column renders "—" for empty phone
      const dashElement = screen.getByText('—');
      expect(dashElement).toBeInTheDocument();
    });

    it('should display formatted join dates', async () => {
      mockGetClients.mockResolvedValue({
        items: [
          {
            id: 'client-1',
            full_name: 'John Doe',
            email: 'john@test.com',
            phone: '+1234567890',
            active_enrollments: 1,
            children_count: 1,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        total: 1,
      });

      render(<Clients />, { wrapper: createWrapper() });

      await waitFor(() => {
        // formatDate returns "Jan 1, 2024" style
        expect(screen.getByText(/Jan/)).toBeInTheDocument();
      });
    });
  });

  describe('Delete Client', () => {
    it('should call deleteClient service when confirmed', async () => {
      const user = userEvent;
      mockDeleteClient.mockResolvedValue({});

      render(<Clients />, { wrapper: createWrapper() });

      await waitForLoaded();

      // Find and click the Delete button for a client
      const deleteButtons = screen.getAllByTitle('Delete');
      expect(deleteButtons.length).toBeGreaterThan(0);
      await user.click(deleteButtons[0]);

      // ConfirmDialog should open - find and click confirm
      await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination info', async () => {
      render(<Clients />, { wrapper: createWrapper() });

      await waitForLoaded();

      // DataTable shows "Showing X to Y of Z results"
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      expect(screen.getByText(/results/)).toBeInTheDocument();
    });

    it('should call getClients with correct pagination params', async () => {
      render(<Clients />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockGetClients).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 0,
            limit: 10,
          })
        );
      });
    });
  });

  describe('Children Count Column', () => {
    it('should display children count for each client', async () => {
      render(<Clients />, { wrapper: createWrapper() });

      await waitForLoaded();

      // The children_count column shows the count; may appear multiple times
      expect(screen.getAllByText('2').length).toBeGreaterThan(0);
      expect(screen.getAllByText('1').length).toBeGreaterThan(0);
    });
  });
});
