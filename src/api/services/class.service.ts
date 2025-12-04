/**
 * Class Service
 * Handles sports class operations
 */

import apiClient from '../client/axios-client';
import { ENDPOINTS } from '../constants/endpoints';
import type {
  Class,
  ClassFilters,
  ClassCapacity,
  ClassWithAvailability,
  CreateClassRequest,
  UpdateClassRequest,
  Program,
  Area,
} from '../types/class.types';

/**
 * Class service
 * Pure API functions for class management
 */
export const classService = {
  /**
   * Get all classes with filters
   */
  async getAll(filters?: ClassFilters): Promise<ClassWithAvailability[]> {
    const { data } = await apiClient.get<{ items: any[]; total: number; skip: number; limit: number }>(
      ENDPOINTS.CLASSES.LIST,
      { params: filters }
    );

    // Transform API response to match expected format
    return data.items.map(item => {
      // Convert weekdays array + start_time/end_time to schedule array
      const schedule = item.weekdays?.map((day: string) => ({
        day_of_week: day.toUpperCase(),
        start_time: item.start_time,
        end_time: item.end_time
      })) || [];

      return {
        ...item,
        schedule,
        base_price: parseFloat(item.price || item.base_price || 0)
      };
    });
  },

  /**
   * Get class by ID
   */
  async getById(id: string): Promise<Class> {
    const { data } = await apiClient.get<Class>(ENDPOINTS.CLASSES.BY_ID(id));
    return data;
  },

  /**
   * Create new class (admin only)
   */
  async create(classData: CreateClassRequest): Promise<Class> {
    const { data } = await apiClient.post<Class>(
      ENDPOINTS.CLASSES.CREATE,
      classData
    );
    return data;
  },

  /**
   * Update class (admin only)
   */
  async update(id: string, classData: UpdateClassRequest): Promise<Class> {
    const { data } = await apiClient.put<Class>(
      ENDPOINTS.CLASSES.UPDATE(id),
      classData
    );
    return data;
  },

  /**
   * Delete class (admin only)
   */
  async delete(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(
      ENDPOINTS.CLASSES.DELETE(id)
    );
    return data;
  },

  /**
   * Get class capacity information
   */
  async getCapacity(id: string): Promise<ClassCapacity> {
    const { data } = await apiClient.get<ClassCapacity>(
      ENDPOINTS.CLASSES.CAPACITY(id)
    );
    return data;
  },
};

/**
 * Program service
 */
export const programService = {
  /**
   * Get all programs
   */
  async getAll(): Promise<Program[]> {
    const { data } = await apiClient.get<Program[]>(ENDPOINTS.PROGRAMS.LIST);
    return data;
  },

  /**
   * Get program by ID
   */
  async getById(id: string): Promise<Program> {
    const { data } = await apiClient.get<Program>(ENDPOINTS.PROGRAMS.BY_ID(id));
    return data;
  },
};

/**
 * Area service
 */
export const areaService = {
  /**
   * Get all areas
   */
  async getAll(): Promise<Area[]> {
    const { data } = await apiClient.get<Area[]>(ENDPOINTS.AREAS.LIST);
    return data;
  },

  /**
   * Get area by ID
   */
  async getById(id: string): Promise<Area> {
    const { data } = await apiClient.get<Area>(ENDPOINTS.AREAS.BY_ID(id));
    return data;
  },
};
