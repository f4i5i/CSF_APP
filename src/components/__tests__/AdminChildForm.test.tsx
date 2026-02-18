/**
 * Unit Tests for AdminChildForm Component
 * Tests open/close, create vs edit mode, form validation, submit, cancel
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminChildForm from '../admin/AdminChildForm';
import toast from 'react-hot-toast';

jest.mock('../../api/services/children.service', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockResolvedValue({ id: 'new-child' }),
    update: jest.fn().mockResolvedValue({ id: 'child-1' }),
  },
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('AdminChildForm Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    mode: 'create' as const,
    initialData: null,
    parentId: 'parent-1',
    parentName: 'John Smith',
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
      render(<AdminChildForm {...defaultProps} />);
      expect(screen.getByText('Add Child')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<AdminChildForm {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Add Child')).not.toBeInTheDocument();
    });

    it('should show "Edit Child" title in edit mode', () => {
      render(
        <AdminChildForm
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'child-1',
            first_name: 'Alice',
            last_name: 'Smith',
            date_of_birth: '2015-06-15',
            grade: '3',
            jersey_size: 'm',
          }}
        />
      );
      expect(screen.getByText('Edit Child')).toBeInTheDocument();
    });

    it('should display parent name', () => {
      render(<AdminChildForm {...defaultProps} />);
      expect(screen.getByText('Parent: John Smith')).toBeInTheDocument();
    });

    it('should not display parent name when not provided', () => {
      render(<AdminChildForm {...defaultProps} parentName={null} />);
      expect(screen.queryByText('Parent:')).not.toBeInTheDocument();
    });

    it('should render First Name input', () => {
      render(<AdminChildForm {...defaultProps} />);
      expect(screen.getByText('First Name *')).toBeInTheDocument();
    });

    it('should render Last Name input', () => {
      render(<AdminChildForm {...defaultProps} />);
      expect(screen.getByText('Last Name *')).toBeInTheDocument();
    });

    it('should render Date of Birth input', () => {
      render(<AdminChildForm {...defaultProps} />);
      expect(screen.getByText('Date of Birth *')).toBeInTheDocument();
    });

    it('should render Grade select', () => {
      render(<AdminChildForm {...defaultProps} />);
      expect(screen.getByText('Grade *')).toBeInTheDocument();
      expect(screen.getByText('Select grade')).toBeInTheDocument();
    });

    it('should render Jersey Size select', () => {
      render(<AdminChildForm {...defaultProps} />);
      expect(screen.getByText('Jersey Size *')).toBeInTheDocument();
      expect(screen.getByText('Select size')).toBeInTheDocument();
    });

    it('should render Attends Afterschool checkbox', () => {
      render(<AdminChildForm {...defaultProps} />);
      expect(screen.getByText('Attends Afterschool')).toBeInTheDocument();
    });

    it('should render Medical Conditions textarea', () => {
      render(<AdminChildForm {...defaultProps} />);
      expect(screen.getByText('Medical Conditions')).toBeInTheDocument();
    });

    it('should render Health Insurance input', () => {
      render(<AdminChildForm {...defaultProps} />);
      expect(screen.getByText('Health Insurance # (optional)')).toBeInTheDocument();
    });

    it('should render Emergency Contact section', () => {
      render(<AdminChildForm {...defaultProps} />);
      expect(screen.getByText('Emergency Contact')).toBeInTheDocument();
    });

    it('should render Cancel and submit buttons', () => {
      render(<AdminChildForm {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Add Child')).toBeInTheDocument();
    });

    it('should show "Save Changes" in edit mode submit button', () => {
      render(
        <AdminChildForm
          {...defaultProps}
          mode="edit"
          initialData={{ id: 'child-1', first_name: 'Alice', last_name: 'Smith', date_of_birth: '2015-06-15', grade: '3', jersey_size: 'm' }}
        />
      );
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('should render grade options', () => {
      render(<AdminChildForm {...defaultProps} />);
      expect(screen.getByText('K')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should render jersey size options', () => {
      render(<AdminChildForm {...defaultProps} />);
      expect(screen.getByText('XS')).toBeInTheDocument();
      expect(screen.getByText('S')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
      expect(screen.getByText('L')).toBeInTheDocument();
      expect(screen.getByText('XL')).toBeInTheDocument();
      expect(screen.getByText('XXL')).toBeInTheDocument();
    });

    it('should render emergency contact relation options', () => {
      render(<AdminChildForm {...defaultProps} />);
      expect(screen.getByText('Select relation')).toBeInTheDocument();
    });
  });

  // ===========================================
  // EDIT MODE TESTS
  // ===========================================
  describe('Edit Mode', () => {
    it('should pre-fill form data in edit mode', () => {
      render(
        <AdminChildForm
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'child-1',
            first_name: 'Alice',
            last_name: 'Smith',
            date_of_birth: '2015-06-15',
            grade: '3',
            jersey_size: 'm',
            medical_conditions: 'Asthma',
            after_school_attendance: true,
            health_insurance_number: 'INS123',
            emergency_contacts: [
              { name: 'Jane', phone: '555-9999', relation: 'Parent' },
            ],
          }}
        />
      );

      const firstNameInputs = screen.getAllByDisplayValue('Alice');
      expect(firstNameInputs.length).toBeGreaterThan(0);

      const lastNameInputs = screen.getAllByDisplayValue('Smith');
      expect(lastNameInputs.length).toBeGreaterThan(0);
    });
  });

  // ===========================================
  // VALIDATION TESTS
  // ===========================================
  describe('Validation', () => {
    it('should show error when first name is empty', async () => {
      render(<AdminChildForm {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Child'));

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });
    });

    it('should show error when last name is empty', async () => {
      render(<AdminChildForm {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Child'));

      await waitFor(() => {
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
      });
    });

    it('should show error when date of birth is empty', async () => {
      render(<AdminChildForm {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Child'));

      await waitFor(() => {
        expect(screen.getByText('Date of birth is required')).toBeInTheDocument();
      });
    });

    it('should show error when grade is not selected', async () => {
      render(<AdminChildForm {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Child'));

      await waitFor(() => {
        expect(screen.getByText('Grade is required')).toBeInTheDocument();
      });
    });

    it('should show error when jersey size is not selected', async () => {
      render(<AdminChildForm {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Child'));

      await waitFor(() => {
        expect(screen.getByText('Jersey size is required')).toBeInTheDocument();
      });
    });

    it('should show all validation errors on empty submit', async () => {
      render(<AdminChildForm {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Child'));

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
        expect(screen.getByText('Date of birth is required')).toBeInTheDocument();
        expect(screen.getByText('Grade is required')).toBeInTheDocument();
        expect(screen.getByText('Jersey size is required')).toBeInTheDocument();
      });
    });

    it('should clear error when field is filled', async () => {
      render(<AdminChildForm {...defaultProps} />);

      fireEvent.click(screen.getByText('Add Child'));

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText(/First Name/);
      fireEvent.change(firstNameInput, { target: { value: 'Alice' } });

      expect(screen.queryByText('First name is required')).not.toBeInTheDocument();
    });
  });

  // ===========================================
  // SUBMIT TESTS
  // ===========================================
  describe('Submit', () => {
    const fillForm = () => {
      // We need to fill in inputs via their name attributes since labels aren't properly associated
      const inputs = screen.getAllByRole('textbox');
      const selects = screen.getAllByRole('combobox');

      // Use name-based targeting
      fireEvent.change(screen.getByLabelText(/First Name/), { target: { value: 'Alice' } });
      fireEvent.change(screen.getByLabelText(/Last Name/), { target: { value: 'Smith' } });

      // Date of birth - find the date input
      const dateInput = document.querySelector('input[name="date_of_birth"]');
      if (dateInput) fireEvent.change(dateInput, { target: { value: '2015-06-15' } });

      // Grade
      const gradeSelect = document.querySelector('select[name="grade"]');
      if (gradeSelect) fireEvent.change(gradeSelect, { target: { value: '3' } });

      // Jersey size
      const jerseySizeSelect = document.querySelector('select[name="jersey_size"]');
      if (jerseySizeSelect) fireEvent.change(jerseySizeSelect, { target: { value: 'm' } });
    };

    it('should call childrenService.create on valid create submit', async () => {
      const childrenService = require('../../api/services/children.service').default;
      render(<AdminChildForm {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByText('Add Child'));

      await waitFor(() => {
        expect(childrenService.create).toHaveBeenCalledWith(
          expect.objectContaining({
            first_name: 'Alice',
            last_name: 'Smith',
            parent_id: 'parent-1',
          })
        );
      });
    });

    it('should call childrenService.update on valid edit submit', async () => {
      const childrenService = require('../../api/services/children.service').default;
      render(
        <AdminChildForm
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'child-1',
            first_name: 'Alice',
            last_name: 'Smith',
            date_of_birth: '2015-06-15',
            grade: '3',
            jersey_size: 'm',
          }}
        />
      );

      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(childrenService.update).toHaveBeenCalledWith(
          'child-1',
          expect.objectContaining({
            first_name: 'Alice',
            last_name: 'Smith',
          })
        );
      });
    });

    it('should show success toast on successful create', async () => {
      render(<AdminChildForm {...defaultProps} />);

      fillForm();
      fireEvent.click(screen.getByText('Add Child'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Child created successfully');
      });
    });

    it('should show success toast on successful edit', async () => {
      render(
        <AdminChildForm
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'child-1',
            first_name: 'Alice',
            last_name: 'Smith',
            date_of_birth: '2015-06-15',
            grade: '3',
            jersey_size: 'm',
          }}
        />
      );

      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Child updated successfully');
      });
    });

    it('should call onSuccess and onClose after successful submit', async () => {
      const onSuccess = jest.fn();
      const onClose = jest.fn();
      render(
        <AdminChildForm
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'child-1',
            first_name: 'Alice',
            last_name: 'Smith',
            date_of_birth: '2015-06-15',
            grade: '3',
            jersey_size: 'm',
          }}
          onSuccess={onSuccess}
          onClose={onClose}
        />
      );

      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('should show error toast on failed submit', async () => {
      const childrenService = require('../../api/services/children.service').default;
      childrenService.update.mockRejectedValueOnce(
        new Error('Failed to update child')
      );

      render(
        <AdminChildForm
          {...defaultProps}
          mode="edit"
          initialData={{
            id: 'child-1',
            first_name: 'Alice',
            last_name: 'Smith',
            date_of_birth: '2015-06-15',
            grade: '3',
            jersey_size: 'm',
          }}
        />
      );

      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  // ===========================================
  // CLOSE / CANCEL TESTS
  // ===========================================
  describe('Close / Cancel', () => {
    it('should call onClose when Cancel button is clicked', () => {
      const onClose = jest.fn();
      render(<AdminChildForm {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when X button is clicked', () => {
      const onClose = jest.fn();
      render(<AdminChildForm {...defaultProps} onClose={onClose} />);

      const allButtons = screen.getAllByRole('button');
      const xButton = allButtons.find(
        (btn) =>
          btn.querySelector('svg') &&
          !btn.textContent?.includes('Cancel') &&
          !btn.textContent?.includes('Add Child')
      );
      if (xButton) {
        fireEvent.click(xButton);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  // ===========================================
  // CHECKBOX BEHAVIOR TESTS
  // ===========================================
  describe('Checkbox Behavior', () => {
    it('should toggle after school checkbox', () => {
      render(<AdminChildForm {...defaultProps} />);

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();

      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });
});
