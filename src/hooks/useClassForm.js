/**
 * useClassForm Hook
 * Manages class form state, validation, and API integration
 */

import { useState, useEffect } from 'react';
import classesService from '../api/services/classes.service';
import toast from 'react-hot-toast';

/**
 * Convert 12-hour format (e.g., "9:00 AM", "2:30 PM") to 24-hour format (e.g., "09:00", "14:30")
 * This is needed because the backend returns 12-hour format, but HTML5 time inputs require 24-hour format.
 */
const convertTo24Hour = (time12h) => {
  if (!time12h) return '';

  // If already in 24-hour format (HH:mm), return as-is
  if (/^\d{2}:\d{2}$/.test(time12h)) {
    return time12h;
  }

  // Parse 12-hour format: "9:00 AM" or "2:30 PM"
  const match = time12h.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    // Try without AM/PM in case it's already 24-hour with different format
    const simpleMatch = time12h.match(/^(\d{1,2}):(\d{2})$/);
    if (simpleMatch) {
      const hour = simpleMatch[1].padStart(2, '0');
      const minute = simpleMatch[2];
      return `${hour}:${minute}`;
    }
    return '';
  }

  let hour = parseInt(match[1], 10);
  const minute = match[2];
  const period = match[3].toUpperCase();

  // Convert to 24-hour format
  if (period === 'AM') {
    if (hour === 12) {
      hour = 0; // 12 AM = 00:00
    }
  } else { // PM
    if (hour !== 12) {
      hour += 12; // 1 PM = 13:00, 2 PM = 14:00, etc.
    }
    // 12 PM stays as 12
  }

  return `${hour.toString().padStart(2, '0')}:${minute}`;
};

const initialFormData = {
  // Basic Info
  name: '',
  description: '',
  program_id: '',
  area_id: '',
  school_id: '',
  school_code: '',            // NEW - Ledger code
  capacity: '',
  min_age: '',
  max_age: '',
  start_date: '',
  end_date: '',
  coach_id: null,             // Legacy single coach (for backwards compatibility)
  coach_ids: [],              // Multiple coaches support
  slug: '',                   // Custom URL slug for registration links
  is_active: true,

  // NEW FIELDS
  registration_start_date: '', // Registration period start
  registration_end_date: '',   // Registration period end
  recurrence_pattern: 'weekly', // weekly, monthly, one-time
  repeat_every_weeks: '1',     // Number of weeks between repetitions
  class_type: '',              // one-time or membership
  class_image: null,           // Image file or URL
  website_link: '',            // Class website/info link

  // Schedule (array)
  schedule: [
    {
      day_of_week: 'monday',
      start_time: '09:00',
      end_time: '10:00',
    },
  ],

  // Payment Options (array)
  payment_options: [
    {
      type: 'full_payment',
      enabled: true,
      price: 0,
      custom_name: 'Pay in Full',
    },
    {
      type: 'monthly_subscription',
      enabled: false,
      price: 0,
      custom_name: 'Monthly Subscription',
    },
    {
      type: 'installment_2',
      enabled: false,
      price: 0,
      custom_name: '2 Month Installment',
    },
    {
      type: 'installment_3',
      enabled: false,
      price: 0,
      custom_name: '3 Month Installment',
    },
    {
      type: 'installment_4',
      enabled: false,
      price: 0,
      custom_name: '4 Month Installment',
    },
    {
      type: 'installment_6',
      enabled: false,
      price: 0,
      custom_name: '6 Month Installment',
    },
  ],

  // Custom Fees (optional, editable fees like Jersey Fee, Equipment Fee, etc.)
  custom_fees: [],
};

export default function useClassForm(initialData = null, mode = 'create') {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transform backend payment options to frontend format
  const transformPaymentOptionsFromBackend = (backendOptions) => {
    if (!backendOptions || backendOptions.length === 0) {
      return initialFormData.payment_options;
    }

    // Map backend format to frontend format
    const typeMapping = {
      'Full Payment': 'full_payment',
      'Monthly Subscription': 'monthly_subscription',
      '2 Installments': 'installment_2',
      '3 Installments': 'installment_3',
      '4 Installments': 'installment_4',
      '6 Installments': 'installment_6',
    };

    // Default custom names
    const defaultNames = {
      'full_payment': 'Pay in Full',
      'monthly_subscription': 'Monthly Subscription',
      'installment_2': '2 Month Installment',
      'installment_3': '3 Month Installment',
      'installment_4': '4 Month Installment',
      'installment_6': '6 Month Installment',
    };

    // Start with ALL options DISABLED (not from initialFormData which has full_payment enabled)
    const frontendOptions = initialFormData.payment_options.map(opt => ({
      ...opt,
      enabled: false,  // Disable all by default
      price: 0,
    }));

    // Enable ONLY the options returned from backend (should be just one)
    backendOptions.forEach(backendOpt => {
      const frontendType = typeMapping[backendOpt.name] || backendOpt.type;
      const index = frontendOptions.findIndex(opt => opt.type === frontendType);

      if (index !== -1) {
        frontendOptions[index] = {
          type: frontendOptions[index].type,
          enabled: true,
          price: backendOpt.amount || backendOpt.price || 0,
          custom_name: backendOpt.custom_name || backendOpt.display_name || defaultNames[frontendType] || backendOpt.name,
        };
      }
    });

    return frontendOptions;
  };

  // Initialize form with existing class data when editing or cloning
  useEffect(() => {
    if (initialData) {
      // Transform backend schedule format to frontend format
      let schedule = initialFormData.schedule;
      if (initialData.weekdays && Array.isArray(initialData.weekdays) && initialData.weekdays.length > 0) {
        // Backend format: {weekdays: [...], start_time, end_time}
        // Convert 12-hour format (from backend) to 24-hour format (for HTML5 time input)
        schedule = initialData.weekdays.map(day => ({
          day_of_week: day.toLowerCase(),
          start_time: convertTo24Hour(initialData.start_time) || '09:00',
          end_time: convertTo24Hour(initialData.end_time) || '10:00',
        }));
      } else if (initialData.schedule && Array.isArray(initialData.schedule) && initialData.schedule.length > 0) {
        // Frontend format - still need to convert times in case they came from backend
        schedule = initialData.schedule.map(sched => ({
          ...sched,
          day_of_week: sched.day_of_week?.toLowerCase() || 'monday',
          start_time: convertTo24Hour(sched.start_time) || '09:00',
          end_time: convertTo24Hour(sched.end_time) || '10:00',
        }));
      }

      // Transform payment options from backend format
      const paymentOptions = transformPaymentOptionsFromBackend(initialData.payment_options);

      // Map backend data to form structure - be explicit about all fields
      const mappedData = {
        // Basic text fields
        name: initialData.name || '',
        description: initialData.description || '',

        // Extract IDs from nested objects (override any raw values from backend)
        program_id: initialData.program?.id || initialData.program_id || '',
        area_id: initialData.area?.id || initialData.area_id || '',
        school_id: initialData.school?.id || initialData.school_id || '',
        school_code: initialData.school?.code || initialData.school_code || '',
        coach_id: initialData.coach?.id || initialData.coach_id || null,
        // Multiple coaches support
        coach_ids: initialData.coach_ids ||
          (initialData.coaches?.map(c => c.id)) ||
          (initialData.coach?.id ? [initialData.coach.id] : []),
        // Custom URL slug
        slug: initialData.slug || '',

        // Numeric fields
        capacity: initialData.capacity?.toString() || '',
        min_age: initialData.min_age?.toString() || '',
        max_age: initialData.max_age?.toString() || '',

        // Date fields - ensure proper format
        start_date: initialData.start_date ? initialData.start_date.split('T')[0] : '',
        end_date: initialData.end_date ? initialData.end_date.split('T')[0] : '',
        registration_start_date: initialData.registration_start_date
          ? initialData.registration_start_date.split('T')[0]
          : (initialData.registration_start ? initialData.registration_start.split('T')[0] : ''),
        registration_end_date: initialData.registration_end_date
          ? initialData.registration_end_date.split('T')[0]
          : (initialData.registration_end ? initialData.registration_end.split('T')[0] : ''),

        // Boolean
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,

        // New fields
        recurrence_pattern: initialData.recurrence_pattern || 'weekly',
        repeat_every_weeks: initialData.repeat_every_weeks?.toString() || '1',
        class_type: initialData.class_type || '',
        website_link: initialData.website_link || '',
        class_image: initialData.class_image_url || initialData.class_image || null,

        // Transformed schedule
        schedule: schedule,

        // Transformed payment options
        payment_options: paymentOptions,

        // Custom fees (optional fees like Jersey Fee)
        custom_fees: initialData.custom_fees || [],
      };

      setFormData(mappedData);
    } else {
      setFormData(initialFormData);
    }
  }, [initialData, mode]);

  // Update form field
  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Helper function to add 1 hour to a time string (HH:mm format)
  const addOneHour = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newHours = (hours + 1) % 24; // Wrap around at midnight
    return `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Update schedule entry
  const updateSchedule = (index, field, value) => {
    setFormData(prev => {
      const newSchedule = [...prev.schedule];
      const currentEntry = newSchedule[index];

      // If start_time is being changed, auto-update end_time to start_time + 1 hour
      if (field === 'start_time' && value) {
        const newEndTime = addOneHour(value);
        newSchedule[index] = {
          ...currentEntry,
          start_time: value,
          end_time: newEndTime,
        };
      } else {
        newSchedule[index] = {
          ...currentEntry,
          [field]: value,
        };
      }

      return {
        ...prev,
        schedule: newSchedule,
      };
    });
  };

  // Add schedule entry
  const addSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [
        ...prev.schedule,
        {
          day_of_week: 'monday',
          start_time: '09:00',
          end_time: '10:00',
        },
      ],
    }));
  };

  // Remove schedule entry
  const removeSchedule = (index) => {
    if (formData.schedule.length <= 1) {
      toast.error('At least one schedule entry is required');
      return;
    }
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index),
    }));
  };

  // Update payment option
  const updatePaymentOption = (index, field, value) => {
    setFormData(prev => {
      const newPaymentOptions = [...prev.payment_options];
      newPaymentOptions[index] = {
        ...newPaymentOptions[index],
        [field]: value,
      };
      return {
        ...prev,
        payment_options: newPaymentOptions,
      };
    });
  };

  // Add custom fee
  const addCustomFee = () => {
    setFormData(prev => ({
      ...prev,
      custom_fees: [
        ...prev.custom_fees,
        {
          name: '',
          amount: 0,
          is_optional: true,
          description: '',
        },
      ],
    }));
  };

  // Update custom fee
  const updateCustomFee = (index, field, value) => {
    setFormData(prev => {
      const newCustomFees = [...prev.custom_fees];
      newCustomFees[index] = {
        ...newCustomFees[index],
        [field]: value,
      };
      return {
        ...prev,
        custom_fees: newCustomFees,
      };
    });
  };

  // Remove custom fee
  const removeCustomFee = (index) => {
    setFormData(prev => ({
      ...prev,
      custom_fees: prev.custom_fees.filter((_, i) => i !== index),
    }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};

    // Required basic fields
    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Class name must be at least 3 characters';
    }

    if (!formData.program_id) {
      newErrors.program_id = 'Program is required';
    }

    if (!formData.area_id) {
      newErrors.area_id = 'Area/Location is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (!formData.capacity || parseInt(formData.capacity) < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
    }

    if (formData.min_age === '' || parseInt(formData.min_age) < 0) {
      newErrors.min_age = 'Minimum age is required';
    }

    if (formData.max_age === '' || parseInt(formData.max_age) < 0) {
      newErrors.max_age = 'Maximum age is required';
    }

    if (formData.min_age !== '' && formData.max_age !== '') {
      if (parseInt(formData.max_age) < parseInt(formData.min_age)) {
        newErrors.max_age = 'Maximum age must be greater than or equal to minimum age';
      }
    }

    // Schedule validation
    if (!formData.schedule || formData.schedule.length === 0) {
      newErrors.schedule = 'At least one schedule entry is required';
    } else {
      formData.schedule.forEach((sched, index) => {
        if (sched.start_time >= sched.end_time) {
          newErrors[`schedule_${index}`] = 'End time must be after start time';
        }
      });
    }

    // Payment options validation
    const enabledOptions = formData.payment_options.filter(opt => opt.enabled);
    if (enabledOptions.length === 0) {
      newErrors.payment_options = 'At least one payment option must be enabled';
    }

    enabledOptions.forEach((opt, index) => {
      if (!opt.price || parseFloat(opt.price) <= 0) {
        newErrors[`payment_${opt.type}`] = 'Price must be greater than 0';
      }
    });

    // NEW FIELDS VALIDATION

    // School code validation
    if (!formData.school_id) {
      newErrors.school_id = 'School is required';
    }

    // Registration period validation
    if (!formData.registration_start_date) {
      newErrors.registration_start_date = 'Registration start date is required';
    }

    if (!formData.registration_end_date) {
      newErrors.registration_end_date = 'Registration end date is required';
    }

    if (formData.registration_start_date && formData.registration_end_date) {
      if (new Date(formData.registration_end_date) <= new Date(formData.registration_start_date)) {
        newErrors.registration_end_date = 'Registration end date must be after start date';
      }
    }

    // Class type validation
    if (!formData.class_type) {
      newErrors.class_type = 'Class type is required';
    }

    // Recurrence pattern validation
    if (!formData.recurrence_pattern) {
      newErrors.recurrence_pattern = 'Recurrence pattern is required';
    }

    // Repeat every weeks validation
    if (!formData.repeat_every_weeks || parseInt(formData.repeat_every_weeks) < 1) {
      newErrors.repeat_every_weeks = 'Repeat frequency is required';
    }

    // Website link validation (optional but validate format if provided)
    if (formData.website_link && formData.website_link.trim()) {
      if (!isValidUrl(formData.website_link)) {
        newErrors.website_link = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Submit form
  // overrides: optional object to override formData values (e.g., { is_active: false } for draft)
  const handleSubmit = async (onSuccess, overrides = {}) => {
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Merge formData with any overrides
      const mergedData = { ...formData, ...overrides };

      // Remove fields that need special handling
      const {
        slug: _slug,
        ...mergedDataWithoutExcluded
      } = mergedData;

      // Helper: convert empty strings to undefined so they're omitted from payload
      const emptyToNull = (val) => (typeof val === 'string' && !val.trim()) ? undefined : val;

      // Prepare data for API
      const apiData = {
        ...mergedDataWithoutExcluded,
        // Include is_active - backend now supports it for both create and update
        is_active: mergedData.is_active ?? true,
        capacity: parseInt(formData.capacity),
        min_age: parseInt(formData.min_age),
        max_age: parseInt(formData.max_age),

        // Optional string fields - send null instead of empty strings
        description: emptyToNull(formData.description),
        school_id: emptyToNull(formData.school_id),
        school_code: emptyToNull(formData.school_code),
        website_link: emptyToNull(formData.website_link),
        area_id: emptyToNull(formData.area_id),
        registration_start_date: emptyToNull(formData.registration_start_date),
        registration_end_date: emptyToNull(formData.registration_end_date),
        recurrence_pattern: emptyToNull(formData.recurrence_pattern),
        repeat_every_weeks: parseInt(formData.repeat_every_weeks),
        class_type: formData.class_type,
        // Multiple coaches support
        coach_ids: formData.coach_ids || [],
        // Custom URL slug - only include if it has a value (backend rejects empty strings due to regex pattern)
        ...(formData.slug?.trim() ? { slug: formData.slug.trim() } : {}),

        // Only send enabled payment options with prices and custom names
        payment_options: formData.payment_options
          .filter(opt => opt.enabled)
          .map(opt => ({
            type: opt.type,
            enabled: true,
            price: parseFloat(opt.price),
            custom_name: opt.custom_name || '',
          })),
      };

      // custom_fees and class_image are included via the spread of mergedDataWithoutExcluded.
      // The classes.service.js transformClassDataToBackend() handles custom_fees transformation,
      // and the service create/update methods handle image upload as a separate API call.

      if (mode === 'create') {
        await classesService.create(apiData);
        toast.success('Class created successfully');
      } else {
        await classesService.update(initialData.id, apiData);
        toast.success('Class updated successfully');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error.message || error.response?.data?.message || 'Failed to save class';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    updateField,
    updateSchedule,
    addSchedule,
    removeSchedule,
    updatePaymentOption,
    addCustomFee,
    updateCustomFee,
    removeCustomFee,
    validate,
    handleSubmit,
    resetForm,
  };
}
