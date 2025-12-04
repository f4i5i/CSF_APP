/**
 * Child Service
 * Handles child/student management and emergency contacts
 */

import apiClient from '../client/axios-client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  Child,
  CreateChildRequest,
  UpdateChildRequest,
  EmergencyContact,
  CreateEmergencyContactRequest,
  UpdateEmergencyContactRequest,
  ChildFilters,
} from '../types/child.types';

/**
 * Child service
 * Pure API functions for child management
 */
export const childService = {
  /**
   * Get current user's children
   */
  async getMy(filters?: ChildFilters): Promise<Child[]> {
    const { data } = await apiClient.get<Child[]>(ENDPOINTS.CHILDREN.MY, {
      params: filters,
    });
    return data;
  },

  /**
   * Get child by ID
   */
  async getById(id: string): Promise<Child> {
    const { data } = await apiClient.get<Child>(ENDPOINTS.CHILDREN.BY_ID(id));
    return data;
  },

  /**
   * Create new child
   */
  async create(childData: CreateChildRequest): Promise<Child> {
    const { data } = await apiClient.post<Child>(
      ENDPOINTS.CHILDREN.CREATE,
      childData
    );
    return data;
  },

  /**
   * Update child information
   */
  async update(id: string, childData: UpdateChildRequest): Promise<Child> {
    const { data } = await apiClient.put<Child>(
      ENDPOINTS.CHILDREN.BY_ID(id),
      childData
    );
    return data;
  },

  /**
   * Delete child (soft delete)
   */
  async delete(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(
      ENDPOINTS.CHILDREN.BY_ID(id)
    );
    return data;
  },

  /**
   * Get emergency contacts for a child
   */
  async getEmergencyContacts(childId: string): Promise<EmergencyContact[]> {
    const { data } = await apiClient.get<EmergencyContact[]>(
      ENDPOINTS.CHILDREN.EMERGENCY_CONTACTS(childId)
    );
    return data;
  },

  /**
   * Add emergency contact
   */
  async addEmergencyContact(
    childId: string,
    contactData: CreateEmergencyContactRequest
  ): Promise<EmergencyContact> {
    const { data } = await apiClient.post<EmergencyContact>(
      ENDPOINTS.CHILDREN.EMERGENCY_CONTACTS(childId),
      contactData
    );
    return data;
  },

  /**
   * Update emergency contact
   */
  async updateEmergencyContact(
    childId: string,
    contactId: string,
    contactData: UpdateEmergencyContactRequest
  ): Promise<EmergencyContact> {
    const { data } = await apiClient.put<EmergencyContact>(
      ENDPOINTS.CHILDREN.EMERGENCY_CONTACT(childId, contactId),
      contactData
    );
    return data;
  },

  /**
   * Delete emergency contact
   */
  async deleteEmergencyContact(
    childId: string,
    contactId: string
  ): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(
      ENDPOINTS.CHILDREN.EMERGENCY_CONTACT(childId, contactId)
    );
    return data;
  },
};
