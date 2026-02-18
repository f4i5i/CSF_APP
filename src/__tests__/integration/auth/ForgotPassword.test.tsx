/**
 * ForgotPassword Page Integration Tests
 * Tests for the forgot password flow including form validation, submission, and success state
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../utils/test-utils';
import ForgotPassword from '../../../pages/ForgotPassword';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock('react-hot-toast', () => ({
  success: (...args: unknown[]) => mockToastSuccess(...args),
  error: (...args: unknown[]) => mockToastError(...args),
}));

// Mock LogoLogin component
jest.mock('../../../components/LogoLogin', () => ({
  __esModule: true,
  default: () => <div data-testid="logo-login">Logo</div>,
}));

// Mock auth service
jest.mock('../../../api/services/auth.service', () => ({
  __esModule: true,
  default: {
    forgotPassword: jest.fn(),
    isAuthenticated: () => false,
  },
}));

import authService from '../../../api/services/auth.service';

describe('ForgotPassword Page', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the forgot password form', () => {
      render(<ForgotPassword />);

      expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
      expect(screen.getByText(/Enter your email and we'll send you instructions/i)).toBeInTheDocument();
    });

    it('should render email input field', () => {
      render(<ForgotPassword />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toBeRequired();
    });

    it('should render submit button', () => {
      render(<ForgotPassword />);

      expect(screen.getByRole('button', { name: /send reset instructions/i })).toBeInTheDocument();
    });

    it('should render back to login link', () => {
      render(<ForgotPassword />);

      expect(screen.getByText(/Remember your password/i)).toBeInTheDocument();
      expect(screen.getByText('Back to Login')).toBeInTheDocument();
    });

    it('should render the logo', () => {
      render(<ForgotPassword />);

      expect(screen.getByTestId('logo-login')).toBeInTheDocument();
    });

    it('should render required email asterisk', () => {
      render(<ForgotPassword />);

      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  // ===========================================
  // FORM VALIDATION TESTS
  // ===========================================
  describe('Form Validation', () => {
    it('should show error toast when email is empty', async () => {
      render(<ForgotPassword />);

      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Please enter your email address');
      });
    });

    it('should show error toast for invalid email format', async () => {
      render(<ForgotPassword />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'invalidemail');

      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Please enter a valid email address');
      });
    });

    it('should not call API when email is empty', async () => {
      render(<ForgotPassword />);

      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      expect(authService.forgotPassword).not.toHaveBeenCalled();
    });

    it('should not call API when email is invalid', async () => {
      render(<ForgotPassword />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'notanemail');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      expect(authService.forgotPassword).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // SUBMISSION FLOW TESTS
  // ===========================================
  describe('Submission Flow', () => {
    it('should call forgotPassword service with valid email', async () => {
      (authService.forgotPassword as jest.Mock).mockResolvedValue({});

      render(<ForgotPassword />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(authService.forgotPassword).toHaveBeenCalledWith('test@test.com');
      });
    });

    it('should show loading state while submitting', async () => {
      (authService.forgotPassword as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 500))
      );

      render(<ForgotPassword />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled();
    });

    it('should show success state after successful submission', async () => {
      (authService.forgotPassword as jest.Mock).mockResolvedValue({});

      render(<ForgotPassword />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(screen.getByText('Check Your Email')).toBeInTheDocument();
      });

      expect(screen.getByText(/test@test.com/)).toBeInTheDocument();
      expect(screen.getByText(/check your spam folder/i)).toBeInTheDocument();
    });

    it('should show success toast after successful submission', async () => {
      (authService.forgotPassword as jest.Mock).mockResolvedValue({});

      render(<ForgotPassword />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Password reset instructions sent to your email');
      });
    });

    it('should show "Back to Login" link in success state', async () => {
      (authService.forgotPassword as jest.Mock).mockResolvedValue({});

      render(<ForgotPassword />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(screen.getByText('Back to Login')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should show error toast on API failure', async () => {
      (authService.forgotPassword as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<ForgotPassword />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to send reset email. Please try again.');
      });
    });

    it('should not navigate to success state on API failure', async () => {
      (authService.forgotPassword as jest.Mock).mockRejectedValue(new Error('Server error'));

      render(<ForgotPassword />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        // Should still be on the form, not the success state
        expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
      });

      expect(screen.queryByText('Check Your Email')).not.toBeInTheDocument();
    });

    it('should re-enable submit button after API failure', async () => {
      (authService.forgotPassword as jest.Mock).mockRejectedValue(new Error('Error'));

      render(<ForgotPassword />);

      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /send reset instructions/i })).not.toBeDisabled();
      });
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================
  describe('Edge Cases', () => {
    it('should trim whitespace from email before validation', async () => {
      (authService.forgotPassword as jest.Mock).mockResolvedValue({});

      render(<ForgotPassword />);

      await user.type(screen.getByPlaceholderText('Enter your email'), '  test@test.com  ');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      // Should not show empty email error since email is not blank after trimming
      expect(mockToastError).not.toHaveBeenCalledWith('Please enter your email address');
    });

    it('should handle whitespace-only email', async () => {
      render(<ForgotPassword />);

      await user.type(screen.getByPlaceholderText('Enter your email'), '   ');
      await user.click(screen.getByRole('button', { name: /send reset instructions/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });
    });
  });
});
