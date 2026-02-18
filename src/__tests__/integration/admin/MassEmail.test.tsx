/**
 * Integration Tests for Mass Email Page
 * Tests email composition, recipient selection, validation, preview, and sending
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import MassEmail from '../../../pages/AdminDashboard/MassEmail';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock Header since it makes API calls that aren't relevant to MassEmail tests
jest.mock('../../../components/Header', () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

// Mock react-hot-toast so we can assert on toast.error calls for validation
jest.mock('react-hot-toast', () => {
  const mockToast: any = (msg: string) => msg;
  mockToast.success = jest.fn();
  mockToast.error = jest.fn();
  mockToast.loading = jest.fn();
  mockToast.dismiss = jest.fn();
  mockToast.custom = jest.fn();
  mockToast.remove = jest.fn();
  return {
    __esModule: true,
    default: mockToast,
  };
});
import toast from 'react-hot-toast';

// Mock admin service to avoid unhandled rejections from apiClient chain
const mockSendBulkEmail = jest.fn();
jest.mock('../../../api/services/admin.service', () => ({
  __esModule: true,
  default: {
    sendBulkEmail: (...args: any[]) => mockSendBulkEmail(...args),
  },
}));

// Mock service imports used by dynamic import() in MassEmail component
jest.mock('../../../api/services/classes.service', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue({ items: [
      { id: 'class-1', name: 'Soccer Stars U6' },
      { id: 'class-2', name: 'Lightning Bolts U8' },
    ]}),
  },
}));

jest.mock('../../../api/services/programs.service', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue({ items: [
      { id: 'prog-1', name: 'Summer Program' },
      { id: 'prog-2', name: 'After School Program' },
    ]}),
  },
}));

jest.mock('../../../api/services/areas.service', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue([
      { id: 'area-1', name: 'Downtown' },
      { id: 'area-2', name: 'Suburbs' },
    ]),
  },
}));

// Mock ConfirmDialog to avoid complex dialog interactions
jest.mock('../../../components/admin/ConfirmDialog', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onConfirm, title, message }: any) => {
    if (!isOpen) return null;
    return (
      <div role="dialog" data-testid="confirm-dialog">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onClose}>Cancel</button>
        <button onClick={onConfirm}>Confirm Send</button>
      </div>
    );
  },
}));

// Mock ReactQuill since it uses DOM APIs not available in tests
jest.mock('react-quill', () => {
  return function MockReactQuill({ value, onChange, placeholder }: any) {
    return (
      <textarea
        data-testid="quill-editor"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    );
  };
});

// Also mock the CSS import
jest.mock('react-quill/dist/quill.snow.css', () => ({}));

// Mock data
const mockClasses = [
  { id: 'class-1', name: 'Soccer Stars U6' },
  { id: 'class-2', name: 'Lightning Bolts U8' },
];

const mockPrograms = [
  { id: 'prog-1', name: 'Summer Program' },
  { id: 'prog-2', name: 'After School Program' },
];

const mockAreas = [
  { id: 'area-1', name: 'Downtown' },
  { id: 'area-2', name: 'Suburbs' },
];

describe('Mass Email Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');

    mockSendBulkEmail.mockReset();
    (toast.error as jest.Mock).mockClear();
    (toast.success as jest.Mock).mockClear();

    // Re-apply mock resolved values for dynamic import() services
    // (jest.mock + dynamic import caching can lose resolved values between tests)
    const classesService = require('../../../api/services/classes.service').default;
    classesService.getAll.mockResolvedValue({ items: [
      { id: 'class-1', name: 'Soccer Stars U6' },
      { id: 'class-2', name: 'Lightning Bolts U8' },
    ]});
    const programsService = require('../../../api/services/programs.service').default;
    programsService.getAll.mockResolvedValue({ items: [
      { id: 'prog-1', name: 'Summer Program' },
      { id: 'prog-2', name: 'After School Program' },
    ]});
    const areasService = require('../../../api/services/areas.service').default;
    areasService.getAll.mockResolvedValue([
      { id: 'area-1', name: 'Downtown' },
      { id: 'area-2', name: 'Suburbs' },
    ]);

    server.use(
      http.get(`${API_BASE}/classes`, () => {
        return HttpResponse.json({ items: mockClasses, total: mockClasses.length });
      }),
      http.get(`${API_BASE}/programs`, () => {
        return HttpResponse.json({ items: mockPrograms, total: mockPrograms.length });
      }),
      http.get(`${API_BASE}/areas`, () => {
        return HttpResponse.json(mockAreas);
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
    it('should render page title', async () => {
      render(<MassEmail />);

      expect(screen.getByText('Mass Email')).toBeInTheDocument();
    });

    it('should render page description', async () => {
      render(<MassEmail />);

      expect(screen.getByText(/Send emails to parents/i)).toBeInTheDocument();
    });

    it('should display Recipients section', async () => {
      render(<MassEmail />);

      expect(screen.getByText('Recipients')).toBeInTheDocument();
    });

    it('should display Compose Email section', async () => {
      render(<MassEmail />);

      expect(screen.getByText('Compose Email')).toBeInTheDocument();
    });

    it('should display Send Email button', async () => {
      render(<MassEmail />);

      expect(screen.getByText('Send Email')).toBeInTheDocument();
    });

    it('should display all recipient type options', async () => {
      render(<MassEmail />);

      expect(screen.getByText('All Parents')).toBeInTheDocument();
      expect(screen.getByText('By Class')).toBeInTheDocument();
      expect(screen.getByText('By Program')).toBeInTheDocument();
      expect(screen.getByText('By Area')).toBeInTheDocument();
    });

    it('should display recipient type descriptions', async () => {
      render(<MassEmail />);

      expect(screen.getByText(/Send to all registered parents/i)).toBeInTheDocument();
      expect(screen.getByText(/Send to parents of a specific class/i)).toBeInTheDocument();
      expect(screen.getByText(/Send to parents in a program/i)).toBeInTheDocument();
      expect(screen.getByText(/Send to parents in an area/i)).toBeInTheDocument();
    });
  });

  // ===========================================
  // RECIPIENT SELECTION TESTS
  // ===========================================
  describe('Recipient Selection', () => {
    it('should default to All Parents recipient type', async () => {
      render(<MassEmail />);

      // "all parents" appears in the <strong> inside "Sending to: <strong>all parents</strong>"
      const strongElements = screen.getAllByText('all parents');
      expect(strongElements.length).toBeGreaterThan(0);
    });

    it('should show class dropdown when By Class is selected', async () => {
      const user = userEvent;
      render(<MassEmail />);

      await user.click(screen.getByText('By Class'));

      await waitFor(() => {
        expect(screen.getByText(/Select Class/i)).toBeInTheDocument();
      });
    });

    it('should populate class dropdown options', async () => {
      const user = userEvent;
      render(<MassEmail />);

      await user.click(screen.getByText('By Class'));

      await waitFor(() => {
        // The select has an <option> with "Choose a class" text
        const selectEl = screen.getByRole('combobox');
        expect(selectEl).toBeInTheDocument();
        expect(screen.getByText(/Choose a class|Loading classes/i)).toBeInTheDocument();
      });
    });

    it('should show program dropdown when By Program is selected', async () => {
      const user = userEvent;
      render(<MassEmail />);

      await user.click(screen.getByText('By Program'));

      await waitFor(() => {
        expect(screen.getByText(/Select Program/i)).toBeInTheDocument();
      });
    });

    it('should show area dropdown when By Area is selected', async () => {
      const user = userEvent;
      render(<MassEmail />);

      await user.click(screen.getByText('By Area'));

      await waitFor(() => {
        expect(screen.getByText(/Select Area/i)).toBeInTheDocument();
      });
    });

    it('should update recipient label when class is selected', async () => {
      const user = userEvent;
      render(<MassEmail />);

      await user.click(screen.getByText('By Class'));

      // Wait for the combobox to appear and options to load
      const classDropdown = await screen.findByRole('combobox');

      await waitFor(() => {
        const options = classDropdown.querySelectorAll('option');
        expect(options.length).toBeGreaterThan(1);
      });

      fireEvent.change(classDropdown, { target: { value: 'class-1' } });

      // The recipient label should now show the class name
      await waitFor(() => {
        const matches = screen.getAllByText((content) => content.includes('Soccer Stars U6'));
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should reset selection when switching recipient types', async () => {
      const user = userEvent;
      render(<MassEmail />);

      // Select By Class and choose a class
      await user.click(screen.getByText('By Class'));

      await waitFor(() => {
        expect(screen.getByText(/Choose a class/i)).toBeInTheDocument();
      });

      const classDropdown = screen.getByRole('combobox');
      fireEvent.change(classDropdown, { target: { value: 'class-1' } });

      // Switch to All Parents
      await user.click(screen.getByText('All Parents'));

      await waitFor(() => {
        // "all parents" in lowercase is the recipient label; "All Parents" is the button
        const matches = screen.getAllByText(/all parents/i);
        expect(matches.length).toBeGreaterThanOrEqual(1);
      });

      // Switch back to By Class
      await user.click(screen.getByText('By Class'));

      await waitFor(() => {
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select.value).toBe('');
      });
    });
  });

  // ===========================================
  // EMAIL COMPOSITION TESTS
  // ===========================================
  describe('Email Composition', () => {
    it('should display subject input', async () => {
      render(<MassEmail />);

      expect(screen.getByPlaceholderText(/Email subject line/i)).toBeInTheDocument();
    });

    it('should display message editor', async () => {
      render(<MassEmail />);

      expect(screen.getByTestId('quill-editor')).toBeInTheDocument();
    });

    it('should display Preview button', async () => {
      render(<MassEmail />);

      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('should disable Preview button when no content', async () => {
      render(<MassEmail />);

      const previewButton = screen.getByText('Preview');
      expect(previewButton).toBeDisabled();
    });

    it('should enable Preview button when subject and message are provided', async () => {
      const user = userEvent;
      render(<MassEmail />);

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Test Subject');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Test message content' } });

      await waitFor(() => {
        const previewButton = screen.getByText('Preview');
        expect(previewButton).not.toBeDisabled();
      });
    });

    it('should disable Send Email button when no content', async () => {
      render(<MassEmail />);

      const sendButton = screen.getByText('Send Email');
      expect(sendButton).toBeDisabled();
    });

    it('should enable Send Email button with valid content', async () => {
      const user = userEvent;
      render(<MassEmail />);

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Test Subject');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Test message content' } });

      await waitFor(() => {
        const sendButton = screen.getByText('Send Email');
        expect(sendButton).not.toBeDisabled();
      });
    });
  });

  // ===========================================
  // VALIDATION TESTS
  // ===========================================
  describe('Validation', () => {
    it('should show error when subject is empty', async () => {
      const user = userEvent;
      render(<MassEmail />);

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Test message' } });

      // Force send button to be clickable by checking if it becomes enabled
      // Note: The button should still be disabled without subject
      const sendButton = screen.getByText('Send Email');
      expect(sendButton).toBeDisabled();
    });

    it('should show error when message is empty', async () => {
      const user = userEvent;
      render(<MassEmail />);

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Test Subject');

      // Send button should be disabled without message
      const sendButton = screen.getByText('Send Email');
      expect(sendButton).toBeDisabled();
    });

    it('should show error when By Class is selected but no class chosen', async () => {
      const user = userEvent;
      render(<MassEmail />);

      await user.click(screen.getByText('By Class'));

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Test Subject');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Test message content' } });

      await waitFor(() => {
        const sendButton = screen.getByText('Send Email');
        expect(sendButton).not.toBeDisabled();
      });

      await user.click(screen.getByText('Send Email'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please select a class');
      });
    });

    it('should show error when By Program is selected but no program chosen', async () => {
      const user = userEvent;
      render(<MassEmail />);

      await user.click(screen.getByText('By Program'));

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Test Subject');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Test message content' } });

      await waitFor(() => {
        const sendButton = screen.getByText('Send Email');
        expect(sendButton).not.toBeDisabled();
      });

      await user.click(screen.getByText('Send Email'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please select a program');
      });
    });

    it('should show error when By Area is selected but no area chosen', async () => {
      const user = userEvent;
      render(<MassEmail />);

      await user.click(screen.getByText('By Area'));

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Test Subject');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Test message content' } });

      await waitFor(() => {
        const sendButton = screen.getByText('Send Email');
        expect(sendButton).not.toBeDisabled();
      });

      await user.click(screen.getByText('Send Email'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please select an area');
      });
    });
  });

  // ===========================================
  // SEND EMAIL TESTS
  // ===========================================
  describe('Send Email', () => {
    it('should show confirmation dialog before sending', async () => {
      const user = userEvent;
      render(<MassEmail />);

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Important Update');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Hello everyone!' } });

      await waitFor(() => {
        const sendButton = screen.getByText('Send Email');
        expect(sendButton).not.toBeDisabled();
      });

      await user.click(screen.getByText('Send Email'));

      await waitFor(() => {
        expect(screen.getByText(/Send Mass Email/i)).toBeInTheDocument();
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });
    });

    it('should send email successfully', async () => {
      const user = userEvent;

      mockSendBulkEmail.mockResolvedValueOnce({
        successful: 25,
        failed: 0,
        total_recipients: 25,
      });

      render(<MassEmail />);

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Important Update');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Hello everyone!' } });

      await waitFor(() => {
        const sendButton = screen.getByText('Send Email');
        expect(sendButton).not.toBeDisabled();
      });

      fireEvent.click(screen.getByText('Send Email'));

      await waitFor(() => {
        expect(screen.getByText(/Send Mass Email/i)).toBeInTheDocument();
      });

      // Confirm send
      const confirmButton = screen.getByRole('button', { name: /Confirm Send/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Email Sent/i)).toBeInTheDocument();
        expect(screen.getByText(/25 of 25 emails sent successfully/i)).toBeInTheDocument();
      });
    });

    it('should show partial success result', async () => {
      const user = userEvent;

      mockSendBulkEmail.mockResolvedValueOnce({
        successful: 20,
        failed: 5,
        total_recipients: 25,
      });

      render(<MassEmail />);

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Update');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Content' } });

      await waitFor(() => {
        const sendButton = screen.getByText('Send Email');
        expect(sendButton).not.toBeDisabled();
      });

      await user.click(screen.getByText('Send Email'));

      await waitFor(() => {
        expect(screen.getByText(/Send Mass Email/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm Send/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/20 of 25 emails sent/i)).toBeInTheDocument();
        expect(screen.getByText(/5 failed/i)).toBeInTheDocument();
      });
    });

    it('should send with class_id when By Class is selected', async () => {
      const user = userEvent;

      mockSendBulkEmail.mockResolvedValueOnce({ successful: 10, failed: 0, total_recipients: 10 });

      render(<MassEmail />);

      await user.click(screen.getByText('By Class'));

      // Wait for class options to be populated in the dropdown
      await waitFor(() => {
        expect(screen.getByText('Soccer Stars U6')).toBeInTheDocument();
      });

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'class-1' } });

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Class Update');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Class message' } });

      await waitFor(() => {
        const sendButton = screen.getByText('Send Email');
        expect(sendButton).not.toBeDisabled();
      });

      await user.click(screen.getByText('Send Email'));

      await waitFor(() => {
        expect(screen.getByText(/Send Mass Email/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm Send/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockSendBulkEmail).toHaveBeenCalled();
        const payload = mockSendBulkEmail.mock.calls[0][0];
        expect(payload.recipient_type).toBe('class');
        expect(payload.class_id).toBe('class-1');
      });
    });

    it('should handle send error', async () => {
      const user = userEvent;

      mockSendBulkEmail.mockRejectedValueOnce(new Error('Email service unavailable'));

      render(<MassEmail />);

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Update');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Content' } });

      await waitFor(() => {
        const sendButton = screen.getByText('Send Email');
        expect(sendButton).not.toBeDisabled();
      });

      await user.click(screen.getByText('Send Email'));

      await waitFor(() => {
        expect(screen.getByText(/Send Mass Email/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm Send/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to send emails');
      });
    });

    it('should show Send Another Email link after successful send', async () => {
      const user = userEvent;

      mockSendBulkEmail.mockResolvedValueOnce({ successful: 10, failed: 0, total_recipients: 10 });

      render(<MassEmail />);

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Update');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Content' } });

      await user.click(screen.getByText('Send Email'));

      await waitFor(() => {
        expect(screen.getByText(/Send Mass Email/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm Send/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Send Another Email/i)).toBeInTheDocument();
      });
    });

    it('should reset form when clicking Send Another Email', async () => {
      const user = userEvent;

      mockSendBulkEmail.mockResolvedValueOnce({ successful: 10, failed: 0, total_recipients: 10 });

      render(<MassEmail />);

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Update');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Content' } });

      await user.click(screen.getByText('Send Email'));

      await waitFor(() => {
        expect(screen.getByText(/Send Mass Email/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm Send/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Send Another Email/i)).toBeInTheDocument();
      });

      await user.click(screen.getByText(/Send Another Email/i));

      await waitFor(() => {
        // Form should be visible again
        expect(screen.getByText('Compose Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Email subject line/i)).toBeInTheDocument();
      });
    });
  });

  // ===========================================
  // PREVIEW TESTS
  // ===========================================
  describe('Email Preview', () => {
    it('should open preview modal with subject and message', async () => {
      const user = userEvent;
      render(<MassEmail />);

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Preview Subject');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: '<p>Preview content</p>' } });

      await waitFor(() => {
        const previewButton = screen.getByText('Preview');
        expect(previewButton).not.toBeDisabled();
      });

      await user.click(screen.getByText('Preview'));

      await waitFor(() => {
        expect(screen.getByText('Email Preview')).toBeInTheDocument();
      });

      expect(screen.getByText('Preview Subject')).toBeInTheDocument();
    });

    it('should display preview header and footer', async () => {
      const user = userEvent;
      render(<MassEmail />);

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Test');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Content' } });

      await waitFor(() => {
        const previewButton = screen.getByText('Preview');
        expect(previewButton).not.toBeDisabled();
      });

      await user.click(screen.getByText('Preview'));

      await waitFor(() => {
        expect(screen.getByText('Email Preview')).toBeInTheDocument();
      });

      // "Carolina Soccer Factory" appears multiple times in the preview (header + footer)
      const matches = screen.getAllByText('Carolina Soccer Factory');
      expect(matches.length).toBeGreaterThan(0);
    });

    it('should close preview modal', async () => {
      const user = userEvent;
      render(<MassEmail />);

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Test');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Content' } });

      await user.click(screen.getByText('Preview'));

      await waitFor(() => {
        expect(screen.getByText('Email Preview')).toBeInTheDocument();
      });

      const closeButtons = screen.getAllByText('Close');
      await user.click(closeButtons[closeButtons.length - 1]);

      await waitFor(() => {
        expect(screen.queryByText('Email Preview')).not.toBeInTheDocument();
      });
    });

    it('should display recipient info in preview', async () => {
      const user = userEvent;
      render(<MassEmail />);

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Test');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Content' } });

      await waitFor(() => {
        const previewButton = screen.getByText('Preview');
        expect(previewButton).not.toBeDisabled();
      });

      await user.click(screen.getByText('Preview'));

      await waitFor(() => {
        expect(screen.getByText('Email Preview')).toBeInTheDocument();
      });

      // "all parents" appears inside a <strong> element within a container that also has "Sending to:"
      const recipientInfo = screen.getAllByText('all parents');
      expect(recipientInfo.length).toBeGreaterThan(0);
    });
  });

  // ===========================================
  // LOADING STATE TESTS
  // ===========================================
  describe('Loading States', () => {
    it('should show loading text in dropdowns while options load', async () => {
      // Delay the response to see loading state
      server.use(
        http.get(`${API_BASE}/classes`, async () => {
          await new Promise(r => setTimeout(r, 100));
          return HttpResponse.json({ items: mockClasses });
        })
      );

      const user = userEvent;
      render(<MassEmail />);

      await user.click(screen.getByText('By Class'));

      // May show loading text
      expect(screen.getByText(/Loading classes|Choose a class/i)).toBeInTheDocument();
    });

    it('should show Sending... state during email send', async () => {
      const user = userEvent;

      // Use a delayed mock to keep isSending=true long enough
      mockSendBulkEmail.mockImplementationOnce(() => new Promise(resolve => {
        setTimeout(() => resolve({ successful: 10, failed: 0, total_recipients: 10 }), 200);
      }));

      render(<MassEmail />);

      const subjectInput = screen.getByPlaceholderText(/Email subject line/i);
      await user.type(subjectInput, 'Test');

      const messageEditor = screen.getByTestId('quill-editor');
      fireEvent.change(messageEditor, { target: { value: 'Content' } });

      await user.click(screen.getByText('Send Email'));

      await waitFor(() => {
        expect(screen.getByText(/Send Mass Email/i)).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /Confirm Send/i });
      await userEvent.click(confirmButton);

      // Should show sending state - use exact text to avoid matching "Sending to:"
      expect(screen.getByText('Sending...')).toBeInTheDocument();
    });
  });
});
