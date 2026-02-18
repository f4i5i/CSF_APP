/**
 * Unit Tests for InstallmentPlanSelector Component
 * Tests plan display, selection, auto-pay toggle, and payment schedule preview
 */

import React from 'react';
import { render, screen, waitFor } from '../../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import InstallmentPlanSelector from '../../checkout/InstallmentPlanSelector';

describe('InstallmentPlanSelector Component', () => {
  const defaultProps = {
    orderTotal: 600,
    selectedPlan: null,
    onSelect: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the component', async () => {
      render(<InstallmentPlanSelector {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByText('Choose Payment Plan')).toBeInTheDocument();
      });
    });

    it('should display all installment options', async () => {
      render(<InstallmentPlanSelector {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByText('2 Months')).toBeInTheDocument();
        expect(screen.getByText('3 Months')).toBeInTheDocument();
        expect(screen.getByText('4 Months')).toBeInTheDocument();
        expect(screen.getByText('6 Months')).toBeInTheDocument();
      });
    });

    it('should display monthly amounts', async () => {
      render(<InstallmentPlanSelector {...defaultProps} />);
      await waitFor(() => {
        expect(screen.getByText('$300.00/month')).toBeInTheDocument(); // 600/2
        expect(screen.getByText('$200.00/month')).toBeInTheDocument(); // 600/3
        expect(screen.getByText('$150.00/month')).toBeInTheDocument(); // 600/4
        expect(screen.getByText('$100.00/month')).toBeInTheDocument(); // 600/6
      });
    });

    it('should display total for each plan', async () => {
      render(<InstallmentPlanSelector {...defaultProps} />);
      await waitFor(() => {
        const totalTexts = screen.getAllByText('Total: $600.00');
        expect(totalTexts.length).toBe(4);
      });
    });
  });

  // ===========================================
  // PLAN SELECTION
  // ===========================================
  describe('Plan Selection', () => {
    it('should call onSelect when a plan is clicked', async () => {
      render(<InstallmentPlanSelector {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('3 Months')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByText('3 Months'));

      expect(defaultProps.onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          count: 3,
          label: '3 Months',
          amountPerMonth: '200.00',
          total: '600.00',
          autoPay: true,
        })
      );
    });

    it('should visually highlight the selected plan', async () => {
      render(
        <InstallmentPlanSelector
          {...defaultProps}
          selectedPlan={{ count: 2, label: '2 Months', amountPerMonth: '300.00' }}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('2 Months')).toBeInTheDocument();
      });

      // The selected plan button should have the selected style
      const twoMonthsButton = screen.getByText('2 Months').closest('button');
      expect(twoMonthsButton?.className).toContain('border-[#F3BC48]');
    });
  });

  // ===========================================
  // AUTO-PAY TOGGLE
  // ===========================================
  describe('Auto-Pay Toggle', () => {
    it('should render auto-pay checkbox', async () => {
      render(<InstallmentPlanSelector {...defaultProps} />);
      await waitFor(() => {
        expect(
          screen.getByText('Enable Auto-Pay (Recommended)')
        ).toBeInTheDocument();
      });
    });

    it('should have auto-pay checked by default', async () => {
      render(<InstallmentPlanSelector {...defaultProps} />);
      await waitFor(() => {
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
      });
    });

    it('should toggle auto-pay when clicked', async () => {
      render(<InstallmentPlanSelector {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeChecked();
      });

      await userEvent.click(screen.getByRole('checkbox'));
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('should pass autoPay value when selecting a plan', async () => {
      render(<InstallmentPlanSelector {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('2 Months')).toBeInTheDocument();
      });

      // Uncheck auto-pay first
      await userEvent.click(screen.getByRole('checkbox'));

      // Select a plan
      await userEvent.click(screen.getByText('2 Months'));

      expect(defaultProps.onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          autoPay: false,
        })
      );
    });
  });

  // ===========================================
  // PAYMENT SCHEDULE PREVIEW
  // ===========================================
  describe('Payment Schedule Preview', () => {
    it('should show payment schedule when a plan is selected', async () => {
      render(
        <InstallmentPlanSelector
          {...defaultProps}
          selectedPlan={{
            count: 3,
            label: '3 Months',
            amountPerMonth: '200.00',
            total: '600.00',
          }}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText('Payment Schedule Preview:')
        ).toBeInTheDocument();
      });

      // Should show 3 payment entries
      expect(screen.getByText(/Payment 1/)).toBeInTheDocument();
      expect(screen.getByText(/Payment 2/)).toBeInTheDocument();
      expect(screen.getByText(/Payment 3/)).toBeInTheDocument();
    });

    it('should not show payment schedule when no plan is selected', async () => {
      render(<InstallmentPlanSelector {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Choose Payment Plan')).toBeInTheDocument();
      });

      expect(
        screen.queryByText('Payment Schedule Preview:')
      ).not.toBeInTheDocument();
    });

    it('should display correct amount per payment', async () => {
      render(
        <InstallmentPlanSelector
          {...defaultProps}
          selectedPlan={{
            count: 2,
            label: '2 Months',
            amountPerMonth: '300.00',
            total: '600.00',
          }}
        />
      );

      await waitFor(() => {
        const amounts = screen.getAllByText('$300.00');
        // amount per month in the plan card + schedule entries
        expect(amounts.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================
  describe('Edge Cases', () => {
    it('should not calculate plans when orderTotal is 0', async () => {
      render(
        <InstallmentPlanSelector {...defaultProps} orderTotal={0} />
      );

      // Component should render but without plan options calculated
      expect(screen.getByText('Choose Payment Plan')).toBeInTheDocument();
    });

    it('should handle decimal orderTotal', async () => {
      render(
        <InstallmentPlanSelector {...defaultProps} orderTotal={99.99} />
      );

      await waitFor(() => {
        expect(screen.getByText('2 Months')).toBeInTheDocument();
      });

      // 99.99 / 2 = 49.995, toFixed(2) = "49.99" (JS floating-point rounding)
      // Text is split across nodes ($, amount, /month), so use regex on container
      expect(screen.getByText(/49\.99\/month/)).toBeInTheDocument();
    });

    it('should recalculate when orderTotal changes', async () => {
      const { rerender } = render(
        <InstallmentPlanSelector {...defaultProps} orderTotal={200} />
      );

      await waitFor(() => {
        expect(screen.getByText('$100.00/month')).toBeInTheDocument(); // 200/2
      });

      rerender(
        <InstallmentPlanSelector {...defaultProps} orderTotal={400} />
      );

      await waitFor(() => {
        expect(screen.getByText('$200.00/month')).toBeInTheDocument(); // 400/2
      });
    });
  });
});
