/**
 * @file child.service.ts
 * @description Child/Student management service for the CSF application.
 *
 * This module provides a comprehensive service layer for managing children (students) and their
 * associated emergency contacts. It handles all child-related API operations including CRUD
 * operations for both children and emergency contacts.
 *
 * Key Features:
 *
 * 1. CHILD MANAGEMENT (CRUD)
 *    - Create: Register new children with parent associations
 *    - Read: Retrieve individual children or list of user's children
 *    - Update: Modify child information (name, age, medical info, etc.)
 *    - Delete: Soft delete children (preserves data but marks as inactive)
 *    - Filter: Query children with optional filters
 *
 * 2. EMERGENCY CONTACT MANAGEMENT (CRUD)
 *    - Create: Add emergency contacts for specific children
 *    - Read: Retrieve all emergency contacts for a child
 *    - Update: Modify emergency contact information
 *    - Delete: Remove emergency contacts
 *    - Multiple contacts per child supported
 *
 * 3. DATA RELATIONSHIPS
 *    - Children are associated with authenticated parent user
 *    - Emergency contacts are linked to specific children
 *    - Cascade operations maintain data integrity
 *
 * Architecture:
 *
 * Service Layer Pattern:
 * - Pure API functions without business logic
 * - Each function maps to a single API endpoint
 * - Returns typed responses using TypeScript interfaces
 * - All requests automatically include authentication headers
 * - Errors are handled by axios-client interceptors
 *
 * Authentication:
 * - All requests require valid JWT access token
 * - Token automatically attached by axios-client request interceptor
 * - 401 errors trigger automatic token refresh
 * - Users can only access their own children's data
 *
 * Data Model:
 *
 * Child Object:
 * - id: Unique identifier (UUID)
 * - parent_id: Associated parent user ID
 * - first_name, last_name: Child's name
 * - date_of_birth: Child's birth date
 * - grade_level: Current grade
 * - medical_info: Medical conditions, allergies, etc.
 * - emergency_contacts: Array of associated emergency contacts
 * - created_at, updated_at: Timestamps
 *
 * Emergency Contact Object:
 * - id: Unique identifier (UUID)
 * - child_id: Associated child ID
 * - name: Contact's full name
 * - relationship: Relationship to child
 * - phone_number: Primary contact number
 * - email: Contact email address
 * - is_primary: Boolean flag for primary contact
 *
 * @requires ../client/axios-client - Configured Axios instance with auth interceptors
 * @requires ../constants/endpoints - API endpoint constants
 * @requires ../types/child.types - TypeScript type definitions for child and emergency contact data
 *
 * @example
 * // Import the service
 * import { childService } from '@/api/services/child.service';
 *
 * // Get all children for current user
 * const children = await childService.getMy();
 *
 * // Create a new child
 * const newChild = await childService.create({
 *   first_name: 'Emma',
 *   last_name: 'Smith',
 *   date_of_birth: '2015-06-15',
 *   grade_level: '3rd Grade'
 * });
 *
 * // Add emergency contact
 * const contact = await childService.addEmergencyContact(newChild.id, {
 *   name: 'Jane Smith',
 *   relationship: 'Mother',
 *   phone_number: '+1-555-123-4567',
 *   is_primary: true
 * });
 */

// ========================================
// IMPORTS
// ========================================
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

// ========================================
// CHILD SERVICE
// ========================================

/**
 * Child Service Object
 *
 * Provides methods for managing children and emergency contacts.
 * All methods are async and return typed Promise objects.
 * Authentication is handled automatically by apiClient.
 *
 * Available Child Operations:
 * - getMy(): Retrieve current user's children
 * - getById(): Retrieve specific child by ID
 * - create(): Create new child
 * - update(): Update child information
 * - delete(): Soft delete child
 *
 * Available Emergency Contact Operations:
 * - getEmergencyContacts(): Retrieve child's emergency contacts
 * - addEmergencyContact(): Add new emergency contact
 * - updateEmergencyContact(): Update emergency contact
 * - deleteEmergencyContact(): Delete emergency contact
 */
export const childService = {
  // ========================================
  // CHILD READ OPERATIONS
  // ========================================

  /**
   * Get Current User's Children
   *
   * Retrieves all children associated with the authenticated parent user.
   * Supports optional filtering to narrow down results.
   * Uses JWT token to automatically identify the parent, so no parent ID is needed.
   *
   * API Endpoint: GET /children/my
   *
   * Authentication:
   * - Requires valid JWT access token in Authorization header
   * - Token automatically attached by axios-client interceptor
   * - Returns 401 if token is invalid or expired (triggers auto-refresh)
   * - Only returns children belonging to authenticated user
   *
   * Query Parameters (Optional Filters):
   * - grade_level: Filter by specific grade
   * - active: Filter by active status (true/false)
   * - search: Search by child name
   *
   * Response Data:
   * Returns array of Child objects, each containing:
   * - id: Child's unique identifier (UUID)
   * - parent_id: Parent user's ID
   * - first_name: Child's first name
   * - last_name: Child's last name
   * - date_of_birth: Birth date (ISO format)
   * - grade_level: Current grade level
   * - medical_info: Medical conditions, allergies
   * - emergency_contacts: Array of emergency contacts
   * - created_at: Registration timestamp
   * - updated_at: Last modification timestamp
   *
   * @param {ChildFilters} [filters] - Optional filters to narrow results
   * @param {string} [filters.grade_level] - Filter by grade level
   * @param {boolean} [filters.active] - Filter by active status
   * @param {string} [filters.search] - Search term for child name
   *
   * @returns {Promise<Child[]>} Promise that resolves to array of child objects
   *
   * @throws {Error} If user is not authenticated (401)
   * @throws {Error} If user lacks permission (403)
   * @throws {Error} If server error occurs (500)
   *
   * @example
   * // Get all children
   * try {
   *   const children = await childService.getMy();
   *   console.log(`You have ${children.length} children registered`);
   *   children.forEach(child => {
   *     console.log(`${child.first_name} ${child.last_name} - Grade ${child.grade_level}`);
   *   });
   * } catch (error) {
   *   console.error('Failed to fetch children:', error.message);
   * }
   *
   * @example
   * // Get children with filters
   * const thirdGraders = await childService.getMy({
   *   grade_level: '3rd Grade',
   *   active: true
   * });
   *
   * @example
   * // Search children by name
   * const searchResults = await childService.getMy({
   *   search: 'Emma'
   * });
   *
   * @example
   * // Using in React component
   * const ChildrenList = () => {
   *   const [children, setChildren] = useState([]);
   *
   *   useEffect(() => {
   *     const loadChildren = async () => {
   *       try {
   *         const data = await childService.getMy();
   *         setChildren(data);
   *       } catch (error) {
   *         toast.error('Failed to load children');
   *       }
   *     };
   *     loadChildren();
   *   }, []);
   *
   *   return <div>{children.map(child => <ChildCard key={child.id} child={child} />)}</div>;
   * };
   */
  async getMy(filters?: ChildFilters): Promise<Child[]> {
    // Make GET request to /children/my endpoint with optional query params
    const { data } = await apiClient.get<Child[]>(ENDPOINTS.CHILDREN.MY, {
      params: filters,
    });
    return data;
  },

  /**
   * Get Child by ID
   *
   * Retrieves detailed information for a specific child by their unique identifier.
   * User must be the parent of the child to access their data.
   *
   * API Endpoint: GET /children/{id}
   *
   * Authentication:
   * - Requires valid JWT access token in Authorization header
   * - Token automatically attached by axios-client interceptor
   * - Returns 401 if token is invalid or expired (triggers auto-refresh)
   * - Returns 403 if user is not the child's parent
   *
   * Response Data:
   * Returns complete Child object with:
   * - id: Child's unique identifier
   * - parent_id: Parent user's ID
   * - first_name, last_name: Child's name
   * - date_of_birth: Birth date
   * - grade_level: Current grade
   * - medical_info: Medical information
   * - emergency_contacts: Complete list of emergency contacts
   * - created_at, updated_at: Timestamps
   *
   * @param {string} id - Child's unique identifier (UUID)
   *
   * @returns {Promise<Child>} Promise that resolves to the child object
   *
   * @throws {Error} If user is not authenticated (401)
   * @throws {Error} If user is not the child's parent (403)
   * @throws {Error} If child not found (404)
   * @throws {Error} If server error occurs (500)
   *
   * @example
   * // Basic usage
   * try {
   *   const child = await childService.getById('123e4567-e89b-12d3-a456-426614174000');
   *   console.log(`${child.first_name} ${child.last_name}`);
   *   console.log(`Grade: ${child.grade_level}`);
   *   console.log(`Medical Info: ${child.medical_info}`);
   *   console.log(`Emergency Contacts: ${child.emergency_contacts.length}`);
   * } catch (error) {
   *   if (error.status === 404) {
   *     console.error('Child not found');
   *   } else if (error.status === 403) {
   *     console.error('You do not have permission to view this child');
   *   }
   * }
   *
   * @example
   * // Using in React component
   * const ChildProfile = ({ childId }) => {
   *   const [child, setChild] = useState(null);
   *
   *   useEffect(() => {
   *     const fetchChild = async () => {
   *       try {
   *         const data = await childService.getById(childId);
   *         setChild(data);
   *       } catch (error) {
   *         toast.error('Failed to load child profile');
   *         navigate('/children');
   *       }
   *     };
   *     fetchChild();
   *   }, [childId]);
   *
   *   return child ? <ChildDetails child={child} /> : <Spinner />;
   * };
   */
  async getById(id: string): Promise<Child> {
    // Make GET request to /children/{id} endpoint
    const { data } = await apiClient.get<Child>(ENDPOINTS.CHILDREN.BY_ID(id));
    return data;
  },

  // ========================================
  // CHILD CREATE OPERATIONS
  // ========================================

  /**
   * Create New Child
   *
   * Registers a new child and associates them with the authenticated parent user.
   * The child will be automatically linked to the current user via JWT token.
   *
   * API Endpoint: POST /children
   *
   * Authentication:
   * - Requires valid JWT access token in Authorization header
   * - Token automatically attached by axios-client interceptor
   * - Returns 401 if token is invalid or expired (triggers auto-refresh)
   * - Child automatically associated with authenticated user
   *
   * Required Fields:
   * - first_name: Child's first name (string, non-empty)
   * - last_name: Child's last name (string, non-empty)
   * - date_of_birth: Birth date (ISO format: YYYY-MM-DD)
   *
   * Optional Fields:
   * - grade_level: Current grade level (string)
   * - medical_info: Medical conditions, allergies, medications (string)
   *
   * Validation:
   * - Names must not be empty
   * - Date of birth must be valid past date
   * - Returns 400 for validation errors
   *
   * Response:
   * Returns newly created Child object with generated ID
   *
   * @param {CreateChildRequest} childData - Child information
   * @param {string} childData.first_name - Child's first name (required)
   * @param {string} childData.last_name - Child's last name (required)
   * @param {string} childData.date_of_birth - Birth date in YYYY-MM-DD format (required)
   * @param {string} [childData.grade_level] - Current grade level
   * @param {string} [childData.medical_info] - Medical information
   *
   * @returns {Promise<Child>} Promise that resolves to the created child object
   *
   * @throws {Error} If user is not authenticated (401)
   * @throws {Error} If validation fails (400)
   * @throws {Error} If server error occurs (500)
   *
   * @example
   * // Create child with required fields only
   * try {
   *   const newChild = await childService.create({
   *     first_name: 'Emma',
   *     last_name: 'Smith',
   *     date_of_birth: '2015-06-15'
   *   });
   *   console.log(`Created child with ID: ${newChild.id}`);
   * } catch (error) {
   *   console.error('Failed to create child:', error.message);
   * }
   *
   * @example
   * // Create child with all fields
   * const newChild = await childService.create({
   *   first_name: 'Emma',
   *   last_name: 'Smith',
   *   date_of_birth: '2015-06-15',
   *   grade_level: '3rd Grade',
   *   medical_info: 'Allergic to peanuts. Asthma - uses inhaler as needed.'
   * });
   *
   * @example
   * // Using in a form submission handler
   * const handleSubmit = async (formData) => {
   *   try {
   *     const child = await childService.create({
   *       first_name: formData.firstName,
   *       last_name: formData.lastName,
   *       date_of_birth: formData.dateOfBirth,
   *       grade_level: formData.grade,
   *       medical_info: formData.medicalInfo
   *     });
   *     toast.success('Child registered successfully!');
   *     navigate(`/children/${child.id}`);
   *   } catch (error) {
   *     if (error.status === 400) {
   *       toast.error('Invalid data. Please check all fields.');
   *     } else {
   *       toast.error('Failed to register child');
   *     }
   *   }
   * };
   */
  async create(childData: CreateChildRequest): Promise<Child> {
    // Make POST request to /children endpoint with child data
    const { data } = await apiClient.post<Child>(
      ENDPOINTS.CHILDREN.CREATE,
      childData
    );
    return data;
  },

  // ========================================
  // CHILD UPDATE OPERATIONS
  // ========================================

  /**
   * Update Child Information
   *
   * Updates information for an existing child.
   * Supports partial updates - only include fields you want to modify.
   * User must be the parent of the child to update their data.
   *
   * API Endpoint: PUT /children/{id}
   *
   * Authentication:
   * - Requires valid JWT access token in Authorization header
   * - Token automatically attached by axios-client interceptor
   * - Returns 401 if token is invalid or expired (triggers auto-refresh)
   * - Returns 403 if user is not the child's parent
   *
   * Updatable Fields:
   * - first_name: Child's first name
   * - last_name: Child's last name
   * - date_of_birth: Birth date (cannot make child older)
   * - grade_level: Current grade level
   * - medical_info: Medical information
   *
   * Validation:
   * - Names must not be empty if provided
   * - Date of birth must be valid past date
   * - Returns 400 for validation errors
   *
   * @param {string} id - Child's unique identifier (UUID)
   * @param {UpdateChildRequest} childData - Fields to update
   * @param {string} [childData.first_name] - Updated first name
   * @param {string} [childData.last_name] - Updated last name
   * @param {string} [childData.date_of_birth] - Updated birth date
   * @param {string} [childData.grade_level] - Updated grade level
   * @param {string} [childData.medical_info] - Updated medical info
   *
   * @returns {Promise<Child>} Promise that resolves to the updated child object
   *
   * @throws {Error} If user is not authenticated (401)
   * @throws {Error} If user is not the child's parent (403)
   * @throws {Error} If child not found (404)
   * @throws {Error} If validation fails (400)
   * @throws {Error} If server error occurs (500)
   *
   * @example
   * // Update single field
   * try {
   *   const updated = await childService.update('child-uuid', {
   *     grade_level: '4th Grade'
   *   });
   *   console.log('Grade updated successfully');
   * } catch (error) {
   *   console.error('Update failed:', error.message);
   * }
   *
   * @example
   * // Update multiple fields
   * const updated = await childService.update('child-uuid', {
   *   first_name: 'Emily',
   *   grade_level: '4th Grade',
   *   medical_info: 'Allergic to peanuts and tree nuts. Carries EpiPen.'
   * });
   *
   * @example
   * // Using in edit form handler
   * const handleUpdate = async (childId, formData) => {
   *   try {
   *     const updated = await childService.update(childId, {
   *       first_name: formData.firstName,
   *       last_name: formData.lastName,
   *       grade_level: formData.grade,
   *       medical_info: formData.medicalInfo
   *     });
   *     toast.success('Child information updated!');
   *     setChild(updated);
   *   } catch (error) {
   *     if (error.status === 403) {
   *       toast.error('You do not have permission to edit this child');
   *     } else if (error.status === 404) {
   *       toast.error('Child not found');
   *     } else {
   *       toast.error('Update failed');
   *     }
   *   }
   * };
   */
  async update(id: string, childData: UpdateChildRequest): Promise<Child> {
    // Make PUT request to /children/{id} endpoint with update data
    const { data } = await apiClient.put<Child>(
      ENDPOINTS.CHILDREN.BY_ID(id),
      childData
    );
    return data;
  },

  // ========================================
  // CHILD DELETE OPERATIONS
  // ========================================

  /**
   * Delete Child (Soft Delete)
   *
   * Removes a child from the system using soft delete.
   * This marks the child as inactive rather than permanently deleting their data.
   * Preserves historical records and enrolled classes.
   * User must be the parent of the child to delete them.
   *
   * API Endpoint: DELETE /children/{id}
   *
   * Authentication:
   * - Requires valid JWT access token in Authorization header
   * - Token automatically attached by axios-client interceptor
   * - Returns 401 if token is invalid or expired (triggers auto-refresh)
   * - Returns 403 if user is not the child's parent
   *
   * Soft Delete Behavior:
   * - Child record marked as inactive
   * - Historical enrollment data preserved
   * - Child no longer appears in active listings
   * - Emergency contacts preserved
   * - Can potentially be restored by admin
   *
   * Use Cases:
   * - Child no longer attending classes
   * - Removing duplicate records
   * - Parent managing active children list
   *
   * Important Notes:
   * - This is a soft delete (preserves data)
   * - Child will not appear in getMy() results
   * - Existing enrollments remain in system
   * - Contact admin for data restoration
   *
   * @param {string} id - Child's unique identifier (UUID)
   *
   * @returns {Promise<{message: string}>} Promise with success message
   *
   * @throws {Error} If user is not authenticated (401)
   * @throws {Error} If user is not the child's parent (403)
   * @throws {Error} If child not found (404)
   * @throws {Error} If child has active enrollments (400)
   * @throws {Error} If server error occurs (500)
   *
   * @example
   * // Basic deletion
   * try {
   *   const result = await childService.delete('child-uuid');
   *   console.log(result.message); // "Child deleted successfully"
   *   toast.success('Child removed from your list');
   * } catch (error) {
   *   console.error('Delete failed:', error.message);
   * }
   *
   * @example
   * // Delete with confirmation dialog
   * const handleDelete = async (childId, childName) => {
   *   const confirmed = window.confirm(
   *     `Are you sure you want to remove ${childName} from your children list?`
   *   );
   *
   *   if (confirmed) {
   *     try {
   *       await childService.delete(childId);
   *       toast.success('Child removed successfully');
   *       // Refresh children list
   *       const updatedChildren = await childService.getMy();
   *       setChildren(updatedChildren);
   *     } catch (error) {
   *       if (error.status === 403) {
   *         toast.error('You do not have permission to delete this child');
   *       } else if (error.status === 404) {
   *         toast.error('Child not found');
   *       } else if (error.status === 400) {
   *         toast.error('Cannot delete child with active enrollments');
   *       } else {
   *         toast.error('Delete failed');
   *       }
   *     }
   *   }
   * };
   *
   * @example
   * // Using with React state management
   * const DeleteChildButton = ({ child }) => {
   *   const [loading, setLoading] = useState(false);
   *
   *   const handleDelete = async () => {
   *     setLoading(true);
   *     try {
   *       await childService.delete(child.id);
   *       toast.success(`${child.first_name} removed from your children`);
   *       navigate('/children');
   *     } catch (error) {
   *       toast.error(error.message || 'Failed to delete child');
   *     } finally {
   *       setLoading(false);
   *     }
   *   };
   *
   *   return (
   *     <button onClick={handleDelete} disabled={loading}>
   *       {loading ? 'Removing...' : 'Remove Child'}
   *     </button>
   *   );
   * };
   */
  async delete(id: string): Promise<{ message: string }> {
    // Make DELETE request to /children/{id} endpoint
    const { data } = await apiClient.delete<{ message: string }>(
      ENDPOINTS.CHILDREN.BY_ID(id)
    );
    return data;
  },

  // ========================================
  // EMERGENCY CONTACT READ OPERATIONS
  // ========================================

  /**
   * Get Emergency Contacts for Child
   *
   * Retrieves all emergency contacts associated with a specific child.
   * Returns an array of contact objects with complete contact information.
   * User must be the parent of the child to access emergency contacts.
   *
   * API Endpoint: GET /children/{childId}/emergency-contacts
   *
   * Authentication:
   * - Requires valid JWT access token in Authorization header
   * - Token automatically attached by axios-client interceptor
   * - Returns 401 if token is invalid or expired (triggers auto-refresh)
   * - Returns 403 if user is not the child's parent
   *
   * Response Data:
   * Returns array of EmergencyContact objects, each containing:
   * - id: Contact's unique identifier (UUID)
   * - child_id: Associated child's ID
   * - name: Contact's full name
   * - relationship: Relationship to child (e.g., "Mother", "Father", "Grandmother")
   * - phone_number: Primary contact phone number
   * - email: Contact email address (optional)
   * - is_primary: Boolean flag indicating primary contact
   * - created_at: Creation timestamp
   * - updated_at: Last modification timestamp
   *
   * Use Cases:
   * - Displaying emergency contact list on child profile
   * - Pre-filling contact information in enrollment forms
   * - Emergency notification systems
   * - Parent dashboard overview
   *
   * @param {string} childId - Child's unique identifier (UUID)
   *
   * @returns {Promise<EmergencyContact[]>} Promise that resolves to array of emergency contacts
   *
   * @throws {Error} If user is not authenticated (401)
   * @throws {Error} If user is not the child's parent (403)
   * @throws {Error} If child not found (404)
   * @throws {Error} If server error occurs (500)
   *
   * @example
   * // Basic usage
   * try {
   *   const contacts = await childService.getEmergencyContacts('child-uuid');
   *   console.log(`Found ${contacts.length} emergency contacts`);
   *   contacts.forEach(contact => {
   *     console.log(`${contact.name} (${contact.relationship}): ${contact.phone_number}`);
   *     if (contact.is_primary) {
   *       console.log('  ^ PRIMARY CONTACT');
   *     }
   *   });
   * } catch (error) {
   *   console.error('Failed to fetch emergency contacts:', error.message);
   * }
   *
   * @example
   * // Using in React component
   * const EmergencyContactsList = ({ childId }) => {
   *   const [contacts, setContacts] = useState([]);
   *
   *   useEffect(() => {
   *     const loadContacts = async () => {
   *       try {
   *         const data = await childService.getEmergencyContacts(childId);
   *         setContacts(data);
   *       } catch (error) {
   *         toast.error('Failed to load emergency contacts');
   *       }
   *     };
   *     loadContacts();
   *   }, [childId]);
   *
   *   return (
   *     <div>
   *       <h3>Emergency Contacts</h3>
   *       {contacts.map(contact => (
   *         <ContactCard key={contact.id} contact={contact} />
   *       ))}
   *     </div>
   *   );
   * };
   *
   * @example
   * // Find primary contact
   * const contacts = await childService.getEmergencyContacts('child-uuid');
   * const primaryContact = contacts.find(c => c.is_primary);
   * if (primaryContact) {
   *   console.log('Primary contact:', primaryContact.name, primaryContact.phone_number);
   * }
   */
  async getEmergencyContacts(childId: string): Promise<EmergencyContact[]> {
    // Make GET request to /children/{childId}/emergency-contacts endpoint
    const { data } = await apiClient.get<EmergencyContact[]>(
      ENDPOINTS.CHILDREN.EMERGENCY_CONTACTS(childId)
    );
    return data;
  },

  // ========================================
  // EMERGENCY CONTACT CREATE OPERATIONS
  // ========================================

  /**
   * Add Emergency Contact
   *
   * Creates a new emergency contact for a specific child.
   * Multiple emergency contacts can be added per child.
   * One contact should be marked as primary (is_primary: true).
   * User must be the parent of the child to add emergency contacts.
   *
   * API Endpoint: POST /children/{childId}/emergency-contacts
   *
   * Authentication:
   * - Requires valid JWT access token in Authorization header
   * - Token automatically attached by axios-client interceptor
   * - Returns 401 if token is invalid or expired (triggers auto-refresh)
   * - Returns 403 if user is not the child's parent
   *
   * Required Fields:
   * - name: Contact's full name (string, non-empty)
   * - relationship: Relationship to child (string, e.g., "Mother", "Father")
   * - phone_number: Contact phone number (string, formatted)
   *
   * Optional Fields:
   * - email: Contact email address (string, must be valid email format)
   * - is_primary: Primary contact flag (boolean, default: false)
   *
   * Validation:
   * - Name must not be empty
   * - Phone number must be in valid format
   * - Email must be valid if provided
   * - Returns 400 for validation errors
   *
   * Best Practices:
   * - Always designate one primary contact (is_primary: true)
   * - Include at least 2 emergency contacts per child
   * - Verify phone numbers are current and reachable
   * - Include alternate contact methods when possible
   *
   * @param {string} childId - Child's unique identifier (UUID)
   * @param {CreateEmergencyContactRequest} contactData - Emergency contact information
   * @param {string} contactData.name - Contact's full name (required)
   * @param {string} contactData.relationship - Relationship to child (required)
   * @param {string} contactData.phone_number - Contact phone number (required)
   * @param {string} [contactData.email] - Contact email address
   * @param {boolean} [contactData.is_primary] - Primary contact flag (default: false)
   *
   * @returns {Promise<EmergencyContact>} Promise that resolves to the created emergency contact
   *
   * @throws {Error} If user is not authenticated (401)
   * @throws {Error} If user is not the child's parent (403)
   * @throws {Error} If child not found (404)
   * @throws {Error} If validation fails (400)
   * @throws {Error} If server error occurs (500)
   *
   * @example
   * // Add primary emergency contact
   * try {
   *   const contact = await childService.addEmergencyContact('child-uuid', {
   *     name: 'Jane Smith',
   *     relationship: 'Mother',
   *     phone_number: '+1-555-123-4567',
   *     email: 'jane.smith@email.com',
   *     is_primary: true
   *   });
   *   console.log('Primary contact added:', contact.name);
   * } catch (error) {
   *   console.error('Failed to add contact:', error.message);
   * }
   *
   * @example
   * // Add secondary emergency contact
   * const secondaryContact = await childService.addEmergencyContact('child-uuid', {
   *   name: 'John Smith',
   *   relationship: 'Father',
   *   phone_number: '+1-555-987-6543',
   *   email: 'john.smith@email.com',
   *   is_primary: false
   * });
   *
   * @example
   * // Add contact without email
   * const grandparent = await childService.addEmergencyContact('child-uuid', {
   *   name: 'Mary Johnson',
   *   relationship: 'Grandmother',
   *   phone_number: '+1-555-456-7890',
   *   is_primary: false
   * });
   *
   * @example
   * // Using in form submission handler
   * const handleAddContact = async (childId, formData) => {
   *   try {
   *     const contact = await childService.addEmergencyContact(childId, {
   *       name: formData.name,
   *       relationship: formData.relationship,
   *       phone_number: formData.phone,
   *       email: formData.email || undefined,
   *       is_primary: formData.isPrimary
   *     });
   *     toast.success('Emergency contact added successfully!');
   *     // Refresh contacts list
   *     const updatedContacts = await childService.getEmergencyContacts(childId);
   *     setContacts(updatedContacts);
   *   } catch (error) {
   *     if (error.status === 400) {
   *       toast.error('Invalid contact information. Please check all fields.');
   *     } else if (error.status === 403) {
   *       toast.error('You do not have permission to add contacts for this child');
   *     } else {
   *       toast.error('Failed to add emergency contact');
   *     }
   *   }
   * };
   */
  async addEmergencyContact(
    childId: string,
    contactData: CreateEmergencyContactRequest
  ): Promise<EmergencyContact> {
    // Make POST request to /children/{childId}/emergency-contacts endpoint
    const { data } = await apiClient.post<EmergencyContact>(
      ENDPOINTS.CHILDREN.EMERGENCY_CONTACTS(childId),
      contactData
    );
    return data;
  },

  // ========================================
  // EMERGENCY CONTACT UPDATE OPERATIONS
  // ========================================

  /**
   * Update Emergency Contact
   *
   * Updates information for an existing emergency contact.
   * Supports partial updates - only include fields you want to modify.
   * User must be the parent of the child to update emergency contacts.
   *
   * API Endpoint: PUT /children/{childId}/emergency-contacts/{contactId}
   *
   * Authentication:
   * - Requires valid JWT access token in Authorization header
   * - Token automatically attached by axios-client interceptor
   * - Returns 401 if token is invalid or expired (triggers auto-refresh)
   * - Returns 403 if user is not the child's parent
   *
   * Updatable Fields:
   * - name: Contact's full name
   * - relationship: Relationship to child
   * - phone_number: Contact phone number
   * - email: Contact email address
   * - is_primary: Primary contact flag
   *
   * Validation:
   * - Name must not be empty if provided
   * - Phone number must be valid format if provided
   * - Email must be valid if provided
   * - Returns 400 for validation errors
   *
   * Important Notes:
   * - Changing is_primary may affect other contacts
   * - Ensure at least one contact remains as primary
   * - Phone number updates should be verified
   *
   * @param {string} childId - Child's unique identifier (UUID)
   * @param {string} contactId - Emergency contact's unique identifier (UUID)
   * @param {UpdateEmergencyContactRequest} contactData - Fields to update
   * @param {string} [contactData.name] - Updated contact name
   * @param {string} [contactData.relationship] - Updated relationship
   * @param {string} [contactData.phone_number] - Updated phone number
   * @param {string} [contactData.email] - Updated email address
   * @param {boolean} [contactData.is_primary] - Updated primary flag
   *
   * @returns {Promise<EmergencyContact>} Promise that resolves to the updated emergency contact
   *
   * @throws {Error} If user is not authenticated (401)
   * @throws {Error} If user is not the child's parent (403)
   * @throws {Error} If child or contact not found (404)
   * @throws {Error} If validation fails (400)
   * @throws {Error} If server error occurs (500)
   *
   * @example
   * // Update phone number
   * try {
   *   const updated = await childService.updateEmergencyContact(
   *     'child-uuid',
   *     'contact-uuid',
   *     { phone_number: '+1-555-NEW-NUMBER' }
   *   );
   *   console.log('Phone number updated:', updated.phone_number);
   * } catch (error) {
   *   console.error('Update failed:', error.message);
   * }
   *
   * @example
   * // Update multiple fields
   * const updated = await childService.updateEmergencyContact(
   *   'child-uuid',
   *   'contact-uuid',
   *   {
   *     name: 'Jane Doe',
   *     email: 'jane.doe@newemail.com',
   *     phone_number: '+1-555-123-4567'
   *   }
   * );
   *
   * @example
   * // Change primary contact
   * const updated = await childService.updateEmergencyContact(
   *   'child-uuid',
   *   'contact-uuid',
   *   { is_primary: true }
   * );
   *
   * @example
   * // Using in edit form handler
   * const handleUpdateContact = async (childId, contactId, formData) => {
   *   try {
   *     const updated = await childService.updateEmergencyContact(
   *       childId,
   *       contactId,
   *       {
   *         name: formData.name,
   *         relationship: formData.relationship,
   *         phone_number: formData.phone,
   *         email: formData.email,
   *         is_primary: formData.isPrimary
   *       }
   *     );
   *     toast.success('Emergency contact updated!');
   *     // Refresh contacts list
   *     const contacts = await childService.getEmergencyContacts(childId);
   *     setContacts(contacts);
   *   } catch (error) {
   *     if (error.status === 403) {
   *       toast.error('You do not have permission to edit this contact');
   *     } else if (error.status === 404) {
   *       toast.error('Contact not found');
   *     } else if (error.status === 400) {
   *       toast.error('Invalid contact information');
   *     } else {
   *       toast.error('Update failed');
   *     }
   *   }
   * };
   */
  async updateEmergencyContact(
    childId: string,
    contactId: string,
    contactData: UpdateEmergencyContactRequest
  ): Promise<EmergencyContact> {
    // Make PUT request to /children/{childId}/emergency-contacts/{contactId} endpoint
    const { data } = await apiClient.put<EmergencyContact>(
      ENDPOINTS.CHILDREN.EMERGENCY_CONTACT(childId, contactId),
      contactData
    );
    return data;
  },

  // ========================================
  // EMERGENCY CONTACT DELETE OPERATIONS
  // ========================================

  /**
   * Delete Emergency Contact
   *
   * Removes an emergency contact from a child's record.
   * This is a permanent deletion (not soft delete).
   * User must be the parent of the child to delete emergency contacts.
   *
   * API Endpoint: DELETE /children/{childId}/emergency-contacts/{contactId}
   *
   * Authentication:
   * - Requires valid JWT access token in Authorization header
   * - Token automatically attached by axios-client interceptor
   * - Returns 401 if token is invalid or expired (triggers auto-refresh)
   * - Returns 403 if user is not the child's parent
   *
   * Delete Behavior:
   * - Emergency contact permanently removed
   * - Cannot be restored (hard delete)
   * - Child record and other contacts unaffected
   *
   * Important Warnings:
   * - Ensure child has at least one remaining emergency contact
   * - Cannot delete if it's the only contact (may return 400)
   * - Verify contact is no longer needed before deletion
   * - Consider updating instead of deleting for accuracy
   *
   * Use Cases:
   * - Contact information is outdated
   * - Contact is no longer authorized
   * - Removing duplicate entries
   * - Person no longer available for emergencies
   *
   * @param {string} childId - Child's unique identifier (UUID)
   * @param {string} contactId - Emergency contact's unique identifier (UUID)
   *
   * @returns {Promise<{message: string}>} Promise with success message
   *
   * @throws {Error} If user is not authenticated (401)
   * @throws {Error} If user is not the child's parent (403)
   * @throws {Error} If child or contact not found (404)
   * @throws {Error} If contact is the only emergency contact (400)
   * @throws {Error} If server error occurs (500)
   *
   * @example
   * // Basic deletion
   * try {
   *   const result = await childService.deleteEmergencyContact(
   *     'child-uuid',
   *     'contact-uuid'
   *   );
   *   console.log(result.message); // "Emergency contact deleted successfully"
   *   toast.success('Emergency contact removed');
   * } catch (error) {
   *   console.error('Delete failed:', error.message);
   * }
   *
   * @example
   * // Delete with confirmation dialog
   * const handleDeleteContact = async (childId, contactId, contactName) => {
   *   const confirmed = window.confirm(
   *     `Are you sure you want to remove ${contactName} as an emergency contact? This cannot be undone.`
   *   );
   *
   *   if (confirmed) {
   *     try {
   *       await childService.deleteEmergencyContact(childId, contactId);
   *       toast.success('Emergency contact removed');
   *       // Refresh contacts list
   *       const updatedContacts = await childService.getEmergencyContacts(childId);
   *       setContacts(updatedContacts);
   *     } catch (error) {
   *       if (error.status === 400) {
   *         toast.error('Cannot remove the only emergency contact. Please add another contact first.');
   *       } else if (error.status === 403) {
   *         toast.error('You do not have permission to delete this contact');
   *       } else if (error.status === 404) {
   *         toast.error('Contact not found');
   *       } else {
   *         toast.error('Failed to remove contact');
   *       }
   *     }
   *   }
   * };
   *
   * @example
   * // Using with React state management
   * const DeleteContactButton = ({ childId, contact }) => {
   *   const [loading, setLoading] = useState(false);
   *
   *   const handleDelete = async () => {
   *     if (!window.confirm(`Remove ${contact.name}?`)) return;
   *
   *     setLoading(true);
   *     try {
   *       await childService.deleteEmergencyContact(childId, contact.id);
   *       toast.success('Contact removed');
   *       // Trigger parent component refresh
   *       onContactDeleted(contact.id);
   *     } catch (error) {
   *       toast.error(error.message || 'Failed to remove contact');
   *     } finally {
   *       setLoading(false);
   *     }
   *   };
   *
   *   return (
   *     <button onClick={handleDelete} disabled={loading}>
   *       {loading ? 'Removing...' : 'Remove'}
   *     </button>
   *   );
   * };
   *
   * @example
   * // Check contact count before deletion
   * const safeDeleteContact = async (childId, contactId) => {
   *   const contacts = await childService.getEmergencyContacts(childId);
   *   if (contacts.length <= 1) {
   *     toast.error('Cannot delete the only emergency contact. Add another contact first.');
   *     return;
   *   }
   *
   *   try {
   *     await childService.deleteEmergencyContact(childId, contactId);
   *     toast.success('Contact removed successfully');
   *   } catch (error) {
   *     toast.error('Failed to remove contact');
   *   }
   * };
   */
  async deleteEmergencyContact(
    childId: string,
    contactId: string
  ): Promise<{ message: string }> {
    // Make DELETE request to /children/{childId}/emergency-contacts/{contactId} endpoint
    const { data } = await apiClient.delete<{ message: string }>(
      ENDPOINTS.CHILDREN.EMERGENCY_CONTACT(childId, contactId)
    );
    return data;
  },
};
