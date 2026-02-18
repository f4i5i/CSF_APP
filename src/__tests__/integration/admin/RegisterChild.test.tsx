/**
 * Integration Tests for Register Child Page
 * Tests form validation, submission, profile image upload, and waiver check
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RegisterChild from '../../../pages/AdminDashboard/RegisterChild';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock toast to avoid rendering issues
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
    info: jest.fn(),
    loading: jest.fn(),
    dismiss: jest.fn(),
  },
  success: (...args: unknown[]) => mockToastSuccess(...args),
  error: (...args: unknown[]) => mockToastError(...args),
}));

// Mock childrenService
const mockCreate = jest.fn();
const mockUploadProfileImage = jest.fn();
jest.mock('../../../api/services/children.service', () => ({
  __esModule: true,
  default: {
    create: (...args: any[]) => mockCreate(...args),
    uploadProfileImage: (...args: any[]) => mockUploadProfileImage(...args),
  },
}));

// Mock waiversService
const mockGetTemplates = jest.fn();
const mockGetMyAcceptances = jest.fn();
jest.mock('../../../api/services/waivers.service', () => ({
  __esModule: true,
  default: {
    getTemplates: (...args: any[]) => mockGetTemplates(...args),
    getMyAcceptances: (...args: any[]) => mockGetMyAcceptances(...args),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

// Mock useClasses hook
const mockClasses = [
  { id: 'class-1', name: 'Soccer Stars U6', is_active: true },
  { id: 'class-2', name: 'Lightning Bolts U8', is_active: true },
];

jest.mock('../../../api/hooks/classes/useClasses', () => ({
  useClasses: () => ({
    data: mockClasses,
    isLoading: false,
  }),
}));

// Mock WaiverCheckModal
jest.mock('../../../components/checkout/WaiverCheckModal', () => {
  return function MockWaiverCheckModal({ waivers, onComplete, onSkip }: any) {
    return (
      <div data-testid="waiver-modal">
        <h2>Sign Waivers</h2>
        <p>{waivers.length} waivers to sign</p>
        <button onClick={onComplete}>Complete</button>
        <button onClick={onSkip}>Skip</button>
      </div>
    );
  };
});

// Mock Logo component
jest.mock('../../../components/Logo', () => {
  return function MockLogo() {
    return <div data-testid="logo">CSF Logo</div>;
  };
});

describe('Register Child Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    sessionStorage.clear();

    // Default mock implementations
    mockCreate.mockResolvedValue({ id: 'new-child-1', first_name: 'John', last_name: 'Smith' });
    mockUploadProfileImage.mockResolvedValue({ success: true });
    mockGetTemplates.mockResolvedValue({ items: [] });
    mockGetMyAcceptances.mockResolvedValue({ items: [] });
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  // ===========================================
  // PAGE LOADING TESTS
  // ===========================================
  describe('Page Loading', () => {
    it('should render page title', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      expect(screen.getByText('Register a Child')).toBeInTheDocument();
    });

    it('should render page subtitle', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      expect(screen.getByText('Add a child to your account')).toBeInTheDocument();
    });

    it('should render CSF School Academy header', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      expect(screen.getByText('CSF School Academy')).toBeInTheDocument();
    });

    it('should render logo', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });

    it('should render all form fields', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('Date of Birth')).toBeInTheDocument();
      expect(screen.getByText('Grade')).toBeInTheDocument();
      expect(screen.getByText('Jersey Size')).toBeInTheDocument();
      expect(screen.getByText('Medical Conditions')).toBeInTheDocument();
      expect(screen.getByText('Emergency Contact Name')).toBeInTheDocument();
      expect(screen.getByText('Emergency Contact Phone')).toBeInTheDocument();
      expect(screen.getByText('Emergency Contact Relation')).toBeInTheDocument();
    });

    it('should render optional fields', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      expect(screen.getByText(/Classroom.*optional/i)).toBeInTheDocument();
      expect(screen.getByText(/Health Insurance.*optional/i)).toBeInTheDocument();
      expect(screen.getByText(/How did you hear/i)).toBeInTheDocument();
    });

    it('should render profile photo upload', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      expect(screen.getByText(/Profile Photo/i)).toBeInTheDocument();
      expect(screen.getByText('Add Photo')).toBeInTheDocument();
    });

    it('should render Save Child and Cancel buttons', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      expect(screen.getByText('Save Child')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render classroom dropdown with classes', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      const classroomSelect = screen.getByText('Select classroom').closest('select') as HTMLSelectElement;
      expect(classroomSelect).toBeInTheDocument();

      // Classes should be loaded
      expect(screen.queryByText('Soccer Stars U6')).not.toBeNull();
    });

    it('should render grade options', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      expect(screen.getByText('Select grade')).toBeInTheDocument();
    });

    it('should render jersey size options', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      expect(screen.getByText('Select size')).toBeInTheDocument();
    });

    it('should render emergency relation options', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      expect(screen.getByText('Select relation')).toBeInTheDocument();
    });

    it('should render footer with copyright', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      expect(screen.getByText(/2025 Carolina Soccer Factory/i)).toBeInTheDocument();
    });
  });

  // ===========================================
  // FORM VALIDATION TESTS
  // ===========================================
  describe('Form Validation', () => {
    it('should show error when first name is empty', async () => {
      const user = userEvent;
      render(<RegisterChild />, { wrapper: createWrapper() });

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(screen.getByText('First name is required.')).toBeInTheDocument();
      });
    });

    it('should show error when last name is empty', async () => {
      const user = userEvent;
      render(<RegisterChild />, { wrapper: createWrapper() });

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(screen.getByText('Last name is required.')).toBeInTheDocument();
      });
    });

    it('should show error when date of birth is empty', async () => {
      const user = userEvent;
      render(<RegisterChild />, { wrapper: createWrapper() });

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(screen.getByText('Date of birth is required.')).toBeInTheDocument();
      });
    });

    it('should show error when grade is empty', async () => {
      const user = userEvent;
      render(<RegisterChild />, { wrapper: createWrapper() });

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(screen.getByText('Grade is required.')).toBeInTheDocument();
      });
    });

    it('should show error when jersey size is empty', async () => {
      const user = userEvent;
      render(<RegisterChild />, { wrapper: createWrapper() });

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(screen.getByText('Select a jersey size.')).toBeInTheDocument();
      });
    });

    it('should show error when emergency contact name is empty', async () => {
      const user = userEvent;
      render(<RegisterChild />, { wrapper: createWrapper() });

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(screen.getByText('Emergency contact name is required.')).toBeInTheDocument();
      });
    });

    it('should show error when emergency contact phone is empty', async () => {
      const user = userEvent;
      render(<RegisterChild />, { wrapper: createWrapper() });

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(screen.getByText('Emergency contact phone is required.')).toBeInTheDocument();
      });
    });

    it('should show error when emergency contact relation is empty', async () => {
      const user = userEvent;
      render(<RegisterChild />, { wrapper: createWrapper() });

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(screen.getByText('Emergency contact relation is required.')).toBeInTheDocument();
      });
    });

    it('should show all validation errors at once', async () => {
      const user = userEvent;
      render(<RegisterChild />, { wrapper: createWrapper() });

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(screen.getByText('First name is required.')).toBeInTheDocument();
        expect(screen.getByText('Last name is required.')).toBeInTheDocument();
        expect(screen.getByText('Date of birth is required.')).toBeInTheDocument();
        expect(screen.getByText('Grade is required.')).toBeInTheDocument();
        expect(screen.getByText('Select a jersey size.')).toBeInTheDocument();
        expect(screen.getByText('Emergency contact name is required.')).toBeInTheDocument();
        expect(screen.getByText('Emergency contact phone is required.')).toBeInTheDocument();
        expect(screen.getByText('Emergency contact relation is required.')).toBeInTheDocument();
      });
    });

    it('should clear error when user starts typing', async () => {
      const user = userEvent;
      render(<RegisterChild />, { wrapper: createWrapper() });

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(screen.getByText('First name is required.')).toBeInTheDocument();
      });

      const firstNameInput = screen.getAllByRole('textbox')[0];
      await user.type(firstNameInput, 'John');

      await waitFor(() => {
        expect(screen.queryByText('First name is required.')).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // FORM SUBMISSION TESTS
  // ===========================================
  describe('Form Submission', () => {
    const fillRequiredFields = async (user: any) => {
      const inputs = screen.getAllByRole('textbox');
      // First Name
      const firstNameInput = inputs[0];
      await user.type(firstNameInput, 'John');

      // Last Name
      const lastNameInput = inputs[1];
      await user.type(lastNameInput, 'Smith');

      // Date of Birth
      const dobInput = document.querySelector('input[name="dob"]') as HTMLInputElement;
      if (dobInput) {
        fireEvent.change(dobInput, { target: { value: '2018-05-15', name: 'dob' } });
      }

      // Grade
      const gradeSelect = screen.getByText('Select grade').closest('select') as HTMLSelectElement;
      fireEvent.change(gradeSelect, { target: { value: '1', name: 'grade' } });

      // Jersey Size
      const jerseySelect = screen.getByText('Select size').closest('select') as HTMLSelectElement;
      fireEvent.change(jerseySelect, { target: { value: 's', name: 'jersey' } });

      // Emergency Contact Name
      const emergencyInputs = screen.getAllByRole('textbox');
      const emergencyNameInput = emergencyInputs.find(
        input => (input as HTMLInputElement).name === 'emergencyName'
      );
      if (emergencyNameInput) {
        await user.type(emergencyNameInput, 'Jane Smith');
      }

      // Emergency Contact Phone
      const emergencyPhoneInput = emergencyInputs.find(
        input => (input as HTMLInputElement).name === 'emergencyPhone'
      );
      if (emergencyPhoneInput) {
        await user.type(emergencyPhoneInput, '555-0123');
      }

      // Emergency Contact Relation
      const relationSelect = screen.getByText('Select relation').closest('select') as HTMLSelectElement;
      fireEvent.change(relationSelect, { target: { value: 'Parent', name: 'emergencyRelation' } });
    };

    it('should submit form with valid data', async () => {
      const user = userEvent;

      render(<RegisterChild />, { wrapper: createWrapper() });

      await fillRequiredFields(user);

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalled();
        const submittedData = mockCreate.mock.calls[0][0];
        expect(submittedData.first_name).toBe('John');
        expect(submittedData.last_name).toBe('Smith');
      });
    });

    it('should show Saving... state while submitting', async () => {
      const user = userEvent;
      mockCreate.mockReturnValue(new Promise(() => {})); // never resolves

      render(<RegisterChild />, { wrapper: createWrapper() });

      await fillRequiredFields(user);

      await user.click(screen.getByText('Save Child'));

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should disable buttons while submitting', async () => {
      const user = userEvent;
      mockCreate.mockReturnValue(new Promise(() => {})); // never resolves

      render(<RegisterChild />, { wrapper: createWrapper() });

      await fillRequiredFields(user);

      await user.click(screen.getByText('Save Child'));

      expect(screen.getByText('Saving...')).toBeDisabled();
    });

    it('should navigate to dashboard on success', async () => {
      const user = userEvent;

      render(<RegisterChild />, { wrapper: createWrapper() });

      await fillRequiredFields(user);

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should navigate to intended route if set', async () => {
      const user = userEvent;
      sessionStorage.setItem('intendedRoute', '/checkout');

      render(<RegisterChild />, { wrapper: createWrapper() });

      await fillRequiredFields(user);

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/checkout');
      });
    });

    it('should show success toast on creation', async () => {
      const user = userEvent;

      render(<RegisterChild />, { wrapper: createWrapper() });

      await fillRequiredFields(user);

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Child registered successfully!');
      });
    });

    it('should handle API error on submission', async () => {
      const user = userEvent;
      const apiError = new Error('Failed to create child') as any;
      apiError.response = { data: { message: 'Failed to create child' } };
      mockCreate.mockRejectedValue(apiError);

      render(<RegisterChild />, { wrapper: createWrapper() });

      await fillRequiredFields(user);

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });
    });

    it('should handle validation errors from API', async () => {
      const user = userEvent;
      const apiError = new Error('Validation error') as any;
      apiError.response = {
        data: {
          detail: [
            { loc: ['body', 'first_name'], msg: 'Name too short', type: 'value_error' },
          ],
        },
      };
      mockCreate.mockRejectedValue(apiError);

      render(<RegisterChild />, { wrapper: createWrapper() });

      await fillRequiredFields(user);

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });
    });

    it('should display submit error message', async () => {
      const user = userEvent;
      const apiError = new Error('Server unavailable') as any;
      apiError.response = { data: { message: 'Server unavailable' } };
      mockCreate.mockRejectedValue(apiError);

      render(<RegisterChild />, { wrapper: createWrapper() });

      await fillRequiredFields(user);

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });
    });
  });

  // ===========================================
  // CANCEL BUTTON TESTS
  // ===========================================
  describe('Cancel Button', () => {
    it('should navigate back on cancel', async () => {
      const user = userEvent;
      render(<RegisterChild />, { wrapper: createWrapper() });

      await user.click(screen.getByText('Cancel'));

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  // ===========================================
  // AGE CALCULATION TESTS
  // ===========================================
  describe('Age Calculation', () => {
    it('should calculate and display age from date of birth', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      const dobInput = document.querySelector('input[name="dob"]') as HTMLInputElement;
      if (dobInput) {
        // Set DOB to 8 years ago
        const eightYearsAgo = new Date();
        eightYearsAgo.setFullYear(eightYearsAgo.getFullYear() - 8);
        const dobValue = eightYearsAgo.toISOString().split('T')[0];
        fireEvent.change(dobInput, { target: { value: dobValue, name: 'dob' } });
      }

      await waitFor(() => {
        expect(screen.getByText(/Age: 8 years old/i)).toBeInTheDocument();
      });
    });

    it('should display singular "year" for age 1', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      const dobInput = document.querySelector('input[name="dob"]') as HTMLInputElement;
      if (dobInput) {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        // Make sure the birthday has passed this year
        oneYearAgo.setMonth(oneYearAgo.getMonth() - 1);
        const dobValue = oneYearAgo.toISOString().split('T')[0];
        fireEvent.change(dobInput, { target: { value: dobValue, name: 'dob' } });
      }

      await waitFor(() => {
        expect(screen.getByText(/Age: 1 year old/i)).toBeInTheDocument();
      });
    });

    it('should not display age when no DOB is set', () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      expect(screen.queryByText(/Age:/i)).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // PROFILE IMAGE TESTS
  // ===========================================
  describe('Profile Image', () => {
    it('should display photo upload area', () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      expect(screen.getByText('Add Photo')).toBeInTheDocument();
      expect(screen.getByText(/Max 400x400/i)).toBeInTheDocument();
    });

    it('should accept file input', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();
      expect(fileInput.accept).toContain('image');
    });
  });

  // ===========================================
  // WAIVER CHECK TESTS
  // ===========================================
  describe('Waiver Check', () => {
    it('should show waiver modal when unsigned waivers exist', async () => {
      const user = userEvent;
      mockGetTemplates.mockResolvedValue({
        items: [{ id: 'waiver-1', title: 'Safety Waiver', is_required: true, is_active: true }],
      });
      mockGetMyAcceptances.mockResolvedValue({ items: [] });

      render(<RegisterChild />, { wrapper: createWrapper() });

      // Fill all required fields
      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'John');
      await user.type(inputs[1], 'Smith');

      const dobInput = document.querySelector('input[name="dob"]') as HTMLInputElement;
      if (dobInput) {
        fireEvent.change(dobInput, { target: { value: '2018-05-15', name: 'dob' } });
      }

      const gradeSelect = screen.getByText('Select grade').closest('select') as HTMLSelectElement;
      fireEvent.change(gradeSelect, { target: { value: '1', name: 'grade' } });

      const jerseySelect = screen.getByText('Select size').closest('select') as HTMLSelectElement;
      fireEvent.change(jerseySelect, { target: { value: 's', name: 'jersey' } });

      const emergencyInputs = screen.getAllByRole('textbox');
      const emergencyName = emergencyInputs.find(
        i => (i as HTMLInputElement).name === 'emergencyName'
      );
      if (emergencyName) await user.type(emergencyName, 'Jane Smith');

      const emergencyPhone = emergencyInputs.find(
        i => (i as HTMLInputElement).name === 'emergencyPhone'
      );
      if (emergencyPhone) await user.type(emergencyPhone, '555-0123');

      const relationSelect = screen.getByText('Select relation').closest('select') as HTMLSelectElement;
      fireEvent.change(relationSelect, { target: { value: 'Parent', name: 'emergencyRelation' } });

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(screen.getByTestId('waiver-modal')).toBeInTheDocument();
      });

      expect(screen.getByText(/1 waivers to sign/i)).toBeInTheDocument();
    });

    it('should navigate after completing waivers', async () => {
      const user = userEvent;
      mockGetTemplates.mockResolvedValue({
        items: [{ id: 'waiver-1', title: 'Safety', is_required: true, is_active: true }],
      });
      mockGetMyAcceptances.mockResolvedValue({ items: [] });

      render(<RegisterChild />, { wrapper: createWrapper() });

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'John');
      await user.type(inputs[1], 'Smith');

      const dobInput = document.querySelector('input[name="dob"]') as HTMLInputElement;
      if (dobInput) {
        fireEvent.change(dobInput, { target: { value: '2018-05-15', name: 'dob' } });
      }

      const gradeSelect = screen.getByText('Select grade').closest('select') as HTMLSelectElement;
      fireEvent.change(gradeSelect, { target: { value: '1', name: 'grade' } });

      const jerseySelect = screen.getByText('Select size').closest('select') as HTMLSelectElement;
      fireEvent.change(jerseySelect, { target: { value: 's', name: 'jersey' } });

      const emergencyInputs = screen.getAllByRole('textbox');
      const emergencyName = emergencyInputs.find(
        i => (i as HTMLInputElement).name === 'emergencyName'
      );
      if (emergencyName) await user.type(emergencyName, 'Jane Smith');

      const emergencyPhone = emergencyInputs.find(
        i => (i as HTMLInputElement).name === 'emergencyPhone'
      );
      if (emergencyPhone) await user.type(emergencyPhone, '555-0123');

      const relationSelect = screen.getByText('Select relation').closest('select') as HTMLSelectElement;
      fireEvent.change(relationSelect, { target: { value: 'Parent', name: 'emergencyRelation' } });

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(screen.getByTestId('waiver-modal')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Complete'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should navigate after skipping waivers', async () => {
      const user = userEvent;
      mockGetTemplates.mockResolvedValue({
        items: [{ id: 'waiver-1', title: 'Safety', is_required: true, is_active: true }],
      });
      mockGetMyAcceptances.mockResolvedValue({ items: [] });

      render(<RegisterChild />, { wrapper: createWrapper() });

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'John');
      await user.type(inputs[1], 'Smith');

      const dobInput = document.querySelector('input[name="dob"]') as HTMLInputElement;
      if (dobInput) {
        fireEvent.change(dobInput, { target: { value: '2018-05-15', name: 'dob' } });
      }

      const gradeSelect = screen.getByText('Select grade').closest('select') as HTMLSelectElement;
      fireEvent.change(gradeSelect, { target: { value: '1', name: 'grade' } });

      const jerseySelect = screen.getByText('Select size').closest('select') as HTMLSelectElement;
      fireEvent.change(jerseySelect, { target: { value: 's', name: 'jersey' } });

      const emergencyInputs = screen.getAllByRole('textbox');
      const emergencyName = emergencyInputs.find(
        i => (i as HTMLInputElement).name === 'emergencyName'
      );
      if (emergencyName) await user.type(emergencyName, 'Jane Smith');

      const emergencyPhone = emergencyInputs.find(
        i => (i as HTMLInputElement).name === 'emergencyPhone'
      );
      if (emergencyPhone) await user.type(emergencyPhone, '555-0123');

      const relationSelect = screen.getByText('Select relation').closest('select') as HTMLSelectElement;
      fireEvent.change(relationSelect, { target: { value: 'Parent', name: 'emergencyRelation' } });

      await user.click(screen.getByText('Save Child'));

      await waitFor(() => {
        expect(screen.getByTestId('waiver-modal')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Skip'));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  // ===========================================
  // AFTERSCHOOL FIELD TESTS
  // ===========================================
  describe('Afterschool Field', () => {
    it('should default to "no" for afterschool', () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      const afterschoolSelect = document.querySelector('select[name="afterschool"]') as HTMLSelectElement;
      expect(afterschoolSelect.value).toBe('no');
    });

    it('should allow changing afterschool to yes', async () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      const afterschoolSelect = document.querySelector('select[name="afterschool"]') as HTMLSelectElement;
      fireEvent.change(afterschoolSelect, { target: { value: 'yes', name: 'afterschool' } });

      expect(afterschoolSelect.value).toBe('yes');
    });
  });

  // ===========================================
  // HEAR ABOUT US FIELD TESTS
  // ===========================================
  describe('How did you hear about us', () => {
    it('should display all referral options', () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      expect(screen.getByText('Select an option')).toBeInTheDocument();
      expect(screen.getByText('Friend/Word of Mouth')).toBeInTheDocument();
      expect(screen.getByText(/Social Media/i)).toBeInTheDocument();
      expect(screen.getByText('School')).toBeInTheDocument();
      expect(screen.getByText('Flyer')).toBeInTheDocument();
      expect(screen.getByText('Google Search')).toBeInTheDocument();
      expect(screen.getAllByText('Other').length).toBeGreaterThan(0);
    });
  });

  // ===========================================
  // FOOTER TESTS
  // ===========================================
  describe('Footer', () => {
    it('should display privacy and help links', () => {
      render(<RegisterChild />, { wrapper: createWrapper() });

      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Get help')).toBeInTheDocument();
    });
  });
});
