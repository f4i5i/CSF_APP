/**
 * EditChild Page Integration Tests
 * Tests for editing child information including form population, validation,
 * profile image handling, and API submission
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import EditChild from '../../../pages/EditChild';

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

// Mock Logo component
jest.mock('../../../components/Logo', () => ({
  __esModule: true,
  default: () => <div data-testid="logo">Logo</div>,
}));

// Mock children service
const mockGetById = jest.fn();
const mockUpdate = jest.fn();
const mockUploadProfileImage = jest.fn();

jest.mock('../../../api/services/children.service', () => ({
  __esModule: true,
  default: {
    getById: (...args: unknown[]) => mockGetById(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    uploadProfileImage: (...args: unknown[]) => mockUploadProfileImage(...args),
  },
}));

const mockChildData = {
  id: 'child-1',
  first_name: 'Johnny',
  last_name: 'Parent',
  date_of_birth: '2015-05-15',
  grade: '3',
  classroom: 'Room 201',
  jersey_size: 'm',
  medical_conditions: 'None',
  after_school_attendance: false,
  health_insurance_number: 'INS-12345',
  how_heard_about_us: 'friend',
  profile_image_url: null,
  emergency_contacts: [
    {
      name: 'Jane Parent',
      phone: '+1234567890',
      relationship: 'Parent',
    },
  ],
};

describe('EditChild Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetById.mockResolvedValue(mockChildData);
    mockUpdate.mockResolvedValue({ ...mockChildData });
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
    it('should show loading state while fetching child data', () => {
      mockGetById.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockChildData), 1000))
      );

      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Loading child data...')).toBeInTheDocument();
    });

    it('should call getById with correct childId', () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      expect(mockGetById).toHaveBeenCalledWith('child-1');
    });
  });

  // ===========================================
  // RENDERING TESTS (after data loads)
  // ===========================================
  describe('Rendering', () => {
    it('should render the edit child form after data loads', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Edit Child')).toBeInTheDocument();
      });

      expect(screen.getByText(/Update your child's information/i)).toBeInTheDocument();
    });

    it('should populate form with existing child data', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
      });

      // "Parent" appears in both last name and emergency contact relationship,
      // so use the input name attribute to disambiguate
      const lastNameInput = document.querySelector('input[name="lastName"]') as HTMLInputElement;
      expect(lastNameInput).toBeInTheDocument();
      expect(lastNameInput.value).toBe('Parent');
      expect(screen.getByDisplayValue('2015-05-15')).toBeInTheDocument();
    });

    it('should populate emergency contact fields', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Jane Parent')).toBeInTheDocument();
      });

      expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument();
    });

    it('should render all form field labels', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('First Name')).toBeInTheDocument();
      });

      expect(screen.getByText('Last Name')).toBeInTheDocument();
      expect(screen.getByText('Date of Birth')).toBeInTheDocument();
      expect(screen.getByText('Grade')).toBeInTheDocument();
      expect(screen.getByText('Jersey Size')).toBeInTheDocument();
      expect(screen.getByText(/Attends Afterschool/i)).toBeInTheDocument();
      expect(screen.getByText('Medical Conditions')).toBeInTheDocument();
      expect(screen.getByText('Emergency Contact Name')).toBeInTheDocument();
      expect(screen.getByText('Emergency Contact Phone')).toBeInTheDocument();
      expect(screen.getByText('Emergency Contact Relation')).toBeInTheDocument();
    });

    it('should render Save Changes and Cancel buttons', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('should render profile photo upload section', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Profile Photo/i)).toBeInTheDocument();
      });
    });

    it('should calculate and display age from DOB', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Age:/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // FORM EDITING TESTS
  // ===========================================
  describe('Form Editing', () => {
    it('should allow editing first name', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByDisplayValue('Johnny');
      await userEvent.clear(firstNameInput);
      await userEvent.type(firstNameInput, 'James');

      expect(screen.getByDisplayValue('James')).toBeInTheDocument();
    });

    it('should allow editing last name', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
      });

      const lastNameInput = document.querySelector('input[name="lastName"]') as HTMLInputElement;
      await userEvent.clear(lastNameInput);
      await userEvent.type(lastNameInput, 'Smith');

      expect(screen.getByDisplayValue('Smith')).toBeInTheDocument();
    });

    it('should clear error when user types in errored field', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
      });

      // Clear first name and submit to trigger error
      const firstNameInput = screen.getByDisplayValue('Johnny');
      await userEvent.clear(firstNameInput);

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText('First name is required.')).toBeInTheDocument();
      });

      // Start typing to clear error
      await userEvent.type(firstNameInput, 'J');

      await waitFor(() => {
        expect(screen.queryByText('First name is required.')).not.toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // FORM VALIDATION TESTS
  // ===========================================
  describe('Form Validation', () => {
    it('should show error when first name is empty', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByDisplayValue('Johnny');
      await userEvent.clear(firstNameInput);

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText('First name is required.')).toBeInTheDocument();
      });
    });

    it('should show error when last name is empty', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
      });

      const lastNameInput = document.querySelector('input[name="lastName"]') as HTMLInputElement;
      await userEvent.clear(lastNameInput);

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText('Last name is required.')).toBeInTheDocument();
      });
    });

    it('should show error when DOB is empty', async () => {
      mockGetById.mockResolvedValue({
        ...mockChildData,
        date_of_birth: '',
      });

      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Edit Child')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText('Date of birth is required.')).toBeInTheDocument();
      });
    });

    it('should show error when emergency contact name is empty', async () => {
      mockGetById.mockResolvedValue({
        ...mockChildData,
        emergency_contacts: [{ name: '', phone: '+1234567890', relationship: 'Parent' }],
      });

      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Edit Child')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText('Emergency contact name is required.')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // SUBMISSION FLOW TESTS
  // ===========================================
  describe('Submission Flow', () => {
    it('should call update service on valid submission', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith('child-1', expect.objectContaining({
          first_name: 'Johnny',
          last_name: 'Parent',
        }));
      });
    });

    it('should show success toast after successful update', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(mockToastSuccess).toHaveBeenCalledWith('Child updated successfully!');
      });
    });

    it('should navigate back after successful update', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(-1);
      });
    });

    it('should show loading state during submission', async () => {
      mockUpdate.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    });

    it('should disable Cancel button while submitting', async () => {
      mockUpdate.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

      expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
    });
  });

  // ===========================================
  // ERROR HANDLING TESTS
  // ===========================================
  describe('Error Handling', () => {
    it('should show error toast and navigate back when child fetch fails', async () => {
      mockGetById.mockRejectedValue(new Error('Not found'));

      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to load child data');
      });

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should show error toast when update fails', async () => {
      mockUpdate.mockRejectedValue({
        response: {
          data: {
            message: 'Failed to update child. Please try again.',
          },
        },
      });

      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Failed to update child. Please try again.');
      });
    });

    it('should handle validation error array from API', async () => {
      mockUpdate.mockRejectedValue({
        response: {
          data: {
            detail: [
              { loc: ['body', 'first_name'], msg: 'Field required' },
            ],
          },
        },
      });

      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalled();
      });
    });

    it('should display submit error message on failure', async () => {
      mockUpdate.mockRejectedValue({
        response: {
          data: {
            message: 'Server error occurred',
          },
        },
      });

      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

      await waitFor(() => {
        expect(screen.getByText('Server error occurred')).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // CANCEL BUTTON TESTS
  // ===========================================
  describe('Cancel Button', () => {
    it('should navigate back when cancel is clicked', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Johnny')).toBeInTheDocument();
      });

      await userEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  // ===========================================
  // PROFILE IMAGE TESTS
  // ===========================================
  describe('Profile Image', () => {
    it('should show existing profile image when one exists', async () => {
      mockGetById.mockResolvedValue({
        ...mockChildData,
        profile_image_url: 'https://example.com/photo.jpg',
      });

      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByAltText('Profile preview')).toBeInTheDocument();
      });
    });

    it('should show "Add Photo" placeholder when no image exists', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Add Photo')).toBeInTheDocument();
      });
    });

    it('should show max size hint', async () => {
      render(
        <MemoryRouter initialEntries={['/edit-child/child-1']}>
          <Routes>
            <Route path="/edit-child/:childId" element={<EditChild />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Max 400x400 pixels, max 1MB/i)).toBeInTheDocument();
      });
    });
  });
});
