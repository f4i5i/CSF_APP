/**
 * @file usePrograms Hook
 * @description React Query hooks for fetching program data with optimized caching for static content.
 *
 * Programs represent the types of activities offered (e.g., Swimming, Gymnastics, Soccer, Art).
 * They serve as high-level categorization for classes and are relatively static data that changes
 * infrequently. This module provides hooks for fetching program lists and individual program details.
 *
 * **React Query Caching Strategy:**
 * - staleTime: 10 minutes - Programs are relatively static, so longer cache is acceptable
 * - gcTime: 30 minutes - Keep program data in memory longer for better navigation performance
 * - Background refetching: Enabled but less aggressive than class queries
 * - Query keys: ['programs', 'list'] for lists, ['programs', 'detail', id] for details
 *
 * **Cache Benefits:**
 * Programs change infrequently (new programs added rarely, names/descriptions updated occasionally),
 * so aggressive caching significantly improves performance:
 * - Instant program selector population
 * - Fast navigation between program pages
 * - Reduced API load
 * - Better offline experience
 *
 * **Integration with Class Browsing Flow:**
 * 1. User views program list (usePrograms)
 * 2. User clicks on a program (useProgram fetches details)
 * 3. User views classes for that program (useClassesByProgram)
 * 4. Navigation back shows cached program data instantly
 *
 * @module api/hooks/classes
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { programService } from '../../services/class.service';
import { queryKeys } from '../../constants/query-keys';
import type { Program, ProgramId } from '../../types/class.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Options for the usePrograms hook
 *
 * @interface UseProgramsOptions
 * @property {Object} [queryOptions] - Additional React Query configuration options
 */
interface UseProgramsOptions {
  queryOptions?: Omit<
    UseQueryOptions<Program[], ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * React Query hook to fetch all available programs
 *
 * This hook retrieves the complete list of programs (activity types) offered by the organization.
 * Programs are high-level categories like "Swimming", "Gymnastics", "Soccer", etc., and are used
 * to group related classes together.
 *
 * **Program Data Includes:**
 * - Program ID and name
 * - Description and detailed information
 * - Category/type classification
 * - Age range suitability
 * - Associated images/media
 * - Active/inactive status
 * - Class count (number of classes in this program)
 *
 * **Caching Configuration:**
 * - staleTime: 10 minutes - Programs rarely change, so longer cache is appropriate
 * - gcTime: 30 minutes - Keeps data in memory for extended navigation sessions
 * - Background refetch: Less aggressive than class queries (programs are static)
 *
 * **Query Key:** `['programs', 'list']`
 * - Simple key structure since there are no filter parameters
 * - Invalidate all program queries: `queryClient.invalidateQueries(['programs'])`
 * - Invalidate just the list: `queryClient.invalidateQueries(['programs', 'list'])`
 *
 * **Performance Considerations:**
 * Programs are fetched early and cached aggressively because:
 * - They're needed in multiple places (filters, navigation, program cards)
 * - They change infrequently (maybe once per season)
 * - The list is typically small (10-50 programs)
 * - Caching reduces API load significantly
 *
 * @param {UseProgramsOptions} [options={}] - Hook configuration options
 * @param {Object} [options.queryOptions] - Additional React Query configuration
 *
 * @returns {UseQueryResult<Program[], ApiErrorResponse>} React Query result object
 * @returns {Program[] | undefined} result.data - Array of all programs
 * @returns {boolean} result.isLoading - True during initial fetch
 * @returns {boolean} result.isFetching - True during any fetch (including background refetch)
 * @returns {boolean} result.isError - True if the query encountered an error
 * @returns {ApiErrorResponse | null} result.error - Error object if query failed
 * @returns {Function} result.refetch - Function to manually trigger a refetch
 * @returns {boolean} result.isSuccess - True when data has been successfully fetched
 *
 * @example
 * // Basic usage - display program list
 * function ProgramsPage() {
 *   const { data: programs, isLoading, error } = usePrograms();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return (
 *     <div>
 *       <h1>Our Programs</h1>
 *       <ProgramGrid>
 *         {programs.map(program => (
 *           <ProgramCard
 *             key={program.id}
 *             program={program}
 *             classCount={program.class_count}
 *           />
 *         ))}
 *       </ProgramGrid>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Program filter dropdown
 * function ClassFilters() {
 *   const { data: programs } = usePrograms();
 *   const [selectedProgram, setSelectedProgram] = useState(null);
 *
 *   return (
 *     <FilterGroup>
 *       <Label>Filter by Program</Label>
 *       <Select
 *         options={programs}
 *         value={selectedProgram}
 *         onChange={setSelectedProgram}
 *         getOptionLabel={(p) => p.name}
 *         getOptionValue={(p) => p.id}
 *       />
 *     </FilterGroup>
 *   );
 * }
 *
 * @example
 * // Navigation menu with program categories
 * function ProgramNavigation() {
 *   const { data: programs, isLoading } = usePrograms({
 *     queryOptions: {
 *       // Even longer cache for navigation menus
 *       staleTime: 30 * 60 * 1000, // 30 minutes
 *     }
 *   });
 *
 *   if (isLoading) return <NavSkeleton />;
 *
 *   return (
 *     <nav>
 *       <h3>Browse by Program</h3>
 *       <ul>
 *         {programs.map(program => (
 *           <li key={program.id}>
 *             <NavLink to={`/programs/${program.id}`}>
 *               {program.name} ({program.class_count})
 *             </NavLink>
 *           </li>
 *         ))}
 *       </ul>
 *     </nav>
 *   );
 * }
 *
 * @example
 * // Dashboard program summary with prefetching
 * function DashboardPrograms() {
 *   const queryClient = useQueryClient();
 *   const { data: programs } = usePrograms();
 *
 *   const handleProgramHover = (programId) => {
 *     // Prefetch program details on hover for instant navigation
 *     queryClient.prefetchQuery({
 *       queryKey: queryKeys.programs.detail(programId),
 *       queryFn: () => programService.getById(programId),
 *     });
 *   };
 *
 *   return (
 *     <section>
 *       <h2>Popular Programs</h2>
 *       {programs?.slice(0, 6).map(program => (
 *         <ProgramCard
 *           key={program.id}
 *           program={program}
 *           onMouseEnter={() => handleProgramHover(program.id)}
 *         />
 *       ))}
 *     </section>
 *   );
 * }
 */
export function usePrograms(options: UseProgramsOptions = {}) {
  const { queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.programs.lists(),
    queryFn: () => programService.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes (programs don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...queryOptions,
  });
}

/**
 * Options for the useProgram hook
 *
 * @interface UseProgramOptions
 * @property {ProgramId} programId - The unique identifier of the program to fetch
 * @property {Object} [queryOptions] - Additional React Query configuration options
 */
interface UseProgramOptions {
  programId: ProgramId;
  queryOptions?: Omit<
    UseQueryOptions<Program, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * React Query hook to fetch detailed information for a single program
 *
 * This hook retrieves comprehensive details for a specific program, including full description,
 * images, requirements, and related metadata. Used primarily on program detail pages.
 *
 * **Program Detail Data Includes:**
 * - Complete program information (name, description, category)
 * - Detailed requirements and prerequisites
 * - Age range and skill level information
 * - Pricing structure and payment options
 * - Schedule availability overview
 * - Related media (images, videos, documents)
 * - Program history and background
 * - Instructor information
 * - List of classes in this program
 *
 * **Caching Configuration:**
 * - staleTime: 10 minutes - Program details are static and can be cached longer
 * - gcTime: 30 minutes - Keep in memory for extended browsing sessions
 * - enabled: !!programId - Query only runs when programId is provided
 *
 * **Query Key:** `['programs', 'detail', programId]`
 * - Hierarchical key structure for precise cache management
 * - Invalidate specific program: `queryClient.invalidateQueries(['programs', 'detail', '123'])`
 * - Invalidate all program details: `queryClient.invalidateQueries(['programs', 'detail'])`
 *
 * **Conditional Fetching:**
 * The query is automatically disabled when programId is null/undefined (enabled: !!programId).
 * This prevents unnecessary API calls when the program ID isn't available yet.
 *
 * @param {UseProgramOptions} options - Hook configuration options
 * @param {ProgramId} options.programId - The ID of the program to fetch
 * @param {Object} [options.queryOptions] - Additional React Query configuration
 *
 * @returns {UseQueryResult<Program, ApiErrorResponse>} React Query result object
 * @returns {Program | undefined} result.data - The program data when successfully fetched
 * @returns {boolean} result.isLoading - True during initial fetch (false if query disabled)
 * @returns {boolean} result.isFetching - True during any fetch (including background refetch)
 * @returns {boolean} result.isError - True if the query encountered an error
 * @returns {ApiErrorResponse | null} result.error - Error object if query failed
 * @returns {Function} result.refetch - Function to manually trigger a refetch
 * @returns {boolean} result.isSuccess - True when data has been successfully fetched
 *
 * @example
 * // Program detail page
 * function ProgramDetailPage({ programId }) {
 *   const { data: program, isLoading, error } = useProgram({ programId });
 *   const { data: classes } = useClassesByProgram(programId);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return (
 *     <div>
 *       <ProgramHeader
 *         name={program.name}
 *         description={program.description}
 *         image={program.image_url}
 *       />
 *       <ProgramDetails program={program} />
 *       <section>
 *         <h2>Available Classes</h2>
 *         <ClassList classes={classes} />
 *       </section>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Conditional fetching based on route params
 * function ProgramRoute() {
 *   const { programId } = useParams();
 *   // Query automatically disabled when programId is undefined
 *   const { data: program, isLoading } = useProgram({ programId });
 *
 *   if (!programId) {
 *     return <Navigate to="/programs" />;
 *   }
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return <ProgramDetailView program={program} />;
 * }
 *
 * @example
 * // Program comparison view
 * function ProgramComparison({ programIds }) {
 *   const programs = programIds.map(id =>
 *     useProgram({ programId: id })
 *   );
 *
 *   const allLoaded = programs.every(p => !p.isLoading);
 *
 *   if (!allLoaded) return <LoadingSpinner />;
 *
 *   return (
 *     <ComparisonTable>
 *       {programs.map(({ data: program }) => (
 *         <ProgramColumn key={program.id} program={program} />
 *       ))}
 *     </ComparisonTable>
 *   );
 * }
 *
 * @example
 * // Program info modal with custom cache
 * function ProgramInfoModal({ programId, isOpen }) {
 *   const { data: program } = useProgram({
 *     programId,
 *     queryOptions: {
 *       // Only fetch when modal is open
 *       enabled: isOpen && !!programId,
 *       // Keep cached data longer for this modal
 *       staleTime: 30 * 60 * 1000, // 30 minutes
 *     }
 *   });
 *
 *   return (
 *     <Modal isOpen={isOpen}>
 *       <h2>{program?.name}</h2>
 *       <p>{program?.description}</p>
 *       <ProgramMetadata program={program} />
 *     </Modal>
 *   );
 * }
 */
export function useProgram({ programId, queryOptions }: UseProgramOptions) {
  return useQuery({
    queryKey: queryKeys.programs.detail(programId),
    queryFn: () => programService.getById(programId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!programId,
    ...queryOptions,
  });
}
