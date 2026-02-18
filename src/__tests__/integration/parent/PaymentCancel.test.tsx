/**
 * PaymentCancel Page Integration Tests
 * Tests for the payment cancellation page including UI rendering,
 * navigation buttons, and help text
 */

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../utils/test-utils';
import PaymentCancel from '../../../pages/PaymentCancel';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock Footer
jest.mock('../../../components/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="footer">Footer</div>,
}));

describe('PaymentCancel Page', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the cancellation message', () => {
      render(<PaymentCancel />);

      expect(screen.getByText('Payment Cancelled')).toBeInTheDocument();
    });

    it('should render the cancellation description', () => {
      render(<PaymentCancel />);

      expect(screen.getByText(/Your payment was not processed/i)).toBeInTheDocument();
      expect(screen.getByText(/No charges have been made/i)).toBeInTheDocument();
    });

    it('should render the "Browse Classes" button', () => {
      render(<PaymentCancel />);

      expect(screen.getByRole('button', { name: /browse classes/i })).toBeInTheDocument();
    });

    it('should render the "Go to Dashboard" button', () => {
      render(<PaymentCancel />);

      expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument();
    });

    it('should render the Footer', () => {
      render(<PaymentCancel />);

      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('should render help text with support email', () => {
      render(<PaymentCancel />);

      expect(screen.getByText(/Need help/i)).toBeInTheDocument();
      expect(screen.getByText('support@csf.com')).toBeInTheDocument();
    });

    it('should render support email as a link', () => {
      render(<PaymentCancel />);

      const emailLink = screen.getByText('support@csf.com');
      expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:support@csf.com');
    });
  });

  // ===========================================
  // NAVIGATION TESTS
  // ===========================================
  describe('Navigation', () => {
    it('should navigate to /classes when "Browse Classes" is clicked', async () => {
      render(<PaymentCancel />);

      await user.click(screen.getByRole('button', { name: /browse classes/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/classes');
    });

    it('should navigate to /dashboard when "Go to Dashboard" is clicked', async () => {
      render(<PaymentCancel />);

      await user.click(screen.getByRole('button', { name: /go to dashboard/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  // ===========================================
  // UI ELEMENTS TESTS
  // ===========================================
  describe('UI Elements', () => {
    it('should display a cancel/error icon', () => {
      render(<PaymentCancel />);

      // The XCircle icon should be rendered within a red background circle
      const redCircle = document.querySelector('.bg-red-100');
      expect(redCircle).toBeInTheDocument();
    });

    it('should render buttons with proper order (Browse first, Dashboard second)', () => {
      render(<PaymentCancel />);

      const buttons = screen.getAllByRole('button');
      expect(buttons[0]).toHaveTextContent(/browse classes/i);
      expect(buttons[1]).toHaveTextContent(/go to dashboard/i);
    });

    it('should render the card container', () => {
      render(<PaymentCancel />);

      const card = document.querySelector('.bg-white.rounded-2xl');
      expect(card).toBeInTheDocument();
    });
  });

  // ===========================================
  // ACCESSIBILITY TESTS
  // ===========================================
  describe('Accessibility', () => {
    it('should have heading level 1 for the main message', () => {
      render(<PaymentCancel />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Payment Cancelled');
    });

    it('should have clickable buttons that are not disabled', () => {
      render(<PaymentCancel />);

      const browseButton = screen.getByRole('button', { name: /browse classes/i });
      const dashboardButton = screen.getByRole('button', { name: /go to dashboard/i });

      expect(browseButton).not.toBeDisabled();
      expect(dashboardButton).not.toBeDisabled();
    });
  });
});
