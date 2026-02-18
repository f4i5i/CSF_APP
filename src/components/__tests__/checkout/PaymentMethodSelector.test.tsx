/**
 * Unit Tests for PaymentMethodSelector Component
 * Tests payment method rendering, selection, subscription/installment support, and help text
 */

import React from 'react';
import { render, screen, waitFor } from '../../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import PaymentMethodSelector from '../../checkout/PaymentMethodSelector';

describe('PaymentMethodSelector Component', () => {
  const defaultProps = {
    selected: 'full',
    onSelect: jest.fn(),
    classPrice: 150,
    classData: {
      id: 'class-1',
      name: 'Soccer Basics',
      installments_enabled: false,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the component', () => {
      render(<PaymentMethodSelector {...defaultProps} />);
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });

    it('should render Pay in Full option for regular classes', () => {
      render(<PaymentMethodSelector {...defaultProps} />);
      expect(screen.getByText('Pay in Full')).toBeInTheDocument();
    });

    it('should show price for Pay in Full', () => {
      render(<PaymentMethodSelector {...defaultProps} />);
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    it('should show Pay in Full description', () => {
      render(<PaymentMethodSelector {...defaultProps} />);
      expect(
        screen.getByText('Pay the full amount now (one-time)')
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // PAY IN FULL SELECTION
  // ===========================================
  describe('Pay in Full Selection', () => {
    it('should call onSelect when Pay in Full is clicked', async () => {
      render(
        <PaymentMethodSelector {...defaultProps} selected={null} />
      );

      await userEvent.click(screen.getByText('Pay in Full'));

      expect(defaultProps.onSelect).toHaveBeenCalledWith('full');
    });

    it('should highlight selected method', () => {
      render(<PaymentMethodSelector {...defaultProps} />);

      const payInFullButton = screen.getByText('Pay in Full').closest('button');
      expect(payInFullButton?.className).toContain('border-[#F3BC48]');
    });

    it('should show help text for Pay in Full', () => {
      render(<PaymentMethodSelector {...defaultProps} />);
      expect(
        screen.getByText(/Pay the full amount securely with your credit card/)
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // INSTALLMENTS
  // ===========================================
  describe('Installments', () => {
    it('should show Installments option when enabled', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          classData={{
            ...defaultProps.classData,
            installments_enabled: true,
          }}
        />
      );

      expect(screen.getByText('Installments')).toBeInTheDocument();
    });

    it('should not show Installments option when not enabled', () => {
      render(<PaymentMethodSelector {...defaultProps} />);
      expect(screen.queryByText('Installments')).not.toBeInTheDocument();
    });

    it('should call onSelect with "installments" when clicked', async () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          classData={{
            ...defaultProps.classData,
            installments_enabled: true,
          }}
        />
      );

      await userEvent.click(screen.getByText('Installments'));

      expect(defaultProps.onSelect).toHaveBeenCalledWith('installments');
    });

    it('should show installments help text when selected', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          selected="installments"
          classData={{
            ...defaultProps.classData,
            installments_enabled: true,
          }}
        />
      );

      expect(
        screen.getByText(/Choose your payment schedule/)
      ).toBeInTheDocument();
    });

    it('should show "Flexible" badge on installments option', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          classData={{
            ...defaultProps.classData,
            installments_enabled: true,
          }}
        />
      );

      expect(screen.getByText('Flexible')).toBeInTheDocument();
    });
  });

  // ===========================================
  // SUBSCRIPTION / MEMBERSHIP CLASSES
  // ===========================================
  describe('Subscription / Membership Classes', () => {
    const subscriptionClassData = {
      id: 'class-2',
      name: 'Monthly Soccer',
      class_type: 'membership',
      end_date: '2025-12-31',
      start_date: '2025-01-01',
    };

    it('should show Monthly Subscription option for membership classes', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          classData={subscriptionClassData}
        />
      );

      expect(screen.getByText('Monthly Subscription')).toBeInTheDocument();
    });

    it('should not show Pay in Full for membership classes', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          classData={subscriptionClassData}
        />
      );

      expect(screen.queryByText('Pay in Full')).not.toBeInTheDocument();
    });

    it('should show RECURRING badge', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          classData={subscriptionClassData}
        />
      );

      expect(screen.getByText('RECURRING')).toBeInTheDocument();
    });

    it('should show subscription help text when selected', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          selected="subscribe"
          classData={subscriptionClassData}
        />
      );

      expect(
        screen.getByText(/This is a RECURRING monthly subscription/)
      ).toBeInTheDocument();
    });

    it('should auto-select subscribe for subscription classes', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          selected={null}
          classData={subscriptionClassData}
        />
      );

      expect(defaultProps.onSelect).toHaveBeenCalledWith('subscribe');
    });

    it('should show end date in subscription description', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          classData={subscriptionClassData}
        />
      );

      expect(
        screen.getByText(/Recurring monthly until/)
      ).toBeInTheDocument();
    });

    it('should show /month price label for subscription', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          selected="subscribe"
          classData={subscriptionClassData}
        />
      );

      expect(screen.getByText('/month')).toBeInTheDocument();
    });
  });

  // ===========================================
  // AUTO-SELECT BEHAVIOR
  // ===========================================
  describe('Auto-Select Behavior', () => {
    it('should auto-select full for regular classes when nothing selected', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          selected={null}
        />
      );

      expect(defaultProps.onSelect).toHaveBeenCalledWith('full');
    });

    it('should not auto-select when already selected', () => {
      render(<PaymentMethodSelector {...defaultProps} />);

      // Should not call onSelect since "full" is already selected
      expect(defaultProps.onSelect).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // BILLING MODEL DETECTION
  // ===========================================
  describe('Billing Model Detection', () => {
    it('should detect subscription class via billing_model', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          classData={{
            id: 'class-3',
            name: 'Monthly Class',
            billing_model: 'monthly',
          }}
        />
      );

      expect(screen.getByText('Monthly Subscription')).toBeInTheDocument();
      expect(screen.queryByText('Pay in Full')).not.toBeInTheDocument();
    });

    it('should detect subscription class via membership_price', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          classData={{
            id: 'class-4',
            name: 'Membership Class',
            membership_price: 75,
          }}
        />
      );

      expect(screen.getByText('Monthly Subscription')).toBeInTheDocument();
    });

    it('should use membership_price as monthly price', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          classData={{
            id: 'class-4',
            name: 'Membership Class',
            membership_price: 75,
          }}
          classPrice={900}
        />
      );

      // The monthly price should use membership_price (75), not classPrice (900)
      expect(screen.getByText('$75.00')).toBeInTheDocument();
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================
  describe('Edge Cases', () => {
    it('should not show installments for subscription classes even if enabled', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          classData={{
            id: 'class-5',
            name: 'Sub Class',
            class_type: 'membership',
            installments_enabled: true,
          }}
        />
      );

      expect(screen.queryByText('Installments')).not.toBeInTheDocument();
    });

    it('should handle zero price', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          classPrice={0}
        />
      );

      // Should still render the component
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });

    it('should handle missing classData end_date for subscription', () => {
      render(
        <PaymentMethodSelector
          {...defaultProps}
          classData={{
            id: 'class-6',
            name: 'No End Date',
            class_type: 'membership',
          }}
        />
      );

      expect(
        screen.getByText(/Recurring monthly until class ends/)
      ).toBeInTheDocument();
    });
  });
});
