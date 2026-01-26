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
  const { schedule, payment_options, class_type, ...rest } = classData;

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

  return {
    ...rest,
    ...scheduleData,
    class_type: mappedClassType,
    payment_options: transformedPaymentOptions,
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

    // TODO: Handle image upload if class_image is a File
    // For now, we'll skip image upload and use image_url if provided
    if (classData.class_image instanceof File) {
      console.warn('Image upload not yet implemented. Skipping image.');
      delete transformedData.class_image;
    } else if (typeof classData.class_image === 'string') {
      transformedData.image_url = classData.class_image;
      delete transformedData.class_image;
    }

    const { data } = await apiClient.post(API_ENDPOINTS.CLASSES.CREATE, transformedData);
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

    // TODO: Handle image upload if class_image is a File
    if (classData.class_image instanceof File) {
      console.warn('Image upload not yet implemented. Skipping image.');
      delete transformedData.class_image;
    } else if (typeof classData.class_image === 'string') {
      transformedData.image_url = classData.class_image;
      delete transformedData.class_image;
    }

    const { data } = await apiClient.put(API_ENDPOINTS.CLASSES.BY_ID(id), transformedData);
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
