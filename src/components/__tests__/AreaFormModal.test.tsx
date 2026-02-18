/**
 * Unit Tests for AreaFormModal Component
 * Tests open/close, create vs edit mode, form validation, submit, cancel
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AreaFormModal from '../admin/AreaFormModal';
import toast from 'react-hot-toast';

jest.mock('../../api/services/areas.service', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockResolvedValue({ id: 'new-area', name: 'New Area' }),
    update: jest.fn().mockResolvedValue({ id: 'area-1', name: 'Updated Area' }),
  },
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('AreaFormModal Component', () => {
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
      render(<AreaFormModal {...defaultProps} />);
      expect(screen.getByText('Create Area')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<AreaFormModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Create Area')).not.toBeInTheDocument();
    });

    it('should show "Edit Area" title in edit mode', () => {
      render(
        <AreaFormModal
          {...defaultProps}
          mode="edit"
          initialData={{ id: 'area-1', name: 'North', description: 'North region', is_active: true }}
        />
      );
      expect(screen.getByText('Edit Area')).toBeInTheDocument();
    });

    it('should render name input', () => {
      render(<AreaFormModal {...defaultProps} />);
      expect(
        screen.getByPlaceholderText('e.g., North Region, Downtown, etc.')
      ).toBeInTheDocument();
    });

    it('should render description textarea', () => {
      render(<AreaFormModal {...defaultProps} />);
      expect(
        screen.getByPlaceholderText('Brief description of the area...')
      ).toBeInTheDocument();
    });

    it('should render Active toggle', () => {
      render(<AreaFormModal {...defaultProps} />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render Cancel and Create Area buttons', () => {
      render(<AreaFormModal {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Create Area')).toBeInTheDocument();
    });
  });

  // ===========================================
  // EDIT MODE TESTS
  // ===========================================
  describe('Edit Mode', () => {
    it('should pre-fill form data in edit mode', () => {
      render(
        <AreaFormModal
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'area-1',
            name: 'North Region',
            description: 'Northern area',
            is_active: false,
          }}
        />
      );

      const nameInput = screen.getByPlaceholderText(
        'e.g., North Region, Downtown, etc.'
      ) as HTMLInputElement;
      expect(nameInput.value).toBe('North Region');

      const descInput = screen.getByPlaceholderText(
        'Brief description of the area...'
      ) as HTMLTextAreaElement;
      expect(descInput.value).toBe('Northern area');
    });

    it('should show "Update Area" button in edit mode', () => {
      render(
        <AreaFormModal
          {...defaultProps}
          mode="edit"
          initialData={{ id: 'area-1', name: 'North' }}
        />
      );
      expect(screen.getByText('Update Area')).toBeInTheDocument();
    });
  });

  // ===========================================
  // VALIDATION TESTS
  // ===========================================
  describe('Validation', () => {
    it('should show error when name is empty on submit', async () => {
      render(<AreaFormModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Create Area'));

      await waitFor(() => {
        expect(screen.getByText('Area name is required')).toBeInTheDocument();
      });
    });

    it('should clear error when name is typed', async () => {
      render(<AreaFormModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Create Area'));
      await waitFor(() => {
        expect(screen.getByText('Area name is required')).toBeInTheDocument();
      });

      const nameInput = screen.getByPlaceholderText(
        'e.g., North Region, Downtown, etc.'
      );
      fireEvent.change(nameInput, { target: { value: 'North' } });

      expect(screen.queryByText('Area name is required')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // SUBMIT TESTS
  // ===========================================
  describe('Submit', () => {
    it('should call areasService.create on valid create submit', async () => {
      const areasService = require('../../api/services/areas.service').default;
      render(<AreaFormModal {...defaultProps} />);

      fireEvent.change(
        screen.getByPlaceholderText('e.g., North Region, Downtown, etc.'),
        { target: { value: 'North Region' } }
      );

      fireEvent.click(screen.getByText('Create Area'));

      await waitFor(() => {
        expect(areasService.create).toHaveBeenCalledWith({
          name: 'North Region',
          description: null,
          is_active: true,
        });
      });
    });

    it('should call areasService.update on valid edit submit', async () => {
      const areasService = require('../../api/services/areas.service').default;
      render(
        <AreaFormModal
          {...defaultProps}
          mode="edit"
          initialData={{ id: 'area-1', name: 'North', description: 'North region', is_active: true }}
        />
      );

      fireEvent.click(screen.getByText('Update Area'));

      await waitFor(() => {
        expect(areasService.update).toHaveBeenCalledWith('area-1', {
          name: 'North',
          description: 'North region',
          is_active: true,
        });
      });
    });

    it('should show success toast on successful create', async () => {
      render(<AreaFormModal {...defaultProps} />);

      fireEvent.change(
        screen.getByPlaceholderText('e.g., North Region, Downtown, etc.'),
        { target: { value: 'North' } }
      );

      fireEvent.click(screen.getByText('Create Area'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Area created successfully');
      });
    });

    it('should show error toast on failed submit', async () => {
      const areasService = require('../../api/services/areas.service').default;
      areasService.create.mockRejectedValueOnce(new Error('Network error'));

      render(<AreaFormModal {...defaultProps} />);

      fireEvent.change(
        screen.getByPlaceholderText('e.g., North Region, Downtown, etc.'),
        { target: { value: 'North' } }
      );

      fireEvent.click(screen.getByText('Create Area'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Network error');
      });
    });
  });

  // ===========================================
  // CLOSE / CANCEL TESTS
  // ===========================================
  describe('Close / Cancel', () => {
    it('should call onClose when Cancel button is clicked', () => {
      const onClose = jest.fn();
      render(<AreaFormModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalled();
    });
  });
});
