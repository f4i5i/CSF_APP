import React from 'react';
import { render, screen, waitFor } from '../../__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import PaymentCard from '../payment/PaymentCard';

// Mock Stripe
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({})),
}));

jest.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }) => <div data-testid="stripe-elements">{children}</div>,
  CardElement: () => <div data-testid="card-element" />,
  useStripe: () => ({
    confirmCardSetup: jest.fn(),
  }),
  useElements: () => ({
    getElement: jest.fn(),
  }),
}));

jest.mock('../../api/services/payments.service', () => ({
  __esModule: true,
  default: {
    getPaymentMethods: jest.fn(),
    createSetupIntent: jest.fn(),
    setDefaultPaymentMethod: jest.fn(),
    removePaymentMethod: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

const paymentsService = require('../../api/services/payments.service').default;

describe('PaymentCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    paymentsService.getPaymentMethods.mockReturnValue(new Promise(() => {}));
    render(<PaymentCard />);
    expect(screen.getByText('Loading payment methods...')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    paymentsService.getPaymentMethods.mockRejectedValue(new Error('Fail'));
    render(<PaymentCard />);
    await waitFor(() => {
      expect(screen.getByText('Failed to load payment methods')).toBeInTheDocument();
    });
  });

  it('renders Try Again on error', async () => {
    paymentsService.getPaymentMethods.mockRejectedValue(new Error('Fail'));
    render(<PaymentCard />);
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('renders empty state when no payment methods', async () => {
    paymentsService.getPaymentMethods.mockResolvedValue([]);
    render(<PaymentCard />);
    await waitFor(() => {
      expect(screen.getByText('No saved payment methods')).toBeInTheDocument();
      expect(screen.getByText('Add your first card')).toBeInTheDocument();
    });
  });

  it('renders Saved Payment Methods heading', async () => {
    paymentsService.getPaymentMethods.mockResolvedValue([]);
    render(<PaymentCard />);
    await waitFor(() => {
      expect(screen.getByText('Saved Payment Methods')).toBeInTheDocument();
    });
  });

  it('renders Add Card button', async () => {
    paymentsService.getPaymentMethods.mockResolvedValue([]);
    render(<PaymentCard />);
    await waitFor(() => {
      expect(screen.getByText('Add Card')).toBeInTheDocument();
    });
  });

  it('renders payment method card info', async () => {
    paymentsService.getPaymentMethods.mockResolvedValue([
      {
        id: 'pm_1',
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2028,
        is_default: true,
      },
    ]);
    render(<PaymentCard />);
    await waitFor(() => {
      expect(screen.getByText(/Visa/)).toBeInTheDocument();
      expect(screen.getByText(/4242/)).toBeInTheDocument();
      expect(screen.getByText('Expires 12/2028')).toBeInTheDocument();
      expect(screen.getByText('Default')).toBeInTheDocument();
    });
  });

  it('renders Set as Default for non-default methods', async () => {
    paymentsService.getPaymentMethods.mockResolvedValue([
      {
        id: 'pm_1',
        brand: 'visa',
        last4: '4242',
        exp_month: 12,
        exp_year: 2028,
        is_default: false,
      },
    ]);
    render(<PaymentCard />);
    await waitFor(() => {
      expect(screen.getByText('Set as Default')).toBeInTheDocument();
    });
  });

  it('handles items response format', async () => {
    paymentsService.getPaymentMethods.mockResolvedValue({
      items: [
        {
          id: 'pm_1',
          brand: 'mastercard',
          last4: '5555',
          exp_month: 6,
          exp_year: 2027,
          is_default: true,
        },
      ],
    });
    render(<PaymentCard />);
    await waitFor(() => {
      expect(screen.getByText(/Mastercard/)).toBeInTheDocument();
      expect(screen.getByText(/5555/)).toBeInTheDocument();
    });
  });
});
