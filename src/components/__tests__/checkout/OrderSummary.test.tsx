/**
 * Unit Tests for OrderSummary Component
 * Tests order breakdown, discounts, processing fees, installment/subscription info
 */

import React from 'react';
import { render, screen } from '../../../__tests__/utils/test-utils';
import OrderSummary from '../../checkout/OrderSummary';

describe('OrderSummary Component', () => {
  const defaultProps = {
    classPrice: 150,
    registrationFee: 0,
    processingFeePercent: 0,
    discount: null,
    paymentMethod: 'full',
    installmentPlan: null,
    childCount: 1,
    children: [],
    lineItems: null,
    classData: null,
    backendTotal: null,
    backendProcessingFee: null,
    customFees: [],
    selectedFeesByChild: {},
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the component', () => {
      render(<OrderSummary {...defaultProps} />);
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
    });

    it('should display class fee', () => {
      render(<OrderSummary {...defaultProps} />);
      expect(screen.getByText('Class Fee')).toBeInTheDocument();
      expect(screen.getAllByText('$150.00').length).toBeGreaterThanOrEqual(1);
    });

    it('should display total', () => {
      render(<OrderSummary {...defaultProps} />);
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  // ===========================================
  // DISCOUNT DISPLAY
  // ===========================================
  describe('Discount Display', () => {
    it('should display percentage discount', () => {
      render(
        <OrderSummary
          {...defaultProps}
          discount={{ code: 'SAVE20', type: 'percentage', value: 20 }}
        />
      );

      expect(screen.getByText('Discount')).toBeInTheDocument();
      expect(screen.getByText('SAVE20')).toBeInTheDocument();
      // 150 * 20% = 30
      expect(screen.getByText('-$30.00')).toBeInTheDocument();
    });

    it('should display fixed amount discount', () => {
      render(
        <OrderSummary
          {...defaultProps}
          discount={{ code: 'FLAT25', type: 'fixed_amount', value: 25 }}
        />
      );

      expect(screen.getByText('-$25.00')).toBeInTheDocument();
    });

    it('should not display discount section when no discount', () => {
      render(<OrderSummary {...defaultProps} />);
      expect(screen.queryByText('Discount')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // PROCESSING FEE
  // ===========================================
  describe('Processing Fee', () => {
    it('should display processing fee when set', () => {
      render(
        <OrderSummary
          {...defaultProps}
          processingFeePercent={3.2}
        />
      );

      expect(screen.getByText('Processing Fee (3.2%)')).toBeInTheDocument();
      // 150 * 3.2% = 4.80
      expect(screen.getByText('$4.80')).toBeInTheDocument();
    });

    it('should not display processing fee when zero', () => {
      render(<OrderSummary {...defaultProps} />);
      expect(
        screen.queryByText('Processing Fee (3.2%)')
      ).not.toBeInTheDocument();
    });

    it('should use backend processing fee when available', () => {
      render(
        <OrderSummary
          {...defaultProps}
          processingFeePercent={3.2}
          backendProcessingFee={5.25}
        />
      );

      expect(screen.getByText('$5.25')).toBeInTheDocument();
    });
  });

  // ===========================================
  // TOTAL CALCULATION
  // ===========================================
  describe('Total Calculation', () => {
    it('should calculate correct total with just class fee', () => {
      render(<OrderSummary {...defaultProps} classPrice={100} />);
      // Total should be displayed in the bold total row
      const totalRow = screen.getByText('Total').closest('div');
      expect(totalRow).toHaveTextContent('$100.00');
    });

    it('should use backend total when available', () => {
      render(
        <OrderSummary
          {...defaultProps}
          classPrice={100}
          backendTotal={105.25}
        />
      );

      // The bold total should show the backend total
      expect(screen.getByText('$105.25')).toBeInTheDocument();
    });

    it('should calculate total with discount and processing fee', () => {
      render(
        <OrderSummary
          {...defaultProps}
          classPrice={200}
          discount={{ type: 'percentage', value: 10 }}
          processingFeePercent={3.2}
        />
      );

      // 200 - 20 (10%) = 180, + 180 * 3.2% = 5.76 -> total = 185.76
      expect(screen.getByText('-$20.00')).toBeInTheDocument();
      expect(screen.getByText('$5.76')).toBeInTheDocument();
    });
  });

  // ===========================================
  // MULTI-CHILD ENROLLMENT
  // ===========================================
  describe('Multi-Child Enrollment', () => {
    it('should show multi-child header when childCount > 1', () => {
      render(
        <OrderSummary
          {...defaultProps}
          childCount={2}
          children={[
            { id: 'c1', first_name: 'Alice' },
            { id: 'c2', first_name: 'Bob' },
          ]}
        />
      );

      expect(screen.getByText('2 Children Enrolling')).toBeInTheDocument();
    });

    it('should not show multi-child header for single child', () => {
      render(<OrderSummary {...defaultProps} />);
      expect(screen.queryByText(/Children Enrolling/)).not.toBeInTheDocument();
    });

    it('should show sibling discount savings for multiple children', () => {
      render(
        <OrderSummary
          {...defaultProps}
          classPrice={100}
          childCount={2}
          children={[
            { id: 'c1', first_name: 'Alice' },
            { id: 'c2', first_name: 'Bob' },
          ]}
        />
      );

      expect(screen.getByText('Sibling Discount Savings')).toBeInTheDocument();
      // Second child gets 25% off: 100 * 0.25 = 25
      expect(screen.getByText('-$25.00')).toBeInTheDocument();
    });

    it('should display child names with discount badges', () => {
      render(
        <OrderSummary
          {...defaultProps}
          classPrice={100}
          childCount={2}
          children={[
            { id: 'c1', first_name: 'Alice' },
            { id: 'c2', first_name: 'Bob' },
          ]}
        />
      );

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('25% OFF')).toBeInTheDocument();
    });
  });

  // ===========================================
  // BACKEND LINE ITEMS
  // ===========================================
  describe('Backend Line Items', () => {
    it('should render backend line items when provided', () => {
      const lineItems = [
        {
          description: 'Alice - Soccer Basics',
          unit_price: 100,
          line_total: 100,
          discount_amount: 0,
        },
        {
          description: 'Bob - Soccer Basics',
          unit_price: 100,
          line_total: 75,
          discount_amount: 25,
          discount_description: '25% sibling discount',
        },
      ];

      render(
        <OrderSummary
          {...defaultProps}
          lineItems={lineItems}
          childCount={2}
        />
      );

      expect(screen.getByText('Alice - Soccer Basics')).toBeInTheDocument();
      expect(screen.getByText('Bob - Soccer Basics')).toBeInTheDocument();
      expect(screen.getByText('25% sibling discount')).toBeInTheDocument();
    });

    it('should show strikethrough price for discounted line items', () => {
      const lineItems = [
        {
          description: 'Bob - Soccer Basics',
          unit_price: 100,
          line_total: 75,
          discount_amount: 25,
        },
      ];

      render(<OrderSummary {...defaultProps} lineItems={lineItems} />);

      // Both the original and discounted price should be visible
      expect(screen.getByText('$100.00')).toBeInTheDocument();
      expect(screen.getByText('$75.00')).toBeInTheDocument();
    });

    it('should handle subscription line items', () => {
      const lineItems = [
        {
          description: 'Alice - Monthly Soccer',
          monthly_price: 50,
          line_total: 50,
          is_subscription: true,
          billing_model: 'monthly',
          num_months: 6,
          discount_amount: 0,
        },
      ];

      render(
        <OrderSummary
          {...defaultProps}
          lineItems={lineItems}
          paymentMethod="subscribe"
        />
      );

      expect(screen.getByText('Alice - Monthly Soccer')).toBeInTheDocument();
      expect(screen.getByText('$50.00/mo')).toBeInTheDocument();
    });
  });

  // ===========================================
  // INSTALLMENT INFO
  // ===========================================
  describe('Installment Info', () => {
    it('should show installment info when payment method is installments', () => {
      render(
        <OrderSummary
          {...defaultProps}
          classPrice={600}
          paymentMethod="installments"
          installmentPlan={{ count: 3 }}
        />
      );

      expect(screen.getByText(/Payment Plan/)).toBeInTheDocument();
      expect(screen.getByText(/First payment/)).toBeInTheDocument();
    });

    it('should calculate correct first payment amount', () => {
      render(
        <OrderSummary
          {...defaultProps}
          classPrice={600}
          paymentMethod="installments"
          installmentPlan={{ count: 3 }}
        />
      );

      // 600 / 3 = 200 — may appear in multiple places (total + first payment)
      expect(screen.getAllByText(/\$200\.00/).length).toBeGreaterThanOrEqual(1);
    });

    it('should show remaining payments info', () => {
      render(
        <OrderSummary
          {...defaultProps}
          classPrice={600}
          paymentMethod="installments"
          installmentPlan={{ count: 4 }}
        />
      );

      expect(screen.getByText(/3 more months/)).toBeInTheDocument();
    });
  });

  // ===========================================
  // SUBSCRIPTION INFO
  // ===========================================
  describe('Subscription Info', () => {
    it('should show subscription badge when payment method is subscribe', () => {
      render(
        <OrderSummary
          {...defaultProps}
          paymentMethod="subscribe"
        />
      );

      expect(screen.getByText('MONTHLY SUBSCRIPTION')).toBeInTheDocument();
    });

    it('should show monthly label for subscription class fee', () => {
      render(
        <OrderSummary
          {...defaultProps}
          paymentMethod="subscribe"
        />
      );

      expect(screen.getAllByText(/Monthly/i).length).toBeGreaterThanOrEqual(1);
    });

    it('should show auto-cancel note', () => {
      render(
        <OrderSummary
          {...defaultProps}
          paymentMethod="subscribe"
        />
      );

      expect(
        screen.getByText(/Subscription auto-cancels when class ends/)
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // CUSTOM FEES (PRE-ORDER ESTIMATE)
  // ===========================================
  describe('Custom Fees', () => {
    it('should show required custom fees in estimate', () => {
      render(
        <OrderSummary
          {...defaultProps}
          customFees={[
            { name: 'Uniform', amount: 25, is_optional: false },
          ]}
          children={[{ id: 'c1', first_name: 'Alice' }]}
          childCount={1}
        />
      );

      expect(screen.getByText('Uniform')).toBeInTheDocument();
      expect(screen.getByText(/Required/)).toBeInTheDocument();
    });

    it('should show optional fees only when selected', () => {
      render(
        <OrderSummary
          {...defaultProps}
          customFees={[
            { name: 'Photo Package', amount: 10, is_optional: true },
          ]}
          children={[{ id: 'c1', first_name: 'Alice' }]}
          childCount={1}
          selectedFeesByChild={{ c1: [0] }}
        />
      );

      expect(screen.getByText('Photo Package')).toBeInTheDocument();
      expect(screen.getByText(/Optional/)).toBeInTheDocument();
    });

    it('should not show optional fees when not selected', () => {
      render(
        <OrderSummary
          {...defaultProps}
          customFees={[
            { name: 'Photo Package', amount: 10, is_optional: true },
          ]}
          children={[{ id: 'c1', first_name: 'Alice' }]}
          childCount={1}
          selectedFeesByChild={{}}
        />
      );

      expect(screen.queryByText('Photo Package')).not.toBeInTheDocument();
    });

    it('should multiply required fees by child count', () => {
      render(
        <OrderSummary
          {...defaultProps}
          customFees={[
            { name: 'Uniform', amount: 25, is_optional: false },
          ]}
          children={[
            { id: 'c1', first_name: 'Alice' },
            { id: 'c2', first_name: 'Bob' },
          ]}
          childCount={2}
        />
      );

      // 25 * 2 = 50
      expect(screen.getByText('$50.00')).toBeInTheDocument();
    });

    it('should not show custom fees when backend lineItems are present', () => {
      render(
        <OrderSummary
          {...defaultProps}
          lineItems={[
            { description: 'Class Fee', line_total: 150, unit_price: 150, discount_amount: 0 },
          ]}
          customFees={[
            { name: 'Uniform', amount: 25, is_optional: false },
          ]}
          children={[{ id: 'c1', first_name: 'Alice' }]}
          childCount={1}
        />
      );

      expect(screen.queryByText('Uniform')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================
  describe('Edge Cases', () => {
    it('should handle zero class price', () => {
      render(<OrderSummary {...defaultProps} classPrice={0} />);
      const totalRow = screen.getByText('Total').closest('div');
      expect(totalRow).toHaveTextContent('$0.00');
    });

    it('should handle discount greater than subtotal (fixed amount)', () => {
      render(
        <OrderSummary
          {...defaultProps}
          classPrice={50}
          discount={{ type: 'fixed_amount', value: 100 }}
        />
      );

      // -100 discount on a $50 order = -$50 subtotal, but total shows calculation
      expect(screen.getByText('-$100.00')).toBeInTheDocument();
    });

    it('should not show discount section when lineItems are present', () => {
      render(
        <OrderSummary
          {...defaultProps}
          lineItems={[
            { description: 'Test', line_total: 100, unit_price: 100, discount_amount: 0 },
          ]}
          discount={{ code: 'SAVE20', type: 'percentage', value: 20 }}
        />
      );

      // Discount row from promo code should be hidden when backend provides line items
      expect(screen.queryByText('SAVE20')).not.toBeInTheDocument();
    });

    it('should handle 3-child enrollment with tiered sibling discounts', () => {
      render(
        <OrderSummary
          {...defaultProps}
          classPrice={100}
          childCount={3}
          children={[
            { id: 'c1', first_name: 'Alice' },
            { id: 'c2', first_name: 'Bob' },
            { id: 'c3', first_name: 'Carol' },
          ]}
        />
      );

      expect(screen.getByText('3 Children Enrolling')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Carol')).toBeInTheDocument();
    });

    it('should handle registration fee in subtotal', () => {
      render(
        <OrderSummary
          {...defaultProps}
          classPrice={100}
          registrationFee={25}
        />
      );

      // Registration fee is added to the subtotal (100 + 25 = 125)
      // but is not displayed as a separate line item
      const totalRow = screen.getByText('Total').closest('div');
      expect(totalRow).toHaveTextContent('$125.00');
    });

    it('should handle zero processing fee percent', () => {
      render(
        <OrderSummary
          {...defaultProps}
          classPrice={100}
          processingFeePercent={0}
        />
      );

      expect(screen.queryByText(/Processing Fee/)).not.toBeInTheDocument();
    });

    it('should render order summary with all fields populated', () => {
      render(
        <OrderSummary
          {...defaultProps}
          classPrice={200}
          registrationFee={50}
          processingFeePercent={3.2}
          discount={{ code: 'TEST10', type: 'percentage', value: 10 }}
          paymentMethod="full"
          childCount={1}
          children={[{ id: 'c1', first_name: 'Alice' }]}
        />
      );

      expect(screen.getByText('Order Summary')).toBeInTheDocument();
      expect(screen.getByText('Class Fee')).toBeInTheDocument();
      // Registration fee is included in subtotal but not shown as separate line
      expect(screen.getByText('Discount')).toBeInTheDocument();
      expect(screen.getByText('Processing Fee (3.2%)')).toBeInTheDocument();
    });
  });
});
