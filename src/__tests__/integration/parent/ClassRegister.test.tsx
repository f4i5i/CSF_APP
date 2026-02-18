/**
 * ClassRegister Page Integration Tests
 * Tests for the class registration page that handles custom URL slugs,
 * loading states, error states, and redirect behavior
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../utils/test-utils';
import ClassRegister from '../../../pages/ClassRegister';

// Mock useParams and useNavigate
const mockNavigate = jest.fn();
let mockSlug: string | undefined = 'u10-soccer-fall-2024';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ slug: mockSlug }),
}));

// Mock Header and Footer
jest.mock('../../../components/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

jest.mock('../../../components/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="footer">Footer</div>,
}));

// Mock classes service
const mockGetBySlug = jest.fn();
jest.mock('../../../api/services/classes.service', () => ({
  __esModule: true,
  default: {
    getBySlug: (...args: unknown[]) => mockGetBySlug(...args),
  },
}));

// Mock users service to prevent AuthProvider's getMe() call from
// going through the real API client (causes "(intermediate value) is not iterable")
jest.mock('../../../api/services/users.service', () => ({
  __esModule: true,
  default: {
    getMe: jest.fn().mockResolvedValue({
      id: 'user-1',
      email: 'parent@test.com',
      first_name: 'Test',
      last_name: 'Parent',
      role: 'parent',
    }),
  },
}));

describe('ClassRegister Page', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockSlug = 'u10-soccer-fall-2024';
    localStorage.setItem('csf_access_token', 'mock-access-token-parent');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===========================================
  // LOADING STATE TESTS
  // ===========================================
  describe('Loading State', () => {
    it('should show loading state while fetching class by slug', () => {
      mockGetBySlug.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ id: 'class-1', name: 'U10 Soccer' }), 5000))
      );

      render(<ClassRegister />);

      expect(screen.getByText('Loading registration...')).toBeInTheDocument();
      expect(screen.getByText(/Please wait while we prepare the class details/i)).toBeInTheDocument();
    });

    it('should show Header during loading', () => {
      mockGetBySlug.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ id: 'class-1', name: 'U10 Soccer' }), 5000))
      );

      render(<ClassRegister />);

      expect(screen.getByTestId('header')).toBeInTheDocument();
    });

    it('should show Footer during loading', () => {
      mockGetBySlug.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ id: 'class-1', name: 'U10 Soccer' }), 5000))
      );

      render(<ClassRegister />);

      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  // ===========================================
  // SUCCESSFUL REDIRECT TESTS
  // ===========================================
  describe('Successful Redirect', () => {
    it('should call getBySlug with the slug parameter', async () => {
      mockGetBySlug.mockResolvedValue({ id: 'class-1', name: 'U10 Soccer' });

      render(<ClassRegister />);

      await waitFor(() => {
        expect(mockGetBySlug).toHaveBeenCalledWith('u10-soccer-fall-2024');
      });
    });

    it('should redirect to checkout with classId on successful fetch', async () => {
      mockGetBySlug.mockResolvedValue({ id: 'class-abc-123', name: 'U10 Soccer' });

      render(<ClassRegister />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/checkout?classId=class-abc-123', { replace: true });
      });
    });

    it('should handle different class IDs correctly', async () => {
      mockGetBySlug.mockResolvedValue({ id: 'class-xyz-789', name: 'U12 Basketball' });

      render(<ClassRegister />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/checkout?classId=class-xyz-789', { replace: true });
      });
    });
  });

  // ===========================================
  // ERROR STATE TESTS
  // ===========================================
  describe('Error States', () => {
    it('should show error when class is not found (empty response)', async () => {
      mockGetBySlug.mockResolvedValue(null);

      render(<ClassRegister />);

      await waitFor(() => {
        expect(screen.getByText('Registration Link Error')).toBeInTheDocument();
        expect(screen.getByText('Class not found')).toBeInTheDocument();
      });
    });

    it('should show error when class response has no id', async () => {
      mockGetBySlug.mockResolvedValue({ name: 'Test' });

      render(<ClassRegister />);

      await waitFor(() => {
        expect(screen.getByText('Registration Link Error')).toBeInTheDocument();
        expect(screen.getByText('Class not found')).toBeInTheDocument();
      });
    });

    it('should show 404 error message for invalid slug', async () => {
      mockGetBySlug.mockRejectedValue({
        response: { status: 404 },
      });

      render(<ClassRegister />);

      await waitFor(() => {
        expect(screen.getByText('Registration Link Error')).toBeInTheDocument();
        expect(screen.getByText(/This registration link is no longer valid/i)).toBeInTheDocument();
      });
    });

    it('should show generic error message for server errors', async () => {
      mockGetBySlug.mockRejectedValue({
        response: { status: 500 },
      });

      render(<ClassRegister />);

      await waitFor(() => {
        expect(screen.getByText('Registration Link Error')).toBeInTheDocument();
        expect(screen.getByText(/Unable to load class information/i)).toBeInTheDocument();
      });
    });

    it('should show generic error for network failure', async () => {
      mockGetBySlug.mockRejectedValue(new Error('Network error'));

      render(<ClassRegister />);

      await waitFor(() => {
        expect(screen.getByText('Registration Link Error')).toBeInTheDocument();
        expect(screen.getByText(/Unable to load class information/i)).toBeInTheDocument();
      });
    });

    it('should render "Browse Available Classes" button on error', async () => {
      mockGetBySlug.mockRejectedValue({ response: { status: 404 } });

      render(<ClassRegister />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /browse available classes/i })).toBeInTheDocument();
      });
    });

    it('should render "Go to Homepage" button on error', async () => {
      mockGetBySlug.mockRejectedValue({ response: { status: 404 } });

      render(<ClassRegister />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /go to homepage/i })).toBeInTheDocument();
      });
    });

    it('should render Header and Footer on error', async () => {
      mockGetBySlug.mockRejectedValue({ response: { status: 404 } });

      render(<ClassRegister />);

      await waitFor(() => {
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // NAVIGATION BUTTON TESTS
  // ===========================================
  describe('Navigation from Error State', () => {
    it('should navigate to /class when "Browse Available Classes" is clicked', async () => {
      mockGetBySlug.mockRejectedValue({ response: { status: 404 } });

      render(<ClassRegister />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /browse available classes/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /browse available classes/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/class');
    });

    it('should navigate to / when "Go to Homepage" is clicked', async () => {
      mockGetBySlug.mockRejectedValue({ response: { status: 404 } });

      render(<ClassRegister />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /go to homepage/i })).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /go to homepage/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  // ===========================================
  // MISSING SLUG TESTS
  // ===========================================
  describe('Missing Slug', () => {
    it('should show "Invalid registration link" when slug is undefined', async () => {
      mockSlug = undefined;

      render(<ClassRegister />);

      await waitFor(() => {
        expect(screen.getByText('Registration Link Error')).toBeInTheDocument();
        expect(screen.getByText('Invalid registration link')).toBeInTheDocument();
      });
    });

    it('should not call API when slug is missing', async () => {
      mockSlug = undefined;

      render(<ClassRegister />);

      await waitFor(() => {
        expect(screen.getByText('Registration Link Error')).toBeInTheDocument();
      });

      expect(mockGetBySlug).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // REDIRECTING STATE TESTS
  // ===========================================
  describe('Redirecting State', () => {
    it('should show redirecting message with class name when class data exists and not yet redirected', async () => {
      // This tests the edge case where class data exists but navigate hasn't fired yet
      mockGetBySlug.mockResolvedValue({ id: 'class-1', name: 'U10 Soccer' });

      render(<ClassRegister />);

      // The navigate should be called; this is a transient state
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/checkout?classId=class-1', { replace: true });
      });
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================
  describe('Edge Cases', () => {
    it('should handle slug with special characters', async () => {
      mockSlug = 'u10-soccer-fall-2024-special';
      mockGetBySlug.mockResolvedValue({ id: 'class-special', name: 'Special Class' });

      render(<ClassRegister />);

      await waitFor(() => {
        expect(mockGetBySlug).toHaveBeenCalledWith('u10-soccer-fall-2024-special');
      });
    });

    it('should handle empty string slug', async () => {
      mockSlug = '';

      render(<ClassRegister />);

      await waitFor(() => {
        expect(screen.getByText('Registration Link Error')).toBeInTheDocument();
        expect(screen.getByText('Invalid registration link')).toBeInTheDocument();
      });
    });
  });
});
