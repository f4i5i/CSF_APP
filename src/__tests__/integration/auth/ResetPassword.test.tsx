/**
 * ResetPassword Page Integration Tests
 * Tests for the reset password flow including token validation,
 * form validation, success/error states, and auto-redirect countdown
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter } from '../../utils/test-utils';
import ResetPassword from '../../../pages/ResetPassword';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock useNavigate and useSearchParams
const mockNavigate = jest.fn();
let mockSearchParams = new URLSearchParams('token=valid-reset-token');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
}));

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
    resetPassword: jest.fn(),
    isAuthenticated: () => false,
  },
}));

import authService from '../../../api/services/auth.service';

describe('ResetPassword Page', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockSearchParams = new URLSearchParams('token=valid-reset-token');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering with valid token', () => {
    it('should render the reset password form', () => {
      renderWithRouter(<ResetPassword />);

      expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
      expect(screen.getByText(/Enter your new password below/i)).toBeInTheDocument();
    });

    it('should render password and confirm password inputs', () => {
      renderWithRouter(<ResetPassword />);

      expect(screen.getByPlaceholderText('Enter new password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm new password')).toBeInTheDocument();
    });

    it('should render submit button with "Reset Password" text', () => {
      renderWithRouter(<ResetPassword />);

      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('should render password inputs as type password', () => {
      renderWithRouter(<ResetPassword />);

      expect(screen.getByPlaceholderText('Enter new password')).toHaveAttribute('type', 'password');
      expect(screen.getByPlaceholderText('Confirm new password')).toHaveAttribute('type', 'password');
    });

    it('should render back to login link', () => {
      renderWithRouter(<ResetPassword />);

      expect(screen.getByText('Back to Login')).toBeInTheDocument();
    });

    it('should set minLength=8 on password inputs', () => {
      renderWithRouter(<ResetPassword />);

      expect(screen.getByPlaceholderText('Enter new password')).toHaveAttribute('minLength', '8');
      expect(screen.getByPlaceholderText('Confirm new password')).toHaveAttribute('minLength', '8');
    });
  });

  // ===========================================
  // INVALID TOKEN TESTS
  // ===========================================
  describe('Invalid/Missing Token', () => {
    it('should show invalid link message when no token is provided', () => {
      mockSearchParams = new URLSearchParams('');

      renderWithRouter(<ResetPassword />);

      expect(screen.getByText('Invalid Reset Link')).toBeInTheDocument();
      expect(screen.getByText(/This password reset link is invalid or has expired/i)).toBeInTheDocument();
    });

    it('should show "Request New Reset Link" button when token is missing', () => {
      mockSearchParams = new URLSearchParams('');

      renderWithRouter(<ResetPassword />);

      expect(screen.getByText('Request New Reset Link')).toBeInTheDocument();
    });

    it('should not render the form when token is missing', () => {
      mockSearchParams = new URLSearchParams('');

      renderWithRouter(<ResetPassword />);

      expect(screen.queryByPlaceholderText('Enter new password')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // WELCOME MODE TESTS
  // ===========================================
  describe('Welcome Mode', () => {
    it('should show welcome text when welcome=true in URL', () => {
      mockSearchParams = new URLSearchParams('token=valid-token&welcome=true');

      renderWithRouter(<ResetPassword />);

      expect(screen.getByText('Welcome! Set Your Password')).toBeInTheDocument();
      expect(screen.getByText(/Create a password to get started/i)).toBeInTheDocument();
    });

    it('should show "Set Password" button text in welcome mode', () => {
      mockSearchParams = new URLSearchParams('token=valid-token&welcome=true');

      renderWithRouter(<ResetPassword />);

      expect(screen.getByRole('button', { name: /set password/i })).toBeInTheDocument();
    });
  });

  // ===========================================
  // FORM VALIDATION TESTS
  // ===========================================
  describe('Form Validation', () => {
    it('should show error when password is empty', async () => {
      renderWithRouter(<ResetPassword />);

      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Please enter a new password');
      });
    });

    it('should show error when password is less than 8 characters', async () => {
      renderWithRouter(<ResetPassword />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'short');
      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Password must be at least 8 characters');
      });
    });

    it('should show error when passwords do not match', async () => {
      renderWithRouter(<ResetPassword />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'differentpass');

      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Passwords do not match');
      });
    });

    it('should not call API on validation failure', async () => {
      renderWithRouter(<ResetPassword />);

      await user.click(screen.getByRole('button', { name: /reset password/i }));

      expect(authService.resetPassword).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // SUBMISSION FLOW TESTS
  // ===========================================
  describe('Submission Flow', () => {
    it('should call resetPassword with token and passwords', async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValue({});

      renderWithRouter(<ResetPassword />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'newpassword123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'newpassword123');

      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(authService.resetPassword).toHaveBeenCalledWith(
          'valid-reset-token',
          'newpassword123',
          'newpassword123'
        );
      });
    });

    it('should show loading state while submitting', async () => {
      (authService.resetPassword as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      renderWithRouter(<ResetPassword />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'newpassword123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'newpassword123');

      await user.click(screen.getByRole('button', { name: /reset password/i }));

      expect(screen.getByRole('button', { name: /setting password/i })).toBeDisabled();
    });

    it('should show success state after successful reset', async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValue({});

      renderWithRouter(<ResetPassword />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'newpassword123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'newpassword123');

      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText('Password Reset Successful')).toBeInTheDocument();
      });
    });

    it('should show success toast on successful reset', async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValue({});

      renderWithRouter(<ResetPassword />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'newpassword123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'newpassword123');

      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Password reset successfully!');
      });
    });

    it('should show welcome success message in welcome mode', async () => {
      mockSearchParams = new URLSearchParams('token=valid-token&welcome=true');
      (authService.resetPassword as jest.Mock).mockResolvedValue({});

      renderWithRouter(<ResetPassword />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'newpassword123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'newpassword123');

      await user.click(screen.getByRole('button', { name: /set password/i }));

      await waitFor(() => {
        expect(screen.getByText('Account Setup Complete!')).toBeInTheDocument();
        expect(mockToastSuccess).toHaveBeenCalledWith('Password set successfully!');
      });
    });

    it('should display countdown timer in success state', async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValue({});

      renderWithRouter(<ResetPassword />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'newpassword123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'newpassword123');

      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText(/Redirecting in/i)).toBeInTheDocument();
      });
    });

    it('should display "Go to Login Now" button in success state', async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValue({});

      renderWithRouter(<ResetPassword />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'newpassword123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'newpassword123');

      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText('Go to Login Now')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should show error toast on API failure', async () => {
      (authService.resetPassword as jest.Mock).mockRejectedValue({
        response: { data: { detail: 'Token has expired' } },
      });

      renderWithRouter(<ResetPassword />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'newpassword123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'newpassword123');

      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Token has expired');
      });
    });

    it('should show generic error message when no detail in API response', async () => {
      (authService.resetPassword as jest.Mock).mockRejectedValue(new Error('Network error'));

      renderWithRouter(<ResetPassword />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'newpassword123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'newpassword123');

      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          'Failed to reset password. The link may have expired.'
        );
      });
    });

    it('should not show success state on API failure', async () => {
      (authService.resetPassword as jest.Mock).mockRejectedValue(new Error('Error'));

      renderWithRouter(<ResetPassword />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'newpassword123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'newpassword123');

      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
      });

      expect(screen.queryByText('Password Reset Successful')).not.toBeInTheDocument();
    });

    it('should re-enable submit button after failure', async () => {
      (authService.resetPassword as jest.Mock).mockRejectedValue(new Error('Error'));

      renderWithRouter(<ResetPassword />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'newpassword123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'newpassword123');

      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reset password/i })).not.toBeDisabled();
      });
    });
  });

  // ===========================================
  // AUTO-REDIRECT COUNTDOWN TESTS
  // ===========================================
  describe('Auto-Redirect Countdown', () => {
    it('should auto-redirect to login after countdown reaches 0', async () => {
      (authService.resetPassword as jest.Mock).mockResolvedValue({});

      renderWithRouter(<ResetPassword />);

      await user.type(screen.getByPlaceholderText('Enter new password'), 'newpassword123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'newpassword123');

      await user.click(screen.getByRole('button', { name: /reset password/i }));

      await waitFor(() => {
        expect(screen.getByText('Password Reset Successful')).toBeInTheDocument();
      });

      // Fast-forward through countdown
      jest.advanceTimersByTime(4000);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
      });
    });
  });
});
