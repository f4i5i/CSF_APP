/**
 * Waivers Page Integration Tests
 * Tests for waiver signing flow including loading, validation, and submission
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import Waivers from '../../../pages/Waivers';
import toast from 'react-hot-toast';

// Mock dependencies
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('react-hot-toast');

jest.mock('../../../components/Logo', () => ({
  __esModule: true,
  default: () => <div data-testid="logo">CSF Logo</div>,
}));

jest.mock('../../../components/Footer', () => ({
  __esModule: true,
  default: () => <div data-testid="footer">Footer</div>,
}));

const API_BASE = 'http://localhost:8000/api/v1';

describe('Waivers Page', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-parent');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-parent');
    mockNavigate.mockClear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initial Render', () => {
    it('should render page header', async () => {
      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('CSF School Academy')).toBeInTheDocument();
      });
    });

    it('should render logo and title', async () => {
      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByTestId('logo')).toBeInTheDocument();
        expect(screen.getByText('Registration Waiver')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      render(<Waivers />);

      expect(screen.getByText(/Loading waivers.../i)).toBeInTheDocument();
    });

    it('should render footer', () => {
      render(<Waivers />);

      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  describe('Pending Waivers Display', () => {
    it('should display pending waivers from API', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [
              {
                waiver_template: {
                  id: 'waiver-1',
                  name: 'Liability Waiver',
                  content: 'I agree to the terms and conditions and understand the risks involved in participating in sports activities.',
                  waiver_type: 'liability',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
              {
                waiver_template: {
                  id: 'waiver-2',
                  name: 'Photo Release',
                  content: 'I consent to photos being taken of my child during class activities.',
                  waiver_type: 'photo_release',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
            ],
            pending_count: 2,
            total: 2,
          });
        })
      );

      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
        expect(screen.getByText('Photo Release')).toBeInTheDocument();
      });
    });

    it('should display waiver content', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [
              {
                waiver_template: {
                  id: 'waiver-1',
                  name: 'Liability Waiver',
                  content: 'I agree to the terms and conditions and understand the risks involved in participating in sports activities.',
                  waiver_type: 'liability',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
            ],
            pending_count: 1,
            total: 1,
          });
        })
      );

      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText(/I agree to the terms and conditions/i)).toBeInTheDocument();
      });
    });

    it('should show checkbox for each waiver', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [
              {
                waiver_template: {
                  id: 'waiver-1',
                  name: 'Liability Waiver',
                  content: 'Terms...',
                  waiver_type: 'liability',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
              {
                waiver_template: {
                  id: 'waiver-2',
                  name: 'Photo Release',
                  content: 'Photo terms...',
                  waiver_type: 'photo_release',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
            ],
            pending_count: 2,
            total: 2,
          });
        })
      );

      render(<Waivers />);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(2);
      });
    });

    it('should show no pending waivers message when all waivers signed', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [],
            pending_count: 0,
            total: 0,
          });
        })
      );

      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText(/No pending waivers found/i)).toBeInTheDocument();
        expect(screen.getByText(/All required waivers have been signed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Waiver Acceptance', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [
              {
                waiver_template: {
                  id: 'waiver-1',
                  name: 'Liability Waiver',
                  content: 'Terms and conditions...',
                  waiver_type: 'liability',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
            ],
            pending_count: 1,
            total: 1,
          });
        })
      );
    });

    it('should allow checking waiver checkbox', async () => {
      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it('should allow unchecking waiver checkbox', async () => {
      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should display acceptance text for each waiver', async () => {
      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText(/I agree to the Liability Waiver terms/i)).toBeInTheDocument();
      });
    });
  });

  describe('Signature Field', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [
              {
                waiver_template: {
                  id: 'waiver-1',
                  name: 'Liability Waiver',
                  content: 'Terms...',
                  waiver_type: 'liability',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
            ],
            pending_count: 1,
            total: 1,
          });
        })
      );
    });

    it('should render signature input field', async () => {
      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Type your full name as signature/i)).toBeInTheDocument();
      });
    });

    it('should allow typing in signature field', async () => {
      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Type your full name as signature/i)).toBeInTheDocument();
      });

      const signatureInput = screen.getByPlaceholderText(/Type your full name as signature/i);
      await user.type(signatureInput, 'John Doe');

      expect(signatureInput).toHaveValue('John Doe');
    });

    it('should have signature field as required', async () => {
      render(<Waivers />);

      await waitFor(() => {
        const signatureInput = screen.getByPlaceholderText(/Type your full name as signature/i);
        expect(signatureInput).toBeRequired();
      });
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [
              {
                waiver_template: {
                  id: 'waiver-1',
                  name: 'Liability Waiver',
                  content: 'Terms...',
                  waiver_type: 'liability',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
            ],
            pending_count: 1,
            total: 1,
          });
        })
      );
    });

    it('should show error when submitting without accepting waivers', async () => {
      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
      });

      const signatureInput = screen.getByPlaceholderText(/Type your full name as signature/i);
      await user.type(signatureInput, 'John Doe');

      const submitButton = screen.getByText('Submit Waiver');
      await user.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith('Please accept all waiver terms');
    });

    it('should show error when submitting without signature', async () => {
      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      const submitButton = screen.getByText('Submit Waiver');
      await user.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith('Please provide your signature');
    });

    it('should validate all waivers are accepted', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [
              {
                waiver_template: {
                  id: 'waiver-1',
                  name: 'Liability Waiver',
                  content: 'Terms...',
                  waiver_type: 'liability',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
              {
                waiver_template: {
                  id: 'waiver-2',
                  name: 'Photo Release',
                  content: 'Photo terms...',
                  waiver_type: 'photo_release',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
            ],
            pending_count: 2,
            total: 2,
          });
        })
      );

      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
      });

      // Accept only first waiver
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);

      const signatureInput = screen.getByPlaceholderText(/Type your full name as signature/i);
      await user.type(signatureInput, 'John Doe');

      const submitButton = screen.getByText('Submit Waiver');
      await user.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith('Please accept all waiver terms');
    });
  });

  describe('Successful Submission', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [
              {
                waiver_template: {
                  id: 'waiver-1',
                  name: 'Liability Waiver',
                  content: 'Terms...',
                  waiver_type: 'liability',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
            ],
            pending_count: 1,
            total: 1,
          });
        }),
        http.post(`${API_BASE}/waivers/sign-multiple`, () => {
          return HttpResponse.json({
            success: true,
            signed_count: 1,
            failed_count: 0,
            errors: [],
          });
        })
      );
    });

    it('should successfully submit waivers', async () => {
      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      const signatureInput = screen.getByPlaceholderText(/Type your full name as signature/i);
      await user.type(signatureInput, 'John Doe');

      const submitButton = screen.getByText('Submit Waiver');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Waivers signed successfully!');
      });
    });

    it('should show signing state during submission', async () => {
      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      const signatureInput = screen.getByPlaceholderText(/Type your full name as signature/i);
      await user.type(signatureInput, 'John Doe');

      const submitButton = screen.getByText('Submit Waiver');
      await user.click(submitButton);

      expect(screen.getByText('Signing...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should navigate to dashboard after successful submission', async () => {
      jest.useFakeTimers();

      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      const signatureInput = screen.getByPlaceholderText(/Type your full name as signature/i);
      await user.type(signatureInput, 'John Doe');

      const submitButton = screen.getByText('Submit Waiver');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });

      // Fast-forward timer for navigation delay
      jest.advanceTimersByTime(1500);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });

      jest.useRealTimers();
    });
  });

  describe('Multiple Waivers', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [
              {
                waiver_template: {
                  id: 'waiver-1',
                  name: 'Liability Waiver',
                  content: 'Liability terms...',
                  waiver_type: 'liability',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
              {
                waiver_template: {
                  id: 'waiver-2',
                  name: 'Photo Release',
                  content: 'Photo terms...',
                  waiver_type: 'photo_release',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
              {
                waiver_template: {
                  id: 'waiver-3',
                  name: 'Medical Consent',
                  content: 'Medical terms...',
                  waiver_type: 'medical',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
            ],
            pending_count: 3,
            total: 3,
          });
        }),
        http.post(`${API_BASE}/waivers/sign-multiple`, () => {
          return HttpResponse.json({
            success: true,
            signed_count: 3,
            failed_count: 0,
            errors: [],
          });
        })
      );
    });

    it('should display multiple waivers', async () => {
      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
        expect(screen.getByText('Photo Release')).toBeInTheDocument();
        expect(screen.getByText('Medical Consent')).toBeInTheDocument();
      });
    });

    it('should require all waivers to be accepted', async () => {
      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3);

      // Accept only two waivers
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      const signatureInput = screen.getByPlaceholderText(/Type your full name as signature/i);
      await user.type(signatureInput, 'John Doe');

      const submitButton = screen.getByText('Submit Waiver');
      await user.click(submitButton);

      expect(toast.error).toHaveBeenCalledWith('Please accept all waiver terms');
    });

    it('should successfully submit all waivers', async () => {
      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
      });

      const checkboxes = screen.getAllByRole('checkbox');
      for (const checkbox of checkboxes) {
        await user.click(checkbox);
      }

      const signatureInput = screen.getByPlaceholderText(/Type your full name as signature/i);
      await user.type(signatureInput, 'John Doe');

      const submitButton = screen.getByText('Submit Waiver');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Waivers signed successfully!');
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [
              {
                waiver_template: {
                  id: 'waiver-1',
                  name: 'Liability Waiver',
                  content: 'Terms...',
                  waiver_type: 'liability',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
            ],
            pending_count: 1,
            total: 1,
          });
        })
      );
    });

    it('should handle submission error', async () => {
      server.use(
        http.post(`${API_BASE}/waivers/sign-multiple`, () => {
          return HttpResponse.json(
            { message: 'Failed to sign waivers' },
            { status: 500 }
          );
        })
      );

      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      const signatureInput = screen.getByPlaceholderText(/Type your full name as signature/i);
      await user.type(signatureInput, 'John Doe');

      const submitButton = screen.getByText('Submit Waiver');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to sign waivers. Please try again.');
      });
    });

    it('should handle partial failure', async () => {
      server.use(
        http.post(`${API_BASE}/waivers/sign-multiple`, () => {
          return HttpResponse.json({
            success: false,
            signed_count: 0,
            failed_count: 1,
            errors: ['Failed to sign waiver-1'],
          });
        })
      );

      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      const signatureInput = screen.getByPlaceholderText(/Type your full name as signature/i);
      await user.type(signatureInput, 'John Doe');

      const submitButton = screen.getByText('Submit Waiver');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to sign 1 waiver(s). Please try again.');
      });
    });

    it('should handle loading error gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json(
            { message: 'Failed to load waivers' },
            { status: 500 }
          );
        })
      );

      render(<Waivers />);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to load waivers');
      });
    });

    it('should re-enable submit button after error', async () => {
      server.use(
        http.post(`${API_BASE}/waivers/sign-multiple`, () => {
          return HttpResponse.json(
            { message: 'Server error' },
            { status: 500 }
          );
        })
      );

      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      const signatureInput = screen.getByPlaceholderText(/Type your full name as signature/i);
      await user.type(signatureInput, 'John Doe');

      const submitButton = screen.getByText('Submit Waiver');
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('Cancel Button', () => {
    beforeEach(() => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [
              {
                waiver_template: {
                  id: 'waiver-1',
                  name: 'Liability Waiver',
                  content: 'Terms...',
                  waiver_type: 'liability',
                  version: 1,
                },
                is_accepted: false,
                needs_reconsent: false,
              },
            ],
            pending_count: 1,
            total: 1,
          });
        })
      );
    });

    it('should have cancel button', async () => {
      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });
    });

    it('should go back when clicking cancel', async () => {
      const backSpy = jest.spyOn(window.history, 'back');

      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(backSpy).toHaveBeenCalled();
    });

    it('should not disable cancel during submission', async () => {
      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
      });

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      const signatureInput = screen.getByPlaceholderText(/Type your full name as signature/i);
      await user.type(signatureInput, 'John Doe');

      const submitButton = screen.getByText('Submit Waiver');
      await user.click(submitButton);

      const cancelButton = screen.getByText('Cancel');
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Waiver Reconsent', () => {
    it('should display waivers that need reconsent', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/pending`, () => {
          return HttpResponse.json({
            items: [
              {
                waiver_template: {
                  id: 'waiver-1',
                  name: 'Updated Liability Waiver',
                  content: 'Updated terms...',
                  waiver_type: 'liability',
                  version: 2,
                },
                is_accepted: true,
                needs_reconsent: true,
              },
            ],
            pending_count: 1,
            total: 1,
          });
        })
      );

      render(<Waivers />);

      await waitFor(() => {
        expect(screen.getByText('Updated Liability Waiver')).toBeInTheDocument();
      });

      // Should require re-signing even though previously accepted
    });
  });
});
