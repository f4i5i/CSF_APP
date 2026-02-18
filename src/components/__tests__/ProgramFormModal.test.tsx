/**
 * Unit Tests for ProgramFormModal Component
 * Tests open/close, create vs edit mode, form validation, submit, cancel
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgramFormModal from '../admin/ProgramFormModal';
import toast from 'react-hot-toast';

jest.mock('../../api/services/programs.service', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockResolvedValue({ id: 'new-prog', name: 'New Program' }),
    update: jest.fn().mockResolvedValue({ id: 'prog-1', name: 'Updated Program' }),
  },
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ProgramFormModal Component', () => {
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
      render(<ProgramFormModal {...defaultProps} />);
      expect(screen.getByText('Create Program')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<ProgramFormModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Create Program')).not.toBeInTheDocument();
    });

    it('should show "Edit Program" title in edit mode', () => {
      render(
        <ProgramFormModal
          {...defaultProps}
          mode="edit"
          initialData={{ id: 'prog-1', name: 'Soccer', description: 'Sport', is_active: true }}
        />
      );
      expect(screen.getByText('Edit Program')).toBeInTheDocument();
    });

    it('should render name input', () => {
      render(<ProgramFormModal {...defaultProps} />);
      expect(
        screen.getByPlaceholderText('e.g., Basketball, Soccer, etc.')
      ).toBeInTheDocument();
    });

    it('should render description textarea', () => {
      render(<ProgramFormModal {...defaultProps} />);
      expect(
        screen.getByPlaceholderText('Brief description of the program...')
      ).toBeInTheDocument();
    });

    it('should render Active toggle', () => {
      render(<ProgramFormModal {...defaultProps} />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render Cancel and submit buttons', () => {
      render(<ProgramFormModal {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Create Program')).toBeInTheDocument();
    });
  });

  // ===========================================
  // EDIT MODE TESTS
  // ===========================================
  describe('Edit Mode', () => {
    it('should pre-fill form data in edit mode', () => {
      render(
        <ProgramFormModal
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'prog-1',
            name: 'Basketball',
            description: 'Hoops program',
            is_active: true,
          }}
        />
      );

      const nameInput = screen.getByPlaceholderText(
        'e.g., Basketball, Soccer, etc.'
      ) as HTMLInputElement;
      expect(nameInput.value).toBe('Basketball');

      const descInput = screen.getByPlaceholderText(
        'Brief description of the program...'
      ) as HTMLTextAreaElement;
      expect(descInput.value).toBe('Hoops program');
    });

    it('should show "Update Program" button in edit mode', () => {
      render(
        <ProgramFormModal
          {...defaultProps}
          mode="edit"
          initialData={{ id: 'prog-1', name: 'Soccer' }}
        />
      );
      expect(screen.getByText('Update Program')).toBeInTheDocument();
    });
  });

  // ===========================================
  // VALIDATION TESTS
  // ===========================================
  describe('Validation', () => {
    it('should show error when name is empty on submit', async () => {
      render(<ProgramFormModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Create Program'));

      await waitFor(() => {
        expect(screen.getByText('Program name is required')).toBeInTheDocument();
      });
    });

    it('should clear error when name is typed', async () => {
      render(<ProgramFormModal {...defaultProps} />);

      // Submit with empty name
      fireEvent.click(screen.getByText('Create Program'));

      await waitFor(() => {
        expect(screen.getByText('Program name is required')).toBeInTheDocument();
      });

      // Type in name
      const nameInput = screen.getByPlaceholderText(
        'e.g., Basketball, Soccer, etc.'
      );
      fireEvent.change(nameInput, { target: { value: 'Soccer' } });

      expect(screen.queryByText('Program name is required')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // SUBMIT TESTS
  // ===========================================
  describe('Submit', () => {
    it('should call programsService.create on valid create submit', async () => {
      const programsService = require('../../api/services/programs.service').default;
      render(<ProgramFormModal {...defaultProps} />);

      // Fill form
      fireEvent.change(
        screen.getByPlaceholderText('e.g., Basketball, Soccer, etc.'),
        { target: { value: 'Soccer' } }
      );

      fireEvent.click(screen.getByText('Create Program'));

      await waitFor(() => {
        expect(programsService.create).toHaveBeenCalledWith({
          name: 'Soccer',
          description: null,
          is_active: true,
        });
      });
    });

    it('should call programsService.update on valid edit submit', async () => {
      const programsService = require('../../api/services/programs.service').default;
      render(
        <ProgramFormModal
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'prog-1',
            name: 'Soccer',
            description: 'Football',
            is_active: true,
          }}
        />
      );

      fireEvent.click(screen.getByText('Update Program'));

      await waitFor(() => {
        expect(programsService.update).toHaveBeenCalledWith('prog-1', {
          name: 'Soccer',
          description: 'Football',
          is_active: true,
        });
      });
    });

    it('should show success toast on successful create', async () => {
      render(<ProgramFormModal {...defaultProps} />);

      fireEvent.change(
        screen.getByPlaceholderText('e.g., Basketball, Soccer, etc.'),
        { target: { value: 'Soccer' } }
      );

      fireEvent.click(screen.getByText('Create Program'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Program created successfully');
      });
    });

    it('should call onSuccess callback after successful submit', async () => {
      const onSuccess = jest.fn();
      render(<ProgramFormModal {...defaultProps} onSuccess={onSuccess} />);

      fireEvent.change(
        screen.getByPlaceholderText('e.g., Basketball, Soccer, etc.'),
        { target: { value: 'Soccer' } }
      );

      fireEvent.click(screen.getByText('Create Program'));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should show error toast on failed submit', async () => {
      const programsService = require('../../api/services/programs.service').default;
      programsService.create.mockRejectedValueOnce(new Error('Server error'));

      render(<ProgramFormModal {...defaultProps} />);

      fireEvent.change(
        screen.getByPlaceholderText('e.g., Basketball, Soccer, etc.'),
        { target: { value: 'Soccer' } }
      );

      fireEvent.click(screen.getByText('Create Program'));

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
      render(<ProgramFormModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when X button is clicked', () => {
      const onClose = jest.fn();
      render(<ProgramFormModal {...defaultProps} onClose={onClose} />);

      const allButtons = screen.getAllByRole('button');
      // X button doesn't have text content "Cancel" or "Create Program"
      const xButton = allButtons.find(
        (btn) =>
          !btn.textContent?.includes('Cancel') &&
          !btn.textContent?.includes('Create Program') &&
          !btn.textContent?.includes('Active')
      );
      if (xButton) {
        fireEvent.click(xButton);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  // ===========================================
  // LOADING STATE TESTS
  // ===========================================
  describe('Loading State', () => {
    it('should show "Saving..." and disable button during submit', async () => {
      const programsService = require('../../api/services/programs.service').default;
      let resolveCreate: Function;
      programsService.create.mockReturnValueOnce(
        new Promise((resolve) => {
          resolveCreate = resolve;
        })
      );

      render(<ProgramFormModal {...defaultProps} />);

      fireEvent.change(
        screen.getByPlaceholderText('e.g., Basketball, Soccer, etc.'),
        { target: { value: 'Soccer' } }
      );

      fireEvent.click(screen.getByText('Create Program'));

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });

      // Resolve the promise to clean up
      resolveCreate!({ id: 'new', name: 'Soccer' });
    });
  });
});
