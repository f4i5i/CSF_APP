/**
 * Waivers Service
 * Handles liability waivers and consent forms
 *
 * Aligned with backend API v1/waivers.py
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const waiversService = {
  // ============== User Waiver Endpoints ==============

  /**
   * Get all required waivers with acceptance status
   * @param {Object} params - Filter parameters
   * @param {string} [params.program_id] - Filter by program
   * @param {string} [params.school_id] - Filter by school
   * @returns {Promise<Object>} {items: [], pending_count, total}
   */
  async getRequired(params = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.WAIVERS.REQUIRED, {
      params,
    });
    return data;
  },

  /**
   * Get ONLY pending waivers (not accepted or needs re-consent)
   * @param {Object} params - Filter parameters
   * @param {string} [params.program_id] - Filter by program
   * @param {string} [params.school_id] - Filter by school
   * @returns {Promise<Object>} {items: [{waiver_template, is_accepted, acceptance, needs_reconsent}], pending_count, total}
   */
  async getPending(params = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.WAIVERS.PENDING, {
      params,
    });
    return data;
  },

  /**
   * Accept/sign a single waiver
   * @param {Object} acceptanceData - Acceptance data
   * @param {string} acceptanceData.waiver_template_id - Template ID to accept
   * @param {string} acceptanceData.signer_name - Name of person signing
   * @returns {Promise<Object>} Acceptance confirmation
   */
  async accept(acceptanceData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.WAIVERS.ACCEPT,
      acceptanceData
    );
    return data;
  },

  /**
   * Get user's waiver acceptances
   * @returns {Promise<Object>} {items: [], total}
   */
  async getMyAcceptances() {
    const { data } = await apiClient.get(API_ENDPOINTS.WAIVERS.MY_ACCEPTANCES);
    return data;
  },

  /**
   * Get specific acceptance by ID
   * @param {string} id - Acceptance ID
   * @returns {Promise<Object>} Acceptance details
   */
  async getAcceptanceById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.WAIVERS.ACCEPTANCE_BY_ID(id));
    return data;
  },

  // ============== Admin Template Endpoints ==============

  /**
   * Get all waiver templates (admin only)
   * @param {Object} params - Filter parameters
   * @param {boolean} [params.include_inactive] - Include inactive templates
   * @returns {Promise<Object>} {items: [], total}
   */
  async getTemplates(params = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.WAIVERS.TEMPLATES, {
      params,
    });
    return data;
  },

  /**
   * Get waiver template by ID (admin only)
   * @param {string} id - Template ID
   * @returns {Promise<Object>} Template details
   */
  async getTemplateById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.WAIVERS.TEMPLATE_BY_ID(id));
    return data;
  },

  /**
   * Create waiver template (admin only)
   * @param {Object} templateData - Template information
   * @param {string} templateData.name - Template name
   * @param {string} templateData.waiver_type - Waiver type (liability, medical, photo_consent, etc.)
   * @param {string} templateData.content - Waiver content/text
   * @param {boolean} [templateData.is_active] - Active status
   * @param {boolean} [templateData.is_required] - Required for all participants
   * @param {string} [templateData.applies_to_program_id] - Specific to a program
   * @param {string} [templateData.applies_to_school_id] - Specific to a school
   * @returns {Promise<Object>} Created template
   */
  async createTemplate(templateData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.WAIVERS.TEMPLATES,
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
   * Soft delete - sets is_active to False
   * @param {string} id - Template ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteTemplate(id) {
    const { data } = await apiClient.delete(
      API_ENDPOINTS.WAIVERS.TEMPLATE_BY_ID(id)
    );
    return data;
  },

  // ============== Helper Methods ==============

  /**
   * Sign multiple waivers (client-side loop over accept endpoint)
   * @param {Object} bulkData - Bulk signature data
   * @param {Array} bulkData.waivers - Array of {template_id, signature, agreed}
   * @param {string} bulkData.signer_name - Name of person signing
   * @returns {Promise<Object>} {success: boolean, results: [], errors: []}
   */
  async signMultiple(bulkData) {
    const results = [];
    const errors = [];

    for (const waiver of bulkData.waivers) {
      try {
        const result = await this.accept({
          waiver_template_id: waiver.template_id,
          signer_name: bulkData.signer_name,
        });
        results.push(result);
      } catch (error) {
        errors.push({
          template_id: waiver.template_id,
          error: error.message || 'Failed to sign waiver',
        });
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
      signed_count: results.length,
      failed_count: errors.length,
    };
  },

  /**
   * Check if all required waivers are signed
   * @param {Object} params - Parameters
   * @param {string} [params.program_id] - Program ID
   * @param {string} [params.school_id] - School ID
   * @returns {Promise<Object>} {all_signed: boolean, pending_count: number}
   */
  async checkCompletionStatus(params = {}) {
    const { pending_count } = await this.getPending(params);
    return {
      all_signed: pending_count === 0,
      pending_count,
    };
  },
};

export default waiversService;
