/**
 * ForcePasswordChange Page Integration Tests
 * Tests for the forced password change flow with validation,
 * API submission, and role-based redirects
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../utils/test-utils';
import ForcePasswordChange from '../../../pages/ForcePasswordChange';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
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

// Mock apiClient
jest.mock('../../../api/client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    defaults: { headers: { common: {} } },
  },
}));

// Mock usersService
jest.mock('../../../api/services/users.service', () => ({
  __esModule: true,
  default: {
    getMe: jest.fn(),
  },
}));

import apiClient from '../../../api/client';
import usersService from '../../../api/services/users.service';

describe('ForcePasswordChange Page', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    jest.clearAllMocks();
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
    it('should render the force password change form', () => {
      render(<ForcePasswordChange />);

      expect(screen.getByText('Set Your Password')).toBeInTheDocument();
      expect(screen.getByText(/Welcome! Please create a new password/i)).toBeInTheDocument();
    });

    it('should render all required form fields', () => {
      render(<ForcePasswordChange />);

      expect(screen.getByPlaceholderText('Enter current password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter new password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm new password')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<ForcePasswordChange />);

      expect(screen.getByRole('button', { name: /set password & continue/i })).toBeInTheDocument();
    });

    it('should render password requirements hint', () => {
      render(<ForcePasswordChange />);

      expect(screen.getByText(/At least 8 characters with uppercase, lowercase, and a number/i)).toBeInTheDocument();
    });

    it('should render the logo', () => {
      render(<ForcePasswordChange />);

      expect(screen.getByTestId('logo-login')).toBeInTheDocument();
    });

    it('should render labels for all fields', () => {
      render(<ForcePasswordChange />);

      expect(screen.getByText(/Current\/Temporary Password/)).toBeInTheDocument();
      expect(screen.getByText(/New Password/)).toBeInTheDocument();
      expect(screen.getByText(/Confirm New Password/)).toBeInTheDocument();
    });

    it('should render required indicators on all fields', () => {
      render(<ForcePasswordChange />);

      const requiredMarkers = screen.getAllByText('*');
      expect(requiredMarkers.length).toBe(3);
    });
  });

  // ===========================================
  // FORM VALIDATION TESTS
  // ===========================================
  describe('Form Validation', () => {
    it('should show error when new password is empty', async () => {
      render(<ForcePasswordChange />);

      await user.type(screen.getByPlaceholderText('Enter current password'), 'oldpassword');
      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Please enter a new password');
      });
    });

    it('should show error when new password is less than 8 characters', async () => {
      render(<ForcePasswordChange />);

      await user.type(screen.getByPlaceholderText('Enter current password'), 'oldpassword');
      await user.type(screen.getByPlaceholderText('Enter new password'), 'Short1');
      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Password must be at least 8 characters');
      });
    });

    it('should show error when password has no uppercase letter', async () => {
      render(<ForcePasswordChange />);

      await user.type(screen.getByPlaceholderText('Enter current password'), 'oldpassword');
      await user.type(screen.getByPlaceholderText('Enter new password'), 'lowercase1');
      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Password must contain at least one uppercase letter');
      });
    });

    it('should show error when password has no lowercase letter', async () => {
      render(<ForcePasswordChange />);

      await user.type(screen.getByPlaceholderText('Enter current password'), 'oldpassword');
      await user.type(screen.getByPlaceholderText('Enter new password'), 'UPPERCASE1');
      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Password must contain at least one lowercase letter');
      });
    });

    it('should show error when password has no number', async () => {
      render(<ForcePasswordChange />);

      await user.type(screen.getByPlaceholderText('Enter current password'), 'oldpassword');
      await user.type(screen.getByPlaceholderText('Enter new password'), 'NoNumbers');
      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Password must contain at least one number');
      });
    });

    it('should show error when passwords do not match', async () => {
      render(<ForcePasswordChange />);

      await user.type(screen.getByPlaceholderText('Enter current password'), 'oldpassword');
      await user.type(screen.getByPlaceholderText('Enter new password'), 'ValidPass1');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'DifferentPass1');
      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Passwords do not match');
      });
    });

    it('should not call API on validation failure', async () => {
      render(<ForcePasswordChange />);

      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });

  // ===========================================
  // PASSWORD VISIBILITY TOGGLE
  // ===========================================
  describe('Password Visibility Toggle', () => {
    it('should toggle new password visibility', async () => {
      render(<ForcePasswordChange />);

      const newPasswordInput = screen.getByPlaceholderText('Enter new password');
      expect(newPasswordInput).toHaveAttribute('type', 'password');

      // Click the eye toggle button
      const toggleButton = screen.getByRole('button', { name: '' });
      await user.click(toggleButton);

      expect(newPasswordInput).toHaveAttribute('type', 'text');

      // Toggle back
      await user.click(toggleButton);
      expect(newPasswordInput).toHaveAttribute('type', 'password');
    });
  });

  // ===========================================
  // SUBMISSION FLOW TESTS
  // ===========================================
  describe('Submission Flow', () => {
    it('should call API with correct data on valid submission', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: {} });
      (usersService.getMe as jest.Mock).mockResolvedValue({
        id: 'user-parent-1',
        email: 'parent@test.com',
        role: 'PARENT',
        must_change_password: false,
      });

      render(<ForcePasswordChange />);

      await user.type(screen.getByPlaceholderText('Enter current password'), 'TempPass123');
      await user.type(screen.getByPlaceholderText('Enter new password'), 'NewPass123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'NewPass123');

      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith(
          '/auth/change-password',
          {
            current_password: 'TempPass123',
            new_password: 'NewPass123',
            confirm_password: 'NewPass123',
          }
        );
      });
    });

    it('should show loading state while submitting', async () => {
      (apiClient.post as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(<ForcePasswordChange />);

      await user.type(screen.getByPlaceholderText('Enter current password'), 'TempPass123');
      await user.type(screen.getByPlaceholderText('Enter new password'), 'NewPass123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'NewPass123');

      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      expect(screen.getByRole('button', { name: /setting password/i })).toBeDisabled();
    });

    it('should show success toast after successful password change', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: {} });
      (usersService.getMe as jest.Mock).mockResolvedValue({
        id: 'user-parent-1',
        role: 'PARENT',
      });

      render(<ForcePasswordChange />);

      await user.type(screen.getByPlaceholderText('Enter current password'), 'TempPass123');
      await user.type(screen.getByPlaceholderText('Enter new password'), 'NewPass123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'NewPass123');

      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Password set successfully!');
      });
    });

    it('should redirect parent to /dashboard after success', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: {} });
      (usersService.getMe as jest.Mock).mockResolvedValue({
        id: 'user-parent-1',
        role: 'PARENT',
      });

      render(<ForcePasswordChange />);

      await user.type(screen.getByPlaceholderText('Enter current password'), 'TempPass123');
      await user.type(screen.getByPlaceholderText('Enter new password'), 'NewPass123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'NewPass123');

      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should redirect admin to /admin after success', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: {} });
      (usersService.getMe as jest.Mock).mockResolvedValue({
        id: 'user-admin-1',
        role: 'ADMIN',
      });

      render(<ForcePasswordChange />);

      await user.type(screen.getByPlaceholderText('Enter current password'), 'TempPass123');
      await user.type(screen.getByPlaceholderText('Enter new password'), 'NewPass123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'NewPass123');

      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
      });
    });

    it('should redirect coach to /coachdashboard after success', async () => {
      (apiClient.post as jest.Mock).mockResolvedValue({ data: {} });
      (usersService.getMe as jest.Mock).mockResolvedValue({
        id: 'user-coach-1',
        role: 'COACH',
      });

      render(<ForcePasswordChange />);

      await user.type(screen.getByPlaceholderText('Enter current password'), 'TempPass123');
      await user.type(screen.getByPlaceholderText('Enter new password'), 'NewPass123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'NewPass123');

      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/coachdashboard', { replace: true });
      });
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should show error toast on API failure with message', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue({
        message: 'Current password is incorrect',
      });

      render(<ForcePasswordChange />);

      await user.type(screen.getByPlaceholderText('Enter current password'), 'WrongPass123');
      await user.type(screen.getByPlaceholderText('Enter new password'), 'NewPass123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'NewPass123');

      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Current password is incorrect');
      });
    });

    it('should show generic error message on unknown API error', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue({});

      render(<ForcePasswordChange />);

      await user.type(screen.getByPlaceholderText('Enter current password'), 'TempPass123');
      await user.type(screen.getByPlaceholderText('Enter new password'), 'NewPass123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'NewPass123');

      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to change password. Please try again.');
      });
    });

    it('should re-enable submit button after failure', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue(new Error('Error'));

      render(<ForcePasswordChange />);

      await user.type(screen.getByPlaceholderText('Enter current password'), 'TempPass123');
      await user.type(screen.getByPlaceholderText('Enter new password'), 'NewPass123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'NewPass123');

      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /set password & continue/i })).not.toBeDisabled();
      });
    });

    it('should handle API error with response.data.detail', async () => {
      (apiClient.post as jest.Mock).mockRejectedValue({
        response: { data: { detail: 'Token expired' } },
      });

      render(<ForcePasswordChange />);

      await user.type(screen.getByPlaceholderText('Enter current password'), 'TempPass123');
      await user.type(screen.getByPlaceholderText('Enter new password'), 'NewPass123');
      await user.type(screen.getByPlaceholderText('Confirm new password'), 'NewPass123');

      await user.click(screen.getByRole('button', { name: /set password & continue/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });
    });
  });
});
