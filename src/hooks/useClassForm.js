/**
 * useClassForm Hook
 * Manages class form state, validation, and API integration
 */

import { useState, useEffect } from 'react';
import classesService from '../api/services/classes.service';
import toast from 'react-hot-toast';

const initialFormData = {
  // Basic Info
  name: '',
  description: '',
  program_id: '',
  area_id: '',
  school_id: '',
  school_code: '',            // NEW - Ledges code
  capacity: '',
  min_age: '',
  max_age: '',
  start_date: '',
  end_date: '',
  coach_id: null,
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
    },
    {
      type: 'monthly_subscription',
      enabled: false,
      price: 0,
    },
    {
      type: 'installment_2',
      enabled: false,
      price: 0,
    },
    {
      type: 'installment_3',
      enabled: false,
      price: 0,
    },
    {
      type: 'installment_4',
      enabled: false,
      price: 0,
    },
    {
      type: 'installment_6',
      enabled: false,
      price: 0,
    },
  ],
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

    // Start with default structure (all disabled)
    const frontendOptions = [...initialFormData.payment_options];

    // Enable and set prices for options returned from backend
    backendOptions.forEach(backendOpt => {
      const frontendType = typeMapping[backendOpt.name] || backendOpt.type;
      const index = frontendOptions.findIndex(opt => opt.type === frontendType);

      if (index !== -1) {
        frontendOptions[index] = {
          type: frontendOptions[index].type,
          enabled: true,
          price: backendOpt.amount || backendOpt.price || 0,
        };
      }
    });

    return frontendOptions;
  };

  // Initialize form with existing class data when editing
  useEffect(() => {
    if (initialData && mode === 'edit') {
      // Transform backend schedule format to frontend format
      let schedule = initialFormData.schedule;
      if (initialData.weekdays && Array.isArray(initialData.weekdays) && initialData.weekdays.length > 0) {
        // Backend format: {weekdays: [...], start_time, end_time}
        schedule = initialData.weekdays.map(day => ({
          day_of_week: day.toLowerCase(),
          start_time: initialData.start_time || '09:00',
          end_time: initialData.end_time || '10:00',
        }));
      } else if (initialData.schedule && Array.isArray(initialData.schedule) && initialData.schedule.length > 0) {
        // Frontend format already
        schedule = initialData.schedule;
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

  // Update schedule entry
  const updateSchedule = (index, field, value) => {
    setFormData(prev => {
      const newSchedule = [...prev.schedule];
      newSchedule[index] = {
        ...newSchedule[index],
        [field]: value,
      };
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
      if (parseInt(formData.max_age) <= parseInt(formData.min_age)) {
        newErrors.max_age = 'Maximum age must be greater than minimum age';
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

    // Registration period should be before class start date
    if (formData.registration_end_date && formData.start_date) {
      if (new Date(formData.registration_end_date) > new Date(formData.start_date)) {
        newErrors.registration_end_date = 'Registration must end before class starts';
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
  const handleSubmit = async (onSuccess) => {
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API
      const apiData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        min_age: parseInt(formData.min_age),
        max_age: parseInt(formData.max_age),

        // NEW: Include new fields
        school_id: formData.school_id,
        school_code: formData.school_code,
        registration_start_date: formData.registration_start_date,
        registration_end_date: formData.registration_end_date,
        recurrence_pattern: formData.recurrence_pattern,
        repeat_every_weeks: parseInt(formData.repeat_every_weeks),
        class_type: formData.class_type,
        website_link: formData.website_link,

        // Only send enabled payment options with prices
        payment_options: formData.payment_options
          .filter(opt => opt.enabled)
          .map(opt => ({
            type: opt.type,
            enabled: true,
            price: parseFloat(opt.price),
          })),
      };

      // Handle image upload if image exists
      if (formData.class_image instanceof File) {
        // TODO: Upload image to storage and get URL
        // apiData.class_image_url = await uploadImage(formData.class_image);
      } else if (typeof formData.class_image === 'string') {
        // If it's already a URL (edit mode)
        apiData.class_image_url = formData.class_image;
      }

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
      const errorMessage = error.response?.data?.message || 'Failed to save class';
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
    validate,
    handleSubmit,
    resetForm,
  };
}
