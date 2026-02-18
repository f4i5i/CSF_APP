/**
 * Integration Tests for Discount Management Page
 * Tests discount CRUD operations, toggle active/inactive, filtering, and form interactions
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DiscountManagement from '../../../pages/AdminDashboard/DiscountManagement';

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

// Mock discounts service
const mockGetAllDiscounts = jest.fn();
const mockUpdateDiscount = jest.fn();
const mockDeleteDiscount = jest.fn();
jest.mock('../../../api/services/discounts.service', () => ({
  __esModule: true,
  default: {
    getAll: (...args: any[]) => mockGetAllDiscounts(...args),
    update: (...args: any[]) => mockUpdateDiscount(...args),
    delete: (...args: any[]) => mockDeleteDiscount(...args),
  },
}));

// Mock dynamic imports for programs and classes services
jest.mock('../../../api/services/programs.service', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue({ items: [] }),
  },
}));

jest.mock('../../../api/services/classes.service', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue({ items: [] }),
  },
}));

// Mock DiscountForm component
jest.mock('../../../components/admin/DiscountForm', () => {
  return function MockDiscountForm({ isOpen, onClose, mode, initialData, onSuccess }: any) {
    if (!isOpen) return null;
    return (
      <div role="dialog" data-testid="discount-form">
        <h2>{mode === 'edit' ? 'Edit Discount' : 'Create Discount'}</h2>
        {initialData && <span data-testid="initial-code">{initialData.code}</span>}
        <button onClick={() => {
          onSuccess();
          onClose();
        }}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    );
  };
});

// ==========================================
// TEST SETUP
// ==========================================

const mockDiscounts = [
  {
    id: 'disc-1',
    code: 'SUMMER20',
    description: '20% off summer enrollment',
    discount_type: 'percentage',
    discount_value: 20,
    is_active: true,
    valid_from: '2024-06-01T00:00:00Z',
    valid_until: '2024-08-31T00:00:00Z',
    max_uses: 100,
    current_uses: 45,
    created_at: '2024-05-01T00:00:00Z',
  },
  {
    id: 'disc-2',
    code: 'WELCOME10',
    description: '$10 off first registration',
    discount_type: 'fixed_amount',
    discount_value: 10,
    is_active: true,
    valid_from: '2024-01-01T00:00:00Z',
    valid_until: null,
    max_uses: null,
    current_uses: 200,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'disc-3',
    code: 'EXPIRED50',
    description: 'Expired 50% discount',
    discount_type: 'percentage',
    discount_value: 50,
    is_active: false,
    valid_from: '2023-01-01T00:00:00Z',
    valid_until: '2023-12-31T00:00:00Z',
    max_uses: 50,
    current_uses: 50,
    created_at: '2023-01-01T00:00:00Z',
  },
];

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

describe('Discount Management Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllDiscounts.mockResolvedValue({ items: [...mockDiscounts], total: mockDiscounts.length });
  });

  const waitForLoaded = async () => {
    await waitFor(() => {
      expect(screen.getByText('SUMMER20')).toBeInTheDocument();
    });
  };

  // PAGE LOADING TESTS
  describe('Page Loading', () => {
    it('should render page title', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      expect(screen.getByText('Discount Codes')).toBeInTheDocument();
    });

    it('should render page description', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      expect(screen.getByText(/Create and manage discount codes/i)).toBeInTheDocument();
    });

    it('should display Create Discount button', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      expect(screen.getByText('Create Discount')).toBeInTheDocument();
    });

    it('should load and display discount codes', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();
      expect(screen.getByText('WELCOME10')).toBeInTheDocument();
      expect(screen.getByText('EXPIRED50')).toBeInTheDocument();
    });

    it('should display discount descriptions', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();
      expect(screen.getByText(/20% off summer enrollment/i)).toBeInTheDocument();
      expect(screen.getByText(/\$10 off first registration/i)).toBeInTheDocument();
    });

    it('should display discount values formatted correctly', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();
      expect(screen.getByText('20%')).toBeInTheDocument();
      expect(screen.getByText('$10.00')).toBeInTheDocument();
    });

    it('should display usage counts', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();
      expect(screen.getByText(/45.*100/)).toBeInTheDocument();
    });

    it('should display validity dates', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();
      expect(screen.getByText(/Jun.*2024/i)).toBeInTheDocument();
      expect(screen.getByText(/No expiry/i)).toBeInTheDocument();
    });

    it('should display active status badges', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();
      const activeBadges = screen.getAllByText('Active');
      expect(activeBadges.length).toBeGreaterThanOrEqual(1);
    });

    it('should display inactive status badge', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();
      expect(screen.getAllByText('Inactive').length).toBeGreaterThan(0);
    });
  });

  // FILTERING TESTS
  describe('Filtering', () => {
    it('should display search input', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();
      expect(screen.getByPlaceholderText(/Search by code or description/i)).toBeInTheDocument();
    });

    it('should display status filter', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();
      expect(screen.getAllByText('All Statuses').length).toBeGreaterThan(0);
    });

    it('should display type filter', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();
      expect(screen.getAllByText('All Types').length).toBeGreaterThan(0);
    });

    it('should filter discounts by code search', async () => {
      const user = userEvent;
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      const searchInput = screen.getByPlaceholderText(/Search by code or description/i);
      await user.type(searchInput, 'SUMMER');

      await waitFor(() => {
        expect(screen.getByText('SUMMER20')).toBeInTheDocument();
        expect(screen.queryByText('WELCOME10')).not.toBeInTheDocument();
      });
    });

    it('should filter discounts by description search', async () => {
      const user = userEvent;
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      const searchInput = screen.getByPlaceholderText(/Search by code or description/i);
      await user.type(searchInput, 'first registration');

      await waitFor(() => {
        expect(screen.queryByText('SUMMER20')).not.toBeInTheDocument();
        expect(screen.getByText('WELCOME10')).toBeInTheDocument();
      });
    });

    it('should clear all filters', async () => {
      const user = userEvent;
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      const searchInput = screen.getByPlaceholderText(/Search by code or description/i);
      await user.type(searchInput, 'SUMMER');

      const clearButton = screen.queryByText(/Clear/i);
      if (clearButton) {
        await user.click(clearButton);
        await waitFor(() => {
          expect(screen.getByText('SUMMER20')).toBeInTheDocument();
          expect(screen.getByText('WELCOME10')).toBeInTheDocument();
          expect(screen.getByText('EXPIRED50')).toBeInTheDocument();
        });
      }
    });
  });

  // CREATE DISCOUNT TESTS
  describe('Create Discount', () => {
    it('should open create form modal', async () => {
      const user = userEvent;
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      await user.click(screen.getByText('Create Discount'));

      await waitFor(() => {
        expect(screen.getByTestId('discount-form')).toBeInTheDocument();
      });
    });

    it('should close form modal on cancel', async () => {
      const user = userEvent;
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      await user.click(screen.getByText('Create Discount'));

      await waitFor(() => {
        expect(screen.getByTestId('discount-form')).toBeInTheDocument();
      });

      // Find the Cancel button within the mock form dialog
      const cancelButtons = screen.getAllByText('Cancel');
      const formCancelButton = cancelButtons.find(btn =>
        btn.closest('[data-testid="discount-form"]')
      );
      if (formCancelButton) {
        await user.click(formCancelButton);
      }

      await waitFor(() => {
        expect(screen.queryByTestId('discount-form')).not.toBeInTheDocument();
      });
    });

    it('should refresh list after creating a discount', async () => {
      const user = userEvent;
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      await user.click(screen.getByText('Create Discount'));

      await waitFor(() => {
        expect(screen.getByTestId('discount-form')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(screen.queryByTestId('discount-form')).not.toBeInTheDocument();
      });
    });
  });

  // EDIT DISCOUNT TESTS
  describe('Edit Discount', () => {
    it('should display edit action for each discount', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      // DataTable renders action buttons with title="Edit"
      const editButtons = screen.getAllByTitle('Edit');
      expect(editButtons.length).toBe(3);
    });

    it('should open edit form with discount data', async () => {
      const user = userEvent;
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      const editButtons = screen.getAllByTitle('Edit');
      await user.click(editButtons[0]);

      await waitFor(() => {
        expect(screen.getByTestId('discount-form')).toBeInTheDocument();
        expect(screen.getByText('Edit Discount')).toBeInTheDocument();
      });

      expect(screen.getByTestId('initial-code')).toHaveTextContent('SUMMER20');
    });
  });

  // TOGGLE ACTIVE/INACTIVE TESTS
  describe('Toggle Active/Inactive', () => {
    it('should display Deactivate action for active discounts', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      const deactivateButtons = screen.getAllByTitle('Deactivate');
      expect(deactivateButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('should display Activate action for inactive discounts', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      const activateButtons = screen.getAllByTitle('Activate');
      expect(activateButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('should toggle discount active state', async () => {
      const user = userEvent;
      mockUpdateDiscount.mockResolvedValue({ ...mockDiscounts[0], is_active: false });

      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      const deactivateButtons = screen.getAllByTitle('Deactivate');
      await user.click(deactivateButtons[0]);

      await waitFor(() => {
        expect(mockUpdateDiscount).toHaveBeenCalledWith('disc-1', { is_active: false });
      });
    });

    it('should show toast on successful toggle', async () => {
      const user = userEvent;
      mockUpdateDiscount.mockResolvedValue({ ...mockDiscounts[0], is_active: false });

      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      const deactivateButtons = screen.getAllByTitle('Deactivate');
      await user.click(deactivateButtons[0]);

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Discount deactivated');
      });
    });

    it('should handle toggle error', async () => {
      const user = userEvent;
      mockUpdateDiscount.mockRejectedValue(new Error('Server error'));

      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      const deactivateButtons = screen.getAllByTitle('Deactivate');
      await user.click(deactivateButtons[0]);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to update discount status');
      });
    });
  });

  // DELETE DISCOUNT TESTS
  describe('Delete Discount', () => {
    it('should open confirm dialog on delete click', async () => {
      const user = userEvent;
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      const deleteButtons = screen.getAllByTitle('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Discount Code/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      expect(screen.getByText(/"SUMMER20"/i)).toBeInTheDocument();
    });

    it('should delete discount on confirm', async () => {
      const user = userEvent;
      mockDeleteDiscount.mockResolvedValue({ message: 'Deleted' });

      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      const deleteButtons = screen.getAllByTitle('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Discount Code/i)).toBeInTheDocument();
      });

      const confirmButtons = screen.getAllByRole('button').filter(
        btn => btn.textContent?.trim() === 'Confirm'
      );
      expect(confirmButtons.length).toBeGreaterThan(0);
      await user.click(confirmButtons[0]);

      await waitFor(() => {
        expect(mockDeleteDiscount).toHaveBeenCalledWith('disc-1');
      });
    });

    it('should handle delete error', async () => {
      const user = userEvent;
      mockDeleteDiscount.mockRejectedValue({
        response: { data: { detail: 'Cannot delete discount with active enrollments' } },
      });

      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      const deleteButtons = screen.getAllByTitle('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Discount Code/i)).toBeInTheDocument();
      });

      const confirmButtons = screen.getAllByRole('button').filter(
        btn => btn.textContent?.trim() === 'Confirm'
      );
      await user.click(confirmButtons[0]);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });
    });

    it('should close confirm dialog on cancel', async () => {
      const user = userEvent;
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      const deleteButtons = screen.getAllByTitle('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/Delete Discount Code/i)).toBeInTheDocument();
      });

      // The ConfirmDialog's cancel button
      const dialogCancelButtons = screen.getAllByRole('button').filter(
        btn => btn.textContent?.trim() === 'Cancel'
      );
      await user.click(dialogCancelButtons[0]);

      await waitFor(() => {
        expect(screen.queryByText(/Delete Discount Code/i)).not.toBeInTheDocument();
      });
    });
  });

  // EMPTY STATE TESTS
  describe('Empty State', () => {
    it('should display empty message when no discounts', async () => {
      mockGetAllDiscounts.mockResolvedValue({ items: [], total: 0 });
      render(<DiscountManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(screen.getByText(/No discount codes found/i)).toBeInTheDocument();
      });
    });

    it('should display empty message when filters return no results', async () => {
      const user = userEvent;
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();

      const searchInput = screen.getByPlaceholderText(/Search by code or description/i);
      await user.type(searchInput, 'nonexistent_xyz_code');

      await waitFor(() => {
        expect(screen.getByText(/No discount codes found/i)).toBeInTheDocument();
      });
    });
  });

  // ERROR HANDLING TESTS
  describe('Error Handling', () => {
    it('should display error when fetch fails', async () => {
      mockGetAllDiscounts.mockRejectedValue(new Error('Server error'));
      render(<DiscountManagement />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to load discount codes');
      });
    });
  });

  // LOADING STATE TESTS
  describe('Loading States', () => {
    it('should display loading state initially', () => {
      mockGetAllDiscounts.mockReturnValue(new Promise(() => {}));
      render(<DiscountManagement />, { wrapper: createWrapper() });
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('should hide loading after data loads', async () => {
      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitForLoaded();
      expect(document.querySelector('.animate-pulse')).not.toBeInTheDocument();
    });
  });

  // STATUS DISPLAY TESTS
  describe('Status Display', () => {
    it('should display Used Up status for fully used discounts', async () => {
      mockGetAllDiscounts.mockResolvedValue({
        items: [
          {
            ...mockDiscounts[2],
            is_active: true,
            valid_until: '2030-12-31T00:00:00Z',
          },
        ],
        total: 1,
      });

      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitFor(() => {
        expect(screen.getByText('Used Up')).toBeInTheDocument();
      });
    });

    it('should display Expired status for expired but active discounts', async () => {
      mockGetAllDiscounts.mockResolvedValue({
        items: [
          {
            ...mockDiscounts[0],
            is_active: true,
            valid_until: '2023-01-01T00:00:00Z',
            max_uses: null,
          },
        ],
        total: 1,
      });

      render(<DiscountManagement />, { wrapper: createWrapper() });
      await waitFor(() => {
        expect(screen.getByText('Expired')).toBeInTheDocument();
      });
    });
  });
});
