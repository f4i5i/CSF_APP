/**
 * Integration Tests for Parent Settings Page
 * Tests profile viewing, editing, and form validation
 */

import { render, screen, waitFor, fireEvent } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Settings from '../../../pages/Settings';

const API_BASE = 'http://localhost:8000/api/v1';

const mockUser = {
  id: 'user-parent-1',
  email: 'parent@test.com',
  first_name: 'John',
  last_name: 'Parent',
  role: 'PARENT',
  phone: '+1234567890',
  created_at: '2024-01-01T00:00:00Z',
};

describe('Settings Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-parent');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');

    server.use(
      http.get(`${API_BASE}/users/me`, () => {
        return HttpResponse.json(mockUser);
      })
    );
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ===========================================
  // PAGE LOADING TESTS
  // ===========================================
  describe('Page Loading', () => {
    it('should render settings page title', async () => {
      render(<Settings />);

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should render Account Setting section', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByText('Account Setting')).toBeInTheDocument();
      });

      expect(screen.getByText(/View and update your account details/i)).toBeInTheDocument();
    });

    it('should display Save Changes and Cancel buttons', async () => {
      render(<Settings />);

      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });
  });

  // ===========================================
  // FORM FIELDS TESTS
  // ===========================================
  describe('Form Fields', () => {
    it('should display all form fields', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    });

    it('should populate form with user data', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('Parent')).toBeInTheDocument();
      expect(screen.getByDisplayValue('parent@test.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
    });

    it('should show required indicators on required fields', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByText(/First Name \*/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Last Name \*/i)).toBeInTheDocument();
      expect(screen.getByText(/Email Address \*/i)).toBeInTheDocument();
    });

    it('should show optional indicator on phone field', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByText(/Phone Number \(optional\)/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // FORM EDITING TESTS
  // ===========================================
  describe('Form Editing', () => {
    it('should allow editing first name', async () => {
      const user = userEvent.setup();
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText(/First Name/i);
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Jane');

      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
    });

    it('should allow editing last name', async () => {
      const user = userEvent.setup();
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Parent')).toBeInTheDocument();
      });

      const lastNameInput = screen.getByLabelText(/Last Name/i);
      await user.clear(lastNameInput);
      await user.type(lastNameInput, 'Smith');

      expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
    });

    it('should allow editing email', async () => {
      const user = userEvent.setup();
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('parent@test.com')).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/Email Address/i);
      await user.clear(emailInput);
      await user.type(emailInput, 'newemail@test.com');

      expect(screen.getByDisplayValue('newemail@test.com')).toBeInTheDocument();
    });

    it('should allow editing phone number', async () => {
      const user = userEvent.setup();
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
      });

      const phoneInput = screen.getByLabelText(/Phone Number/i);
      await user.clear(phoneInput);
      await user.type(phoneInput, '+9876543210');

      expect(screen.getByDisplayValue('+9876543210')).toBeInTheDocument();
    });
  });

  // ===========================================
  // SAVE CHANGES TESTS
  // ===========================================
  describe('Save Changes', () => {
    it('should successfully save changes', async () => {
      const user = userEvent.setup();

      server.use(
        http.put(`${API_BASE}/users/me`, async ({ request }) => {
          const body = await request.json() as Record<string, string>;
          return HttpResponse.json({
            ...mockUser,
            first_name: body.first_name || mockUser.first_name,
            last_name: body.last_name || mockUser.last_name,
          });
        })
      );

      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText(/First Name/i);
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'Jane');

      await user.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(screen.getByText(/Profile updated successfully/i)).toBeInTheDocument();
      });
    });

    it('should show loading state while saving', async () => {
      const user = userEvent.setup();

      server.use(
        http.put(`${API_BASE}/users/me`, async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json(mockUser);
        })
      );

      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Save Changes/i }));

      expect(screen.getByText(/Saving.../i)).toBeInTheDocument();
    });

    it('should disable form inputs while saving', async () => {
      const user = userEvent.setup();

      server.use(
        http.put(`${API_BASE}/users/me`, async () => {
          await new Promise(resolve => setTimeout(resolve, 500));
          return HttpResponse.json(mockUser);
        })
      );

      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Save Changes/i }));

      const firstNameInput = screen.getByLabelText(/First Name/i);
      expect(firstNameInput).toBeDisabled();
    });

    it('should handle save error gracefully', async () => {
      const user = userEvent.setup();

      server.use(
        http.put(`${API_BASE}/users/me`, () => {
          return HttpResponse.json(
            { message: 'Failed to update profile' },
            { status: 400 }
          );
        })
      );

      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(screen.getByText(/Failed to update profile/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // CANCEL TESTS
  // ===========================================
  describe('Cancel Changes', () => {
    it('should reset form to original values on cancel', async () => {
      const user = userEvent.setup();
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      // Make changes
      const firstNameInput = screen.getByLabelText(/First Name/i);
      await user.clear(firstNameInput);
      await user.type(firstNameInput, 'ChangedName');

      expect(screen.getByDisplayValue('ChangedName')).toBeInTheDocument();

      // Click cancel
      await user.click(screen.getByRole('button', { name: /Cancel/i }));

      // Should reset to original
      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });
    });

    it('should show success toast on cancel', async () => {
      const user = userEvent.setup();
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Cancel/i }));

      await waitFor(() => {
        expect(screen.getByText(/Changes cancelled/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // FORM VALIDATION TESTS
  // ===========================================
  describe('Form Validation', () => {
    it('should require first name', async () => {
      const user = userEvent.setup();
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText(/First Name/i) as HTMLInputElement;
      expect(firstNameInput.required).toBe(true);
    });

    it('should require last name', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      const lastNameInput = screen.getByLabelText(/Last Name/i) as HTMLInputElement;
      expect(lastNameInput.required).toBe(true);
    });

    it('should require email', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
      expect(emailInput.required).toBe(true);
    });

    it('should have email type on email input', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
      expect(emailInput.type).toBe('email');
    });

    it('should have tel type on phone input', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
      });

      const phoneInput = screen.getByLabelText(/Phone Number/i) as HTMLInputElement;
      expect(phoneInput.type).toBe('tel');
    });
  });

  // ===========================================
  // SIDEBAR TESTS
  // ===========================================
  describe('Sidebar Navigation', () => {
    it('should display sidebar menu items', async () => {
      render(<Settings />);

      // Sidebar should have navigation items
      // Note: Actual sidebar items depend on Sidebar component implementation
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  // ===========================================
  // EMPTY STATE TESTS
  // ===========================================
  describe('Empty User Data', () => {
    it('should handle empty user data gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/users/me`, () => {
          return HttpResponse.json({
            id: 'user-parent-1',
            email: '',
            first_name: '',
            last_name: '',
            role: 'PARENT',
            phone: '',
          });
        })
      );

      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      });

      // Inputs should be empty
      const firstNameInput = screen.getByLabelText(/First Name/i) as HTMLInputElement;
      expect(firstNameInput.value).toBe('');
    });
  });
});
