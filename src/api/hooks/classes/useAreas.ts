/**
 * @file useAreas Hook
 * @description React Query hooks for fetching geographic area data with optimized caching for static content.
 *
 * Areas represent geographic locations or facilities where classes are held (e.g., Main Campus,
 * North Location, Downtown Facility, Community Center). They serve as location-based categorization
 * for classes and are relatively static data that changes infrequently. This module provides hooks
 * for fetching area lists and individual area details.
 *
 * **React Query Caching Strategy:**
 * - staleTime: 10 minutes - Areas are static location data that rarely changes
 * - gcTime: 30 minutes - Keep area data in memory longer for better navigation performance
 * - Background refetching: Enabled but less aggressive than class queries
 * - Query keys: ['areas', 'list'] for lists, ['areas', 'detail', id] for details
 *
 * **Cache Benefits:**
 * Areas change very infrequently (new locations added rarely, details updated occasionally),
 * so aggressive caching provides significant performance benefits:
 * - Instant location selector population
 * - Fast navigation between location pages
 * - Reduced API load
 * - Better offline experience for browsing
 * - Improved map rendering performance
 *
 * **Integration with Class Browsing Flow:**
 * 1. User views area/location list (useAreas)
 * 2. User clicks on an area to see details (useArea fetches location info)
 * 3. User views classes at that location (useClassesByArea)
 * 4. Navigation back shows cached area data instantly
 * 5. Location filters use cached area list for instant dropdown population
 *
 * @module api/hooks/classes
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { areaService } from '../../services/class.service';
import { queryKeys } from '../../constants/query-keys';
import type { Area, AreaId } from '../../types/class.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Options for the useAreas hook
 *
 * @interface UseAreasOptions
 * @property {Object} [queryOptions] - Additional React Query configuration options
 */
interface UseAreasOptions {
  queryOptions?: Omit<
    UseQueryOptions<Area[], ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * React Query hook to fetch all available areas/locations
 *
 * This hook retrieves the complete list of geographic areas or facilities where classes are held.
 * Areas represent physical locations and are used for location-based class filtering and browsing.
 *
 * **Area Data Includes:**
 * - Area ID and name
 * - Full address and location details
 * - Geographic coordinates (for mapping)
 * - Facility type and amenities
 * - Contact information
 * - Operating hours
 * - Parking and accessibility information
 * - Active/inactive status
 * - Class count (number of classes at this location)
 *
 * **Caching Configuration:**
 * - staleTime: 10 minutes - Areas rarely change, so longer cache is appropriate
 * - gcTime: 30 minutes - Keeps data in memory for extended browsing sessions
 * - Background refetch: Less aggressive than class queries (areas are static)
 *
 * **Query Key:** `['areas', 'list']`
 * - Simple key structure since there are no filter parameters
 * - Invalidate all area queries: `queryClient.invalidateQueries(['areas'])`
 * - Invalidate just the list: `queryClient.invalidateQueries(['areas', 'list'])`
 *
 * **Performance Considerations:**
 * Areas are fetched early and cached aggressively because:
 * - They're needed in multiple places (filters, location selectors, maps, navigation)
 * - They change very infrequently (new locations added rarely)
 * - The list is typically small (5-20 areas)
 * - Caching dramatically reduces API load
 * - Used for initializing location-based features
 *
 * @param {UseAreasOptions} [options={}] - Hook configuration options
 * @param {Object} [options.queryOptions] - Additional React Query configuration
 *
 * @returns {UseQueryResult<Area[], ApiErrorResponse>} React Query result object
 * @returns {Area[] | undefined} result.data - Array of all areas/locations
 * @returns {boolean} result.isLoading - True during initial fetch
 * @returns {boolean} result.isFetching - True during any fetch (including background refetch)
 * @returns {boolean} result.isError - True if the query encountered an error
 * @returns {ApiErrorResponse | null} result.error - Error object if query failed
 * @returns {Function} result.refetch - Function to manually trigger a refetch
 * @returns {boolean} result.isSuccess - True when data has been successfully fetched
 *
 * @example
 * // Basic usage - display location list
 * function LocationsPage() {
 *   const { data: areas, isLoading, error } = useAreas();
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return (
 *     <div>
 *       <h1>Our Locations</h1>
 *       <LocationGrid>
 *         {areas.map(area => (
 *           <LocationCard
 *             key={area.id}
 *             area={area}
 *             classCount={area.class_count}
 *             address={area.address}
 *           />
 *         ))}
 *       </LocationGrid>
 *     </div>
 *   );
 * }
 *
 * @example
 * // Location filter dropdown
 * function ClassFilters() {
 *   const { data: areas } = useAreas();
 *   const [selectedArea, setSelectedArea] = useState(null);
 *
 *   return (
 *     <FilterGroup>
 *       <Label>Filter by Location</Label>
 *       <Select
 *         options={areas}
 *         value={selectedArea}
 *         onChange={setSelectedArea}
 *         getOptionLabel={(area) => area.name}
 *         getOptionValue={(area) => area.id}
 *         placeholder="All Locations"
 *       />
 *     </FilterGroup>
 *   );
 * }
 *
 * @example
 * // Interactive map with all locations
 * function LocationsMap() {
 *   const { data: areas, isLoading } = useAreas({
 *     queryOptions: {
 *       // Cache longer for map views
 *       staleTime: 30 * 60 * 1000, // 30 minutes
 *     }
 *   });
 *
 *   if (isLoading) return <MapSkeleton />;
 *
 *   return (
 *     <Map>
 *       {areas.map(area => (
 *         <Marker
 *           key={area.id}
 *           position={[area.latitude, area.longitude]}
 *           popup={
 *             <LocationPopup
 *               name={area.name}
 *               address={area.address}
 *               classCount={area.class_count}
 *             />
 *           }
 *         />
 *       ))}
 *     </Map>
 *   );
 * }
 *
 * @example
 * // Location selector with distance calculation
 * function NearbyLocations({ userLocation }) {
 *   const { data: areas } = useAreas();
 *
 *   const sortedByDistance = useMemo(() => {
 *     if (!areas || !userLocation) return [];
 *     return areas
 *       .map(area => ({
 *         ...area,
 *         distance: calculateDistance(userLocation, {
 *           lat: area.latitude,
 *           lng: area.longitude
 *         })
 *       }))
 *       .sort((a, b) => a.distance - b.distance);
 *   }, [areas, userLocation]);
 *
 *   return (
 *     <section>
 *       <h2>Locations Near You</h2>
 *       {sortedByDistance.map(area => (
 *         <LocationListItem
 *           key={area.id}
 *           area={area}
 *           distance={area.distance}
 *         />
 *       ))}
 *     </section>
 *   );
 * }
 *
 * @example
 * // Navigation menu with location-based organization
 * function LocationNavigation() {
 *   const { data: areas, isLoading } = useAreas();
 *
 *   if (isLoading) return <NavSkeleton />;
 *
 *   return (
 *     <nav>
 *       <h3>Browse by Location</h3>
 *       <ul>
 *         {areas.map(area => (
 *           <li key={area.id}>
 *             <NavLink to={`/locations/${area.id}`}>
 *               <LocationIcon />
 *               {area.name} ({area.class_count} classes)
 *             </NavLink>
 *           </li>
 *         ))}
 *       </ul>
 *     </nav>
 *   );
 * }
 */
export function useAreas(options: UseAreasOptions = {}) {
  const { queryOptions } = options;

  return useQuery({
    queryKey: queryKeys.areas.lists(),
    queryFn: () => areaService.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes (areas don't change often)
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...queryOptions,
  });
}

/**
 * Options for the useArea hook
 *
 * @interface UseAreaOptions
 * @property {AreaId} areaId - The unique identifier of the area to fetch
 * @property {Object} [queryOptions] - Additional React Query configuration options
 */
interface UseAreaOptions {
  areaId: AreaId;
  queryOptions?: Omit<
    UseQueryOptions<Area, ApiErrorResponse>,
    'queryKey' | 'queryFn'
  >;
}

/**
 * React Query hook to fetch detailed information for a single area/location
 *
 * This hook retrieves comprehensive details for a specific geographic area or facility,
 * including full location information, amenities, and operational details. Used primarily
 * on location detail pages and for displaying complete facility information.
 *
 * **Area Detail Data Includes:**
 * - Complete location information (name, full address)
 * - Geographic coordinates (latitude/longitude for mapping)
 * - Facility details (type, size, capacity)
 * - Amenities and features (parking, accessibility, equipment)
 * - Contact information (phone, email)
 * - Operating hours and schedule
 * - Directions and transportation options
 * - Parking instructions
 * - Safety and accessibility information
 * - Photos and virtual tour links
 * - List of classes at this location
 * - Staff and instructor information
 *
 * **Caching Configuration:**
 * - staleTime: 10 minutes - Location details are static and can be cached longer
 * - gcTime: 30 minutes - Keep in memory for extended browsing sessions
 * - enabled: !!areaId - Query only runs when areaId is provided
 *
 * **Query Key:** `['areas', 'detail', areaId]`
 * - Hierarchical key structure for precise cache management
 * - Invalidate specific area: `queryClient.invalidateQueries(['areas', 'detail', '123'])`
 * - Invalidate all area details: `queryClient.invalidateQueries(['areas', 'detail'])`
 *
 * **Conditional Fetching:**
 * The query is automatically disabled when areaId is null/undefined (enabled: !!areaId).
 * This prevents unnecessary API calls when the area ID isn't available yet.
 *
 * @param {UseAreaOptions} options - Hook configuration options
 * @param {AreaId} options.areaId - The ID of the area to fetch
 * @param {Object} [options.queryOptions] - Additional React Query configuration
 *
 * @returns {UseQueryResult<Area, ApiErrorResponse>} React Query result object
 * @returns {Area | undefined} result.data - The area data when successfully fetched
 * @returns {boolean} result.isLoading - True during initial fetch (false if query disabled)
 * @returns {boolean} result.isFetching - True during any fetch (including background refetch)
 * @returns {boolean} result.isError - True if the query encountered an error
 * @returns {ApiErrorResponse | null} result.error - Error object if query failed
 * @returns {Function} result.refetch - Function to manually trigger a refetch
 * @returns {boolean} result.isSuccess - True when data has been successfully fetched
 *
 * @example
 * // Location detail page
 * function LocationDetailPage({ areaId }) {
 *   const { data: area, isLoading, error } = useArea({ areaId });
 *   const { data: classes } = useClassesByArea(areaId);
 *
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} />;
 *
 *   return (
 *     <div>
 *       <LocationHeader
 *         name={area.name}
 *         address={area.address}
 *         image={area.image_url}
 *       />
 *       <LocationDetails area={area} />
 *       <section>
 *         <h2>Classes at This Location</h2>
 *         <ClassSchedule classes={classes} />
 *       </section>
 *       <LocationMap
 *         latitude={area.latitude}
 *         longitude={area.longitude}
 *       />
 *     </div>
 *   );
 * }
 *
 * @example
 * // Conditional fetching based on route params
 * function LocationRoute() {
 *   const { areaId } = useParams();
 *   // Query automatically disabled when areaId is undefined
 *   const { data: area, isLoading } = useArea({ areaId });
 *
 *   if (!areaId) {
 *     return <Navigate to="/locations" />;
 *   }
 *
 *   if (isLoading) return <LoadingSpinner />;
 *
 *   return <LocationDetailView area={area} />;
 * }
 *
 * @example
 * // Location comparison for parent decision-making
 * function LocationComparison({ areaIds }) {
 *   const areas = areaIds.map(id => useArea({ areaId: id }));
 *
 *   const allLoaded = areas.every(a => !a.isLoading);
 *
 *   if (!allLoaded) return <LoadingSpinner />;
 *
 *   return (
 *     <ComparisonTable>
 *       <thead>
 *         <tr>
 *           <th>Feature</th>
 *           {areas.map(({ data: area }) => (
 *             <th key={area.id}>{area.name}</th>
 *           ))}
 *         </tr>
 *       </thead>
 *       <tbody>
 *         <tr>
 *           <td>Address</td>
 *           {areas.map(({ data: area }) => (
 *             <td key={area.id}>{area.address}</td>
 *           ))}
 *         </tr>
 *         <tr>
 *           <td>Classes</td>
 *           {areas.map(({ data: area }) => (
 *             <td key={area.id}>{area.class_count}</td>
 *           ))}
 *         </tr>
 *         <tr>
 *           <td>Parking</td>
 *           {areas.map(({ data: area }) => (
 *             <td key={area.id}>{area.parking_info}</td>
 *           ))}
 *         </tr>
 *       </tbody>
 *     </ComparisonTable>
 *   );
 * }
 *
 * @example
 * // Location info sidebar with custom cache
 * function LocationSidebar({ areaId, isVisible }) {
 *   const { data: area } = useArea({
 *     areaId,
 *     queryOptions: {
 *       // Only fetch when sidebar is visible
 *       enabled: isVisible && !!areaId,
 *       // Keep cached data longer for sidebar
 *       staleTime: 30 * 60 * 1000, // 30 minutes
 *     }
 *   });
 *
 *   if (!isVisible) return null;
 *
 *   return (
 *     <aside>
 *       <h3>{area?.name}</h3>
 *       <address>{area?.address}</address>
 *       <p>{area?.phone}</p>
 *       <DirectionsLink
 *         lat={area?.latitude}
 *         lng={area?.longitude}
 *       />
 *     </aside>
 *   );
 * }
 *
 * @example
 * // Enrollment form with location details
 * function EnrollmentForm({ classId }) {
 *   const { data: classDetail } = useClass({ classId });
 *   const { data: location } = useArea({
 *     areaId: classDetail?.area_id || '',
 *     queryOptions: {
 *       // Only fetch when we have the class area_id
 *       enabled: !!classDetail?.area_id,
 *     }
 *   });
 *
 *   return (
 *     <form>
 *       <ClassInfo class={classDetail} />
 *       {location && (
 *         <LocationInfo
 *           name={location.name}
 *           address={location.address}
 *           parking={location.parking_info}
 *         />
 *       )}
 *       <EnrollmentButton />
 *     </form>
 *   );
 * }
 */
export function useArea({ areaId, queryOptions }: UseAreaOptions) {
  return useQuery({
    queryKey: queryKeys.areas.detail(areaId),
    queryFn: () => areaService.getById(areaId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!areaId,
    ...queryOptions,
  });
}
