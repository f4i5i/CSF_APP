/**
 * Register Page Integration Tests
 * Tests for the registration flow including form validation, submission, and role-based redirects
 */

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, clearAuthState } from '../../utils/test-utils';
import Register from '../../../pages/Register';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock useNavigate and useLocation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null, pathname: '/register' }),
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

describe('Register Page', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    clearAuthState();
    mockNavigate.mockClear();
    mockToastSuccess.mockClear();
    mockToastError.mockClear();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render the registration form with all fields', () => {
      render(<Register />);

      expect(screen.getByText('Create Account')).toBeInTheDocument();
      expect(screen.getByText(/Create your account to get started/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your first name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your last name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your phone number')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Create a password (min 8 characters)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm your password')).toBeInTheDocument();
    });

    it('should render the register button', () => {
      render(<Register />);

      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('should render login link', () => {
      render(<Register />);

      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.getByText(/Already have an account/i)).toBeInTheDocument();
    });

    it('should render required field indicators', () => {
      render(<Register />);

      // Required fields have asterisk markers
      const requiredLabels = screen.getAllByText('*');
      // first_name, last_name, email, password, confirm_password = 5 required markers
      expect(requiredLabels.length).toBeGreaterThanOrEqual(5);
    });

    it('should render phone field as optional', () => {
      render(<Register />);

      expect(screen.getByText(/Phone \(optional\)/i)).toBeInTheDocument();
    });
  });

  // ===========================================
  // FORM VALIDATION TESTS
  // ===========================================
  describe('Form Validation', () => {
    it('should show error when first name is empty', async () => {
      render(<Register />);

      // Fill all fields except first_name
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');
      await user.type(screen.getByPlaceholderText('Create a password (min 8 characters)'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });
    });

    it('should show error when last name is empty', async () => {
      render(<Register />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');
      await user.type(screen.getByPlaceholderText('Create a password (min 8 characters)'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
      });
    });

    it('should show error when email is empty', async () => {
      render(<Register />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe');
      await user.type(screen.getByPlaceholderText('Create a password (min 8 characters)'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      render(<Register />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'invalidemail');
      await user.type(screen.getByPlaceholderText('Create a password (min 8 characters)'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByText('Email is invalid')).toBeInTheDocument();
      });
    });

    it('should show error when password is empty', async () => {
      render(<Register />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');

      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should show error when password is less than 8 characters', async () => {
      render(<Register />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');
      await user.type(screen.getByPlaceholderText('Create a password (min 8 characters)'), 'short');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'short');

      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
      });
    });

    it('should show error when confirm password is empty', async () => {
      render(<Register />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');
      await user.type(screen.getByPlaceholderText('Create a password (min 8 characters)'), 'password123');

      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
      });
    });

    it('should show error when passwords do not match', async () => {
      render(<Register />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');
      await user.type(screen.getByPlaceholderText('Create a password (min 8 characters)'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'differentpassword');

      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should show error for invalid phone number format', async () => {
      render(<Register />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'test@test.com');
      await user.type(screen.getByPlaceholderText('Enter your phone number'), 'abc-not-a-phone');
      await user.type(screen.getByPlaceholderText('Create a password (min 8 characters)'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid phone number format')).toBeInTheDocument();
      });
    });

    it('should show toast error on validation failure', async () => {
      render(<Register />);

      // Submit empty form
      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Please fix the errors in the form');
      });
    });

    it('should clear field error when user types in that field', async () => {
      render(<Register />);

      // Submit empty form to trigger errors
      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });

      // Start typing in first name field
      await user.type(screen.getByPlaceholderText('Enter your first name'), 'J');

      await waitFor(() => {
        expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // PASSWORD VISIBILITY TOGGLE TESTS
  // ===========================================
  describe('Password Visibility Toggle', () => {
    it('should toggle password visibility', async () => {
      render(<Register />);

      const passwordInput = screen.getByPlaceholderText('Create a password (min 8 characters)');
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Find and click the eye button for password field
      const toggleButtons = screen.getAllByRole('button', { name: '' });
      await user.click(toggleButtons[0]);

      expect(passwordInput).toHaveAttribute('type', 'text');
    });

    it('should toggle confirm password visibility', async () => {
      render(<Register />);

      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your password');
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');

      // The second eye toggle button is for confirm password
      const toggleButtons = screen.getAllByRole('button', { name: '' });
      await user.click(toggleButtons[1]);

      expect(confirmPasswordInput).toHaveAttribute('type', 'text');
    });
  });

  // ===========================================
  // REGISTRATION FLOW TESTS
  // ===========================================
  describe('Registration Flow', () => {
    it('should successfully register a new user', async () => {
      render(<Register />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'parent@test.com');
      await user.type(screen.getByPlaceholderText('Create a password (min 8 characters)'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should show loading state during registration', async () => {
      render(<Register />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'parent@test.com');
      await user.type(screen.getByPlaceholderText('Create a password (min 8 characters)'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      await user.click(screen.getByRole('button', { name: /register/i }));

      // Check for loading state
      expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
    });

    it('should handle registration error from API', async () => {
      server.use(
        http.post(`${API_BASE}/auth/register`, () => {
          return HttpResponse.json(
            { detail: 'Email already registered' },
            { status: 400 }
          );
        })
      );

      render(<Register />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'existing@test.com');
      await user.type(screen.getByPlaceholderText('Create a password (min 8 characters)'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        // Should re-enable the button after error
        expect(screen.getByRole('button', { name: /register/i })).not.toBeDisabled();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should allow optional phone number during registration', async () => {
      render(<Register />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'John');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'Doe');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'parent@test.com');
      await user.type(screen.getByPlaceholderText('Enter your phone number'), '+1234567890');
      await user.type(screen.getByPlaceholderText('Create a password (min 8 characters)'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  // ===========================================
  // ROLE-BASED REDIRECT TESTS
  // ===========================================
  describe('Role-Based Redirects', () => {
    it('should redirect admin users to /admin after registration', async () => {
      server.use(
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'user-admin-1',
            email: 'admin@test.com',
            first_name: 'Admin',
            last_name: 'User',
            role: 'ADMIN',
          });
        })
      );

      render(<Register />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'Admin');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'User');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'admin@test.com');
      await user.type(screen.getByPlaceholderText('Create a password (min 8 characters)'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
      });
    });

    it('should redirect coach users to /coachdashboard after registration', async () => {
      server.use(
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'user-coach-1',
            email: 'coach@test.com',
            first_name: 'Coach',
            last_name: 'User',
            role: 'COACH',
          });
        })
      );

      render(<Register />);

      await user.type(screen.getByPlaceholderText('Enter your first name'), 'Coach');
      await user.type(screen.getByPlaceholderText('Enter your last name'), 'User');
      await user.type(screen.getByPlaceholderText('Enter your email'), 'coach@test.com');
      await user.type(screen.getByPlaceholderText('Create a password (min 8 characters)'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm your password'), 'password123');

      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/coachdashboard', { replace: true });
      });
    });
  });

  // ===========================================
  // AUTHENTICATED USER REDIRECT
  // ===========================================
  describe('Authenticated User Redirect', () => {
    it('should redirect logged-in parent users to /dashboard', async () => {
      // Simulate already authenticated user
      localStorage.setItem('csf_access_token', 'mock-access-token-parent');
      localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');

      render(<Register />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });
  });
});
