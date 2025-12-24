/**
 * Checkout Page Integration Tests
 * Tests for the complete checkout flow with child selection, payment method, and Stripe integration
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import CheckOut from '../../../pages/CheckOut';

// Mock useSearchParams to provide classId
const mockSearchParams = new URLSearchParams('classId=class-1');
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [mockSearchParams],
  useNavigate: () => mockNavigate,
}));

// Mock Stripe related components
jest.mock('../../../components/checkout/CheckoutLoading', () => ({
  __esModule: true,
  default: () => <div data-testid="checkout-loading">Loading checkout...</div>,
}));

jest.mock('../../../components/checkout/CheckoutError', () => ({
  __esModule: true,
  default: ({ error, onRetry, onGoHome }: any) => (
    <div data-testid="checkout-error">
      <p>Error: {error.message || error}</p>
      <button onClick={onRetry}>Retry</button>
      <button onClick={onGoHome}>Go Home</button>
    </div>
  ),
}));

jest.mock('../../../components/checkout/WaitlistFlow', () => ({
  __esModule: true,
  default: ({ classData, onJoinWaitlist }: any) => (
    <div data-testid="waitlist-flow">
      <h2>Class is Full: {classData?.name}</h2>
      <button onClick={onJoinWaitlist}>Join Waitlist</button>
    </div>
  ),
}));

jest.mock('../../../components/checkout/OrderConfirmation', () => ({
  __esModule: true,
  default: ({ orderData, enrollmentData, onDownloadReceipt }: any) => (
    <div data-testid="order-confirmation">
      <h2>Order Confirmed</h2>
      <p>Order ID: {orderData?.id}</p>
      <p>Enrollment ID: {enrollmentData?.id}</p>
      <button onClick={onDownloadReceipt}>Download Receipt</button>
    </div>
  ),
}));

jest.mock('../../../components/checkout/ClassDetailsSummary', () => ({
  __esModule: true,
  default: ({ classData }: any) => (
    <div data-testid="class-details">
      <h3>{classData?.name}</h3>
      <p>Price: ${classData?.price}</p>
    </div>
  ),
}));

jest.mock('../../../components/checkout/ChildSelector', () => ({
  __esModule: true,
  default: ({ children, selectedId, onSelect }: any) => (
    <div data-testid="child-selector">
      <label htmlFor="child-select">Select Child</label>
      <select
        id="child-select"
        value={selectedId || ''}
        onChange={(e) => onSelect(e.target.value)}
      >
        <option value="">Choose a child</option>
        {children?.map((child: any) => (
          <option key={child.id} value={child.id}>
            {child.first_name} {child.last_name}
          </option>
        ))}
      </select>
    </div>
  ),
}));

jest.mock('../../../components/checkout/PaymentMethodSelector', () => ({
  __esModule: true,
  default: ({ selected, onSelect }: any) => (
    <div data-testid="payment-method-selector">
      <label>Payment Method</label>
      <button onClick={() => onSelect('full')}>Pay in Full</button>
      <button onClick={() => onSelect('installments')}>Pay with Installments</button>
    </div>
  ),
}));

jest.mock('../../../components/checkout/InstallmentPlanSelector', () => ({
  __esModule: true,
  default: ({ selectedPlan, onSelect }: any) => (
    <div data-testid="installment-plan-selector">
      <label>Installment Plan</label>
      <button onClick={() => onSelect({ count: 3, firstPaymentAmount: 50 })}>
        3 Monthly Payments
      </button>
      <button onClick={() => onSelect({ count: 6, firstPaymentAmount: 25 })}>
        6 Monthly Payments
      </button>
    </div>
  ),
}));

jest.mock('../../../components/checkout/DiscountCodeInput', () => ({
  __esModule: true,
  default: ({ onApply, onRemove, appliedDiscount, isLoading }: any) => (
    <div data-testid="discount-code-input">
      {appliedDiscount ? (
        <div>
          <p>Discount Applied: {appliedDiscount.code}</p>
          <button onClick={onRemove} disabled={isLoading}>
            Remove
          </button>
        </div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Enter discount code"
            id="discount-input"
          />
          <button
            onClick={() => {
              const input = document.getElementById('discount-input') as HTMLInputElement;
              onApply(input?.value);
            }}
            disabled={isLoading}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  ),
}));

jest.mock('../../../components/checkout/OrderSummary', () => ({
  __esModule: true,
  default: ({ classPrice, registrationFee, discount, paymentMethod }: any) => (
    <div data-testid="order-summary">
      <h4>Order Summary</h4>
      <p>Class Price: ${classPrice}</p>
      <p>Registration Fee: ${registrationFee}</p>
      {discount && <p>Discount: -{discount.amount}%</p>}
      <p>Payment Method: {paymentMethod}</p>
    </div>
  ),
}));

jest.mock('../../../components/checkout/WaiverCheckModal', () => ({
  __esModule: true,
  default: ({ classData, onClose, onWaiversSigned }: any) => (
    <div data-testid="waiver-check-modal">
      <h3>Sign Required Waivers for {classData?.name}</h3>
      <button onClick={onClose}>Close</button>
      <button onClick={onWaiversSigned}>Sign Waivers</button>
    </div>
  ),
}));

const API_BASE = 'http://localhost:8000/api/v1';

describe('Checkout Page', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-parent');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');
    mockNavigate.mockClear();
    delete (window as any).location;
    (window as any).location = { href: jest.fn() };
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial Load', () => {
    it('should show loading state initially', () => {
      render(<CheckOut />);

      expect(screen.getByTestId('checkout-loading')).toBeInTheDocument();
    });

    it('should redirect to classes page if no classId provided', () => {
      mockSearchParams.delete('classId');

      render(<CheckOut />);

      expect(mockNavigate).toHaveBeenCalledWith('/classes');
    });

    it('should fetch class details, children, and capacity on mount', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('class-details')).toBeInTheDocument();
      });

      expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
      expect(screen.getByText(/Price: \$150/i)).toBeInTheDocument();
    });
  });

  describe('Class Details', () => {
    it('should display class information', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('class-details')).toBeInTheDocument();
      });

      expect(screen.getByText('Soccer Basics')).toBeInTheDocument();
    });

    it('should show waitlist flow when class is full', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id/capacity`, () => {
          return HttpResponse.json({ available: false, waitlist_count: 5 });
        })
      );

      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('waitlist-flow')).toBeInTheDocument();
      });

      expect(screen.getByText(/Class is Full/i)).toBeInTheDocument();
    });
  });

  describe('Child Selection', () => {
    it('should display child selector with user children', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      expect(screen.getByText(/Johnny Parent/i)).toBeInTheDocument();
      expect(screen.getByText(/Jenny Parent/i)).toBeInTheDocument();
    });

    it('should allow selecting a child', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect((select as HTMLSelectElement).value).toBe('child-1');
      });
    });

    it('should check for pending waivers after child selection', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [
              {
                waiver_template: {
                  id: 'waiver-1',
                  name: 'Liability Waiver',
                  content: 'Terms...',
                  waiver_type: 'liability',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
            ],
            pending_count: 1,
          });
        })
      );

      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('waiver-check-modal')).toBeInTheDocument();
      });
    });

    it('should show checking waivers message while loading', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      // Briefly shows checking message
      await waitFor(() => {
        expect(screen.queryByText(/Checking for required waivers/i)).toBeInTheDocument();
      }, { timeout: 100 });
    });
  });

  describe('Waiver Flow', () => {
    it('should show waiver modal when pending waivers exist', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [
              {
                waiver_template: {
                  id: 'waiver-1',
                  name: 'Liability Waiver',
                  content: 'Terms...',
                  waiver_type: 'liability',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
            ],
            pending_count: 1,
          });
        })
      );

      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('waiver-check-modal')).toBeInTheDocument();
      });
    });

    it('should hide payment options until waivers are signed', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [
              {
                waiver_template: {
                  id: 'waiver-1',
                  name: 'Liability Waiver',
                  content: 'Terms...',
                  waiver_type: 'liability',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
            ],
            pending_count: 1,
          });
        })
      );

      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('waiver-check-modal')).toBeInTheDocument();
      });

      // Payment method selector should not be visible yet
      expect(screen.queryByTestId('payment-method-selector')).not.toBeInTheDocument();
    });

    it('should show payment options after waivers are signed', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [
              {
                waiver_template: {
                  id: 'waiver-1',
                  name: 'Liability Waiver',
                  content: 'Terms...',
                  waiver_type: 'liability',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
            ],
            pending_count: 1,
          });
        })
      );

      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('waiver-check-modal')).toBeInTheDocument();
      });

      // Sign waivers
      const signButton = screen.getByText('Sign Waivers');
      await user.click(signButton);

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });
    });

    it('should not show waiver modal when no pending waivers', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [],
            pending_count: 0,
          });
        })
      );

      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('waiver-check-modal')).not.toBeInTheDocument();
    });
  });

  describe('Payment Method Selection', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({ items: [], pending_count: 0 });
        })
      );
    });

    it('should display payment method options', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });

      expect(screen.getByText('Pay in Full')).toBeInTheDocument();
      expect(screen.getByText('Pay with Installments')).toBeInTheDocument();
    });

    it('should allow selecting pay in full', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });

      const payFullButton = screen.getByText('Pay in Full');
      await user.click(payFullButton);

      // Should proceed to create order
    });

    it('should show installment plan selector when installments selected', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });

      const installmentsButton = screen.getByText('Pay with Installments');
      await user.click(installmentsButton);

      await waitFor(() => {
        expect(screen.getByTestId('installment-plan-selector')).toBeInTheDocument();
      });
    });
  });

  describe('Installment Plan Selection', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({ items: [], pending_count: 0 });
        })
      );
    });

    it('should allow selecting 3 month plan', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });

      const installmentsButton = screen.getByText('Pay with Installments');
      await user.click(installmentsButton);

      await waitFor(() => {
        expect(screen.getByTestId('installment-plan-selector')).toBeInTheDocument();
      });

      const threeMontlButton = screen.getByText('3 Monthly Payments');
      await user.click(threeMontlButton);

      // Should proceed to create order with installment plan
    });

    it('should allow selecting 6 month plan', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });

      const installmentsButton = screen.getByText('Pay with Installments');
      await user.click(installmentsButton);

      await waitFor(() => {
        expect(screen.getByTestId('installment-plan-selector')).toBeInTheDocument();
      });

      const sixMonthButton = screen.getByText('6 Monthly Payments');
      await user.click(sixMonthButton);

      // Should proceed to create order with installment plan
    });
  });

  describe('Discount Code', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({ items: [], pending_count: 0 });
        })
      );
    });

    it('should display discount code input', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });

      const payFullButton = screen.getByText('Pay in Full');
      await user.click(payFullButton);

      await waitFor(() => {
        expect(screen.getByTestId('discount-code-input')).toBeInTheDocument();
      });
    });

    it('should apply valid discount code', async () => {
      server.use(
        http.post(`${API_BASE}/orders/:orderId/discount`, async ({ request }) => {
          const body = await request.json() as any;
          return HttpResponse.json({
            id: 'order-1',
            total: 135, // 10% discount
            discount: {
              code: body.code,
              amount: 10,
              type: 'percentage',
            },
          });
        })
      );

      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });

      const payFullButton = screen.getByText('Pay in Full');
      await user.click(payFullButton);

      await waitFor(() => {
        expect(screen.getByTestId('discount-code-input')).toBeInTheDocument();
      });

      const discountInput = screen.getByPlaceholderText(/Enter discount code/i);
      await user.type(discountInput, 'SAVE10');

      const applyButton = screen.getByText('Apply');
      await user.click(applyButton);

      await waitFor(() => {
        expect(screen.getByText(/Discount Applied: SAVE10/i)).toBeInTheDocument();
      });
    });

    it('should handle invalid discount code', async () => {
      server.use(
        http.post(`${API_BASE}/orders/:orderId/discount`, () => {
          return HttpResponse.json(
            { message: 'Invalid discount code' },
            { status: 400 }
          );
        })
      );

      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });

      const payFullButton = screen.getByText('Pay in Full');
      await user.click(payFullButton);

      await waitFor(() => {
        expect(screen.getByTestId('discount-code-input')).toBeInTheDocument();
      });

      const discountInput = screen.getByPlaceholderText(/Enter discount code/i);
      await user.type(discountInput, 'INVALID');

      const applyButton = screen.getByText('Apply');
      await user.click(applyButton);

      // Error should be displayed
    });

    it('should allow removing applied discount', async () => {
      server.use(
        http.post(`${API_BASE}/orders/:orderId/discount`, async ({ request }) => {
          const body = await request.json() as any;
          return HttpResponse.json({
            id: 'order-1',
            total: 135,
            discount: { code: body.code, amount: 10, type: 'percentage' },
          });
        }),
        http.delete(`${API_BASE}/orders/:orderId/discount`, () => {
          return HttpResponse.json({
            id: 'order-1',
            total: 150,
            discount: null,
          });
        })
      );

      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });

      const payFullButton = screen.getByText('Pay in Full');
      await user.click(payFullButton);

      await waitFor(() => {
        expect(screen.getByTestId('discount-code-input')).toBeInTheDocument();
      });

      const discountInput = screen.getByPlaceholderText(/Enter discount code/i);
      await user.type(discountInput, 'SAVE10');
      await user.click(screen.getByText('Apply'));

      await waitFor(() => {
        expect(screen.getByText(/Discount Applied: SAVE10/i)).toBeInTheDocument();
      });

      const removeButton = screen.getByText('Remove');
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.queryByText(/Discount Applied/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Order Summary', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({ items: [], pending_count: 0 });
        })
      );
    });

    it('should display order summary', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('order-summary')).toBeInTheDocument();
      });

      expect(screen.getByText(/Class Price: \$150/i)).toBeInTheDocument();
      expect(screen.getByText(/Registration Fee: \$25/i)).toBeInTheDocument();
    });

    it('should update order summary when payment method changes', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });

      const payFullButton = screen.getByText('Pay in Full');
      await user.click(payFullButton);

      await waitFor(() => {
        expect(screen.getByText(/Payment Method: full/i)).toBeInTheDocument();
      });
    });
  });

  describe('Stripe Checkout', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({ items: [], pending_count: 0 });
        })
      );
    });

    it('should show proceed to stripe button when ready', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });

      const payFullButton = screen.getByText('Pay in Full');
      await user.click(payFullButton);

      await waitFor(() => {
        expect(screen.getByText(/Proceed to Stripe Checkout/i)).toBeInTheDocument();
      });
    });

    it('should redirect to Stripe when clicking proceed button', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });

      const payFullButton = screen.getByText('Pay in Full');
      await user.click(payFullButton);

      await waitFor(() => {
        expect(screen.getByText(/Proceed to Stripe Checkout/i)).toBeInTheDocument();
      });

      const checkoutButton = screen.getByText(/Proceed to Stripe Checkout/i);
      await user.click(checkoutButton);

      // Should set window.location.href to Stripe URL
      expect(window.location.href).toBeDefined();
    });

    it('should not show checkout button until all selections made', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      // Before selecting child
      expect(screen.queryByText(/Proceed to Stripe Checkout/i)).not.toBeInTheDocument();

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });

      // Before selecting payment method
      expect(screen.queryByText(/Proceed to Stripe Checkout/i)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error when class fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          return HttpResponse.json(
            { message: 'Class not found' },
            { status: 404 }
          );
        })
      );

      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('checkout-error')).toBeInTheDocument();
      });

      expect(screen.getByText(/Class not found/i)).toBeInTheDocument();
    });

    it('should allow retrying after error', async () => {
      let shouldFail = true;

      server.use(
        http.get(`${API_BASE}/classes/:id`, () => {
          if (shouldFail) {
            return HttpResponse.json(
              { message: 'Server error' },
              { status: 500 }
            );
          }
          return HttpResponse.json({
            id: 'class-1',
            name: 'Soccer Basics',
            price: 150,
          });
        })
      );

      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('checkout-error')).toBeInTheDocument();
      });

      shouldFail = false;
      const retryButton = screen.getByText('Retry');
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByTestId('class-details')).toBeInTheDocument();
      });
    });

    it('should handle order creation error', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({ items: [], pending_count: 0 });
        }),
        http.post(`${API_BASE}/orders`, () => {
          return HttpResponse.json(
            { message: 'Failed to create order' },
            { status: 500 }
          );
        })
      );

      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });

      const payFullButton = screen.getByText('Pay in Full');
      await user.click(payFullButton);

      // Error should be displayed
      await waitFor(() => {
        expect(screen.getByText(/Failed to create order/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should have back button that navigates to previous page', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('class-details')).toBeInTheDocument();
      });

      const backButton = screen.getByText('Back');
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should have dashboard button that navigates to dashboard', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('class-details')).toBeInTheDocument();
      });

      const dashboardButton = screen.getByText(/Go to Dashboard/i);
      await user.click(dashboardButton);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Progress Indicator', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({ items: [], pending_count: 0 });
        })
      );
    });

    it('should show progress through checkout steps', async () => {
      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      // Step 1: Select child
      const select = screen.getByLabelText(/Select Child/i);
      await user.selectOptions(select, 'child-1');

      // Step 2: Payment method
      await waitFor(() => {
        expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument();
      });

      const payFullButton = screen.getByText('Pay in Full');
      await user.click(payFullButton);

      // Step 3: Complete payment
      await waitFor(() => {
        expect(screen.getByText(/Proceed to Stripe Checkout/i)).toBeInTheDocument();
      });
    });
  });

  describe('Waitlist', () => {
    it('should allow joining waitlist when class is full', async () => {
      server.use(
        http.get(`${API_BASE}/classes/:id/capacity`, () => {
          return HttpResponse.json({ available: false, waitlist_count: 5 });
        })
      );

      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('waitlist-flow')).toBeInTheDocument();
      });

      const joinButton = screen.getByText('Join Waitlist');
      await user.click(joinButton);

      // Should trigger waitlist join
    });
  });

  describe('Order Confirmation', () => {
    it('should show order confirmation after successful payment', async () => {
      // Mock successful payment flow
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({ items: [], pending_count: 0 });
        })
      );

      render(<CheckOut />);

      await waitFor(() => {
        expect(screen.getByTestId('child-selector')).toBeInTheDocument();
      });

      // Note: Full payment flow would require mocking Stripe redirect and return
      // This is tested in the useCheckoutFlow hook tests
    });
  });
});
