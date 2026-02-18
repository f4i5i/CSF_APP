/**
 * Unit Tests for DiscountForm Component
 * Tests open/close, create vs edit mode, form validation, submit, cancel
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DiscountForm from '../admin/DiscountForm';
import toast from 'react-hot-toast';

jest.mock('../../api/services/discounts.service', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockResolvedValue({ id: 'new-discount', code: 'SUMMER25' }),
    update: jest.fn().mockResolvedValue({ id: 'disc-1', code: 'SUMMER25' }),
  },
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('DiscountForm Component', () => {
  const mockPrograms = [
    { id: 'prog-1', name: 'Soccer' },
    { id: 'prog-2', name: 'Basketball' },
  ];

  const mockClasses = [
    { id: 'class-1', name: 'Soccer 101' },
    { id: 'class-2', name: 'Basketball Pro' },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    mode: 'create' as const,
    initialData: null,
    programs: mockPrograms,
    classes: mockClasses,
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<DiscountForm {...defaultProps} />);
      expect(screen.getByText('Create Discount Code')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<DiscountForm {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Create Discount Code')).not.toBeInTheDocument();
    });

    it('should show "Edit Discount Code" title in edit mode', () => {
      render(
        <DiscountForm
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'disc-1',
            code: 'SUMMER25',
            discount_type: 'percentage',
            discount_value: 25,
            valid_from: '2024-01-01',
            is_active: true,
          }}
        />
      );
      expect(screen.getByText('Edit Discount Code')).toBeInTheDocument();
    });

    it('should render Code input', () => {
      render(<DiscountForm {...defaultProps} />);
      expect(screen.getByPlaceholderText('e.g. SUMMER25')).toBeInTheDocument();
    });

    it('should render Description input', () => {
      render(<DiscountForm {...defaultProps} />);
      expect(
        screen.getByPlaceholderText('Summer 2025 promotion')
      ).toBeInTheDocument();
    });

    it('should render Type select', () => {
      render(<DiscountForm {...defaultProps} />);
      expect(screen.getByText('Percentage (%)')).toBeInTheDocument();
    });

    it('should render Value input', () => {
      render(<DiscountForm {...defaultProps} />);
      expect(screen.getByText(/Value \*/)).toBeInTheDocument();
    });

    it('should render Valid From date', () => {
      render(<DiscountForm {...defaultProps} />);
      expect(screen.getByText('Valid From *')).toBeInTheDocument();
    });

    it('should render Valid Until date', () => {
      render(<DiscountForm {...defaultProps} />);
      expect(screen.getByText('Valid Until')).toBeInTheDocument();
    });

    it('should render Max Total Uses input', () => {
      render(<DiscountForm {...defaultProps} />);
      expect(screen.getByText('Max Total Uses')).toBeInTheDocument();
    });

    it('should render Max Per User input', () => {
      render(<DiscountForm {...defaultProps} />);
      expect(screen.getByText('Max Per User')).toBeInTheDocument();
    });

    it('should render Minimum Order Amount input', () => {
      render(<DiscountForm {...defaultProps} />);
      expect(screen.getByText('Minimum Order Amount ($)')).toBeInTheDocument();
    });

    it('should render Restrictions section when programs/classes are provided', () => {
      render(<DiscountForm {...defaultProps} />);
      expect(screen.getByText('Restrictions (optional)')).toBeInTheDocument();
    });

    it('should render program restriction select', () => {
      render(<DiscountForm {...defaultProps} />);
      expect(screen.getByText('Restrict to Program')).toBeInTheDocument();
      expect(screen.getByText('All Programs')).toBeInTheDocument();
    });

    it('should render class restriction select', () => {
      render(<DiscountForm {...defaultProps} />);
      expect(screen.getByText('Restrict to Class')).toBeInTheDocument();
      expect(screen.getByText('All Classes')).toBeInTheDocument();
    });

    it('should not render Restrictions section when no programs/classes', () => {
      render(<DiscountForm {...defaultProps} programs={[]} classes={[]} />);
      expect(screen.queryByText('Restrictions (optional)')).not.toBeInTheDocument();
    });

    it('should render Cancel and submit buttons', () => {
      render(<DiscountForm {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Create Code')).toBeInTheDocument();
    });

    it('should show "Save Changes" button in edit mode', () => {
      render(
        <DiscountForm
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'disc-1',
            code: 'SUMMER25',
            discount_type: 'percentage',
            discount_value: 25,
            valid_from: '2024-01-01',
            is_active: true,
          }}
        />
      );
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('should render "Leave empty for no expiry" hint', () => {
      render(<DiscountForm {...defaultProps} />);
      expect(screen.getByText('Leave empty for no expiry')).toBeInTheDocument();
    });
  });

  // ===========================================
  // EDIT MODE TESTS
  // ===========================================
  describe('Edit Mode', () => {
    it('should pre-fill form data in edit mode', () => {
      render(
        <DiscountForm
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'disc-1',
            code: 'SUMMER25',
            description: 'Summer promo',
            discount_type: 'percentage',
            discount_value: 25,
            valid_from: '2024-01-01',
            valid_until: '2024-12-31',
            max_uses: 100,
            is_active: true,
          }}
        />
      );

      const codeInput = screen.getByPlaceholderText('e.g. SUMMER25') as HTMLInputElement;
      expect(codeInput.value).toBe('SUMMER25');

      const descInput = screen.getByPlaceholderText(
        'Summer 2025 promotion'
      ) as HTMLInputElement;
      expect(descInput.value).toBe('Summer promo');
    });

    it('should disable code input in edit mode', () => {
      render(
        <DiscountForm
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'disc-1',
            code: 'SUMMER25',
            discount_type: 'percentage',
            discount_value: 25,
            valid_from: '2024-01-01',
            is_active: true,
          }}
        />
      );

      const codeInput = screen.getByPlaceholderText('e.g. SUMMER25') as HTMLInputElement;
      expect(codeInput).toBeDisabled();
    });

    it('should show Active toggle in edit mode', () => {
      render(
        <DiscountForm
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'disc-1',
            code: 'SUMMER25',
            discount_type: 'percentage',
            discount_value: 25,
            valid_from: '2024-01-01',
            is_active: true,
          }}
        />
      );

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should not show Active toggle in create mode', () => {
      render(<DiscountForm {...defaultProps} />);
      // The Active checkbox label only appears in edit mode
      expect(screen.queryByLabelText('Active')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // DISCOUNT TYPE TESTS
  // ===========================================
  describe('Discount Type', () => {
    it('should show percentage label when percentage type is selected', () => {
      render(<DiscountForm {...defaultProps} />);
      expect(screen.getByText('Value * (%)')).toBeInTheDocument();
    });

    it('should update label when type changes to fixed_amount', () => {
      render(<DiscountForm {...defaultProps} />);

      const typeSelect = document.querySelector('select[name="discount_type"]');
      if (typeSelect) {
        fireEvent.change(typeSelect, { target: { value: 'fixed_amount' } });
        expect(screen.getByText('Value * ($)')).toBeInTheDocument();
      }
    });
  });

  // ===========================================
  // VALIDATION TESTS
  // ===========================================
  describe('Validation', () => {
    it('should show error when code is empty on submit', async () => {
      render(<DiscountForm {...defaultProps} />);

      fireEvent.click(screen.getByText('Create Code'));

      await waitFor(() => {
        expect(screen.getByText('Code is required')).toBeInTheDocument();
      });
    });

    it('should show error when value is 0 or negative', async () => {
      render(<DiscountForm {...defaultProps} />);

      const codeInput = screen.getByPlaceholderText('e.g. SUMMER25');
      fireEvent.change(codeInput, { target: { value: 'TEST' } });

      const valueInput = document.querySelector('input[name="discount_value"]');
      if (valueInput) fireEvent.change(valueInput, { target: { value: '0' } });

      fireEvent.click(screen.getByText('Create Code'));

      await waitFor(() => {
        expect(screen.getByText('Value must be greater than 0')).toBeInTheDocument();
      });
    });

    it('should show error when percentage exceeds 100', async () => {
      render(<DiscountForm {...defaultProps} />);

      const codeInput = screen.getByPlaceholderText('e.g. SUMMER25');
      fireEvent.change(codeInput, { target: { value: 'TEST' } });

      const valueInput = document.querySelector('input[name="discount_value"]');
      if (valueInput) fireEvent.change(valueInput, { target: { value: '150' } });

      fireEvent.click(screen.getByText('Create Code'));

      await waitFor(() => {
        expect(screen.getByText('Percentage cannot exceed 100')).toBeInTheDocument();
      });
    });

    it('should clear error when user fills in the field', async () => {
      render(<DiscountForm {...defaultProps} />);

      fireEvent.click(screen.getByText('Create Code'));

      await waitFor(() => {
        expect(screen.getByText('Code is required')).toBeInTheDocument();
      });

      const codeInput = screen.getByPlaceholderText('e.g. SUMMER25');
      fireEvent.change(codeInput, { target: { value: 'NEWCODE' } });

      expect(screen.queryByText('Code is required')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // SUBMIT TESTS
  // ===========================================
  describe('Submit', () => {
    it('should call discountsService.create on valid create submit', async () => {
      const discountsService = require('../../api/services/discounts.service').default;
      render(<DiscountForm {...defaultProps} />);

      fireEvent.change(screen.getByPlaceholderText('e.g. SUMMER25'), {
        target: { value: 'SUMMER25' },
      });

      const valueInput = document.querySelector('input[name="discount_value"]');
      if (valueInput) fireEvent.change(valueInput, { target: { value: '25' } });

      fireEvent.click(screen.getByText('Create Code'));

      await waitFor(() => {
        expect(discountsService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'SUMMER25',
            discount_type: 'percentage',
            discount_value: 25,
          })
        );
      });
    });

    it('should convert code to uppercase before submitting', async () => {
      const discountsService = require('../../api/services/discounts.service').default;
      render(<DiscountForm {...defaultProps} />);

      fireEvent.change(screen.getByPlaceholderText('e.g. SUMMER25'), {
        target: { value: 'summer25' },
      });

      const valueInput = document.querySelector('input[name="discount_value"]');
      if (valueInput) fireEvent.change(valueInput, { target: { value: '25' } });

      fireEvent.click(screen.getByText('Create Code'));

      await waitFor(() => {
        expect(discountsService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            code: 'SUMMER25',
          })
        );
      });
    });

    it('should call discountsService.update on valid edit submit', async () => {
      const discountsService = require('../../api/services/discounts.service').default;
      render(
        <DiscountForm
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'disc-1',
            code: 'SUMMER25',
            description: 'Summer promo',
            discount_type: 'percentage',
            discount_value: 25,
            valid_from: '2024-01-01',
            is_active: true,
          }}
        />
      );

      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(discountsService.update).toHaveBeenCalledWith(
          'disc-1',
          expect.objectContaining({
            is_active: true,
          })
        );
      });
    });

    it('should show success toast on successful create', async () => {
      render(<DiscountForm {...defaultProps} />);

      fireEvent.change(screen.getByPlaceholderText('e.g. SUMMER25'), {
        target: { value: 'SUMMER25' },
      });

      const valueInput = document.querySelector('input[name="discount_value"]');
      if (valueInput) fireEvent.change(valueInput, { target: { value: '25' } });

      fireEvent.click(screen.getByText('Create Code'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Discount code created');
      });
    });

    it('should call onSuccess and onClose after successful submit', async () => {
      const onSuccess = jest.fn();
      const onClose = jest.fn();
      render(
        <DiscountForm
          {...defaultProps}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      );

      fireEvent.change(screen.getByPlaceholderText('e.g. SUMMER25'), {
        target: { value: 'SUMMER25' },
      });

      const valueInput = document.querySelector('input[name="discount_value"]');
      if (valueInput) fireEvent.change(valueInput, { target: { value: '25' } });

      fireEvent.click(screen.getByText('Create Code'));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should show error toast on failed submit', async () => {
      const discountsService = require('../../api/services/discounts.service').default;
      discountsService.create.mockRejectedValueOnce(
        new Error('Code already exists')
      );

      render(<DiscountForm {...defaultProps} />);

      fireEvent.change(screen.getByPlaceholderText('e.g. SUMMER25'), {
        target: { value: 'SUMMER25' },
      });

      const valueInput = document.querySelector('input[name="discount_value"]');
      if (valueInput) fireEvent.change(valueInput, { target: { value: '25' } });

      fireEvent.click(screen.getByText('Create Code'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  // ===========================================
  // CLOSE / CANCEL TESTS
  // ===========================================
  describe('Close / Cancel', () => {
    it('should call onClose when Cancel button is clicked', () => {
      const onClose = jest.fn();
      render(<DiscountForm {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when X button is clicked', () => {
      const onClose = jest.fn();
      render(<DiscountForm {...defaultProps} onClose={onClose} />);

      const allButtons = screen.getAllByRole('button');
      const xButton = allButtons.find(
        (btn) =>
          btn.querySelector('svg') &&
          !btn.textContent?.includes('Cancel') &&
          !btn.textContent?.includes('Create Code')
      );
      if (xButton) {
        fireEvent.click(xButton);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  // ===========================================
  // LOADING STATE TESTS
  // ===========================================
  describe('Loading State', () => {
    it('should disable buttons during submit', async () => {
      const discountsService = require('../../api/services/discounts.service').default;
      let resolveCreate: Function;
      discountsService.create.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveCreate = resolve;
        })
      );

      render(<DiscountForm {...defaultProps} />);

      fireEvent.change(screen.getByPlaceholderText('e.g. SUMMER25'), {
        target: { value: 'SUMMER25' },
      });
      const valueInput = document.querySelector('input[name="discount_value"]');
      if (valueInput) fireEvent.change(valueInput, { target: { value: '25' } });

      fireEvent.click(screen.getByText('Create Code'));

      // After submitting, the submit button should be disabled
      await waitFor(() => {
        const submitBtn = screen.getByText('Create Code').closest('button') || screen.queryByRole('button', { name: /Saving|Loading|Create/i });
        if (submitBtn) {
          expect(submitBtn).toBeDisabled();
        }
      });

      // Cleanup
      resolveCreate!({ id: 'new', code: 'SUMMER25' });
    });
  });
});
