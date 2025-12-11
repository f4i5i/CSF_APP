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
  capacity: '',
  min_age: '',
  max_age: '',
  start_date: '',
  end_date: '',
  coach_id: null,
  is_active: true,

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

  // Initialize form with existing class data when editing
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        ...initialFormData,
        ...initialData,
        schedule: initialData.schedule || initialFormData.schedule,
        payment_options: initialData.payment_options || initialFormData.payment_options,
      });
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        // Only send enabled payment options with prices
        payment_options: formData.payment_options
          .filter(opt => opt.enabled)
          .map(opt => ({
            type: opt.type,
            enabled: true,
            price: parseFloat(opt.price),
          })),
      };

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
      console.error('Failed to save class:', error);
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
