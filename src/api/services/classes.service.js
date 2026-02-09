/**
 * Classes Service
 * Handles class/program management and enrollment operations
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

/**
 * Transform schedule array to backend format
 * Frontend: [{day_of_week, start_time, end_time}, ...]
 * Backend: {weekdays: [...], start_time, end_time}
 */
const transformScheduleToBackend = (schedule) => {
  if (!schedule || schedule.length === 0) {
    return { weekdays: null, start_time: null, end_time: null };
  }

  // Extract unique weekdays
  const weekdays = schedule.map(s => s.day_of_week);

  // Use first schedule entry's times (assuming same time for all days)
  const { start_time, end_time } = schedule[0];

  return {
    weekdays,
    start_time,
    end_time,
  };
};

/**
 * Transform payment options to backend PaymentOption format
 * Frontend: {type: 'full_payment', enabled: true, price: 100}
 * Backend: {name: 'Full Payment', type: 'one_time', amount: 100, interval: null}
 */
const transformPaymentOptionsToBackend = (paymentOptions) => {
  if (!paymentOptions) return [];

  const typeMapping = {
    'full_payment': {
      name: 'Full Payment',
      type: 'one_time',
      interval: null,
      interval_count: 1,
    },
    'monthly_subscription': {
      name: 'Monthly Subscription',
      type: 'recurring',
      interval: 'month',
      interval_count: 1,
    },
    'installment_2': {
      name: '2 Installments',
      type: 'one_time',
      interval: null,
      interval_count: 1,
    },
    'installment_3': {
      name: '3 Installments',
      type: 'one_time',
      interval: null,
      interval_count: 1,
    },
    'installment_4': {
      name: '4 Installments',
      type: 'one_time',
      interval: null,
      interval_count: 1,
    },
    'installment_6': {
      name: '6 Installments',
      type: 'one_time',
      interval: null,
      interval_count: 1,
    },
  };

  return paymentOptions
    .filter(opt => opt.enabled)
    .map(opt => {
      const mapping = typeMapping[opt.type] || {
        name: opt.type,
        type: 'one_time',
        interval: null,
        interval_count: 1,
      };

      return {
        name: mapping.name,
        type: mapping.type,
        amount: parseFloat(opt.price),
        interval: mapping.interval,
        interval_count: mapping.interval_count,
        description: `${mapping.name} - $${opt.price}`,
      };
    });
};

/**
 * Transform frontend class data to backend format
 */
const transformClassDataToBackend = (classData) => {
  const { schedule, payment_options, class_type, custom_fees, ...rest } = classData;

  // Transform schedule
  const scheduleData = transformScheduleToBackend(schedule);

  // Transform payment options
  const transformedPaymentOptions = transformPaymentOptionsToBackend(payment_options);

  // Map class_type: 'one-time' stays 'one-time', 'membership' stays 'membership'
  // Backend now supports 'one-time' value
  const mappedClassType = class_type;

  // Calculate legacy price field (required by backend)
  const firstPaymentOption = payment_options?.find(opt => opt.enabled);
  const price = firstPaymentOption ? parseFloat(firstPaymentOption.price) : 0;

  // Transform custom fees (filter out empty ones)
  const transformedCustomFees = custom_fees
    ?.filter(fee => fee.name && fee.name.trim())
    .map(fee => ({
      name: fee.name.trim(),
      amount: parseFloat(fee.amount) || 0,
      is_optional: fee.is_optional ?? true,
      description: fee.description?.trim() || '',
    })) || [];

  return {
    ...rest,
    ...scheduleData,
    class_type: mappedClassType,
    payment_options: transformedPaymentOptions,
    custom_fees: transformedCustomFees.length > 0 ? transformedCustomFees : undefined,
    price, // Legacy field - use first enabled payment option
    auto_create_stripe_prices: true, // Enable automatic Stripe Price creation
  };
};

const classesService = {
  /**
   * Get all available classes with optional filters
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.program_id] - Filter by program ID
   * @param {string} [filters.school_id] - Filter by school ID
   * @param {string} [filters.area_id] - Filter by area ID
   * @param {boolean} [filters.has_capacity] - Only show classes with available spots
   * @param {number} [filters.min_age] - Minimum age requirement
   * @param {number} [filters.max_age] - Maximum age requirement
   * @param {string} [filters.search] - Search query for class name and description
   * @param {number} [filters.skip] - Number of items to skip (for pagination)
   * @param {number} [filters.limit] - Maximum number of items to return
   * @returns {Promise<Object>} Response with items, total, skip, limit
   *   { items: [], total: number, skip: number, limit: number }
   */
  async getAll(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.CLASSES.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get class details by ID
   * @param {string} id - Class ID
   * @returns {Promise<Object>} Class details with schedule, capacity, and enrollment info
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.CLASSES.BY_ID(id));
    return data;
  },

  /**
   * Get class details by slug (custom URL)
   * @param {string} slug - Class slug (e.g., "u10-soccer-fall-2024")
   * @returns {Promise<Object>} Class details
   */
  async getBySlug(slug) {
    const { data } = await apiClient.get(`/classes/slug/${slug}`);
    return data;
  },

  /**
   * Get class schedule
   * Schedule data is included in the class details (weekdays, start_time, end_time)
   * @param {string} id - Class ID
   * @returns {Promise<Object>} Class schedule data
   */
  async getSchedule(id) {
    const classData = await this.getById(id);
    return {
      weekdays: classData.weekdays,
      start_time: classData.start_time,
      end_time: classData.end_time,
      start_date: classData.start_date,
      end_date: classData.end_date,
    };
  },

  /**
   * Get enrolled students for a class (admin only)
   * Use enrollments API with class_id filter
   * @param {string} id - Class ID
   * @returns {Promise<Array>} List of enrolled students
   */
  async getEnrollments(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.ENROLLMENTS.LIST, {
      params: { class_id: id },
    });
    return data;
  },

  /**
   * Create new class (admin only)
   * @param {Object} classData - Class information
   * @param {string} classData.name - Class name
   * @param {string} classData.program_id - Program ID
   * @param {string} classData.school_id - School ID
   * @param {string} classData.area_id - Area ID
   * @param {number} classData.capacity - Maximum capacity
   * @param {number} classData.min_age - Minimum age
   * @param {number} classData.max_age - Maximum age
   * @param {string} classData.start_date - Start date (YYYY-MM-DD)
   * @param {string} classData.end_date - End date (YYYY-MM-DD)
   * @param {Array} classData.schedule - Weekly schedule
   * @param {string} [classData.description] - Class description
   * @param {number} [classData.price] - Class price
   * @returns {Promise<Object>} Created class
   */
  async create(classData) {
    // Transform frontend data to backend format
    const transformedData = transformClassDataToBackend(classData);

    // Extract image File for separate upload after class creation
    const imageFile = classData.class_image instanceof File ? classData.class_image : null;
    delete transformedData.class_image;

    // If it's a string URL (not a File), pass as image_url
    if (typeof classData.class_image === 'string' && classData.class_image) {
      transformedData.image_url = classData.class_image;
    }

    const { data } = await apiClient.post(API_ENDPOINTS.CLASSES.CREATE, transformedData);

    // Upload image as a separate call after class creation
    if (imageFile && data.id) {
      try {
        const updatedData = await this.uploadImage(data.id, imageFile);
        return updatedData;
      } catch (err) {
        console.error('Image upload failed:', err);
        // Return class data even if image upload fails
        return data;
      }
    }

    return data;
  },

  /**
   * Update class information (admin only)
   * @param {string} id - Class ID
   * @param {Object} classData - Updated class data
   * @returns {Promise<Object>} Updated class
   */
  async update(id, classData) {
    // Transform frontend data to backend format
    const transformedData = transformClassDataToBackend(classData);

    // Extract image File for separate upload
    const imageFile = classData.class_image instanceof File ? classData.class_image : null;
    delete transformedData.class_image;

    // If it's a string URL (not a File), pass as image_url
    if (typeof classData.class_image === 'string' && classData.class_image) {
      transformedData.image_url = classData.class_image;
    }

    const { data } = await apiClient.put(API_ENDPOINTS.CLASSES.BY_ID(id), transformedData);

    // Upload new image if provided
    if (imageFile) {
      try {
        const updatedData = await this.uploadImage(id, imageFile);
        return updatedData;
      } catch (err) {
        console.error('Image upload failed:', err);
        return data;
      }
    }

    return data;
  },

  /**
   * Upload an image for a class (admin only)
   * @param {string} classId - Class ID
   * @param {File} file - Image file
   * @returns {Promise<Object>} Updated class data
   */
  async uploadImage(classId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post(
      API_ENDPOINTS.CLASSES.IMAGE_UPLOAD(classId),
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return data;
  },

  /**
   * Delete class (admin only)
   * @param {string} id - Class ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    const { data } = await apiClient.delete(API_ENDPOINTS.CLASSES.BY_ID(id));
    return data;
  },

  /**
   * Check if a class has available capacity
   * Capacity data is included in class details (has_capacity, available_spots)
   * @param {string} id - Class ID
   * @returns {Promise<Object>} Capacity information {available: boolean, spots_left: number}
   */
  async checkCapacity(id) {
    const classData = await this.getById(id);
    return {
      available: classData.has_capacity,
      spots_left: classData.available_spots,
      capacity: classData.capacity,
      current_enrollment: classData.current_enrollment,
    };
  },

  /**
   * Get classes by program
   * @param {string} programId - Program ID
   * @returns {Promise<Array>} List of classes in the program
   */
  async getByProgram(programId) {
    return this.getAll({ program_id: programId });
  },

  /**
   * Get classes by school
   * @param {string} schoolId - School ID
   * @returns {Promise<Array>} List of classes at the school
   */
  async getBySchool(schoolId) {
    return this.getAll({ school_id: schoolId });
  },

  /**
   * Get classes with available spots
   * @returns {Promise<Array>} List of classes with capacity
   */
  async getAvailable() {
    return this.getAll({ has_capacity: true });
  },
};

export default classesService;
