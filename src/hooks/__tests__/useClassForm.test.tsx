/**
 * Unit Tests for useClassForm Hook
 * Tests form state management, field updates, schedule management,
 * payment options, custom fees, validation, and submission
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import useClassForm from '../useClassForm';

// ==========================================
// MOCK SETUP
// ==========================================

jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

const mockClassesCreate = jest.fn();
const mockClassesUpdate = jest.fn();

jest.mock('../../api/services/classes.service', () => ({
  __esModule: true,
  default: {
    create: (...args: unknown[]) => mockClassesCreate(...args),
    update: (...args: unknown[]) => mockClassesUpdate(...args),
  },
}));

// Valid form data that passes all validation
const validFormData = {
  name: 'Soccer Basics',
  description: 'Learn soccer fundamentals',
  program_id: 'prog-1',
  area_id: 'area-1',
  school_id: 'school-1',
  school_code: 'SCH001',
  capacity: '20',
  min_age: '5',
  max_age: '12',
  start_date: '2024-06-01',
  end_date: '2024-08-30',
  registration_start_date: '2024-04-01',
  registration_end_date: '2024-05-30',
  class_type: 'one-time',
  recurrence_pattern: 'weekly',
  repeat_every_weeks: '1',
  is_active: true,
};

describe('useClassForm Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClassesCreate.mockResolvedValue({ id: 'class-new' });
    mockClassesUpdate.mockResolvedValue({ id: 'class-1' });
  });

  // ===========================================
  // INITIAL STATE TESTS
  // ===========================================

  describe('Initial State (create mode)', () => {
    it('should have default form data', () => {
      const { result } = renderHook(() => useClassForm());

      expect(result.current.formData.name).toBe('');
      expect(result.current.formData.description).toBe('');
      expect(result.current.formData.program_id).toBe('');
      expect(result.current.formData.capacity).toBe('');
      expect(result.current.formData.is_active).toBe(true);
    });

    it('should have default schedule with one entry', () => {
      const { result } = renderHook(() => useClassForm());

      expect(result.current.formData.schedule).toHaveLength(1);
      expect(result.current.formData.schedule[0]).toEqual({
        day_of_week: 'monday',
        start_time: '09:00',
        end_time: '10:00',
      });
    });

    it('should have default payment options with full_payment enabled', () => {
      const { result } = renderHook(() => useClassForm());

      expect(result.current.formData.payment_options).toHaveLength(6);
      expect(result.current.formData.payment_options[0].type).toBe('full_payment');
      expect(result.current.formData.payment_options[0].enabled).toBe(true);
      expect(result.current.formData.payment_options[1].enabled).toBe(false);
    });

    it('should have empty custom fees', () => {
      const { result } = renderHook(() => useClassForm());

      expect(result.current.formData.custom_fees).toEqual([]);
    });

    it('should have empty errors', () => {
      const { result } = renderHook(() => useClassForm());

      expect(result.current.errors).toEqual({});
    });

    it('should not be submitting', () => {
      const { result } = renderHook(() => useClassForm());

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  // ===========================================
  // EDIT MODE INITIALIZATION TESTS
  // ===========================================

  describe('Initial State (edit mode)', () => {
    it('should populate form from initial data', () => {
      const initialData = {
        name: 'Existing Class',
        description: 'An existing class',
        program: { id: 'prog-1' },
        area: { id: 'area-1' },
        school: { id: 'school-1', code: 'SCH001' },
        capacity: 15,
        min_age: 6,
        max_age: 10,
        start_date: '2024-03-01T00:00:00Z',
        end_date: '2024-06-01T00:00:00Z',
        is_active: true,
        weekdays: ['Monday', 'Wednesday'],
        start_time: '3:00 PM',
        end_time: '4:00 PM',
        class_type: 'one-time',
        recurrence_pattern: 'weekly',
        repeat_every_weeks: 1,
        payment_options: [
          { name: 'Full Payment', amount: 200 },
        ],
      };

      const { result } = renderHook(() => useClassForm(initialData, 'edit'));

      expect(result.current.formData.name).toBe('Existing Class');
      expect(result.current.formData.program_id).toBe('prog-1');
      expect(result.current.formData.area_id).toBe('area-1');
      expect(result.current.formData.school_id).toBe('school-1');
      expect(result.current.formData.capacity).toBe('15');
      expect(result.current.formData.min_age).toBe('6');
      expect(result.current.formData.max_age).toBe('10');
      expect(result.current.formData.start_date).toBe('2024-03-01');
      expect(result.current.formData.end_date).toBe('2024-06-01');
    });

    it('should transform backend weekdays to schedule entries', () => {
      const initialData = {
        weekdays: ['Monday', 'Wednesday'],
        start_time: '3:00 PM',
        end_time: '4:00 PM',
        class_type: 'one-time',
        payment_options: [],
      };

      const { result } = renderHook(() => useClassForm(initialData, 'edit'));

      expect(result.current.formData.schedule).toHaveLength(2);
      expect(result.current.formData.schedule[0].day_of_week).toBe('monday');
      expect(result.current.formData.schedule[0].start_time).toBe('15:00');
      expect(result.current.formData.schedule[0].end_time).toBe('16:00');
    });

    it('should transform backend 12-hour times to 24-hour format', () => {
      const initialData = {
        weekdays: ['Monday'],
        start_time: '9:00 AM',
        end_time: '12:00 PM',
        class_type: 'one-time',
        payment_options: [],
      };

      const { result } = renderHook(() => useClassForm(initialData, 'edit'));

      expect(result.current.formData.schedule[0].start_time).toBe('09:00');
      expect(result.current.formData.schedule[0].end_time).toBe('12:00');
    });
  });

  // ===========================================
  // FIELD UPDATE TESTS
  // ===========================================

  describe('updateField', () => {
    it('should update a form field', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.updateField('name', 'New Class Name');
      });

      expect(result.current.formData.name).toBe('New Class Name');
    });

    it('should clear error for the updated field', () => {
      const { result } = renderHook(() => useClassForm());

      // Trigger validation to create errors
      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.name).toBeDefined();

      // Update the field
      act(() => {
        result.current.updateField('name', 'Valid Name');
      });

      expect(result.current.errors.name).toBeUndefined();
    });

    it('should update boolean fields', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.updateField('is_active', false);
      });

      expect(result.current.formData.is_active).toBe(false);
    });
  });

  // ===========================================
  // SCHEDULE MANAGEMENT TESTS
  // ===========================================

  describe('Schedule Management', () => {
    describe('updateSchedule', () => {
      it('should update a schedule entry field', () => {
        const { result } = renderHook(() => useClassForm());

        act(() => {
          result.current.updateSchedule(0, 'day_of_week', 'wednesday');
        });

        expect(result.current.formData.schedule[0].day_of_week).toBe('wednesday');
      });

      it('should auto-update end_time when start_time changes', () => {
        const { result } = renderHook(() => useClassForm());

        act(() => {
          result.current.updateSchedule(0, 'start_time', '14:00');
        });

        expect(result.current.formData.schedule[0].start_time).toBe('14:00');
        expect(result.current.formData.schedule[0].end_time).toBe('15:00');
      });

      it('should wrap around midnight for end_time when start is 23:00', () => {
        const { result } = renderHook(() => useClassForm());

        act(() => {
          result.current.updateSchedule(0, 'start_time', '23:00');
        });

        expect(result.current.formData.schedule[0].end_time).toBe('00:00');
      });
    });

    describe('addSchedule', () => {
      it('should add a new schedule entry', () => {
        const { result } = renderHook(() => useClassForm());

        act(() => {
          result.current.addSchedule();
        });

        expect(result.current.formData.schedule).toHaveLength(2);
        expect(result.current.formData.schedule[1]).toEqual({
          day_of_week: 'monday',
          start_time: '09:00',
          end_time: '10:00',
        });
      });
    });

    describe('removeSchedule', () => {
      it('should remove a schedule entry', () => {
        const { result } = renderHook(() => useClassForm());

        // Add a second entry first
        act(() => {
          result.current.addSchedule();
        });
        expect(result.current.formData.schedule).toHaveLength(2);

        act(() => {
          result.current.removeSchedule(0);
        });

        expect(result.current.formData.schedule).toHaveLength(1);
      });

      it('should not remove the last schedule entry', () => {
        const toast = require('react-hot-toast');
        const { result } = renderHook(() => useClassForm());

        act(() => {
          result.current.removeSchedule(0);
        });

        // Should still have 1 entry
        expect(result.current.formData.schedule).toHaveLength(1);
        expect(toast.error).toHaveBeenCalledWith('At least one schedule entry is required');
      });
    });
  });

  // ===========================================
  // PAYMENT OPTIONS TESTS
  // ===========================================

  describe('Payment Options', () => {
    it('should update payment option enabled state', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.updatePaymentOption(1, 'enabled', true);
      });

      expect(result.current.formData.payment_options[1].enabled).toBe(true);
    });

    it('should update payment option price', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.updatePaymentOption(0, 'price', 200);
      });

      expect(result.current.formData.payment_options[0].price).toBe(200);
    });

    it('should update payment option custom name', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.updatePaymentOption(0, 'custom_name', 'One-Time Payment');
      });

      expect(result.current.formData.payment_options[0].custom_name).toBe('One-Time Payment');
    });
  });

  // ===========================================
  // CUSTOM FEES TESTS
  // ===========================================

  describe('Custom Fees', () => {
    it('should add a custom fee', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.addCustomFee();
      });

      expect(result.current.formData.custom_fees).toHaveLength(1);
      expect(result.current.formData.custom_fees[0]).toEqual({
        name: '',
        amount: 0,
        is_optional: true,
        description: '',
      });
    });

    it('should update a custom fee', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.addCustomFee();
      });

      act(() => {
        result.current.updateCustomFee(0, 'name', 'Jersey Fee');
      });
      act(() => {
        result.current.updateCustomFee(0, 'amount', 25);
      });

      expect(result.current.formData.custom_fees[0].name).toBe('Jersey Fee');
      expect(result.current.formData.custom_fees[0].amount).toBe(25);
    });

    it('should remove a custom fee', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.addCustomFee();
        result.current.addCustomFee();
      });

      expect(result.current.formData.custom_fees).toHaveLength(2);

      act(() => {
        result.current.removeCustomFee(0);
      });

      expect(result.current.formData.custom_fees).toHaveLength(1);
    });
  });

  // ===========================================
  // VALIDATION TESTS
  // ===========================================

  describe('Validation', () => {
    it('should return false with empty form', () => {
      const { result } = renderHook(() => useClassForm());

      let isValid: boolean = false;
      act(() => {
        isValid = result.current.validate();
      });

      expect(isValid).toBe(false);
      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);
    });

    it('should validate name length (min 3 chars)', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.updateField('name', 'Ab');
      });

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.name).toBe('Class name must be at least 3 characters');
    });

    it('should validate required program_id', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.program_id).toBe('Program is required');
    });

    it('should validate end_date is after start_date', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.updateField('start_date', '2024-06-01');
        result.current.updateField('end_date', '2024-05-01');
      });

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.end_date).toBe('End date must be after start date');
    });

    it('should validate capacity must be at least 1', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.updateField('capacity', '0');
      });

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.capacity).toBe('Capacity must be at least 1');
    });

    it('should validate max_age >= min_age', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.updateField('min_age', '10');
        result.current.updateField('max_age', '5');
      });

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.max_age).toBe(
        'Maximum age must be greater than or equal to minimum age'
      );
    });

    it('should validate at least one payment option is enabled', () => {
      const { result } = renderHook(() => useClassForm());

      // Disable all payment options
      act(() => {
        result.current.updatePaymentOption(0, 'enabled', false);
      });

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.payment_options).toBe(
        'At least one payment option must be enabled'
      );
    });

    it('should validate enabled payment options have price > 0', () => {
      const { result } = renderHook(() => useClassForm());

      // Full payment is enabled by default, but price is 0
      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.payment_full_payment).toBe('Price must be greater than 0');
    });

    it('should validate schedule end_time > start_time', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.updateSchedule(0, 'end_time', '08:00'); // Before default start 09:00
      });

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.schedule_0).toBe('End time must be after start time');
    });

    it('should validate class_type is required', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.class_type).toBe('Class type is required');
    });

    it('should validate registration dates', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.registration_start_date).toBe(
        'Registration start date is required'
      );
      expect(result.current.errors.registration_end_date).toBe(
        'Registration end date is required'
      );
    });

    it('should validate registration_end_date is after registration_start_date', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.updateField('registration_start_date', '2024-05-01');
        result.current.updateField('registration_end_date', '2024-04-01');
      });

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.registration_end_date).toBe(
        'Registration end date must be after start date'
      );
    });

    it('should validate website_link format when provided', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.updateField('website_link', 'not-a-url');
      });

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.website_link).toBe('Please enter a valid URL');
    });

    it('should not validate website_link when empty', () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        result.current.updateField('website_link', '');
      });

      act(() => {
        result.current.validate();
      });

      expect(result.current.errors.website_link).toBeUndefined();
    });

    it('should pass validation with complete valid form data', () => {
      const { result } = renderHook(() => useClassForm());

      // Fill in all required fields
      act(() => {
        Object.entries(validFormData).forEach(([key, value]) => {
          result.current.updateField(key, value);
        });
        // Enable and price the payment option
        result.current.updatePaymentOption(0, 'price', 150);
      });

      let isValid: boolean = false;
      act(() => {
        isValid = result.current.validate();
      });

      expect(isValid).toBe(true);
      expect(result.current.errors).toEqual({});
    });
  });

  // ===========================================
  // SUBMIT TESTS
  // ===========================================

  describe('handleSubmit', () => {
    it('should not submit when validation fails', async () => {
      const toast = require('react-hot-toast');
      const { result } = renderHook(() => useClassForm());

      const onSuccess = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(onSuccess);
      });

      expect(toast.error).toHaveBeenCalledWith('Please fix the errors in the form');
      expect(onSuccess).not.toHaveBeenCalled();
      expect(mockClassesCreate).not.toHaveBeenCalled();
    });

    it('should call classesService.create in create mode', async () => {
      const toast = require('react-hot-toast');
      const { result } = renderHook(() => useClassForm());

      // Fill all required fields
      act(() => {
        Object.entries(validFormData).forEach(([key, value]) => {
          result.current.updateField(key, value);
        });
        result.current.updatePaymentOption(0, 'price', 150);
      });

      const onSuccess = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(onSuccess);
      });

      expect(mockClassesCreate).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Class created successfully');
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should call classesService.update in edit mode', async () => {
      const toast = require('react-hot-toast');
      const initialData = {
        id: 'class-1',
        ...validFormData,
        capacity: 20,
        min_age: 5,
        max_age: 12,
        repeat_every_weeks: 1,
        class_type: 'one-time',
        schedule: [{ day_of_week: 'monday', start_time: '09:00', end_time: '10:00' }],
        payment_options: [{ name: 'Full Payment', amount: 150 }],
      };

      const { result } = renderHook(() => useClassForm(initialData, 'edit'));

      // Wait for initial data effect
      await waitFor(() => {
        expect(result.current.formData.name).toBe('Soccer Basics');
      });

      const onSuccess = jest.fn();

      await act(async () => {
        await result.current.handleSubmit(onSuccess);
      });

      expect(mockClassesUpdate).toHaveBeenCalledWith('class-1', expect.any(Object));
      expect(toast.success).toHaveBeenCalledWith('Class updated successfully');
      expect(onSuccess).toHaveBeenCalled();
    });

    it('should show error toast when API call fails', async () => {
      const toast = require('react-hot-toast');
      mockClassesCreate.mockRejectedValue(new Error('Server error'));

      const { result } = renderHook(() => useClassForm());

      act(() => {
        Object.entries(validFormData).forEach(([key, value]) => {
          result.current.updateField(key, value);
        });
        result.current.updatePaymentOption(0, 'price', 150);
      });

      await act(async () => {
        await result.current.handleSubmit(jest.fn());
      });

      expect(toast.error).toHaveBeenCalledWith('Server error');
    });

    it('should set isSubmitting during submission', async () => {
      let resolveCreate: (value: unknown) => void;
      mockClassesCreate.mockImplementation(
        () => new Promise((resolve) => { resolveCreate = resolve; })
      );

      const { result } = renderHook(() => useClassForm());

      act(() => {
        Object.entries(validFormData).forEach(([key, value]) => {
          result.current.updateField(key, value);
        });
        result.current.updatePaymentOption(0, 'price', 150);
      });

      let submitPromise: Promise<void>;
      act(() => {
        submitPromise = result.current.handleSubmit(jest.fn());
      });

      // isSubmitting should be true during the API call
      expect(result.current.isSubmitting).toBe(true);

      await act(async () => {
        resolveCreate!({ id: 'class-new' });
        await submitPromise!;
      });

      expect(result.current.isSubmitting).toBe(false);
    });

    it('should support overrides for draft saving', async () => {
      const { result } = renderHook(() => useClassForm());

      act(() => {
        Object.entries(validFormData).forEach(([key, value]) => {
          result.current.updateField(key, value);
        });
        result.current.updatePaymentOption(0, 'price', 150);
      });

      await act(async () => {
        await result.current.handleSubmit(jest.fn(), { is_active: false });
      });

      // The API should be called with is_active: false
      const callArg = mockClassesCreate.mock.calls[0][0];
      expect(callArg.is_active).toBe(false);
    });
  });

  // ===========================================
  // RESET FORM TESTS
  // ===========================================

  describe('resetForm', () => {
    it('should reset form to initial state', () => {
      const { result } = renderHook(() => useClassForm());

      // Modify form
      act(() => {
        result.current.updateField('name', 'Changed Name');
        result.current.addSchedule();
        result.current.addCustomFee();
      });

      // Reset
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.formData.name).toBe('');
      expect(result.current.formData.schedule).toHaveLength(1);
      expect(result.current.formData.custom_fees).toEqual([]);
      expect(result.current.errors).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  // ===========================================
  // RETURN VALUE STRUCTURE TESTS
  // ===========================================

  describe('Return Values', () => {
    it('should return all expected properties and methods', () => {
      const { result } = renderHook(() => useClassForm());

      expect(result.current).toHaveProperty('formData');
      expect(result.current).toHaveProperty('setFormData');
      expect(result.current).toHaveProperty('errors');
      expect(result.current).toHaveProperty('isSubmitting');
      expect(typeof result.current.updateField).toBe('function');
      expect(typeof result.current.updateSchedule).toBe('function');
      expect(typeof result.current.addSchedule).toBe('function');
      expect(typeof result.current.removeSchedule).toBe('function');
      expect(typeof result.current.updatePaymentOption).toBe('function');
      expect(typeof result.current.addCustomFee).toBe('function');
      expect(typeof result.current.updateCustomFee).toBe('function');
      expect(typeof result.current.removeCustomFee).toBe('function');
      expect(typeof result.current.validate).toBe('function');
      expect(typeof result.current.handleSubmit).toBe('function');
      expect(typeof result.current.resetForm).toBe('function');
    });
  });
});
