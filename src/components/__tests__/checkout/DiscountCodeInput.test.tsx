/**
 * Unit Tests for DiscountCodeInput Component
 * Tests code input, apply/remove actions, error states, and applied discount display
 */

import React from 'react';
import { render, screen, waitFor } from '../../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import DiscountCodeInput from '../../checkout/DiscountCodeInput';

describe('DiscountCodeInput Component', () => {
  const defaultProps = {
    onApply: jest.fn(),
    onRemove: jest.fn(),
    appliedDiscount: null,
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the component', () => {
      render(<DiscountCodeInput {...defaultProps} />);
      expect(screen.getByText('Discount Code')).toBeInTheDocument();
    });

    it('should render the input field', () => {
      render(<DiscountCodeInput {...defaultProps} />);
      expect(
        screen.getByPlaceholderText('Enter discount code')
      ).toBeInTheDocument();
    });

    it('should render the Apply button', () => {
      render(<DiscountCodeInput {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Apply/i })).toBeInTheDocument();
    });

    it('should render help text', () => {
      render(<DiscountCodeInput {...defaultProps} />);
      expect(
        screen.getByText(/Have a promo code\?/)
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // INPUT BEHAVIOR
  // ===========================================
  describe('Input Behavior', () => {
    it('should convert input to uppercase', async () => {
      render(<DiscountCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter discount code');
      await userEvent.type(input, 'summer20');

      expect(input).toHaveValue('SUMMER20');
    });

    it('should disable input when loading', () => {
      render(<DiscountCodeInput {...defaultProps} isLoading={true} />);
      const input = screen.getByPlaceholderText('Enter discount code');
      expect(input).toBeDisabled();
    });

    it('should disable Apply button when loading', () => {
      render(<DiscountCodeInput {...defaultProps} isLoading={true} />);
      expect(screen.getByRole('button', { name: /Applying/i })).toBeDisabled();
    });

    it('should show "Applying..." text when loading', () => {
      render(<DiscountCodeInput {...defaultProps} isLoading={true} />);
      expect(screen.getByText('Applying...')).toBeInTheDocument();
    });

    it('should disable Apply button when code is empty', () => {
      render(<DiscountCodeInput {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Apply/i })).toBeDisabled();
    });
  });

  // ===========================================
  // APPLY FLOW
  // ===========================================
  describe('Apply Flow', () => {
    it('should call onApply with uppercase code when Apply is clicked', async () => {
      defaultProps.onApply.mockResolvedValueOnce(undefined);
      render(<DiscountCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter discount code');
      await userEvent.type(input, 'save10');
      await userEvent.click(screen.getByRole('button', { name: /Apply/i }));

      expect(defaultProps.onApply).toHaveBeenCalledWith('SAVE10');
    });

    it('should clear the input after successful apply', async () => {
      defaultProps.onApply.mockResolvedValueOnce(undefined);
      render(<DiscountCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter discount code');
      await userEvent.type(input, 'save10');
      await userEvent.click(screen.getByRole('button', { name: /Apply/i }));

      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('should apply code on Enter key press', async () => {
      defaultProps.onApply.mockResolvedValueOnce(undefined);
      render(<DiscountCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter discount code');
      await userEvent.type(input, 'save10{Enter}');

      expect(defaultProps.onApply).toHaveBeenCalledWith('SAVE10');
    });

    it('should show error when applying empty code', async () => {
      render(<DiscountCodeInput {...defaultProps} />);

      // Force enable the button by typing and clearing
      const input = screen.getByPlaceholderText('Enter discount code');
      await userEvent.type(input, ' ');
      // Since the code is just whitespace, Apply button may be disabled
      // but pressing Enter should trigger the validation
      await userEvent.type(input, '{Enter}');

      // The error should appear as the trimmed code is empty
      await waitFor(() => {
        expect(screen.getByText('Please enter a discount code')).toBeInTheDocument();
      });
    });

    it('should show error when onApply throws', async () => {
      defaultProps.onApply.mockRejectedValueOnce(new Error('Code not found'));
      render(<DiscountCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter discount code');
      await userEvent.type(input, 'BADCODE');
      await userEvent.click(screen.getByRole('button', { name: /Apply/i }));

      await waitFor(() => {
        expect(screen.getByText('Code not found')).toBeInTheDocument();
      });
    });

    it('should show generic error when onApply throws without message', async () => {
      defaultProps.onApply.mockRejectedValueOnce({});
      render(<DiscountCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter discount code');
      await userEvent.type(input, 'BADCODE');
      await userEvent.click(screen.getByRole('button', { name: /Apply/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid discount code')).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      defaultProps.onApply.mockRejectedValueOnce(new Error('Code not found'));
      render(<DiscountCodeInput {...defaultProps} />);

      const input = screen.getByPlaceholderText('Enter discount code');
      await userEvent.type(input, 'BAD');
      await userEvent.click(screen.getByRole('button', { name: /Apply/i }));

      await waitFor(() => {
        expect(screen.getByText('Code not found')).toBeInTheDocument();
      });

      await userEvent.type(input, 'X');

      await waitFor(() => {
        expect(screen.queryByText('Code not found')).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // APPLIED DISCOUNT DISPLAY
  // ===========================================
  describe('Applied Discount Display', () => {
    it('should display applied percentage discount', () => {
      render(
        <DiscountCodeInput
          {...defaultProps}
          appliedDiscount={{
            code: 'SAVE20',
            type: 'percentage',
            value: 20,
          }}
        />
      );

      expect(screen.getByText('Discount Applied!')).toBeInTheDocument();
      expect(screen.getByText(/SAVE20/)).toBeInTheDocument();
      expect(screen.getByText(/20% off/)).toBeInTheDocument();
    });

    it('should display applied fixed amount discount', () => {
      render(
        <DiscountCodeInput
          {...defaultProps}
          appliedDiscount={{
            code: 'FLAT10',
            type: 'fixed_amount',
            value: 10,
          }}
        />
      );

      expect(screen.getByText('Discount Applied!')).toBeInTheDocument();
      expect(screen.getByText(/FLAT10/)).toBeInTheDocument();
      expect(screen.getByText(/\$10 off/)).toBeInTheDocument();
    });

    it('should hide input when discount is applied', () => {
      render(
        <DiscountCodeInput
          {...defaultProps}
          appliedDiscount={{ code: 'SAVE20', type: 'percentage', value: 20 }}
        />
      );

      expect(
        screen.queryByPlaceholderText('Enter discount code')
      ).not.toBeInTheDocument();
    });

    it('should show remove button when discount is applied', () => {
      render(
        <DiscountCodeInput
          {...defaultProps}
          appliedDiscount={{ code: 'SAVE20', type: 'percentage', value: 20 }}
        />
      );

      expect(screen.getByTitle('Remove discount')).toBeInTheDocument();
    });
  });

  // ===========================================
  // REMOVE DISCOUNT
  // ===========================================
  describe('Remove Discount', () => {
    it('should call onRemove when remove button is clicked', async () => {
      render(
        <DiscountCodeInput
          {...defaultProps}
          appliedDiscount={{ code: 'SAVE20', type: 'percentage', value: 20 }}
        />
      );

      await userEvent.click(screen.getByTitle('Remove discount'));

      expect(defaultProps.onRemove).toHaveBeenCalled();
    });
  });

  // ===========================================
  // ADMIN APPLIED DISCOUNT
  // ===========================================
  describe('Admin Applied Discount', () => {
    it('should display admin-applied discount banner', () => {
      render(
        <DiscountCodeInput
          {...defaultProps}
          appliedDiscount={{
            code: 'ADMIN',
            type: 'percentage',
            value: 50,
            adminApplied: true,
            description: 'Staff discount applied',
          }}
        />
      );

      expect(screen.getByText('Special Discount Applied')).toBeInTheDocument();
      expect(screen.getByText('Staff discount applied')).toBeInTheDocument();
    });

    it('should show default admin description when none provided', () => {
      render(
        <DiscountCodeInput
          {...defaultProps}
          appliedDiscount={{
            code: 'ADMIN',
            type: 'percentage',
            value: 50,
            adminApplied: true,
          }}
        />
      );

      expect(screen.getByText('Applied by administrator')).toBeInTheDocument();
    });
  });
});
