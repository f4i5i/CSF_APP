/**
 * Waivers Service
 * Handles liability waivers and consent forms
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const waiversService = {
  /**
   * Get all waiver templates (admin only)
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.type] - Filter by type (liability, medical, photo_consent)
   * @param {boolean} [filters.active] - Filter by active status
   * @returns {Promise<Array>} List of waiver templates
   */
  async getTemplates(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.WAIVERS.TEMPLATES, {
      params: filters,
    });
    return data;
  },

  /**
   * Get waiver template by ID
   * @param {string} id - Template ID
   * @returns {Promise<Object>} Waiver template details
   */
  async getTemplateById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.WAIVERS.TEMPLATE_BY_ID(id));
    return data;
  },

  /**
   * Create waiver template (admin only)
   * @param {Object} templateData - Template information
   * @param {string} templateData.name - Template name
   * @param {string} templateData.type - Waiver type
   * @param {string} templateData.content - Waiver content/text
   * @param {boolean} [templateData.required] - Required for all participants
   * @param {string} [templateData.program_id] - Specific to a program
   * @param {Array<string>} [templateData.required_fields] - Additional required fields
   * @returns {Promise<Object>} Created template
   */
  async createTemplate(templateData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.WAIVERS.CREATE_TEMPLATE,
      templateData
    );
    return data;
  },

  /**
   * Update waiver template (admin only)
   * @param {string} id - Template ID
   * @param {Object} templateData - Updated template data
   * @returns {Promise<Object>} Updated template
   */
  async updateTemplate(id, templateData) {
    const { data } = await apiClient.put(
      API_ENDPOINTS.WAIVERS.TEMPLATE_BY_ID(id),
      templateData
    );
    return data;
  },

  /**
   * Delete waiver template (admin only)
   * @param {string} id - Template ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteTemplate(id) {
    const { data } = await apiClient.delete(
      API_ENDPOINTS.WAIVERS.TEMPLATE_BY_ID(id)
    );
    return data;
  },

  /**
   * Get user's signed waivers
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.child_id] - Filter by child ID
   * @param {string} [filters.type] - Filter by waiver type
   * @returns {Promise<Array>} List of signed waivers
   */
  async getMySigned(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.WAIVERS.MY_SIGNED, {
      params: filters,
    });
    return data;
  },

  /**
   * Get pending waivers for user
   * @returns {Promise<Array>} Waivers that need to be signed
   */
  async getPending() {
    const { data } = await apiClient.get(API_ENDPOINTS.WAIVERS.PENDING);
    return data;
  },

  /**
   * Sign a waiver
   * @param {Object} signatureData - Signature information
   * @param {string} signatureData.template_id - Waiver template ID
   * @param {string} [signatureData.child_id] - Child ID if signing for a child
   * @param {string} signatureData.signature - Digital signature data (base64 or text)
   * @param {string} signatureData.signer_name - Name of person signing
   * @param {Object} [signatureData.additional_data] - Additional required data
   * @param {boolean} signatureData.agreed - Agreement confirmation
   * @returns {Promise<Object>} Signed waiver confirmation
   */
  async sign(signatureData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.WAIVERS.SIGN,
      signatureData
    );
    return data;
  },

  /**
   * Get signed waiver by ID
   * @param {string} id - Signed waiver ID
   * @returns {Promise<Object>} Signed waiver details
   */
  async getSignedById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.WAIVERS.SIGNED_BY_ID(id));
    return data;
  },

  /**
   * Download signed waiver as PDF
   * @param {string} id - Signed waiver ID
   * @returns {Promise<Blob>} PDF blob
   */
  async downloadPdf(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.WAIVERS.DOWNLOAD_PDF(id), {
      responseType: 'blob',
    });
    return data;
  },

  /**
   * Revoke signed waiver (admin only)
   * @param {string} id - Signed waiver ID
   * @param {Object} revocationData - Revocation information
   * @param {string} revocationData.reason - Reason for revocation
   * @returns {Promise<Object>} Revocation confirmation
   */
  async revoke(id, revocationData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.WAIVERS.REVOKE(id),
      revocationData
    );
    return data;
  },

  /**
   * Get waivers for a specific child
   * @param {string} childId - Child ID
   * @returns {Promise<Array>} Child's waivers
   */
  async getByChild(childId) {
    return this.getMySigned({ child_id: childId });
  },

  /**
   * Check if all required waivers are signed
   * @param {string} [childId] - Child ID (optional, checks for all children if not provided)
   * @returns {Promise<Object>} Status {all_signed: boolean, pending: Array, missing: Array}
   */
  async checkCompletionStatus(childId = null) {
    const params = childId ? { child_id: childId } : {};
    const { data } = await apiClient.get(API_ENDPOINTS.WAIVERS.CHECK_STATUS, {
      params,
    });
    return data;
  },

  /**
   * Get required waivers for enrollment
   * @param {string} classId - Class ID
   * @returns {Promise<Array>} Required waivers for the class
   */
  async getRequiredForClass(classId) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.WAIVERS.REQUIRED_FOR_CLASS(classId)
    );
    return data;
  },

  /**
   * Bulk sign waivers for a child
   * @param {Object} bulkSignData - Bulk signature data
   * @param {string} bulkSignData.child_id - Child ID
   * @param {Array} bulkSignData.waivers - Array of {template_id, signature, agreed}
   * @param {string} bulkSignData.signer_name - Name of person signing
   * @returns {Promise<Object>} Bulk signature confirmation
   */
  async bulkSign(bulkSignData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.WAIVERS.BULK_SIGN,
      bulkSignData
    );
    return data;
  },

  /**
   * Resend waiver notification email
   * @param {string} templateId - Waiver template ID
   * @returns {Promise<Object>} Confirmation
   */
  async resendNotification(templateId) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.WAIVERS.RESEND_NOTIFICATION(templateId)
    );
    return data;
  },

  /**
   * Get waiver statistics (admin only)
   * @param {Object} params - Filter parameters
   * @param {string} [params.template_id] - Specific template
   * @param {string} [params.start_date] - Start date
   * @param {string} [params.end_date] - End date
   * @returns {Promise<Object>} Statistics
   */
  async getStats(params = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.WAIVERS.STATS, {
      params,
    });
    return data;
  },
};

export default waiversService;
