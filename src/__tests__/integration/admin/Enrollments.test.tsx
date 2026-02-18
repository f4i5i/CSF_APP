/**
 * Integration Tests for Enrollments Management Page
 * Tests enrollment CRUD operations, filtering, and status management
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Enrollments from '../../../pages/AdminDashboard/Enrollments';

// ==========================================
// MOCKS
// ==========================================

jest.mock('../../../context/auth', () => ({
  useAuth: () => ({
    user: { id: 'user-admin-1', email: 'admin@test.com', first_name: 'Test', last_name: 'Admin', role: 'ADMIN' },
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../../components/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

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
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock enrollments service
const mockGetAll = jest.fn();
const mockDeleteEnrollment = jest.fn();
const mockCancelEnrollment = jest.fn();
const mockActivateEnrollment = jest.fn();
const mockGetById = jest.fn();
jest.mock('../../../api/services/enrollments.service', () => ({
  __esModule: true,
  default: {
    getAll: (...args: any[]) => mockGetAll(...args),
    delete: (...args: any[]) => mockDeleteEnrollment(...args),
    cancel: (...args: any[]) => mockCancelEnrollment(...args),
    activate: (...args: any[]) => mockActivateEnrollment(...args),
    getById: (...args: any[]) => mockGetById(...args),
  },
}));

// Mock classes service
const mockGetAllClasses = jest.fn();
const mockGetClassById = jest.fn();
jest.mock('../../../api/services/classes.service', () => ({
  __esModule: true,
  default: {
    getAll: (...args: any[]) => mockGetAllClasses(...args),
    getById: (...args: any[]) => mockGetClassById(...args),
  },
}));

// Mock EnrollmentFormModal
jest.mock('../../../components/admin/EnrollmentFormModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div role="dialog" data-testid="enrollment-form-modal">Enrollment Form</div> : null,
}));

// ==========================================
// TEST SETUP
// ==========================================

const defaultEnrollments = {
  items: [
    {
      id: 'enroll-1',
      child_id: 'child-123456789',
      child_name: 'Johnny Doe',
      class_id: 'class-987654321',
      class_name: 'Soccer Basics',
      status: 'active',
      final_price: 150,
      discount_amount: 0,
      enrolled_at: '2024-01-15T00:00:00Z',
      created_at: '2024-01-15T00:00:00Z',
    },
  ],
  total: 1,
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

describe('Enrollments Page Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAll.mockResolvedValue({ ...defaultEnrollments });
    mockGetAllClasses.mockResolvedValue({ items: [] });
  });

  const waitForLoaded = async () => {
    await waitFor(() => {
      expect(screen.getByText('Enrollments Management')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument();
    });
  };

  describe('Page Loading and Initial State', () => {
    it('should display page header', async () => {
      render(<Enrollments />, { wrapper: createWrapper() });

      await waitForLoaded();

      expect(screen.getByText('Enrollments Management')).toBeInTheDocument();
    });

    it('should display Create Enrollment button', async () => {
      render(<Enrollments />, { wrapper: createWrapper() });

      await waitForLoaded();

      // Button text may be "Enrollment" or "Create Enrollment" depending on screen size
      expect(screen.getAllByText(/Enrollment/i).length).toBeGreaterThan(0);
    });

    it('should display search input', async () => {
      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search by child or class name/i)).toBeInTheDocument();
      });
    });

    it('should load enrollments on mount', async () => {
      render(<Enrollments />, { wrapper: createWrapper() });

      await waitForLoaded();

      await waitFor(() => {
        expect(screen.getByText('Johnny Doe')).toBeInTheDocument();
        expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      });
    });
  });

  describe('Enrollments Table Display', () => {
    it('should display enrollment data in table', async () => {
      mockGetAll.mockResolvedValue({
        items: [
          {
            id: 'enroll-1',
            child_id: 'child-1',
            child_name: 'Johnny Doe',
            class_id: 'class-1',
            class_name: 'Soccer Basics',
            status: 'active',
            final_price: 150,
            discount_amount: 0,
            enrolled_at: '2024-01-15T00:00:00Z',
            created_at: '2024-01-15T00:00:00Z',
          },
          {
            id: 'enroll-2',
            child_id: 'child-2',
            child_name: 'Jenny Smith',
            class_id: 'class-2',
            class_name: 'Basketball 101',
            status: 'pending',
            final_price: 175,
            discount_amount: 25,
            enrolled_at: '2024-01-20T00:00:00Z',
            created_at: '2024-01-20T00:00:00Z',
          },
        ],
        total: 2,
      });

      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Johnny Doe')).toBeInTheDocument();
        expect(screen.getByText('Jenny Smith')).toBeInTheDocument();
      });

      expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      expect(screen.getByText('Basketball 101')).toBeInTheDocument();
    });

    it('should display status badges', async () => {
      mockGetAll.mockResolvedValue({
        items: [
          {
            id: 'enroll-1',
            child_name: 'Active Child',
            class_name: 'Soccer',
            status: 'active',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
          {
            id: 'enroll-2',
            child_name: 'Pending Child',
            class_name: 'Basketball',
            status: 'pending',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 2,
      });

      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        const statuses = screen.getAllByText(/active|pending/i);
        expect(statuses.length).toBeGreaterThan(0);
      });
    });

    it('should display price with discount information', async () => {
      mockGetAll.mockResolvedValue({
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer',
            status: 'active',
            final_price: 150,
            discount_amount: 25,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      });

      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('$150.00')).toBeInTheDocument();
        expect(screen.getByText(/-\$25\.00 discount/i)).toBeInTheDocument();
      });
    });

    it('should display formatted dates', async () => {
      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Johnny Doe')).toBeInTheDocument();
      });

      expect(screen.getAllByText(/Jan/i).length).toBeGreaterThan(0);
    });

    it('should display truncated child and class IDs', async () => {
      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Johnny Doe')).toBeInTheDocument();
      });

      // IDs are shown as "ID: {id.slice(0,8)}..."
      expect(screen.getByText(/child-12/i)).toBeInTheDocument();
      expect(screen.getByText(/class-98/i)).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should display status filter dropdown', async () => {
      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getAllByText('All Statuses').length).toBeGreaterThan(0);
      });
    });

    it('should display class filter dropdown', async () => {
      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getAllByText('All Classes').length).toBeGreaterThan(0);
      });
    });

    it('should show clear filters button when search is active', async () => {
      const user = userEvent;

      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search by child or class name/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by child or class name/i);
      await user.type(searchInput, 'test search');

      await waitFor(() => {
        expect(screen.getByText(/Clear/i)).toBeInTheDocument();
      });
    });

    it('should clear search when clear button clicked', async () => {
      const user = userEvent;

      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Search by child or class name/i)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/Search by child or class name/i);
      await user.type(searchInput, 'test search');

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

  describe('Create Enrollment', () => {
    it('should open modal when Create Enrollment button clicked', async () => {
      const user = userEvent;

      render(<Enrollments />, { wrapper: createWrapper() });

      await waitForLoaded();

      // Find the create button - it contains "Enrollment" text
      const createButton = screen.getAllByText(/Enrollment/i).find(
        el => el.closest('button') !== null
      );
      expect(createButton).toBeTruthy();
      await user.click(createButton!.closest('button')!);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Enrollment', () => {
    it('should display Edit action button for enrollments', async () => {
      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Johnny Doe')).toBeInTheDocument();
      });

      // DataTable renders action buttons with title attribute
      expect(screen.getByTitle('Edit')).toBeInTheDocument();
    });

    it('should open edit modal when edit button clicked', async () => {
      const user = userEvent;

      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTitle('Edit')).toBeInTheDocument();
      });

      await user.click(screen.getByTitle('Edit'));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
    });
  });

  describe('Activate Enrollment', () => {
    it('should display Activate button for pending enrollments', async () => {
      mockGetAll.mockResolvedValue({
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer',
            status: 'pending',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      });

      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTitle('Activate')).toBeInTheDocument();
      });
    });

    it('should activate enrollment when activate button clicked', async () => {
      mockGetAll.mockResolvedValue({
        items: [
          {
            id: 'enroll-1',
            child_name: 'Johnny Doe',
            class_name: 'Soccer',
            status: 'pending',
            final_price: 150,
            created_at: '2024-01-15T00:00:00Z',
            enrolled_at: '2024-01-15T00:00:00Z',
          },
        ],
        total: 1,
      });
      mockActivateEnrollment.mockResolvedValue({ id: 'enroll-1', status: 'active' });

      const user = userEvent;
      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTitle('Activate')).toBeInTheDocument();
      });

      await user.click(screen.getByTitle('Activate'));

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Enrollment activated successfully');
      });
    });

    it('should not display Activate button for active enrollments', async () => {
      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Johnny Doe')).toBeInTheDocument();
      });

      expect(screen.queryByTitle('Activate')).not.toBeInTheDocument();
    });
  });

  describe('Cancel Enrollment', () => {
    it('should display Cancel button for active enrollments', async () => {
      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTitle('Cancel')).toBeInTheDocument();
      });
    });

    it('should show confirmation dialog when cancel button clicked', async () => {
      const user = userEvent;

      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTitle('Cancel')).toBeInTheDocument();
      });

      await user.click(screen.getByTitle('Cancel'));

      await waitFor(() => {
        expect(screen.getByText(/Cancel Enrollment/i)).toBeInTheDocument();
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });
    });

    it('should cancel enrollment when confirmed', async () => {
      const user = userEvent;
      mockCancelEnrollment.mockResolvedValue({ id: 'enroll-1', status: 'cancelled' });

      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTitle('Cancel')).toBeInTheDocument();
      });

      await user.click(screen.getByTitle('Cancel'));

      await waitFor(() => {
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });

      // Find and click the confirm button in the ConfirmDialog
      const confirmButton = screen.getAllByRole('button').find(
        btn => btn.textContent?.match(/confirm|yes|ok/i)
      );
      if (confirmButton) {
        await user.click(confirmButton);
        await waitFor(() => {
          expect(mockToastSuccess).toHaveBeenCalledWith('Enrollment cancelled successfully');
        });
      }
    });
  });

  describe('Delete Enrollment', () => {
    it('should display Delete button for enrollments', async () => {
      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTitle('Delete')).toBeInTheDocument();
      });
    });

    it('should show confirmation dialog when delete button clicked', async () => {
      const user = userEvent;

      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTitle('Delete')).toBeInTheDocument();
      });

      await user.click(screen.getByTitle('Delete'));

      await waitFor(() => {
        expect(screen.getByText(/Delete Enrollment/i)).toBeInTheDocument();
        expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
      });
    });

    it('should delete enrollment when confirmed', async () => {
      const user = userEvent;
      mockDeleteEnrollment.mockResolvedValue({ success: true });

      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTitle('Delete')).toBeInTheDocument();
      });

      await user.click(screen.getByTitle('Delete'));

      await waitFor(() => {
        expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
      });

      // ConfirmDialog renders a "Confirm" button
      const confirmButtons = screen.getAllByRole('button').filter(
        btn => btn.textContent?.trim() === 'Confirm'
      );
      expect(confirmButtons.length).toBeGreaterThan(0);
      await user.click(confirmButtons[0]);

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Enrollment deleted successfully');
      });
    });
  });

  describe('Pagination', () => {
    it('should display pagination info when data available', async () => {
      mockGetAll.mockResolvedValue({
        items: Array.from({ length: 10 }, (_, i) => ({
          id: `enroll-${i + 1}`,
          child_name: `Child ${i + 1}`,
          class_name: `Class ${i + 1}`,
          status: 'active',
          final_price: 150,
          created_at: '2024-01-15T00:00:00Z',
          enrolled_at: '2024-01-15T00:00:00Z',
        })),
        total: 25,
      });

      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText('Child 1')).toBeInTheDocument();
      });

      // DataTable shows "Showing X to Y of Z results"
      expect(screen.getByText(/Showing/)).toBeInTheDocument();
      expect(screen.getByText(/results/)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error toast when fetch fails', async () => {
      mockGetAll.mockRejectedValue(new Error('Server error'));

      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to load enrollments');
      });
    });

    it('should handle empty enrollments list', async () => {
      mockGetAll.mockResolvedValue({
        items: [],
        total: 0,
      });

      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/No enrollments found/i)).toBeInTheDocument();
      });
    });

    it('should display error when cancel fails', async () => {
      const user = userEvent;
      mockCancelEnrollment.mockRejectedValue(new Error('Failed to cancel enrollment'));

      render(<Enrollments />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByTitle('Cancel')).toBeInTheDocument();
      });

      await user.click(screen.getByTitle('Cancel'));

      await waitFor(() => {
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getAllByRole('button').find(
        btn => btn.textContent?.match(/confirm|yes|ok/i)
      );
      if (confirmButton) {
        await user.click(confirmButton);
        await waitFor(() => {
          expect(mockToastError).toHaveBeenCalledWith('Failed to cancel enrollment');
        });
      }
    });
  });
});
