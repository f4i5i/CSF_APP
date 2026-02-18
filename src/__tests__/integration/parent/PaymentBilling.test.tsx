/**
 * PaymentBilling Page Integration Tests
 * Tests for the payment and billing settings page including sections,
 * sidebar, and component rendering
 */

import { screen } from '@testing-library/react';
import { render } from '../../utils/test-utils';
import PaymentPage from '../../../pages/PaymentBilling';

// Mock components
jest.mock('../../../components/Sidebar', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

jest.mock('../../../components/payment/PaymentCard', () => ({
  __esModule: true,
  default: () => <div data-testid="payment-card">Payment Card</div>,
}));

jest.mock('../../../components/payment/BillingInfo', () => ({
  __esModule: true,
  default: () => <div data-testid="billing-info">Billing Info</div>,
}));

jest.mock('../../../components/payment/MembershipList', () => ({
  __esModule: true,
  default: () => <div data-testid="membership-list">Membership List</div>,
}));

jest.mock('../../../components/payment/InvoiceTable', () => ({
  __esModule: true,
  default: () => <div data-testid="invoice-table">Invoice Table</div>,
}));

jest.mock('../../../components/Footer', () => ({
  __esModule: true,
  default: ({ isFixed }: { isFixed?: boolean }) => (
    <div data-testid="footer" data-fixed={isFixed}>
      Footer
    </div>
  ),
}));

jest.mock('../../../components/Logo', () => ({
  __esModule: true,
  default: () => <div data-testid="logo">Logo</div>,
}));

jest.mock('@/components/DottedOverlay', () => ({
  __esModule: true,
  default: () => <div data-testid="dotted-overlay">Overlay</div>,
}));

describe('PaymentBilling Page', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-parent');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the page with Settings title', () => {
      render(<PaymentPage />);

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should render the Logo', () => {
      render(<PaymentPage />);

      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });

    it('should render the Sidebar', () => {
      render(<PaymentPage />);

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('should render the Footer with isFixed=false', () => {
      render(<PaymentPage />);

      const footer = screen.getByTestId('footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveAttribute('data-fixed', 'false');
    });

    it('should render Cancel and Save Changes buttons', () => {
      render(<PaymentPage />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    });
  });

  // ===========================================
  // SECTION RENDERING TESTS
  // ===========================================
  describe('Sections', () => {
    it('should render Payment section', () => {
      render(<PaymentPage />);

      expect(screen.getByText('Payment')).toBeInTheDocument();
      expect(screen.getByText(/Manage your payment methods securely/i)).toBeInTheDocument();
    });

    it('should render PaymentCard component', () => {
      render(<PaymentPage />);

      expect(screen.getByTestId('payment-card')).toBeInTheDocument();
    });

    it('should render BillingInfo component', () => {
      render(<PaymentPage />);

      expect(screen.getByTestId('billing-info')).toBeInTheDocument();
    });

    it('should render MembershipList component', () => {
      render(<PaymentPage />);

      expect(screen.getByTestId('membership-list')).toBeInTheDocument();
    });

    it('should render InvoiceTable component', () => {
      render(<PaymentPage />);

      expect(screen.getByTestId('invoice-table')).toBeInTheDocument();
    });

    it('should render Billing section heading', () => {
      render(<PaymentPage />);

      const billingHeadings = screen.getAllByText('Billing');
      expect(billingHeadings.length).toBeGreaterThan(0);
    });

    it('should render Memberships section heading', () => {
      render(<PaymentPage />);

      const membershipHeadings = screen.getAllByText('Memberships');
      expect(membershipHeadings.length).toBeGreaterThan(0);
    });

    it('should render Invoices section heading', () => {
      render(<PaymentPage />);

      const invoiceHeadings = screen.getAllByText('Invoices');
      expect(invoiceHeadings.length).toBeGreaterThan(0);
    });
  });

  // ===========================================
  // SECTION DESCRIPTIONS TESTS
  // ===========================================
  describe('Section Descriptions', () => {
    it('should render payment section description', () => {
      render(<PaymentPage />);

      expect(screen.getByText(/Manage your payment methods securely/i)).toBeInTheDocument();
    });

    it('should render billing section description', () => {
      render(<PaymentPage />);

      expect(screen.getAllByText(/Review and update your billing information/i).length).toBeGreaterThan(0);
    });

    it('should render memberships section description', () => {
      render(<PaymentPage />);

      expect(screen.getAllByText(/View all your children's class enrollments/i).length).toBeGreaterThan(0);
    });

    it('should render invoices section description', () => {
      render(<PaymentPage />);

      expect(screen.getAllByText(/Download and view your payment history/i).length).toBeGreaterThan(0);
    });
  });

  // ===========================================
  // LAYOUT STRUCTURE TESTS
  // ===========================================
  describe('Layout Structure', () => {
    it('should have a main white container', () => {
      render(<PaymentPage />);

      const whiteContainer = document.querySelector('.bg-white');
      expect(whiteContainer).toBeInTheDocument();
    });

    it('should render DottedOverlay', () => {
      render(<PaymentPage />);

      expect(screen.getByTestId('dotted-overlay')).toBeInTheDocument();
    });
  });
});
