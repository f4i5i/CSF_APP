/**
 * Unit Tests for StripePaymentForm Component
 * Tests form rendering, card input handling, payment submission, and error states
 */

import React from 'react';
import { render, screen, waitFor } from '../../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import StripePaymentForm from '../../checkout/StripePaymentForm';

// Mock Stripe
const mockConfirmCardPayment = jest.fn();
const mockGetElement = jest.fn();

jest.mock('@stripe/react-stripe-js', () => ({
  useStripe: () => ({
    confirmCardPayment: mockConfirmCardPayment,
  }),
  useElements: () => ({
    getElement: mockGetElement,
  }),
  CardElement: ({ onChange, ...props }: any) => (
    <div data-testid="mock-card-element" {...props}>
      <button
        type="button"
        data-testid="simulate-card-complete"
        onClick={() => onChange && onChange({ complete: true, error: null })}
      >
        Simulate Complete
      </button>
      <button
        type="button"
        data-testid="simulate-card-error"
        onClick={() =>
          onChange &&
          onChange({
            complete: false,
            error: { message: 'Your card number is incomplete' },
          })
        }
      >
        Simulate Error
      </button>
    </div>
  ),
}));

describe('StripePaymentForm Component', () => {
  const defaultProps = {
    clientSecret: 'pi_test_secret_12345',
    amount: 150,
    onSuccess: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetElement.mockReturnValue({});
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the component', () => {
      render(<StripePaymentForm {...defaultProps} />);
      expect(screen.getByText('Payment Information')).toBeInTheDocument();
    });

    it('should render the Card Element', () => {
      render(<StripePaymentForm {...defaultProps} />);
      expect(screen.getByTestId('mock-card-element')).toBeInTheDocument();
    });

    it('should render the Secure Payment badge', () => {
      render(<StripePaymentForm {...defaultProps} />);
      expect(screen.getByText('Secure Payment')).toBeInTheDocument();
    });

    it('should render the security info section', () => {
      render(<StripePaymentForm {...defaultProps} />);
      expect(
        screen.getByText(/Your payment is secure/)
      ).toBeInTheDocument();
    });

    it('should display the amount', () => {
      render(<StripePaymentForm {...defaultProps} />);
      expect(screen.getByText('Total Amount')).toBeInTheDocument();
      // Amount appears in total display and pay button
      const amountElements = screen.getAllByText('$150.00');
      expect(amountElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should display the Pay button with amount', () => {
      render(<StripePaymentForm {...defaultProps} />);
      expect(
        screen.getByRole('button', { name: /Pay \$150\.00/i })
      ).toBeInTheDocument();
    });

    it('should render Card Information label', () => {
      render(<StripePaymentForm {...defaultProps} />);
      expect(screen.getByText('Card Information')).toBeInTheDocument();
    });
  });

  // ===========================================
  // BUTTON STATE TESTS
  // ===========================================
  describe('Button State', () => {
    it('should disable the Pay button when card is not complete', () => {
      render(<StripePaymentForm {...defaultProps} />);
      const payButton = screen.getByRole('button', { name: /Pay \$150\.00/i });
      expect(payButton).toBeDisabled();
    });

    it('should enable the Pay button when card is complete', async () => {
      render(<StripePaymentForm {...defaultProps} />);

      // Simulate card completion
      await userEvent.click(screen.getByTestId('simulate-card-complete'));

      const payButton = screen.getByRole('button', { name: /Pay \$150\.00/i });
      expect(payButton).not.toBeDisabled();
    });
  });

  // ===========================================
  // CARD CHANGE HANDLING
  // ===========================================
  describe('Card Change Handling', () => {
    it('should display card error message', async () => {
      render(<StripePaymentForm {...defaultProps} />);

      await userEvent.click(screen.getByTestId('simulate-card-error'));

      expect(
        screen.getByText('Your card number is incomplete')
      ).toBeInTheDocument();
    });

    it('should clear error when card becomes complete', async () => {
      render(<StripePaymentForm {...defaultProps} />);

      // First trigger error
      await userEvent.click(screen.getByTestId('simulate-card-error'));
      expect(
        screen.getByText('Your card number is incomplete')
      ).toBeInTheDocument();

      // Then complete card
      await userEvent.click(screen.getByTestId('simulate-card-complete'));
      expect(
        screen.queryByText('Your card number is incomplete')
      ).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // SUCCESSFUL PAYMENT
  // ===========================================
  describe('Successful Payment', () => {
    it('should call confirmCardPayment on form submit', async () => {
      mockConfirmCardPayment.mockResolvedValueOnce({
        paymentIntent: { id: 'pi_123', status: 'succeeded' },
      });

      render(<StripePaymentForm {...defaultProps} />);

      // Complete card
      await userEvent.click(screen.getByTestId('simulate-card-complete'));

      // Submit form
      await userEvent.click(screen.getByRole('button', { name: /Pay \$150\.00/i }));

      expect(mockConfirmCardPayment).toHaveBeenCalledWith(
        'pi_test_secret_12345',
        {
          payment_method: {
            card: expect.anything(),
          },
        }
      );
    });

    it('should call onSuccess callback on successful payment', async () => {
      const paymentIntent = { id: 'pi_123', status: 'succeeded' };
      mockConfirmCardPayment.mockResolvedValueOnce({ paymentIntent });

      render(<StripePaymentForm {...defaultProps} />);

      await userEvent.click(screen.getByTestId('simulate-card-complete'));
      await userEvent.click(screen.getByRole('button', { name: /Pay \$150\.00/i }));

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalledWith(paymentIntent);
      });
    });

    it('should show Processing Payment text during submission', async () => {
      let resolvePayment: (value: any) => void;
      mockConfirmCardPayment.mockReturnValueOnce(
        new Promise((resolve) => {
          resolvePayment = resolve;
        })
      );

      render(<StripePaymentForm {...defaultProps} />);

      await userEvent.click(screen.getByTestId('simulate-card-complete'));
      await userEvent.click(screen.getByRole('button', { name: /Pay \$150\.00/i }));

      expect(screen.getByText('Processing Payment...')).toBeInTheDocument();

      // Resolve the payment
      resolvePayment!({
        paymentIntent: { id: 'pi_123', status: 'succeeded' },
      });

      await waitFor(() => {
        expect(screen.queryByText('Processing Payment...')).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // FAILED PAYMENT
  // ===========================================
  describe('Failed Payment', () => {
    it('should display Stripe error message on payment failure', async () => {
      mockConfirmCardPayment.mockResolvedValueOnce({
        error: { message: 'Your card was declined.' },
      });

      render(<StripePaymentForm {...defaultProps} />);

      await userEvent.click(screen.getByTestId('simulate-card-complete'));
      await userEvent.click(screen.getByRole('button', { name: /Pay \$150\.00/i }));

      await waitFor(() => {
        expect(screen.getByText('Your card was declined.')).toBeInTheDocument();
      });
    });

    it('should call onError callback on payment failure', async () => {
      const stripeError = { message: 'Your card was declined.' };
      mockConfirmCardPayment.mockResolvedValueOnce({ error: stripeError });

      render(<StripePaymentForm {...defaultProps} />);

      await userEvent.click(screen.getByTestId('simulate-card-complete'));
      await userEvent.click(screen.getByRole('button', { name: /Pay \$150\.00/i }));

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith(stripeError);
      });
    });

    it('should display error for unexpected payment status', async () => {
      mockConfirmCardPayment.mockResolvedValueOnce({
        paymentIntent: { id: 'pi_123', status: 'requires_action' },
      });

      render(<StripePaymentForm {...defaultProps} />);

      await userEvent.click(screen.getByTestId('simulate-card-complete'));
      await userEvent.click(screen.getByRole('button', { name: /Pay \$150\.00/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Payment status: requires_action')
        ).toBeInTheDocument();
      });
    });

    it('should handle unexpected errors during payment', async () => {
      mockConfirmCardPayment.mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<StripePaymentForm {...defaultProps} />);

      await userEvent.click(screen.getByTestId('simulate-card-complete'));
      await userEvent.click(screen.getByRole('button', { name: /Pay \$150\.00/i }));

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // VALIDATION ERRORS
  // ===========================================
  describe('Validation Errors', () => {
    it('should show error when client secret is missing', async () => {
      render(
        <StripePaymentForm {...defaultProps} clientSecret={null} />
      );

      await userEvent.click(screen.getByTestId('simulate-card-complete'));
      await userEvent.click(screen.getByRole('button', { name: /Pay \$150\.00/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Payment setup not complete. Please try again.')
        ).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================
  describe('Edge Cases', () => {
    it('should handle zero amount', () => {
      render(<StripePaymentForm {...defaultProps} amount={0} />);
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });

    it('should display error heading when error occurs', async () => {
      mockConfirmCardPayment.mockResolvedValueOnce({
        error: { message: 'Declined' },
      });

      render(<StripePaymentForm {...defaultProps} />);

      await userEvent.click(screen.getByTestId('simulate-card-complete'));
      await userEvent.click(screen.getByRole('button', { name: /Pay \$150\.00/i }));

      await waitFor(() => {
        expect(screen.getByText('Payment Error')).toBeInTheDocument();
      });
    });

    it('should re-enable the button after payment fails', async () => {
      mockConfirmCardPayment.mockResolvedValueOnce({
        error: { message: 'Declined' },
      });

      render(<StripePaymentForm {...defaultProps} />);

      await userEvent.click(screen.getByTestId('simulate-card-complete'));
      await userEvent.click(screen.getByRole('button', { name: /Pay \$150\.00/i }));

      await waitFor(() => {
        const payButton = screen.getByRole('button', { name: /Pay \$150\.00/i });
        expect(payButton).not.toBeDisabled();
      });
    });
  });
});
