/**
 * PaymentSuccess Page Integration Tests
 * Tests for the payment success page including success display,
 * countdown timer, auto-redirect, and manual navigation
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../utils/test-utils';
import PaymentSuccess from '../../../pages/PaymentSuccess';

// Mock useNavigate and useSearchParams
const mockNavigate = jest.fn();
let mockSearchParams = new URLSearchParams('session_id=cs_test_123456');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
}));

// Mock Footer
jest.mock('../../../components/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="footer">Footer</div>,
}));

describe('PaymentSuccess Page', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockSearchParams = new URLSearchParams('session_id=cs_test_123456');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the success message', () => {
      render(<PaymentSuccess />);

      expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
    });

    it('should render the success description', () => {
      render(<PaymentSuccess />);

      expect(screen.getByText(/Your payment has been processed successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/Your enrollment is now active/i)).toBeInTheDocument();
    });

    it('should render the "Go to Dashboard Now" button', () => {
      render(<PaymentSuccess />);

      expect(screen.getByRole('button', { name: /go to dashboard now/i })).toBeInTheDocument();
    });

    it('should render the Footer', () => {
      render(<PaymentSuccess />);

      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  // ===========================================
  // SESSION ID DISPLAY TESTS
  // ===========================================
  describe('Session ID Display', () => {
    it('should display the session/transaction ID when present', () => {
      render(<PaymentSuccess />);

      expect(screen.getByText('Transaction ID')).toBeInTheDocument();
      expect(screen.getByText('cs_test_123456')).toBeInTheDocument();
    });

    it('should not display transaction ID section when no session_id', () => {
      mockSearchParams = new URLSearchParams('');

      render(<PaymentSuccess />);

      expect(screen.queryByText('Transaction ID')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // COUNTDOWN TIMER TESTS
  // ===========================================
  describe('Countdown Timer', () => {
    it('should display initial countdown of 5 seconds', () => {
      render(<PaymentSuccess />);

      expect(screen.getByText(/Redirecting to dashboard in/i)).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should decrement countdown every second', () => {
      render(<PaymentSuccess />);

      expect(screen.getByText('5')).toBeInTheDocument();

      jest.advanceTimersByTime(1000);
      expect(screen.getByText('4')).toBeInTheDocument();

      jest.advanceTimersByTime(1000);
      expect(screen.getByText('3')).toBeInTheDocument();

      jest.advanceTimersByTime(1000);
      expect(screen.getByText('2')).toBeInTheDocument();

      jest.advanceTimersByTime(1000);
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should auto-redirect to dashboard when countdown reaches 0', () => {
      render(<PaymentSuccess />);

      jest.advanceTimersByTime(5000);

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should display "seconds" text with countdown', () => {
      render(<PaymentSuccess />);

      expect(screen.getByText(/seconds/i)).toBeInTheDocument();
    });
  });

  // ===========================================
  // MANUAL NAVIGATION TESTS
  // ===========================================
  describe('Manual Navigation', () => {
    it('should navigate to dashboard when "Go to Dashboard Now" is clicked', async () => {
      render(<PaymentSuccess />);

      await user.click(screen.getByRole('button', { name: /go to dashboard now/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('should navigate before countdown expires when button is clicked', async () => {
      render(<PaymentSuccess />);

      // Click button immediately without waiting for countdown
      await user.click(screen.getByRole('button', { name: /go to dashboard now/i }));

      // Should navigate immediately
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  // ===========================================
  // CLEANUP TESTS
  // ===========================================
  describe('Cleanup', () => {
    it('should clear interval timer on unmount', () => {
      const { unmount } = render(<PaymentSuccess />);

      jest.advanceTimersByTime(2000);

      unmount();

      // Should not throw after unmount
      jest.advanceTimersByTime(5000);
    });
  });
});
