/**
 * Unit Tests for OrderConfirmation Component
 * Tests success display, order details, enrollment info, and action buttons
 */

import React from 'react';
import { render, screen } from '../../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import OrderConfirmation from '../../checkout/OrderConfirmation';

describe('OrderConfirmation Component', () => {
  const mockOrderData = {
    order_number: 'ORD-12345',
    total: 150,
    payment_method: 'credit_card',
    payment_date: '2025-01-15T10:30:00Z',
  };

  const mockEnrollmentData = {
    class: {
      name: 'Soccer Basics',
      schedule: 'Monday/Wednesday 4:00 PM - 5:00 PM',
      start_date: '2025-02-01',
      end_date: '2025-04-30',
    },
    child: {
      first_name: 'Alice',
      last_name: 'Smith',
    },
  };

  const defaultProps = {
    orderData: mockOrderData,
    enrollmentData: mockEnrollmentData,
    onDownloadReceipt: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the success message', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(screen.getByText('Enrollment Confirmed!')).toBeInTheDocument();
    });

    it('should render the success description', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(
        screen.getByText(/Payment successful/)
      ).toBeInTheDocument();
    });

    it('should display the order number', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(screen.getByText('ORD-12345')).toBeInTheDocument();
      expect(screen.getByText('Order Number:')).toBeInTheDocument();
    });
  });

  // ===========================================
  // ORDER DETAILS
  // ===========================================
  describe('Order Details', () => {
    it('should display class name', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
    });

    it('should display class schedule', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(
        screen.getByText('Monday/Wednesday 4:00 PM - 5:00 PM')
      ).toBeInTheDocument();
    });

    it('should display student name', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Student')).toBeInTheDocument();
    });

    it('should display amount paid', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(screen.getByText('Amount Paid:')).toBeInTheDocument();
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    it('should display payment method', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(screen.getByText('Payment Method:')).toBeInTheDocument();
      expect(screen.getByText('credit card')).toBeInTheDocument();
    });

    it('should display payment date', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(screen.getByText('Payment Date:')).toBeInTheDocument();
    });
  });

  // ===========================================
  // WHAT'S NEXT SECTION
  // ===========================================
  describe("What's Next Section", () => {
    it('should display the whats next section', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(screen.getByText("What's Next?")).toBeInTheDocument();
    });

    it('should show confirmation email notice', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(
        screen.getByText('Confirmation Email Sent')
      ).toBeInTheDocument();
    });

    it('should show mark your calendar notice', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(screen.getByText('Mark Your Calendar')).toBeInTheDocument();
    });

    it('should show view in dashboard notice', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(screen.getByText('View in Dashboard')).toBeInTheDocument();
    });
  });

  // ===========================================
  // ACTION BUTTONS
  // ===========================================
  describe('Action Buttons', () => {
    it('should render Download Receipt button', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /Download Receipt/i })
      ).toBeInTheDocument();
    });

    it('should call onDownloadReceipt when button is clicked', async () => {
      render(<OrderConfirmation {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('button', { name: /Download Receipt/i })
      );

      expect(defaultProps.onDownloadReceipt).toHaveBeenCalled();
    });

    it('should render Go to Dashboard button', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /Go to Dashboard/i })
      ).toBeInTheDocument();
    });

    it('should not render Download Receipt button when handler is not provided', () => {
      render(
        <OrderConfirmation
          {...defaultProps}
          onDownloadReceipt={undefined}
        />
      );
      expect(
        screen.queryByRole('button', { name: /Download Receipt/i })
      ).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // INSTALLMENT PLAN INFO
  // ===========================================
  describe('Installment Plan Info', () => {
    it('should display installment plan details', () => {
      const orderWithInstallments = {
        ...mockOrderData,
        payment_plan: 'installments',
        installment_plan: {
          count: 3,
          next_due_date: '2025-02-15',
          amount_per_month: 50,
        },
      };

      render(
        <OrderConfirmation
          {...defaultProps}
          orderData={orderWithInstallments}
        />
      );

      expect(screen.getByText(/Payment Plan/)).toBeInTheDocument();
      expect(screen.getByText(/3 Months/)).toBeInTheDocument();
    });
  });

  // ===========================================
  // SUBSCRIPTION INFO
  // ===========================================
  describe('Subscription Info', () => {
    it('should display subscription info', () => {
      const orderWithSubscription = {
        ...mockOrderData,
        payment_plan: 'subscribe',
      };

      render(
        <OrderConfirmation
          {...defaultProps}
          orderData={orderWithSubscription}
        />
      );

      expect(
        screen.getByText(/Subscription Active/)
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // CONTACT INFO
  // ===========================================
  describe('Contact Info', () => {
    it('should display support email', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(screen.getByText('support@example.com')).toBeInTheDocument();
    });

    it('should display support phone number', () => {
      render(<OrderConfirmation {...defaultProps} />);
      expect(screen.getByText('(123) 456-7890')).toBeInTheDocument();
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================
  describe('Edge Cases', () => {
    it('should handle missing order number', () => {
      render(
        <OrderConfirmation
          {...defaultProps}
          orderData={{ ...mockOrderData, order_number: null }}
        />
      );

      expect(screen.queryByText('Order Number:')).not.toBeInTheDocument();
    });

    it('should handle missing enrollment class data', () => {
      render(
        <OrderConfirmation
          {...defaultProps}
          enrollmentData={{ child: mockEnrollmentData.child }}
        />
      );

      expect(screen.queryByText('Soccer Basics')).not.toBeInTheDocument();
    });

    it('should handle missing child data', () => {
      render(
        <OrderConfirmation
          {...defaultProps}
          enrollmentData={{ class: mockEnrollmentData.class }}
        />
      );

      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    });

    it('should use amount_paid as fallback when total is missing', () => {
      render(
        <OrderConfirmation
          {...defaultProps}
          orderData={{ ...mockOrderData, total: null, amount_paid: 200 }}
        />
      );

      expect(screen.getByText('$200.00')).toBeInTheDocument();
    });

    it('should handle missing payment method', () => {
      render(
        <OrderConfirmation
          {...defaultProps}
          orderData={{ ...mockOrderData, payment_method: null }}
        />
      );

      expect(screen.queryByText('Payment Method:')).not.toBeInTheDocument();
    });

    it('should handle missing payment date', () => {
      render(
        <OrderConfirmation
          {...defaultProps}
          orderData={{ ...mockOrderData, payment_date: null }}
        />
      );

      expect(screen.queryByText('Payment Date:')).not.toBeInTheDocument();
    });
  });
});
