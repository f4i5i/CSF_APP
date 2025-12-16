/**
 * Children Service
 * Handles child/student management and emergency contacts
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const childrenService = {
  /**
   * Get current user's children
   * @returns {Promise<Array>} List of children
   */
  async getMy() {
    const response = await apiClient.get(API_ENDPOINTS.CHILDREN.MY);
    const { data } = response;

    // Handle paginated response format {items: [...], total: X}
    if (data && data.items) {
      return data.items;
    }

    // Return data as-is if not paginated
    return data;
  },

  /**
   * Create new child
   * @param {Object} childData - Child information
   * @param {string} childData.first_name - First name
   * @param {string} childData.last_name - Last name
   * @param {string} childData.date_of_birth - Date of birth (YYYY-MM-DD)
   * @param {string} [childData.jersey_size] - Jersey size
   * @param {string} [childData.grade] - Grade level
   * @param {string} [childData.medical_conditions] - Medical conditions
   * @param {boolean} childData.has_no_medical_conditions - No medical conditions flag
   * @param {boolean} childData.after_school_attendance - After school attendance
   * @param {string} [childData.after_school_program] - After school program name
   * @param {string} [childData.health_insurance_number] - Insurance number
   * @param {string} [childData.how_heard_about_us] - How they heard about us
   * @param {Array} [childData.emergency_contacts] - Emergency contact list
   * @returns {Promise<Object>} Created child
   */
  async create(childData) {
    const { data } = await apiClient.post(API_ENDPOINTS.CHILDREN.CREATE, childData);
    return data;
  },

  /**
   * Get child by ID
   * @param {string} id - Child ID
   * @returns {Promise<Object>} Child details
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.CHILDREN.BY_ID(id));
    return data;
  },

  /**
   * Update child information
   * @param {string} id - Child ID
   * @param {Object} childData - Updated child data
   * @returns {Promise<Object>} Updated child
   */
  async update(id, childData) {
    const { data } = await apiClient.put(API_ENDPOINTS.CHILDREN.BY_ID(id), childData);
    return data;
  },

  /**
   * Delete child (soft delete)
   * @param {string} id - Child ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    const { data } = await apiClient.delete(API_ENDPOINTS.CHILDREN.BY_ID(id));
    return data;
  },

  /**
   * Get emergency contacts for a child
   * @param {string} childId - Child ID
   * @returns {Promise<Array>} Emergency contacts
   */
  async getEmergencyContacts(childId) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.CHILDREN.EMERGENCY_CONTACTS(childId)
    );
    return data;
  },

  /**
   * Add emergency contact
   * @param {string} childId - Child ID
   * @param {Object} contactData - Contact information
   * @param {string} contactData.name - Contact name
   * @param {string} contactData.relation - Relation to child
   * @param {string} contactData.phone - Phone number
   * @param {string} [contactData.email] - Email address
   * @param {boolean} [contactData.is_primary] - Primary contact flag
   * @returns {Promise<Object>} Created contact
   */
  async addEmergencyContact(childId, contactData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.CHILDREN.EMERGENCY_CONTACTS(childId),
      contactData
    );
    return data;
  },

  /**
   * Update emergency contact
   * @param {string} contactId - Contact ID
   * @param {Object} contactData - Updated contact data
   * @returns {Promise<Object>} Updated contact
   */
  async updateEmergencyContact(contactId, contactData) {
    const { data } = await apiClient.put(
      API_ENDPOINTS.CHILDREN.EMERGENCY_CONTACT_BY_ID(contactId),
      contactData
    );
    return data;
  },

  /**
   * Delete emergency contact
   * @param {string} contactId - Contact ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteEmergencyContact(contactId) {
    const { data } = await apiClient.delete(
      API_ENDPOINTS.CHILDREN.EMERGENCY_CONTACT_BY_ID(contactId)
    );
    return data;
  },
};

export default childrenService;
