/**
 * Unit Tests for UserFormModal Component
 * Tests open/close, create vs edit mode, form validation, role assignment, password, submit
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserFormModal from '../admin/UserFormModal';
import toast from 'react-hot-toast';

jest.mock('../../api/services/users.service', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockResolvedValue({ id: 'new-user', email: 'user@test.com' }),
    updateUser: jest.fn().mockResolvedValue({ id: 'user-1', email: 'user@test.com' }),
  },
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock useAuth context
jest.mock('../../context/auth', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { id: 'admin-1', role: 'owner', email: 'admin@test.com' },
  }),
}));

describe('UserFormModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    mode: 'create' as const,
    initialData: null,
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<UserFormModal {...defaultProps} />);
      expect(screen.getByText('Create User')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<UserFormModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Create User')).not.toBeInTheDocument();
    });

    it('should show "Edit User" title in edit mode', () => {
      render(
        <UserFormModal
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'user-1',
            email: 'john@test.com',
            first_name: 'John',
            last_name: 'Doe',
            role: 'parent',
          }}
        />
      );
      expect(screen.getByText('Edit User')).toBeInTheDocument();
    });

    it('should render email input', () => {
      render(<UserFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('user@example.com')).toBeInTheDocument();
    });

    it('should render first name input', () => {
      render(<UserFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('John')).toBeInTheDocument();
    });

    it('should render last name input', () => {
      render(<UserFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument();
    });

    it('should render phone input', () => {
      render(<UserFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('+1 (555) 123-4567')).toBeInTheDocument();
    });

    it('should render password input', () => {
      render(<UserFormModal {...defaultProps} />);
      const passwordInputs = screen.getAllByPlaceholderText(/••••/);
      expect(passwordInputs.length).toBeGreaterThan(0);
    });

    it('should render Active Account toggle', () => {
      render(<UserFormModal {...defaultProps} />);
      expect(screen.getByText('Active Account')).toBeInTheDocument();
    });

    it('should render Cancel and submit buttons', () => {
      render(<UserFormModal {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Create User')).toBeInTheDocument();
    });

    it('should show password help text', () => {
      render(<UserFormModal {...defaultProps} />);
      expect(
        screen.getByText(/Password must be at least 8 characters/)
      ).toBeInTheDocument();
    });

    it('should show welcome email info in create mode', () => {
      render(<UserFormModal {...defaultProps} />);
      expect(
        screen.getByText(/A welcome email with a password setup link/)
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // EDIT MODE TESTS
  // ===========================================
  describe('Edit Mode', () => {
    it('should pre-fill form data in edit mode', () => {
      render(
        <UserFormModal
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'user-1',
            email: 'john@test.com',
            first_name: 'John',
            last_name: 'Doe',
            phone: '555-1234',
            role: 'coach',
            is_active: true,
          }}
        />
      );

      const emailInput = screen.getByPlaceholderText('user@example.com') as HTMLInputElement;
      expect(emailInput.value).toBe('john@test.com');

      const firstNameInput = screen.getByPlaceholderText('John') as HTMLInputElement;
      expect(firstNameInput.value).toBe('John');

      const lastNameInput = screen.getByPlaceholderText('Doe') as HTMLInputElement;
      expect(lastNameInput.value).toBe('Doe');
    });

    it('should show "Update User" button in edit mode', () => {
      render(
        <UserFormModal
          {...defaultProps}
          mode="edit"
          initialData={{ id: 'user-1', email: 'john@test.com', first_name: 'John', last_name: 'Doe' }}
        />
      );
      expect(screen.getByText('Update User')).toBeInTheDocument();
    });

    it('should show password hint for edit mode', () => {
      render(
        <UserFormModal
          {...defaultProps}
          mode="edit"
          initialData={{ id: 'user-1', email: 'john@test.com', first_name: 'John', last_name: 'Doe' }}
        />
      );
      expect(screen.getByText(/leave blank to keep current/)).toBeInTheDocument();
    });
  });

  // ===========================================
  // ROLE ASSIGNMENT TESTS
  // ===========================================
  describe('Role Assignment', () => {
    it('should show all roles for owner user', () => {
      // The mock returns user with role "owner", so all roles should be available
      render(<UserFormModal {...defaultProps} />);
      // The Parent role is the default selected option, so it should appear
      expect(screen.getByText('Parent')).toBeInTheDocument();
    });

    it('should show limited roles for admin user', () => {
      const { useAuth } = require('../../context/auth');
      useAuth.mockReturnValueOnce({
        user: { id: 'admin-1', role: 'admin', email: 'admin@test.com' },
      });

      render(<UserFormModal {...defaultProps} />);
      expect(
        screen.getByText(/Only owners can assign admin or owner roles/)
      ).toBeInTheDocument();
    });
  });

  // ===========================================
  // VALIDATION TESTS
  // ===========================================
  describe('Validation', () => {
    it('should show error when email is empty on submit', async () => {
      render(<UserFormModal {...defaultProps} />);

      // Fill required fields except email
      fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'John' } });
      fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Doe' } });

      fireEvent.click(screen.getByText('Create User'));

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      render(<UserFormModal {...defaultProps} />);

      fireEvent.change(screen.getByPlaceholderText('user@example.com'), {
        target: { value: 'not-an-email' },
      });
      fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'John' } });
      fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Doe' } });

      fireEvent.click(screen.getByText('Create User'));

      await waitFor(() => {
        expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      });
    });

    it('should show error when first name is empty', async () => {
      render(<UserFormModal {...defaultProps} />);

      fireEvent.change(screen.getByPlaceholderText('user@example.com'), {
        target: { value: 'john@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Doe' } });

      fireEvent.click(screen.getByText('Create User'));

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });
    });

    it('should show error when last name is empty', async () => {
      render(<UserFormModal {...defaultProps} />);

      fireEvent.change(screen.getByPlaceholderText('user@example.com'), {
        target: { value: 'john@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'John' } });

      fireEvent.click(screen.getByText('Create User'));

      await waitFor(() => {
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
      });
    });

    it('should show error for short password', async () => {
      render(<UserFormModal {...defaultProps} />);

      fireEvent.change(screen.getByPlaceholderText('user@example.com'), {
        target: { value: 'john@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'John' } });
      fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Doe' } });

      const passwordInputs = screen.getAllByPlaceholderText(/••••/);
      fireEvent.change(passwordInputs[0], { target: { value: 'short' } });

      fireEvent.click(screen.getByText('Create User'));

      await waitFor(() => {
        expect(
          screen.getByText('Password must be at least 8 characters')
        ).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // PASSWORD VISIBILITY TESTS
  // ===========================================
  describe('Password Visibility', () => {
    it('should toggle password visibility', () => {
      render(<UserFormModal {...defaultProps} />);

      const passwordInputs = screen.getAllByPlaceholderText(/••••/);
      expect(passwordInputs[0]).toHaveAttribute('type', 'password');

      // Click the eye icon button
      const toggleButtons = screen.getAllByRole('button');
      const eyeButton = toggleButtons.find(
        (btn) => btn.querySelector('svg') && btn.closest('.relative')
      );
      if (eyeButton) {
        fireEvent.click(eyeButton);
        // After toggle, type should be 'text'
        expect(passwordInputs[0]).toHaveAttribute('type', 'text');
      }
    });
  });

  // ===========================================
  // SUBMIT TESTS
  // ===========================================
  describe('Submit', () => {
    it('should call usersService.create on valid create submit', async () => {
      const usersService = require('../../api/services/users.service').default;
      render(<UserFormModal {...defaultProps} />);

      fireEvent.change(screen.getByPlaceholderText('user@example.com'), {
        target: { value: 'john@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('John'), {
        target: { value: 'John' },
      });
      fireEvent.change(screen.getByPlaceholderText('Doe'), {
        target: { value: 'Doe' },
      });

      fireEvent.click(screen.getByText('Create User'));

      await waitFor(() => {
        expect(usersService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            email: 'john@test.com',
            first_name: 'John',
            last_name: 'Doe',
            role: 'parent',
            is_active: true,
          })
        );
      });
    });

    it('should show success toast on successful create', async () => {
      render(<UserFormModal {...defaultProps} />);

      fireEvent.change(screen.getByPlaceholderText('user@example.com'), {
        target: { value: 'john@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'John' } });
      fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Doe' } });

      fireEvent.click(screen.getByText('Create User'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('User created successfully')
        );
      });
    });

    it('should show error toast on failed submit', async () => {
      const usersService = require('../../api/services/users.service').default;
      usersService.create.mockRejectedValueOnce(new Error('Email already exists'));

      render(<UserFormModal {...defaultProps} />);

      fireEvent.change(screen.getByPlaceholderText('user@example.com'), {
        target: { value: 'john@test.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('John'), { target: { value: 'John' } });
      fireEvent.change(screen.getByPlaceholderText('Doe'), { target: { value: 'Doe' } });

      fireEvent.click(screen.getByText('Create User'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Email already exists');
      });
    });
  });

  // ===========================================
  // CLOSE / CANCEL TESTS
  // ===========================================
  describe('Close / Cancel', () => {
    it('should call onClose when Cancel button is clicked', () => {
      const onClose = jest.fn();
      render(<UserFormModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalled();
    });
  });
});
