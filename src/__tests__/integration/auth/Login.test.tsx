/**
 * Login Page Integration Tests
 * Tests for the login flow with mocked API
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, clearAuthState } from '../../utils/test-utils';
import Login from '../../../pages/Login';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null, pathname: '/login' }),
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock Google Sign In Button
jest.mock('../../../components/auth/GoogleSignInButton', () => ({
  __esModule: true,
  default: ({ onSuccess }: { onSuccess: (credential: string) => void }) => (
    <button
      data-testid="google-signin-button"
      onClick={() => onSuccess('mock-google-credential')}
    >
      Sign in with Google
    </button>
  ),
}));

describe('Login Page', () => {
  const user = userEvent;

  beforeEach(() => {
    clearAuthState();
    mockNavigate.mockClear();
  });

  describe('Rendering', () => {
    it('should render the login form', () => {
      render(<Login />);

      // Check for form elements
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    it('should render forgot password link', () => {
      render(<Login />);

      expect(screen.getByText('Forgot Password?')).toBeInTheDocument();
    });

    it('should render register link', () => {
      render(<Login />);

      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    it('should render Google sign-in button', () => {
      render(<Login />);

      expect(screen.getByTestId('google-signin-button')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should have required email field', () => {
      render(<Login />);

      const emailInput = screen.getByPlaceholderText('Enter your email');
      expect(emailInput).toBeRequired();
    });

    it('should have required password field', () => {
      render(<Login />);

      const passwordInput = screen.getByPlaceholderText('Enter your password');
      expect(passwordInput).toBeRequired();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility when eye icon is clicked', async () => {
      render(<Login />);

      const passwordInput = screen.getByPlaceholderText('Enter your password');
      const toggleButton = screen.getByRole('button', { name: '' }); // Eye button has no text

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click again to hide password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Login Flow', () => {
    it('should successfully login as parent', async () => {
      render(<Login />);

      // Fill in the form
      await user.type(screen.getByPlaceholderText('Enter your email'), 'parent@test.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');

      // Submit the form
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Wait for navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });

      // Verify token was stored
      expect(localStorage.getItem('csf_access_token')).toBeTruthy();
    });

    it('should successfully login as admin and redirect to admin dashboard', async () => {
      render(<Login />);

      // Fill in the form with admin credentials
      await user.type(screen.getByPlaceholderText('Enter your email'), 'admin@test.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');

      // Submit the form
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Wait for navigation to admin dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
      });
    });

    it('should successfully login as coach and redirect to coach dashboard', async () => {
      render(<Login />);

      // Fill in the form with coach credentials
      await user.type(screen.getByPlaceholderText('Enter your email'), 'coach@test.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');

      // Submit the form
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Wait for navigation to coach dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/coachdashboard', { replace: true });
      });
    });

    it('should show loading state while logging in', async () => {
      render(<Login />);

      // Fill in the form
      await user.type(screen.getByPlaceholderText('Enter your email'), 'parent@test.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'password123');

      // Submit the form
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Button should be disabled during loading
      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();
    });

    it('should handle login error', async () => {
      // Override the login handler to return an error
      server.use(
        http.post('http://localhost:8000/api/v1/auth/login', () => {
          return HttpResponse.json(
            { message: 'Invalid credentials' },
            { status: 401 }
          );
        })
      );

      render(<Login />);

      // Fill in the form with invalid credentials
      await user.type(screen.getByPlaceholderText('Enter your email'), 'wrong@test.com');
      await user.type(screen.getByPlaceholderText('Enter your password'), 'wrongpassword');

      // Submit the form
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Wait for error handling
      await waitFor(() => {
        // Button should be re-enabled after error
        expect(screen.getByRole('button', { name: /login/i })).not.toBeDisabled();
      });

      // Should not navigate
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Google Sign-In', () => {
    it('should handle Google sign-in success', async () => {
      render(<Login />);

      // Click Google sign-in button
      await user.click(screen.getByTestId('google-signin-button'));

      // Wait for navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe('Remember Me', () => {
    it('should have remember me checkbox', () => {
      render(<Login />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('should toggle remember me checkbox', async () => {
      render(<Login />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });
});
