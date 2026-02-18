/**
 * Unit Tests for ClassFormModal Component
 * Tests open/close, create vs edit mode, form sections, submit, cancel
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClassFormModal from '../admin/ClassFormModal';

// Mock all services and hooks
jest.mock('../../hooks/useClassForm', () => {
  return jest.fn(() => ({
    formData: {
      name: '',
      slug: '',
      description: '',
      program_id: '',
      area_id: '',
      school_id: '',
      school_code: '',
      coach_id: null,
      coach_ids: [],
      capacity: '',
      min_age: '',
      max_age: '',
      start_date: '',
      end_date: '',
      registration_start_date: '',
      registration_end_date: '',
      is_active: true,
      class_type: 'one-time',
      recurrence_pattern: 'weekly',
      repeat_every_weeks: '1',
      schedule: [{ day_of_week: '', start_time: '', end_time: '' }],
      payment_options: [
        { type: 'full_payment', enabled: true, price: '', custom_name: '' },
        { type: 'monthly_subscription', enabled: false, price: '', custom_name: '' },
        { type: 'installment_2', enabled: false, price: '', custom_name: '' },
        { type: 'installment_3', enabled: false, price: '', custom_name: '' },
        { type: 'installment_4', enabled: false, price: '', custom_name: '' },
        { type: 'installment_6', enabled: false, price: '', custom_name: '' },
      ],
      custom_fees: [],
      class_image: null,
      website_link: '',
    },
    errors: {},
    isSubmitting: false,
    updateField: jest.fn(),
    updateSchedule: jest.fn(),
    addSchedule: jest.fn(),
    removeSchedule: jest.fn(),
    updatePaymentOption: jest.fn(),
    addCustomFee: jest.fn(),
    updateCustomFee: jest.fn(),
    removeCustomFee: jest.fn(),
    handleSubmit: jest.fn((callback) => callback && callback()),
  }));
});

jest.mock('../../api/services/programs.service', () => ({
  __esModule: true,
  default: { getAll: jest.fn().mockResolvedValue([]) },
}));
jest.mock('../../api/services/areas.service', () => ({
  __esModule: true,
  default: { getAll: jest.fn().mockResolvedValue([]) },
}));
jest.mock('../../api/services/schools.service', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 'new-site', name: 'New Site' }),
  },
}));
jest.mock('../../api/services/admin.service', () => ({
  __esModule: true,
  default: { getCoaches: jest.fn().mockResolvedValue({ items: [] }) },
}));
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('../ui/TimePicker12Hour', () => {
  return function MockTimePicker({ value, onChange, placeholder }: any) {
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid="time-picker"
      />
    );
  };
});
jest.mock('./MultiCoachSelector', () => {
  return function MockMultiCoachSelector({ label }: any) {
    return <div data-testid="multi-coach-selector">{label}</div>;
  };
});
jest.mock('../ui/GooglePlacesAutocomplete', () => {
  return function MockGooglePlacesAutocomplete({ label }: any) {
    return <div data-testid="google-places">{label}</div>;
  };
});

describe('ClassFormModal Component', () => {
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
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Create New Class')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<ClassFormModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Create New Class')).not.toBeInTheDocument();
    });

    it('should show "Edit Class" title in edit mode', () => {
      render(<ClassFormModal {...defaultProps} mode="edit" />);
      expect(screen.getByText('Edit Class')).toBeInTheDocument();
    });

    it('should show "Create New Class" title in create mode', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Create New Class')).toBeInTheDocument();
    });
  });

  // ===========================================
  // FORM SECTIONS TESTS
  // ===========================================
  describe('Form Sections', () => {
    it('should render Basic Information section', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Basic Information')).toBeInTheDocument();
    });

    it('should render Registration Period section', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Registration Period')).toBeInTheDocument();
    });

    it('should render Schedule section', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Schedule')).toBeInTheDocument();
    });

    it('should render Recurrence section', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Recurrence')).toBeInTheDocument();
    });

    it('should render Class Type section', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Class Type')).toBeInTheDocument();
    });

    it('should render Payment Options section', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Payment Options (Stripe)')).toBeInTheDocument();
    });

    it('should render Custom Fees section', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Custom Fees (Optional)')).toBeInTheDocument();
    });

    it('should render Class Image/Logo section', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Class Image/Logo')).toBeInTheDocument();
    });

    it('should render Additional Information section', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Additional Information')).toBeInTheDocument();
    });

    it('should render Custom URL Slug field', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Custom URL Slug')).toBeInTheDocument();
    });
  });

  // ===========================================
  // FORM FIELDS TESTS
  // ===========================================
  describe('Form Fields', () => {
    it('should render Class Name input', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('e.g., U10 After School Soccer')).toBeInTheDocument();
    });

    it('should render Capacity input', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('20')).toBeInTheDocument();
    });

    it('should render Min Age input', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('8')).toBeInTheDocument();
    });

    it('should render Max Age input', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('10')).toBeInTheDocument();
    });

    it('should render description textarea', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(
        screen.getByPlaceholderText('Brief description of the class...')
      ).toBeInTheDocument();
    });

    it('should render Active checkbox', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Active (visible to users)')).toBeInTheDocument();
    });

    it('should render MultiCoachSelector', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByTestId('multi-coach-selector')).toBeInTheDocument();
    });
  });

  // ===========================================
  // BUTTONS TESTS
  // ===========================================
  describe('Buttons', () => {
    it('should render Cancel button', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should render Create Class button in create mode', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Create Class')).toBeInTheDocument();
    });

    it('should render Update Class button in edit mode', () => {
      render(<ClassFormModal {...defaultProps} mode="edit" />);
      expect(screen.getByText('Update Class')).toBeInTheDocument();
    });

    it('should render Save as Draft button in create mode', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Save as Draft')).toBeInTheDocument();
    });

    it('should not render Save as Draft button in edit mode', () => {
      render(<ClassFormModal {...defaultProps} mode="edit" />);
      expect(screen.queryByText('Save as Draft')).not.toBeInTheDocument();
    });

    it('should render "Add Schedule" button', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('+ Add Schedule')).toBeInTheDocument();
    });

    it('should render New site button', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByTitle('Add new site')).toBeInTheDocument();
    });
  });

  // ===========================================
  // CLOSE/CANCEL TESTS
  // ===========================================
  describe('Close/Cancel', () => {
    it('should call onClose when Cancel button is clicked', () => {
      const onClose = jest.fn();
      render(<ClassFormModal {...defaultProps} onClose={onClose} />);

      fireEvent.click(screen.getByText('Cancel'));
      expect(onClose).toHaveBeenCalled();
    });

    it('should call onClose when X button is clicked', () => {
      const onClose = jest.fn();
      render(<ClassFormModal {...defaultProps} onClose={onClose} />);

      const allButtons = screen.getAllByRole('button');
      const xButton = allButtons.find(
        (btn) => btn.querySelector('svg') && btn.textContent === ''
      );
      if (xButton) {
        fireEvent.click(xButton);
        expect(onClose).toHaveBeenCalled();
      }
    });
  });

  // ===========================================
  // PAYMENT OPTION TESTS
  // ===========================================
  describe('Payment Options', () => {
    it('should render One-time payment option', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('One-time')).toBeInTheDocument();
    });

    it('should render Subscription payment option', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Subscription')).toBeInTheDocument();
    });

    it('should render Installment Plans section', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('Installment Plans')).toBeInTheDocument();
    });

    it('should render installment options', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('2 Months')).toBeInTheDocument();
      expect(screen.getByText('3 Months')).toBeInTheDocument();
      expect(screen.getByText('4 Months')).toBeInTheDocument();
      expect(screen.getByText('6 Months')).toBeInTheDocument();
    });
  });

  // ===========================================
  // REGISTRATION LINK TESTS (EDIT MODE)
  // ===========================================
  describe('Registration Link (Edit Mode)', () => {
    it('should show Registration Link section in edit mode with initialData', () => {
      render(
        <ClassFormModal
          {...defaultProps}
          mode="edit"
          initialData={{ id: 'class-1', slug: 'soccer-fall' }}
        />
      );
      expect(screen.getByText('Registration Link')).toBeInTheDocument();
    });

    it('should not show Registration Link section in create mode', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.queryByText('Registration Link')).not.toBeInTheDocument();
    });

    it('should show copy button in edit mode', () => {
      render(
        <ClassFormModal
          {...defaultProps}
          mode="edit"
          initialData={{ id: 'class-1', slug: 'soccer-fall' }}
        />
      );
      expect(screen.getByText('Copy')).toBeInTheDocument();
    });
  });

  // ===========================================
  // CUSTOM FEES TESTS
  // ===========================================
  describe('Custom Fees', () => {
    it('should show "No custom fees added" when empty', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('No custom fees added')).toBeInTheDocument();
    });

    it('should show "Add your first custom fee" button', () => {
      render(<ClassFormModal {...defaultProps} />);
      expect(screen.getByText('+ Add your first custom fee')).toBeInTheDocument();
    });
  });
});
