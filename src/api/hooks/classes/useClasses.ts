/**
 * @file useClasses Hook
 * @description React Query hooks for fetching and filtering class lists with advanced caching.
 *
 * This module provides a comprehensive set of hooks for browsing classes with various filters
 * and pre-configured query variants for common use cases (available classes, program-specific,
 * area-specific). All hooks share the same caching strategy optimized for real-time enrollment data.
 *
 * **React Query Caching Strategy:**
 * - staleTime: 0ms - Ensures users always see current enrollment availability
 * - gcTime: 5 minutes - Keeps filtered results in cache for fast back-navigation
 * - Background refetching: Automatic when window refocuses or network reconnects
 * - Query keys: Include filter parameters for granular cache management
 *
 * **Filter-Based Query Keys:**
 * Query keys are structured as: `['classes', 'list', { filters }]`
 * This allows different filter combinations to be cached independently:
 * - Program A classes: ['classes', 'list', { program_id: 'A' }]
 * - Available classes: ['classes', 'list', { is_active: true, has_capacity: true }]
 * - All classes: ['classes', 'list', undefined]
 *
 * **Integration with Class Browsing Flow:**
 * 1. User lands on class browsing page (useClasses fetches all active classes)
 * 2. User applies filters (new query with different cache key)
 * 3. User clicks on a class (useClass fetches detailed data)
 * 4. User navigates back (cached list is instantly available)
 * 5. User enrolls in a class (enrollment mutation invalidates all class lists)
 *
 * @module api/hooks/classes
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { classService } from '../../services/class.service';
import { queryKeys } from '../../constants/query-keys';
import type { Class, ClassFilters } from '../../types/class.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Options for the useClasses hook
 *
 * @interface UseClassesOptions
 * @property {ClassFilters} [filters] - Filter criteria to apply to the class list
 * @property {Object} [queryOptions] - Additional React Query options
 */
interface UseClassesOptions {
  filters?: ClassFilters;
  queryOptions?: Omit<
    UseQueryOptions<Class[], ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * React Query hook to fetch a list of classes with optional filtering
 *
 * This is the primary hook for browsing and searching classes. It supports comprehensive
 * filtering options and returns an array of class objects with summary information.
 *
 * **Supported Filter Parameters:**
 * @param {string} [filters.program_id] - Filter by specific program (e.g., "Swimming", "Gymnastics")
 * @param {string} [filters.area_id] - Filter by geographic area/location
 * @param {string} [filters.age_group] - Filter by age range (e.g., "5-7", "8-10")
 * @param {string} [filters.day_of_week] - Filter by class day (e.g., "Monday", "Wednesday")
 * @param {boolean} [filters.has_capacity] - Only show classes with available spots
 * @param {boolean} [filters.is_active] - Only show currently active classes
 * @param {string} [filters.skill_level] - Filter by required skill level (e.g., "Beginner", "Intermediate")
 * @param {string} [filters.instructor_id] - Filter by specific instructor
 * @param {number} [filters.min_age] - Minimum age requirement
 * @param {number} [filters.max_age] - Maximum age requirement
 *
 * **Caching Configuration:**
 * - staleTime: 0ms - Data immediately considered stale for fresh enrollment counts
 * - gcTime: 5 minutes - Results cached for quick filter changes and back-navigation
 * - Automatic refetch on: window focus, component remount, network reconnect
 *
 * **Query Key Structure:**
 * The query key includes filter parameters: `['classes', 'list', filters]`
 * Benefits:
 * - Each filter combination has its own cache entry
 * - Changing filters creates a new cache entry (old data remains for back-navigation)
 * - Invalidating all lists: `queryClient.invalidateQueries(['classes', 'list'])`
 * - Invalidating specific filter: `queryClient.invalidateQueries(['classes', 'list', { program_id: '123' }])`
 *
 * **Background Refetching:**
 * React Query automatically refetches when:
 * - User returns to the browser tab (refetchOnWindowFocus: true by default)
 * - Component remounts (refetchOnMount: true by default)
 * - Network reconnects after being offline (refetchOnReconnect: true by default)
 * This ensures users always see current enrollment availability.
 *
 * @param {UseClassesOptions} [options={}] - Hook configuration options
 * @param {ClassFilters} [options.filters] - Filter criteria for the class list
 * @param {Object} [options.queryOptions] - Additional React Query configuration
 *
 * @returns {UseQueryResult<Class[], ApiErrorResponse>} React Query result object
 * @returns {Class[] | undefined} result.data - Array of classes matching the filters
 * @returns {boolean} result.isLoading - True during initial fetch
 * @returns {boolean} result.isFetching - True during any fetch (including background refetch)
 * @returns {boolean} result.isError - True if the query encountered an error
 * @returns {ApiErrorResponse | null} result.error - Error object if query failed
 * @returns {Function} result.refetch - Function to manually trigger a refetch
 * @returns {boolean} result.isSuccess - True when data has been successfully fetched
 *
 * @example
 * // Basic usage - fetch all classes
 * function ClassListPage() {
 *   const { data: classes, isLoading, error } = useClasses();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorAlert message={error.message} />;
 *
 *   return (
 *     <ClassGrid>
 *       {classes.map(cls => (
 *         <ClassCard key={cls.id} class={cls} />
 *       ))}
 *     </ClassGrid>
 *   );
 * }
 *
 * @example
 * // Advanced filtering - dynamic filter state
 * function FilterableClassList() {
 *   const [filters, setFilters] = useState({
 *     is_active: true,
 *     has_capacity: true
 *   });
 *
 *   const { data: classes, isLoading, isFetching } = useClasses({
 *     filters,
 *     queryOptions: {
 *       // Keep showing previous results while new data loads
 *       placeholderData: (previousData) => previousData,
 *     }
 *   });
 *
 *   const handleFilterChange = (newFilters) => {
 *     // Changing filters triggers new query with different cache key
 *     setFilters({ ...filters, ...newFilters });
 *   };
 *
 *   return (
 *     <div>
 *       <FilterBar
 *         filters={filters}
 *         onChange={handleFilterChange}
 *         isLoading={isFetching}
 *       />
 *       <ClassList classes={classes} />
 *     </div>
 *   );
 * }
 *
 * @example
 * // Program-specific class browsing
 * function ProgramClassesPage({ programId }) {
 *   const { data: classes } = useClasses({
 *     filters: {
 *       program_id: programId,
 *       is_active: true,
 *       has_capacity: true
 *     }
 *   });
 *
 *   return (
 *     <div>
 *       <h2>Available Classes</h2>
 *       <p>{classes?.length || 0} classes with open spots</p>
 *       <ClassList classes={classes} />
 *     </div>
 *   );
 * }
 *
 * @example
 * // Multi-filter search with real-time updates
 * function ClassSearchPage() {
 *   const [searchFilters, setSearchFilters] = useState({});
 *
 *   const { data: classes, isLoading, refetch } = useClasses({
 *     filters: {
 *       is_active: true,
 *       ...searchFilters
 *     },
 *     queryOptions: {
 *       // Refetch every minute to show current availability
 *       refetchInterval: 60000,
 *     }
 *   });
 *
 *   return (
 *     <SearchInterface
 *       onFilterChange={setSearchFilters}
 *       results={classes}
 *       isLoading={isLoading}
 *       onRefresh={refetch}
 *     />
 *   );
 * }
 */
export function useClasses(options: UseClassesOptions = {}) {
  const { filters, queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.classes.list(filters),
    queryFn: () => classService.getAll(filters),
    staleTime: 0, // Always fetch fresh data (capacity changes frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions,
  });
}

/**
 * Pre-configured hook to fetch only active classes with available enrollment capacity
 *
 * This is a convenience hook that wraps useClasses with commonly used filters for
 * displaying classes that users can actually enroll in. It automatically filters out:
 * - Inactive/archived classes
 * - Classes that are at maximum capacity
 * - Classes that don't accept new enrollments
 *
 * **Use Cases:**
 * - Main class browsing page
 * - "Available Classes" section on dashboard
 * - Quick enrollment flows
 * - Parent portal class selection
 *
 * **Query Key:** `['classes', 'list', { is_active: true, has_capacity: true }]`
 *
 * @param {Object} [queryOptions] - Additional React Query configuration options
 *
 * @returns {UseQueryResult<Class[], ApiErrorResponse>} React Query result with available classes
 * @returns {Class[] | undefined} result.data - Array of classes that are active and have open spots
 *
 * @example
 * // Dashboard showing enrollable classes
 * function DashboardAvailableClasses() {
 *   const { data: classes, isLoading } = useAvailableClasses();
 *
 *   return (
 *     <section>
 *       <h2>Classes You Can Join</h2>
 *       {isLoading ? (
 *         <Skeleton count={3} />
 *       ) : (
 *         <ClassCarousel classes={classes} />
 *       )}
 *     </section>
 *   );
 * }
 *
 * @example
 * // Quick enrollment modal with available classes
 * function QuickEnrollModal() {
 *   const { data: availableClasses } = useAvailableClasses({
 *     // Poll for updates while modal is open
 *     refetchInterval: 30000,
 *   });
 *
 *   return (
 *     <Modal>
 *       <h3>Choose a Class</h3>
 *       <ClassSelector
 *         classes={availableClasses}
 *         onSelect={handleEnrollment}
 *       />
 *     </Modal>
 *   );
 * }
 */
export function useAvailableClasses(
  queryOptions?: Omit<UseQueryOptions<Class[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useClasses({
    filters: {
      is_active: true,
      has_capacity: true,
    },
    queryOptions,
  });
}

/**
 * Pre-configured hook to fetch classes belonging to a specific program
 *
 * This convenience hook fetches all active classes for a given program, useful for
 * program detail pages and program-specific class browsing. The program defines the
 * type of activity (e.g., Swimming, Gymnastics, Soccer) and groups related classes.
 *
 * **Use Cases:**
 * - Program detail page showing all classes
 * - "More classes like this" recommendations
 * - Program comparison views
 * - Administrative program management
 *
 * **Query Key:** `['classes', 'list', { program_id: programId, is_active: true }]`
 *
 * @param {string} programId - The unique identifier of the program
 * @param {Object} [queryOptions] - Additional React Query configuration options
 *
 * @returns {UseQueryResult<Class[], ApiErrorResponse>} React Query result with program classes
 * @returns {Class[] | undefined} result.data - Array of classes for the specified program
 *
 * @example
 * // Program detail page
 * function ProgramDetailPage({ programId }) {
 *   const { data: program } = useProgram({ programId });
 *   const { data: classes, isLoading } = useClassesByProgram(programId);
 *
 *   return (
 *     <div>
 *       <ProgramHeader program={program} />
 *       <section>
 *         <h2>Available Classes</h2>
 *         {isLoading ? (
 *           <LoadingState />
 *         ) : (
 *           <ClassScheduleGrid classes={classes} />
 *         )}
 *       </section>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Related classes recommendation
 * function RelatedClasses({ currentClassProgramId }) {
 *   const { data: relatedClasses } = useClassesByProgram(
 *     currentClassProgramId,
 *     {
 *       // Keep in background, don't need super fresh data
 *       staleTime: 2 * 60 * 1000, // 2 minutes
 *     }
 *   );
 *
 *   return (
 *     <aside>
 *       <h3>More {relatedClasses?.[0]?.program_name} Classes</h3>
 *       <ClassList classes={relatedClasses} />
 *     </aside>
 *   );
 * }
 */
export function useClassesByProgram(
  programId: string,
  queryOptions?: Omit<UseQueryOptions<Class[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useClasses({
    filters: {
      program_id: programId,
      is_active: true,
    },
    queryOptions,
  });
}

/**
 * Pre-configured hook to fetch classes in a specific geographic area
 *
 * This convenience hook fetches all active classes for a given area/location, useful for
 * location-based browsing and helping users find classes near them. Areas typically
 * represent facilities, neighborhoods, or geographic regions.
 *
 * **Use Cases:**
 * - Location-based class search
 * - "Classes near you" features
 * - Multi-location facility management
 * - Area-specific scheduling views
 *
 * **Query Key:** `['classes', 'list', { area_id: areaId, is_active: true }]`
 *
 * @param {string} areaId - The unique identifier of the geographic area
 * @param {Object} [queryOptions] - Additional React Query configuration options
 *
 * @returns {UseQueryResult<Class[], ApiErrorResponse>} React Query result with area classes
 * @returns {Class[] | undefined} result.data - Array of classes in the specified area
 *
 * @example
 * // Location-based class browsing
 * function LocationClassesPage({ areaId }) {
 *   const { data: area } = useArea({ areaId });
 *   const { data: classes, isLoading } = useClassesByArea(areaId);
 *
 *   return (
 *     <div>
 *       <LocationHeader
 *         name={area?.name}
 *         address={area?.address}
 *       />
 *       <section>
 *         <h2>Classes at This Location</h2>
 *         {isLoading ? (
 *           <LoadingSkeleton />
 *         ) : classes?.length === 0 ? (
 *           <EmptyState message="No classes at this location" />
 *         ) : (
 *           <ClassGrid classes={classes} />
 *         )}
 *       </section>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Multi-location selector with class counts
 * function LocationSelector() {
 *   const { data: areas } = useAreas();
 *   const [selectedArea, setSelectedArea] = useState(null);
 *
 *   const { data: areaClasses } = useClassesByArea(
 *     selectedArea?.id || '',
 *     {
 *       // Only fetch when area is selected
 *       enabled: !!selectedArea,
 *     }
 *   );
 *
 *   return (
 *     <div>
 *       <AreaDropdown
 *         areas={areas}
 *         onChange={setSelectedArea}
 *       />
 *       {selectedArea && (
 *         <ClassList
 *           classes={areaClasses}
 *           location={selectedArea.name}
 *         />
 *       )}
 *     </div>
 *   );
 * }
 */
export function useClassesByArea(
  areaId: string,
  queryOptions?: Omit<UseQueryOptions<Class[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useClasses({
    filters: {
      area_id: areaId,
      is_active: true,
    },
    queryOptions,
  });
}
