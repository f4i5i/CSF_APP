/**
 * Discounts Service
 * Handles discount codes and promotional offers
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const discountsService = {
  /**
   * Get all available discount codes (admin only)
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.status] - Filter by status (active, expired, used)
   * @param {string} [filters.type] - Filter by type (percentage, fixed, free_shipping)
   * @returns {Promise<Array>} List of discount codes
   */
  async getAll(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.DISCOUNTS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get discount by ID (admin only)
   * @param {string} id - Discount ID
   * @returns {Promise<Object>} Discount details
   */
  async getById(id) {
    const { data} = await apiClient.get(API_ENDPOINTS.DISCOUNTS.BY_ID(id));
    return data;
  },

  /**
   * Validate discount code
   * @param {Object} validationData - Validation parameters
   * @param {string} validationData.code - Discount code
   * @param {number} [validationData.order_amount] - Order amount to apply to
   * @param {Array<string>} [validationData.item_ids] - Order item IDs
   * @returns {Promise<Object>} Validation result {valid: boolean, discount: Object, message: string}
   */
  async validate(validationData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.DISCOUNTS.VALIDATE,
      validationData
    );
    return data;
  },

  /**
   * Create new discount code (admin only)
   * @param {Object} discountData - Discount information
   * @param {string} discountData.code - Unique discount code
   * @param {string} discountData.type - Discount type (percentage, fixed_amount)
   * @param {number} discountData.value - Discount value (percentage or amount)
   * @param {string} [discountData.description] - Description
   * @param {string} [discountData.valid_from] - Valid from date (YYYY-MM-DD)
   * @param {string} [discountData.valid_until] - Valid until date (YYYY-MM-DD)
   * @param {number} [discountData.max_uses] - Maximum number of uses
   * @param {number} [discountData.max_uses_per_user] - Max uses per user
   * @param {number} [discountData.min_order_amount] - Minimum order amount required
   * @param {Array<string>} [discountData.applicable_programs] - Program IDs this applies to
   * @param {Array<string>} [discountData.applicable_classes] - Class IDs this applies to
   * @param {boolean} [discountData.first_time_only] - Only for first-time users
   * @returns {Promise<Object>} Created discount
   */
  async create(discountData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.DISCOUNTS.CREATE,
      discountData
    );
    return data;
  },

  /**
   * Update discount code (admin only)
   * @param {string} id - Discount ID
   * @param {Object} discountData - Updated discount data
   * @returns {Promise<Object>} Updated discount
   */
  async update(id, discountData) {
    const { data } = await apiClient.put(
      API_ENDPOINTS.DISCOUNTS.BY_ID(id),
      discountData
    );
    return data;
  },

  /**
   * Delete discount code (admin only)
   * @param {string} id - Discount ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    const { data } = await apiClient.delete(API_ENDPOINTS.DISCOUNTS.BY_ID(id));
    return data;
  },

  /**
   * Deactivate discount code (admin only)
   * @param {string} id - Discount ID
   * @returns {Promise<Object>} Confirmation
   */
  async deactivate(id) {
    const { data } = await apiClient.post(API_ENDPOINTS.DISCOUNTS.DEACTIVATE(id));
    return data;
  },

  /**
   * Activate discount code (admin only)
   * @param {string} id - Discount ID
   * @returns {Promise<Object>} Confirmation
   */
  async activate(id) {
    const { data } = await apiClient.post(API_ENDPOINTS.DISCOUNTS.ACTIVATE(id));
    return data;
  },

  /**
   * Get discount usage statistics (admin only)
   * @param {string} id - Discount ID
   * @returns {Promise<Object>} Usage statistics {total_uses, total_savings, users: Array}
   */
  async getUsageStats(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.DISCOUNTS.USAGE_STATS(id));
    return data;
  },

  /**
   * Get user's available discounts
   * @returns {Promise<Array>} Available discount codes for the user
   */
  async getAvailable() {
    const { data } = await apiClient.get(API_ENDPOINTS.DISCOUNTS.AVAILABLE);
    return data;
  },

  /**
   * Get user's discount usage history
   * @returns {Promise<Array>} Discounts used by the user
   */
  async getMyUsage() {
    const { data } = await apiClient.get(API_ENDPOINTS.DISCOUNTS.MY_USAGE);
    return data;
  },

  /**
   * Check if user is eligible for a discount
   * @param {string} code - Discount code
   * @returns {Promise<Object>} Eligibility info {eligible: boolean, reason: string}
   */
  async checkEligibility(code) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.DISCOUNTS.CHECK_ELIGIBILITY,
      { code }
    );
    return data;
  },

  /**
   * Get active discount codes (admin only)
   * @returns {Promise<Array>} Active discounts
   */
  async getActive() {
    return this.getAll({ status: 'active' });
  },

  /**
   * Get expired discount codes (admin only)
   * @returns {Promise<Array>} Expired discounts
   */
  async getExpired() {
    return this.getAll({ status: 'expired' });
  },

  /**
   * Generate bulk discount codes (admin only)
   * @param {Object} bulkData - Bulk generation parameters
   * @param {string} bulkData.prefix - Code prefix
   * @param {number} bulkData.count - Number of codes to generate
   * @param {string} bulkData.type - Discount type
   * @param {number} bulkData.value - Discount value
   * @param {string} [bulkData.valid_until] - Expiration date
   * @param {number} [bulkData.max_uses_per_code] - Max uses per code
   * @returns {Promise<Object>} Generated codes {codes: Array, count: number}
   */
  async generateBulk(bulkData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.DISCOUNTS.GENERATE_BULK,
      bulkData
    );
    return data;
  },

  /**
   * Export discount codes (admin only)
   * @param {Object} filters - Filter parameters
   * @returns {Promise<Blob>} CSV export
   */
  async export(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.DISCOUNTS.EXPORT, {
      params: filters,
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Check sibling discount eligibility
   * @param {string} childId - Child ID to check eligibility for
   * @returns {Promise<Object>} Eligibility info {eligible: boolean, sibling_count: number, discount_percentage: number, discount_label: string}
   */
  async checkSiblingDiscount(childId) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.DISCOUNTS.SIBLING_ELIGIBILITY(childId)
    );
    return data;
  },
};

export default discountsService;
