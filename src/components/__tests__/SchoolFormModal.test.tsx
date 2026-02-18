/**
 * Unit Tests for SchoolFormModal Component
 * Tests open/close, create vs edit mode, form validation, submit, cancel
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SchoolFormModal from '../admin/SchoolFormModal';
import toast from 'react-hot-toast';

jest.mock('../../api/services/schools.service', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockResolvedValue({ id: 'new-school', name: 'New School' }),
    update: jest.fn().mockResolvedValue({ id: 'school-1', name: 'Updated School' }),
  },
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('SchoolFormModal Component', () => {
  const mockAreas = [
    { id: 'area-1', name: 'North Region' },
    { id: 'area-2', name: 'South Region' },
  ];

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    mode: 'create' as const,
    initialData: null,
    onSuccess: jest.fn(),
    areas: mockAreas,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ===========================================
  // RENDERING TESTS
  // ===========================================
  describe('Rendering', () => {
    it('should render when isOpen is true', () => {
      render(<SchoolFormModal {...defaultProps} />);
      expect(screen.getByText('Create Site')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<SchoolFormModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Create Site')).not.toBeInTheDocument();
    });

    it('should show "Edit Site" title in edit mode', () => {
      render(
        <SchoolFormModal
          {...defaultProps}
          mode="edit"
          initialData={{ id: 'school-1', name: 'Lincoln Elementary' }}
        />
      );
      expect(screen.getByText('Edit Site')).toBeInTheDocument();
    });

    it('should render required fields notice', () => {
      render(<SchoolFormModal {...defaultProps} />);
      expect(screen.getByText(/Fields marked with/)).toBeInTheDocument();
    });

    it('should render Site Name input', () => {
      render(<SchoolFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('e.g., Lincoln Elementary Site')).toBeInTheDocument();
    });

    it('should render Site Code input', () => {
      render(<SchoolFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('e.g., LES001')).toBeInTheDocument();
    });

    it('should render Street Address input', () => {
      render(<SchoolFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('123 Main Street')).toBeInTheDocument();
    });

    it('should render City input', () => {
      render(<SchoolFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('e.g., Charlotte')).toBeInTheDocument();
    });

    it('should render State select', () => {
      render(<SchoolFormModal {...defaultProps} />);
      expect(screen.getByText('Select State')).toBeInTheDocument();
    });

    it('should render ZIP Code input', () => {
      render(<SchoolFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('12345')).toBeInTheDocument();
    });

    it('should render Active toggle', () => {
      render(<SchoolFormModal {...defaultProps} />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render Cancel and submit buttons', () => {
      render(<SchoolFormModal {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Create Site')).toBeInTheDocument();
    });
  });

  // ===========================================
  // EDIT MODE TESTS
  // ===========================================
  describe('Edit Mode', () => {
    it('should pre-fill form data in edit mode', () => {
      render(
        <SchoolFormModal
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'school-1',
            name: 'Lincoln Elementary',
            code: 'LES001',
            address: '456 Oak Ave',
            city: 'Charlotte',
            state: 'NC',
            zip_code: '28202',
            area_id: 'area-1',
            is_active: true,
          }}
        />
      );

      const nameInput = screen.getByPlaceholderText(
        'e.g., Lincoln Elementary Site'
      ) as HTMLInputElement;
      expect(nameInput.value).toBe('Lincoln Elementary');

      const codeInput = screen.getByPlaceholderText('e.g., LES001') as HTMLInputElement;
      expect(codeInput.value).toBe('LES001');
    });

    it('should show "Update Site" button in edit mode', () => {
      render(
        <SchoolFormModal
          {...defaultProps}
          mode="edit"
          initialData={{ id: 'school-1', name: 'Test' }}
        />
      );
      expect(screen.getByText('Update Site')).toBeInTheDocument();
    });
  });

  // ===========================================
  // VALIDATION TESTS
  // ===========================================
  describe('Validation', () => {
    it('should show all required field errors on empty submit', async () => {
      render(<SchoolFormModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Create Site'));

      await waitFor(() => {
        expect(screen.getByText('Site name is required')).toBeInTheDocument();
        expect(screen.getByText('Address is required')).toBeInTheDocument();
        expect(screen.getByText('City is required')).toBeInTheDocument();
        expect(screen.getByText('State is required')).toBeInTheDocument();
        expect(screen.getByText('ZIP code is required')).toBeInTheDocument();
        expect(screen.getByText('Area is required')).toBeInTheDocument();
      });
    });

    it('should show error summary with count', async () => {
      render(<SchoolFormModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Create Site'));

      await waitFor(() => {
        expect(screen.getByText(/Please fill in all required fields/)).toBeInTheDocument();
        expect(screen.getByText(/6 missing/)).toBeInTheDocument();
      });
    });

    it('should clear field error when user types', async () => {
      render(<SchoolFormModal {...defaultProps} />);

      fireEvent.click(screen.getByText('Create Site'));

      await waitFor(() => {
        expect(screen.getByText('Site name is required')).toBeInTheDocument();
      });

      fireEvent.change(
        screen.getByPlaceholderText('e.g., Lincoln Elementary Site'),
        { target: { value: 'My School' } }
      );

      expect(screen.queryByText('Site name is required')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // SUBMIT TESTS
  // ===========================================
  describe('Submit', () => {
    const fillForm = () => {
      fireEvent.change(
        screen.getByPlaceholderText('e.g., Lincoln Elementary Site'),
        { target: { value: 'Lincoln Elementary' } }
      );
      fireEvent.change(
        screen.getByPlaceholderText('123 Main Street'),
        { target: { value: '456 Oak Ave' } }
      );
      fireEvent.change(
        screen.getByPlaceholderText('e.g., Charlotte'),
        { target: { value: 'Charlotte' } }
      );
      // State needs to be set via select
      const stateSelect = screen.getByText('Select State').closest('select');
      if (stateSelect) {
        fireEvent.change(stateSelect, { target: { value: 'NC' } });
      }
      fireEvent.change(
        screen.getByPlaceholderText('12345'),
        { target: { value: '28202' } }
      );
      // Area needs CustomDropdown click - we'll test service calls with edit mode instead
    };

    it('should show success toast on successful edit submit', async () => {
      const schoolsService = require('../../api/services/schools.service').default;
      render(
        <SchoolFormModal
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'school-1',
            name: 'Lincoln',
            address: '123 Main',
            city: 'Charlotte',
            state: 'NC',
            zip_code: '28202',
            area_id: 'area-1',
            is_active: true,
          }}
        />
      );

      fireEvent.click(screen.getByText('Update Site'));

      await waitFor(() => {
        expect(schoolsService.update).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Site updated successfully');
      });
    });

    it('should show error toast on failed submit', async () => {
      const schoolsService = require('../../api/services/schools.service').default;
      schoolsService.update.mockRejectedValueOnce(new Error('Network error'));

      render(
        <SchoolFormModal
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'school-1',
            name: 'Lincoln',
            address: '123 Main',
            city: 'Charlotte',
            state: 'NC',
            zip_code: '28202',
            area_id: 'area-1',
            is_active: true,
          }}
        />
      );

      fireEvent.click(screen.getByText('Update Site'));

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
      render(<SchoolFormModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalled();
    });
  });
});
