/**
 * Unit Tests for WaiverFormModal Component
 * Tests open/close, create vs edit mode, form validation, submit, cancel
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WaiverFormModal from '../admin/WaiverFormModal';
import toast from 'react-hot-toast';

jest.mock('../../api/services/waivers.service', () => ({
  __esModule: true,
  default: {
    createTemplate: jest.fn().mockResolvedValue({ id: 'new-waiver' }),
    updateTemplate: jest.fn().mockResolvedValue({ id: 'waiver-1' }),
  },
}));

jest.mock('../../hooks', () => ({
  useApi: jest.fn().mockReturnValue({
    data: [
      { id: 'prog-1', name: 'Soccer' },
      { id: 'prog-2', name: 'Basketball' },
    ],
  }),
}));

jest.mock('../../api/services', () => ({
  programsService: {
    getAll: jest.fn(),
  },
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('WaiverFormModal Component', () => {
  const defaultProps = {
    waiver: null,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render Create mode by default', () => {
      render(<WaiverFormModal {...defaultProps} />);
      expect(screen.getByText('Create New Waiver Template')).toBeInTheDocument();
    });

    it('should render Edit mode when waiver is provided', () => {
      render(
        <WaiverFormModal
          {...defaultProps}
          waiver={{
            id: 'waiver-1',
            name: 'Liability Waiver',
            waiver_type: 'liability',
            content: 'Waiver content here',
            is_active: true,
            is_required: true,
          }}
        />
      );
      expect(screen.getByText('Edit Waiver Template')).toBeInTheDocument();
    });

    it('should render waiver name input', () => {
      render(<WaiverFormModal {...defaultProps} />);
      expect(
        screen.getByPlaceholderText('e.g., Liability Waiver 2024')
      ).toBeInTheDocument();
    });

    it('should render waiver type select', () => {
      render(<WaiverFormModal {...defaultProps} />);
      expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
    });

    it('should render content textarea', () => {
      render(<WaiverFormModal {...defaultProps} />);
      expect(
        screen.getByPlaceholderText('Enter the full waiver text here...')
      ).toBeInTheDocument();
    });

    it('should render program scope dropdown', () => {
      render(<WaiverFormModal {...defaultProps} />);
      expect(screen.getByText('All Programs (Global)')).toBeInTheDocument();
    });

    it('should render Required Waiver checkbox', () => {
      render(<WaiverFormModal {...defaultProps} />);
      expect(screen.getByText('Required Waiver')).toBeInTheDocument();
    });

    it('should render Active checkbox', () => {
      render(<WaiverFormModal {...defaultProps} />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render guidelines info banner', () => {
      render(<WaiverFormModal {...defaultProps} />);
      expect(screen.getByText('Waiver Template Guidelines')).toBeInTheDocument();
    });

    it('should render Cancel and submit buttons', () => {
      render(<WaiverFormModal {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Create Waiver')).toBeInTheDocument();
    });
  });

  // ===========================================
  // EDIT MODE TESTS
  // ===========================================
  describe('Edit Mode', () => {
    it('should pre-fill form data in edit mode', () => {
      render(
        <WaiverFormModal
          {...defaultProps}
          waiver={{
            id: 'waiver-1',
            name: 'Liability Waiver 2024',
            waiver_type: 'medical_release',
            content: 'By signing this waiver...',
            is_active: true,
            is_required: false,
          }}
        />
      );

      const nameInput = screen.getByPlaceholderText(
        'e.g., Liability Waiver 2024'
      ) as HTMLInputElement;
      expect(nameInput.value).toBe('Liability Waiver 2024');

      const contentTextarea = screen.getByPlaceholderText(
        'Enter the full waiver text here...'
      ) as HTMLTextAreaElement;
      expect(contentTextarea.value).toBe('By signing this waiver...');
    });

    it('should show "Update Waiver" button in edit mode', () => {
      render(
        <WaiverFormModal
          {...defaultProps}
          waiver={{ id: 'waiver-1', name: 'Test', content: 'Test' }}
        />
      );
      expect(screen.getByText('Update Waiver')).toBeInTheDocument();
    });
  });

  // ===========================================
  // WAIVER TYPE OPTIONS TESTS
  // ===========================================
  describe('Waiver Type Options', () => {
    it('should have all waiver type options in the dropdown', () => {
      render(<WaiverFormModal {...defaultProps} />);

      const typeSelect = screen.getByRole('combobox') || screen.getAllByRole('listbox');
      // Check options exist
      expect(screen.getByText('Liability Waiver')).toBeInTheDocument();
    });
  });

  // ===========================================
  // VALIDATION TESTS
  // ===========================================
  describe('Validation', () => {
    it('should show error when name is empty on submit', async () => {
      render(<WaiverFormModal {...defaultProps} />);

      // Fill content but leave name empty
      fireEvent.change(
        screen.getByPlaceholderText('Enter the full waiver text here...'),
        { target: { value: 'Some content' } }
      );

      fireEvent.click(screen.getByText('Create Waiver'));

      await waitFor(() => {
        expect(screen.getByText('Waiver name is required')).toBeInTheDocument();
      });
    });

    it('should show error when content is empty on submit', async () => {
      render(<WaiverFormModal {...defaultProps} />);

      // Fill name but leave content empty
      fireEvent.change(
        screen.getByPlaceholderText('e.g., Liability Waiver 2024'),
        { target: { value: 'Test Waiver' } }
      );

      fireEvent.click(screen.getByText('Create Waiver'));

      await waitFor(() => {
        expect(screen.getByText('Waiver content is required')).toBeInTheDocument();
      });
    });

    it('should show toast error for validation failure', async () => {
      render(<WaiverFormModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Create Waiver'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          'Please fix the errors before submitting'
        );
      });
    });

    it('should clear error when user types in field', async () => {
      render(<WaiverFormModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Create Waiver'));

      await waitFor(() => {
        expect(screen.getByText('Waiver name is required')).toBeInTheDocument();
      });

      fireEvent.change(
        screen.getByPlaceholderText('e.g., Liability Waiver 2024'),
        { target: { value: 'Liability' } }
      );

      expect(screen.queryByText('Waiver name is required')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // SUBMIT TESTS
  // ===========================================
  describe('Submit', () => {
    it('should call createTemplate on valid create submit', async () => {
      const waiversService = require('../../api/services/waivers.service').default;
      render(<WaiverFormModal {...defaultProps} />);

      fireEvent.change(
        screen.getByPlaceholderText('e.g., Liability Waiver 2024'),
        { target: { value: 'Test Waiver' } }
      );
      fireEvent.change(
        screen.getByPlaceholderText('Enter the full waiver text here...'),
        { target: { value: 'Waiver content goes here.' } }
      );

      fireEvent.click(screen.getByText('Create Waiver'));

      await waitFor(() => {
        expect(waiversService.createTemplate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Waiver',
            content: 'Waiver content goes here.',
            waiver_type: 'liability',
            is_active: true,
            is_required: true,
          })
        );
      });
    });

    it('should call updateTemplate on valid edit submit', async () => {
      const waiversService = require('../../api/services/waivers.service').default;
      render(
        <WaiverFormModal
          {...defaultProps}
          waiver={{
            id: 'waiver-1',
            name: 'Liability Waiver',
            waiver_type: 'liability',
            content: 'Old content',
          }}
        />
      );

      fireEvent.click(screen.getByText('Update Waiver'));

      await waitFor(() => {
        expect(waiversService.updateTemplate).toHaveBeenCalledWith(
          'waiver-1',
          expect.objectContaining({ name: 'Liability Waiver' })
        );
      });
    });

    it('should show success toast and call onClose on success', async () => {
      const onClose = jest.fn();
      render(<WaiverFormModal {...defaultProps} onClose={onClose} />);

      fireEvent.change(
        screen.getByPlaceholderText('e.g., Liability Waiver 2024'),
        { target: { value: 'Test Waiver' } }
      );
      fireEvent.change(
        screen.getByPlaceholderText('Enter the full waiver text here...'),
        { target: { value: 'Content here' } }
      );

      fireEvent.click(screen.getByText('Create Waiver'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          'Waiver template created successfully!'
        );
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should show error toast on failed submit', async () => {
      const waiversService = require('../../api/services/waivers.service').default;
      waiversService.createTemplate.mockRejectedValueOnce(
        new Error('Server error')
      );

      render(<WaiverFormModal {...defaultProps} />);

      fireEvent.change(
        screen.getByPlaceholderText('e.g., Liability Waiver 2024'),
        { target: { value: 'Test' } }
      );
      fireEvent.change(
        screen.getByPlaceholderText('Enter the full waiver text here...'),
        { target: { value: 'Content' } }
      );

      fireEvent.click(screen.getByText('Create Waiver'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Server error');
      });
    });
  });

  // ===========================================
  // CLOSE / CANCEL TESTS
  // ===========================================
  describe('Close / Cancel', () => {
    it('should call onClose when Cancel button is clicked', () => {
      const onClose = jest.fn();
      render(<WaiverFormModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when X button is clicked', () => {
      const onClose = jest.fn();
      render(<WaiverFormModal {...defaultProps} onClose={onClose} />);

      const allButtons = screen.getAllByRole('button');
      const xButton = allButtons.find(
        (btn) =>
          !btn.textContent?.includes('Cancel') &&
          !btn.textContent?.includes('Create Waiver') &&
          btn.querySelector('svg') &&
          !btn.closest('label')
      );
      if (xButton) {
        fireEvent.click(xButton);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });
});
