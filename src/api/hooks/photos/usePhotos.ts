/**
 * @file Photo Query Hooks
 * @description React Query hooks for fetching and managing photo gallery data.
 * These hooks provide access to the photo management system, allowing users to
 * browse photo galleries, view individual photos, filter by class or album,
 * and access paginated photo collections for efficient loading.
 *
 * Photos are cached for 10 minutes since they change less frequently than other
 * content. This longer cache time improves performance when browsing galleries
 * while still allowing for timely updates when new photos are added.
 *
 * @module hooks/photos/usePhotos
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { photoService } from '../../services/photo.service';
import { queryKeys } from '../../constants/query-keys';
import type { Photo, PhotoFilters, PhotoGalleryResponse } from '../../types/photo.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch photos with optional filtering.
 *
 * @description Retrieves photos from the gallery with support for various filters
 * including album, class, date range, and tags. Photos are cached for 10 minutes
 * since they are relatively static content. Ideal for displaying photo lists,
 * galleries, and filtered photo views.
 *
 * @param {Object} [params] - Hook parameters
 * @param {PhotoFilters} [params.filters] - Optional filters (album_id, class_id, date range, tags)
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<Photo[], ApiErrorResponse>} Query result with photos data
 *
 * @example
 * // Fetch all photos
 * const { data: photos, isLoading } = usePhotos();
 *
 * return (
 *   <PhotoGrid>
 *     {photos?.map(photo => (
 *       <PhotoCard key={photo.id} photo={photo} />
 *     ))}
 *   </PhotoGrid>
 * );
 *
 * @example
 * // Fetch photos from a specific album
 * const { data: albumPhotos } = usePhotos({
 *   filters: {
 *     album_id: 'album-123'
 *   }
 * });
 *
 * @example
 * // Fetch photos by date range
 * const { data: recentPhotos } = usePhotos({
 *   filters: {
 *     start_date: '2024-01-01',
 *     end_date: '2024-12-31'
 *   }
 * });
 */
export function usePhotos({
  filters,
  queryOptions,
}: {
  filters?: PhotoFilters;
  queryOptions?: Omit<UseQueryOptions<Photo[], ApiErrorResponse>, 'queryKey' | 'queryFn'>;
} = {}) {
  return useQuery({
    queryKey: queryKeys.photos.list(filters),
    queryFn: () => photoService.getAll(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes (photos are relatively static)
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...queryOptions,
  });
}

/**
 * Hook to fetch photos with pagination support.
 *
 * @description Retrieves a paginated collection of photos, including metadata about
 * total count, page information, and navigation. Optimized for large galleries where
 * loading all photos at once would be inefficient. Returns both photo data and
 * pagination information in a single response.
 *
 * @param {Object} [params] - Hook parameters
 * @param {PhotoFilters} [params.filters] - Optional filters including page and limit
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<PhotoGalleryResponse, ApiErrorResponse>} Query result with paginated photos
 *
 * @example
 * // Fetch paginated photo gallery
 * const { data: gallery, isLoading } = usePhotoGallery({
 *   filters: {
 *     page: 1,
 *     limit: 20
 *   }
 * });
 *
 * if (isLoading) return <GallerySkeleton />;
 *
 * return (
 *   <div>
 *     <PhotoGrid photos={gallery.photos} />
 *     <Pagination
 *       currentPage={gallery.current_page}
 *       totalPages={gallery.total_pages}
 *       totalCount={gallery.total_count}
 *     />
 *   </div>
 * );
 *
 * @example
 * // Infinite scroll implementation
 * const [page, setPage] = useState(1);
 * const { data: gallery } = usePhotoGallery({
 *   filters: { page, limit: 50 }
 * });
 *
 * const loadMore = () => {
 *   if (gallery && page < gallery.total_pages) {
 *     setPage(page + 1);
 *   }
 * };
 */
export function usePhotoGallery({
  filters,
  queryOptions,
}: {
  filters?: PhotoFilters;
  queryOptions?: Omit<UseQueryOptions<PhotoGalleryResponse, ApiErrorResponse>, 'queryKey' | 'queryFn'>;
} = {}) {
  return useQuery({
    queryKey: [...queryKeys.photos.list(filters), 'gallery'],
    queryFn: () => photoService.getPaginated(filters),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * Hook to fetch a single photo by ID.
 *
 * @description Retrieves detailed information for a specific photo, including full
 * metadata, tags, associated children, and album information. Used for photo detail
 * views, lightbox displays, and photo editing interfaces. The query is automatically
 * disabled if no photoId is provided.
 *
 * @param {Object} params - Hook parameters
 * @param {string} params.photoId - The unique identifier of the photo to fetch
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<Photo, ApiErrorResponse>} Query result with photo details
 *
 * @example
 * // Display photo details
 * const { data: photo, isLoading } = usePhoto({ photoId: '123' });
 *
 * if (isLoading) return <PhotoSkeleton />;
 *
 * return (
 *   <div>
 *     <img src={photo.url} alt={photo.caption} />
 *     <h3>{photo.caption}</h3>
 *     <p>Taken on: {new Date(photo.taken_at).toLocaleDateString()}</p>
 *     <TagList tags={photo.tags} />
 *   </div>
 * );
 *
 * @example
 * // Photo lightbox component
 * const { data: photo } = usePhoto({
 *   photoId: selectedPhotoId
 * });
 *
 * return (
 *   <Lightbox isOpen={!!selectedPhotoId}>
 *     {photo && (
 *       <>
 *         <img src={photo.url} alt={photo.caption} />
 *         <PhotoMetadata photo={photo} />
 *       </>
 *     )}
 *   </Lightbox>
 * );
 */
export function usePhoto({
  photoId,
  queryOptions,
}: {
  photoId: string;
  queryOptions?: Omit<UseQueryOptions<Photo, ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.photos.detail(photoId),
    queryFn: () => photoService.getById(photoId),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!photoId,
    ...queryOptions,
  });
}

/**
 * Hook to fetch photos associated with a specific class.
 *
 * @description Retrieves all photos tagged with or associated with a particular class.
 * Useful for displaying class-specific photo galleries, allowing parents to view photos
 * of their child's class activities and events. The query is automatically disabled if
 * no classId is provided.
 *
 * @param {Object} params - Hook parameters
 * @param {string} params.classId - The unique identifier of the class
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<Photo[], ApiErrorResponse>} Query result with class photos
 *
 * @example
 * // Display photos for a specific class
 * const { data: classPhotos, isLoading } = useClassPhotos({
 *   classId: 'class-123'
 * });
 *
 * return (
 *   <div>
 *     <h2>Class Photos</h2>
 *     {isLoading ? (
 *       <LoadingSpinner />
 *     ) : (
 *       <PhotoGallery photos={classPhotos} />
 *     )}
 *   </div>
 * );
 *
 * @example
 * // Class photo count badge
 * const { data: classPhotos } = useClassPhotos({ classId });
 *
 * return (
 *   <ClassCard>
 *     <h3>{className}</h3>
 *     <Badge>{classPhotos?.length || 0} photos</Badge>
 *   </ClassCard>
 * );
 */
export function useClassPhotos({
  classId,
  queryOptions,
}: {
  classId: string;
  queryOptions?: Omit<UseQueryOptions<Photo[], ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: queryKeys.photos.byClass(classId),
    queryFn: () => photoService.getByClass(classId),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!classId,
    ...queryOptions,
  });
}
