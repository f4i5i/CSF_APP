/**
 * @file class.service.ts
 * @description Service module for managing sports classes, programs, and areas in the CSF application.
 *
 * This module provides comprehensive API interfaces for:
 * - Class management (CRUD operations)
 * - Class filtering, searching, and pagination
 * - Capacity tracking and availability checking
 * - Program management and retrieval
 * - Area management and retrieval
 * - Schedule transformation and data normalization
 *
 * Architecture:
 *
 * The service is organized into three main exports:
 * 1. classService - Sports class operations
 * 2. programService - Program/sport type operations
 * 3. areaService - Geographic area operations
 *
 * Key Features:
 *
 * 1. CLASS MANAGEMENT
 *    - Full CRUD operations for sports classes
 *    - Advanced filtering (by program, area, school, capacity, age)
 *    - Pagination support for large datasets
 *    - Real-time capacity tracking
 *    - Schedule data transformation
 *
 * 2. DATA TRANSFORMATION
 *    - Converts backend format to frontend format
 *    - Backend: {weekdays: [], start_time, end_time}
 *    - Frontend: {schedule: [{day_of_week, start_time, end_time}]}
 *    - Normalizes price fields (base_price vs price)
 *
 * 3. RELATIONSHIPS
 *    - Classes belong to Programs (sport type)
 *    - Classes belong to Areas (geographic location)
 *    - Classes may belong to Schools
 *    - Classes can have Coaches (user reference)
 *    - Classes track enrollments and capacity
 *
 * 4. FILTERING CAPABILITIES
 *    - By program (sport type: soccer, basketball, etc.)
 *    - By area (geographic region)
 *    - By school (specific location)
 *    - By capacity (only show classes with available spots)
 *    - By age range (min_age, max_age)
 *    - By day of week (filter by schedule)
 *    - By active status
 *    - Full-text search (name and description)
 *    - Pagination (skip, limit)
 *
 * 5. CAPACITY MANAGEMENT
 *    - Real-time availability tracking
 *    - Current enrollment count
 *    - Available spots calculation
 *    - Waitlist support
 *    - Capacity overflow prevention
 *
 * Technical Implementation:
 *
 * Response Transformation Flow:
 * 1. API returns classes with weekdays array + separate times
 * 2. Service transforms to schedule array for frontend consistency
 * 3. Each day gets own schedule entry with times
 * 4. Price field normalized to base_price
 * 5. Frontend receives consistent ClassWithAvailability objects
 *
 * Example Backend Response:
 * {
 *   id: "123",
 *   name: "Soccer Basics",
 *   weekdays: ["monday", "wednesday"],
 *   start_time: "15:00",
 *   end_time: "16:30",
 *   price: 150
 * }
 *
 * Transformed Frontend Response:
 * {
 *   id: "123",
 *   name: "Soccer Basics",
 *   schedule: [
 *     {day_of_week: "MONDAY", start_time: "15:00", end_time: "16:30"},
 *     {day_of_week: "WEDNESDAY", start_time: "15:00", end_time: "16:30"}
 *   ],
 *   base_price: 150
 * }
 *
 * @requires ../client/axios-client - Configured HTTP client with auth
 * @requires ../constants/endpoints - API endpoint constants
 * @requires ../types/class.types - TypeScript type definitions
 *
 * @example
 * // Import services
 * import { classService, programService, areaService } from '@/api/services/class.service';
 *
 * // Get all classes with filters
 * const classes = await classService.getAll({
 *   program_id: "soccer-123",
 *   has_capacity: true,
 *   min_age: 6,
 *   max_age: 12,
 *   skip: 0,
 *   limit: 20
 * });
 *
 * // Get specific class details
 * const classDetail = await classService.getById("class-456");
 *
 * // Check capacity
 * const capacity = await classService.getCapacity("class-456");
 * if (capacity.has_capacity) {
 *   console.log(`${capacity.available_spots} spots available`);
 * }
 *
 * // Create new class (admin only)
 * const newClass = await classService.create({
 *   name: "Advanced Soccer",
 *   program_id: "soccer-123",
 *   school_id: "school-789",
 *   capacity: 20,
 *   base_price: 200,
 *   start_date: "2025-01-15",
 *   end_date: "2025-05-15",
 *   schedule: [
 *     {day_of_week: "TUESDAY", start_time: "16:00", end_time: "17:30"},
 *     {day_of_week: "THURSDAY", start_time: "16:00", end_time: "17:30"}
 *   ]
 * });
 *
 * // Get all programs
 * const programs = await programService.getAll();
 *
 * // Get all areas
 * const areas = await areaService.getAll();
 */

// ========================================
// IMPORTS
// ========================================
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

// ========================================
// CLASS SERVICE
// ========================================

/**
 * Class Service
 *
 * Provides API operations for sports class management.
 * Handles class CRUD, filtering, capacity tracking, and data transformation.
 *
 * Data Flow:
 * - Requests: Frontend format -> API format (handled by backend)
 * - Responses: API format -> Frontend format (transformed in getAll)
 *
 * All methods use the configured apiClient which:
 * - Automatically attaches JWT tokens
 * - Handles token refresh on 401 errors
 * - Transforms errors to user-friendly messages
 */
export const classService = {
  /**
   * Get all classes with optional filters and pagination
   *
   * Retrieves a list of sports classes with comprehensive filtering options.
   * Supports pagination, searching, and filtering by multiple criteria.
   * Transforms backend response to frontend-friendly format.
   *
   * @param {ClassFilters} [filters] - Optional filter parameters
   * @param {string} [filters.program_id] - Filter by program ID (sport type)
   * @param {string} [filters.area_id] - Filter by geographic area ID
   * @param {string} [filters.school_id] - Filter by school ID
   * @param {boolean} [filters.has_capacity] - Only return classes with available spots
   * @param {number} [filters.min_age] - Minimum age requirement
   * @param {number} [filters.max_age] - Maximum age requirement
   * @param {string} [filters.day_of_week] - Filter by day of week (MONDAY, TUESDAY, etc.)
   * @param {boolean} [filters.is_active] - Filter by active status
   * @param {string} [filters.search] - Full-text search in name and description
   * @param {number} [filters.skip] - Number of items to skip (pagination offset)
   * @param {number} [filters.limit] - Maximum number of items to return (page size)
   *
   * @returns {Promise<ClassWithAvailability[]>} Array of classes with availability info
   *
   * @throws {Error} If API request fails or network error occurs
   *
   * @example
   * // Get all active classes with available spots
   * const availableClasses = await classService.getAll({
   *   has_capacity: true,
   *   is_active: true
   * });
   *
   * @example
   * // Get soccer classes for ages 6-12 in specific area with pagination
   * const soccerClasses = await classService.getAll({
   *   program_id: "soccer-123",
   *   area_id: "north-456",
   *   min_age: 6,
   *   max_age: 12,
   *   skip: 0,
   *   limit: 20
   * });
   *
   * @example
   * // Search for classes by name
   * const searchResults = await classService.getAll({
   *   search: "beginner basketball"
   * });
   *
   * @example
   * // Get Monday classes at a specific school
   * const mondayClasses = await classService.getAll({
   *   school_id: "school-789",
   *   day_of_week: "MONDAY"
   * });
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
   *
   * Retrieves detailed information for a specific class including:
   * - Basic info (name, description, dates)
   * - Schedule details
   * - Capacity and enrollment
   * - Related entities (program, area, school, coach)
   * - Pricing information
   *
   * @param {string} id - Class ID (UUID format)
   *
   * @returns {Promise<Class>} Complete class details
   *
   * @throws {Error} If class not found (404) or request fails
   *
   * @example
   * // Get class details for enrollment page
   * const classDetail = await classService.getById("550e8400-e29b-41d4-a716-446655440000");
   * console.log(classDetail.name); // "Advanced Soccer"
   * console.log(classDetail.schedule); // [{day_of_week: "MONDAY", ...}]
   * console.log(classDetail.current_enrollment); // 15
   * console.log(classDetail.capacity); // 20
   *
   * @example
   * // Check if class has coach assigned
   * const classInfo = await classService.getById(classId);
   * if (classInfo.coach) {
   *   console.log(`Coach: ${classInfo.coach.first_name} ${classInfo.coach.last_name}`);
   * }
   */
  async getById(id: string): Promise<Class> {
    const { data } = await apiClient.get<Class>(ENDPOINTS.CLASSES.BY_ID(id));
    return data;
  },

  /**
   * Create new class (admin only)
   *
   * Creates a new sports class with specified details.
   * Requires admin role authentication.
   *
   * @param {CreateClassRequest} classData - Class data to create
   * @param {string} classData.name - Class name (required)
   * @param {string} classData.program_id - Program/sport type ID (required)
   * @param {string} [classData.school_id] - School location ID
   * @param {string} [classData.area_id] - Geographic area ID
   * @param {string} [classData.coach_id] - Coach user ID
   * @param {number} classData.base_price - Base price in dollars (required)
   * @param {number} classData.capacity - Maximum student capacity (required)
   * @param {number} [classData.min_age] - Minimum age requirement
   * @param {number} [classData.max_age] - Maximum age requirement
   * @param {string} classData.start_date - Start date in YYYY-MM-DD format (required)
   * @param {string} classData.end_date - End date in YYYY-MM-DD format (required)
   * @param {ClassSchedule[]} [classData.schedule] - Weekly schedule array
   * @param {string} [classData.location] - Physical location/address
   * @param {string} [classData.description] - Class description
   *
   * @returns {Promise<Class>} Created class object with generated ID
   *
   * @throws {Error} If validation fails, user not authorized (403), or request fails
   *
   * @example
   * // Create a basic class
   * const newClass = await classService.create({
   *   name: "Beginner Basketball",
   *   program_id: "basketball-123",
   *   school_id: "school-456",
   *   area_id: "north-789",
   *   base_price: 150,
   *   capacity: 15,
   *   min_age: 6,
   *   max_age: 10,
   *   start_date: "2025-02-01",
   *   end_date: "2025-05-30",
   *   schedule: [
   *     {day_of_week: "MONDAY", start_time: "15:00", end_time: "16:30"},
   *     {day_of_week: "WEDNESDAY", start_time: "15:00", end_time: "16:30"}
   *   ],
   *   location: "Gym A",
   *   description: "Learn the fundamentals of basketball"
   * });
   * console.log(`Created class with ID: ${newClass.id}`);
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
   *
   * Updates an existing class with partial data.
   * Only provided fields will be updated.
   * Requires admin role authentication.
   *
   * @param {string} id - Class ID to update
   * @param {UpdateClassRequest} classData - Partial class data to update
   *
   * @returns {Promise<Class>} Updated class object
   *
   * @throws {Error} If class not found (404), user not authorized (403), or validation fails
   *
   * @example
   * // Update class capacity and price
   * const updated = await classService.update("class-123", {
   *   capacity: 25,
   *   base_price: 175
   * });
   *
   * @example
   * // Update class schedule
   * await classService.update("class-456", {
   *   schedule: [
   *     {day_of_week: "TUESDAY", start_time: "16:00", end_time: "17:30"},
   *     {day_of_week: "THURSDAY", start_time: "16:00", end_time: "17:30"}
   *   ]
   * });
   *
   * @example
   * // Assign coach to class
   * await classService.update("class-789", {
   *   coach_id: "coach-user-123"
   * });
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
   *
   * Permanently deletes a class.
   * Requires admin role authentication.
   *
   * WARNING: This operation cannot be undone.
   * Consider deactivating (is_active: false) instead of deleting.
   *
   * @param {string} id - Class ID to delete
   *
   * @returns {Promise<{message: string}>} Deletion confirmation message
   *
   * @throws {Error} If class not found (404), user not authorized (403),
   *                 or class has active enrollments
   *
   * @example
   * // Delete a cancelled class
   * const result = await classService.delete("class-123");
   * console.log(result.message); // "Class deleted successfully"
   *
   * @example
   * // Safe delete with confirmation
   * if (confirm("Are you sure you want to delete this class?")) {
   *   try {
   *     await classService.delete(classId);
   *     alert("Class deleted successfully");
   *   } catch (error) {
   *     alert("Cannot delete class with active enrollments");
   *   }
   * }
   */
  async delete(id: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(
      ENDPOINTS.CLASSES.DELETE(id)
    );
    return data;
  },

  /**
   * Get class capacity information
   *
   * Retrieves real-time capacity and enrollment data for a class.
   * Useful for checking availability before enrollment.
   *
   * @param {string} id - Class ID
   *
   * @returns {Promise<ClassCapacity>} Capacity details
   * @returns {number} return.capacity - Maximum student capacity
   * @returns {number} return.current_enrollment - Currently enrolled students
   * @returns {number} return.available_spots - Remaining available spots
   * @returns {boolean} return.has_capacity - Whether class has available spots
   * @returns {number} [return.waitlist_count] - Number of students on waitlist
   *
   * @throws {Error} If class not found (404) or request fails
   *
   * @example
   * // Check if class is full before showing enrollment button
   * const capacity = await classService.getCapacity("class-123");
   * if (capacity.has_capacity) {
   *   showEnrollButton();
   *   displayMessage(`${capacity.available_spots} spots remaining`);
   * } else {
   *   showWaitlistButton();
   *   displayMessage(`Class full. ${capacity.waitlist_count} on waitlist`);
   * }
   *
   * @example
   * // Display capacity bar in UI
   * const { current_enrollment, capacity } = await classService.getCapacity(classId);
   * const percentFull = (current_enrollment / capacity) * 100;
   * updateProgressBar(percentFull);
   */
  async getCapacity(id: string): Promise<ClassCapacity> {
    const { data } = await apiClient.get<ClassCapacity>(
      ENDPOINTS.CLASSES.CAPACITY(id)
    );
    return data;
  },
};

// ========================================
// PROGRAM SERVICE
// ========================================

/**
 * Program Service
 *
 * Provides API operations for sports program management.
 * Programs represent different sport types (Soccer, Basketball, Tennis, etc.)
 *
 * Relationships:
 * - Programs have many Classes
 * - Each Class belongs to one Program
 *
 * Use Cases:
 * - Populate program dropdown in class creation forms
 * - Filter classes by sport type
 * - Display available sports on website
 * - Organize classes by program category
 *
 * All methods use the configured apiClient which:
 * - Automatically attaches JWT tokens
 * - Handles token refresh on 401 errors
 * - Transforms errors to user-friendly messages
 */
export const programService = {
  /**
   * Get all programs
   *
   * Retrieves a list of all sports programs.
   * Typically used to populate dropdowns and filter options.
   *
   * @returns {Promise<Program[]>} Array of all programs
   * @returns {string} return[].id - Program ID (UUID)
   * @returns {string} return[].name - Program name (e.g., "Soccer", "Basketball")
   * @returns {string} [return[].description] - Program description
   * @returns {boolean} return[].is_active - Whether program is currently active
   * @returns {string} return[].created_at - ISO timestamp of creation
   * @returns {string} return[].updated_at - ISO timestamp of last update
   *
   * @throws {Error} If request fails or network error occurs
   *
   * @example
   * // Get all programs for dropdown
   * const programs = await programService.getAll();
   * const activePrograms = programs.filter(p => p.is_active);
   * console.log(activePrograms); // [{id: "123", name: "Soccer", ...}, ...]
   *
   * @example
   * // Populate program filter in class list
   * const programs = await programService.getAll();
   * const programOptions = programs.map(p => ({
   *   value: p.id,
   *   label: p.name
   * }));
   *
   * @example
   * // Display sports offered on homepage
   * const programs = await programService.getAll();
   * programs.forEach(program => {
   *   if (program.is_active) {
   *     displaySportCard(program.name, program.description);
   *   }
   * });
   */
  async getAll(): Promise<Program[]> {
    const { data } = await apiClient.get<Program[]>(ENDPOINTS.PROGRAMS.LIST);
    return data;
  },

  /**
   * Get program by ID
   *
   * Retrieves detailed information for a specific program.
   *
   * @param {string} id - Program ID (UUID format)
   *
   * @returns {Promise<Program>} Program details
   *
   * @throws {Error} If program not found (404) or request fails
   *
   * @example
   * // Get program details to display on class page
   * const program = await programService.getById("program-123");
   * console.log(program.name); // "Soccer"
   * console.log(program.description); // "Learn soccer fundamentals..."
   *
   * @example
   * // Verify program exists before creating class
   * try {
   *   const program = await programService.getById(selectedProgramId);
   *   if (!program.is_active) {
   *     alert("This program is no longer active");
   *   }
   * } catch (error) {
   *   alert("Program not found");
   * }
   */
  async getById(id: string): Promise<Program> {
    const { data } = await apiClient.get<Program>(ENDPOINTS.PROGRAMS.BY_ID(id));
    return data;
  },
};

// ========================================
// AREA SERVICE
// ========================================

/**
 * Area Service
 *
 * Provides API operations for geographic area management.
 * Areas represent different geographic regions or zones where classes are offered.
 *
 * Relationships:
 * - Areas have many Classes
 * - Areas have many Schools
 * - Each Class belongs to one Area
 * - Each School belongs to one Area
 *
 * Use Cases:
 * - Filter classes by geographic location
 * - Show classes in user's region
 * - Organize schools by area
 * - Display location-based class availability
 *
 * All methods use the configured apiClient which:
 * - Automatically attaches JWT tokens
 * - Handles token refresh on 401 errors
 * - Transforms errors to user-friendly messages
 */
export const areaService = {
  /**
   * Get all areas
   *
   * Retrieves a list of all geographic areas.
   * Typically used for location-based filtering and navigation.
   *
   * @returns {Promise<Area[]>} Array of all areas
   * @returns {string} return[].id - Area ID (UUID)
   * @returns {string} return[].name - Area name (e.g., "North Bay", "East Valley")
   * @returns {string} [return[].description] - Area description
   * @returns {boolean} return[].is_active - Whether area is currently active
   * @returns {string} return[].created_at - ISO timestamp of creation
   * @returns {string} return[].updated_at - ISO timestamp of last update
   *
   * @throws {Error} If request fails or network error occurs
   *
   * @example
   * // Get all areas for location filter
   * const areas = await areaService.getAll();
   * const activeAreas = areas.filter(a => a.is_active);
   * console.log(activeAreas); // [{id: "123", name: "North Bay", ...}, ...]
   *
   * @example
   * // Create area filter dropdown
   * const areas = await areaService.getAll();
   * const areaOptions = [
   *   { value: "", label: "All Areas" },
   *   ...areas.map(a => ({ value: a.id, label: a.name }))
   * ];
   *
   * @example
   * // Display classes grouped by area
   * const areas = await areaService.getAll();
   * for (const area of areas) {
   *   const classes = await classService.getAll({ area_id: area.id });
   *   displayAreaSection(area.name, classes);
   * }
   */
  async getAll(): Promise<Area[]> {
    const { data } = await apiClient.get<Area[]>(ENDPOINTS.AREAS.LIST);
    return data;
  },

  /**
   * Get area by ID
   *
   * Retrieves detailed information for a specific geographic area.
   *
   * @param {string} id - Area ID (UUID format)
   *
   * @returns {Promise<Area>} Area details
   *
   * @throws {Error} If area not found (404) or request fails
   *
   * @example
   * // Get area details to display location info
   * const area = await areaService.getById("area-123");
   * console.log(area.name); // "North Bay"
   * console.log(area.description); // "Serving communities in..."
   *
   * @example
   * // Verify area before filtering classes
   * try {
   *   const area = await areaService.getById(selectedAreaId);
   *   if (area.is_active) {
   *     const classes = await classService.getAll({ area_id: area.id });
   *     displayClasses(classes);
   *   }
   * } catch (error) {
   *   alert("Area not found");
   * }
   */
  async getById(id: string): Promise<Area> {
    const { data } = await apiClient.get<Area>(ENDPOINTS.AREAS.BY_ID(id));
    return data;
  },
};
