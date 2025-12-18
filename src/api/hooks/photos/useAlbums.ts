/**
 * @file Album Management Hooks
 * @description React Query hooks for managing photo albums.
 * These hooks provide functionality to organize photos into albums, create collections
 * for events or time periods, and manage album metadata. Albums help organize the photo
 * gallery into logical groupings, making it easier for parents to find and browse photos
 * from specific events, classes, or time periods.
 *
 * All album mutations automatically invalidate related queries to ensure album lists
 * and photo galleries stay synchronized across the application.
 *
 * @module hooks/photos/useAlbums
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { photoService } from '../../services/photo.service';
import { queryKeys } from '../../constants/query-keys';
import type { Album, AlbumWithPhotos, CreateAlbumRequest, UpdateAlbumRequest } from '../../types/photo.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch all photo albums.
 *
 * @description Retrieves a list of all photo albums with basic metadata including title,
 * description, photo count, and cover photo. Albums are cached for 10 minutes since they
 * change less frequently. Used for displaying album lists, navigation, and selection.
 *
 * @param {Object} [queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<Album[], ApiErrorResponse>} Query result with albums data
 *
 * @example
 * // Display list of albums
 * const { data: albums, isLoading } = useAlbums();
 *
 * return (
 *   <div>
 *     <h2>Photo Albums</h2>
 *     {isLoading ? (
 *       <AlbumsSkeleton />
 *     ) : (
 *       <AlbumGrid>
 *         {albums?.map(album => (
 *           <AlbumCard key={album.id} album={album} />
 *         ))}
 *       </AlbumGrid>
 *     )}
 *   </div>
 * );
 *
 * @example
 * // Album selector dropdown
 * const { data: albums } = useAlbums();
 *
 * return (
 *   <Select>
 *     <option value="">Select an album</option>
 *     {albums?.map(album => (
 *       <option key={album.id} value={album.id}>
 *         {album.title} ({album.photo_count} photos)
 *       </option>
 *     ))}
 *   </Select>
 * );
 */
export function useAlbums(
  queryOptions?: Omit<UseQueryOptions<Album[], ApiErrorResponse>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [...queryKeys.photos.all, 'albums'],
    queryFn: () => photoService.getAlbums(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000,
    ...queryOptions,
  });
}

/**
 * Hook to fetch a single album with its photos.
 *
 * @description Retrieves detailed information about a specific album including all photos
 * contained within it. Returns complete album data with embedded photo collection, making
 * it ideal for album detail pages and photo galleries. The query is automatically disabled
 * if no albumId is provided.
 *
 * @param {Object} params - Hook parameters
 * @param {string} params.albumId - The unique identifier of the album to fetch
 * @param {Object} [params.queryOptions] - Additional React Query options
 *
 * @returns {UseQueryResult<AlbumWithPhotos, ApiErrorResponse>} Query result with album and photos
 *
 * @example
 * // Display album with photos
 * const { data: album, isLoading } = useAlbum({ albumId: '123' });
 *
 * if (isLoading) return <AlbumDetailSkeleton />;
 *
 * return (
 *   <div>
 *     <AlbumHeader
 *       title={album.title}
 *       description={album.description}
 *       photoCount={album.photos.length}
 *     />
 *     <PhotoGallery photos={album.photos} />
 *   </div>
 * );
 *
 * @example
 * // Album photo slideshow
 * const { data: album } = useAlbum({ albumId: selectedAlbumId });
 * const [currentIndex, setCurrentIndex] = useState(0);
 *
 * return (
 *   <Slideshow>
 *     {album && album.photos[currentIndex] && (
 *       <img src={album.photos[currentIndex].url} alt="" />
 *     )}
 *     <Controls
 *       onPrevious={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
 *       onNext={() => setCurrentIndex(Math.min(album.photos.length - 1, currentIndex + 1))}
 *     />
 *   </Slideshow>
 * );
 */
export function useAlbum({
  albumId,
  queryOptions,
}: {
  albumId: string;
  queryOptions?: Omit<UseQueryOptions<AlbumWithPhotos, ApiErrorResponse>, 'queryKey' | 'queryFn'>;
}) {
  return useQuery({
    queryKey: [...queryKeys.photos.all, 'album', albumId],
    queryFn: () => photoService.getAlbumById(albumId),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!albumId,
    ...queryOptions,
  });
}

/**
 * Hook to create a new photo album.
 *
 * @description Creates a new album to organize photos. Albums can be used to group photos
 * from specific events, classes, or time periods. After creation, all album queries are
 * invalidated to ensure the new album appears immediately in album lists.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult<Album, ApiErrorResponse, CreateAlbumRequest>} Mutation result with mutate function
 *
 * @example
 * // Create event album
 * const { mutate: createAlbum, isPending } = useCreateAlbum();
 *
 * const handleCreateAlbum = () => {
 *   createAlbum({
 *     title: 'Summer Camp 2024',
 *     description: 'Photos from our summer camp activities',
 *     class_id: 'class-123'
 *   });
 * };
 *
 * @example
 * // Create album with navigation
 * const { mutate: createAlbum } = useCreateAlbum({
 *   onSuccess: (newAlbum) => {
 *     navigate(`/albums/${newAlbum.id}`);
 *   }
 * });
 *
 * createAlbum({
 *   title: 'Field Trip Photos',
 *   description: 'Our visit to the science museum'
 * });
 *
 * @example
 * // Create album with cover photo
 * const { mutate: createAlbum } = useCreateAlbum();
 *
 * createAlbum({
 *   title: 'Soccer Tournament',
 *   description: 'Championship game photos',
 *   cover_photo_id: 'photo-456'
 * });
 */
export function useCreateAlbum(
  options?: Omit<
    UseMutationOptions<Album, ApiErrorResponse, CreateAlbumRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (albumData: CreateAlbumRequest) => photoService.createAlbum(albumData),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.photos.all, 'albums'] });
      toast.success('Album created successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to create album');
    },

    ...options,
  });
}

/**
 * Hook to update an existing album.
 *
 * @description Modifies album details such as title, description, or cover photo.
 * Automatically invalidates both the album list and specific album detail queries
 * to ensure all views reflect the updated information.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult} Mutation result with mutate function and state
 *
 * @example
 * // Update album title and description
 * const { mutate: updateAlbum } = useUpdateAlbum();
 *
 * updateAlbum({
 *   id: 'album-123',
 *   data: {
 *     title: 'Updated Album Title',
 *     description: 'New description with more details'
 *   }
 * });
 *
 * @example
 * // Change album cover photo
 * const { mutate: updateAlbum } = useUpdateAlbum();
 *
 * updateAlbum({
 *   id: albumId,
 *   data: {
 *     cover_photo_id: selectedPhotoId
 *   }
 * });
 *
 * @example
 * // Update album with form data
 * const { mutate: updateAlbum, isPending } = useUpdateAlbum({
 *   onSuccess: () => {
 *     closeEditModal();
 *   }
 * });
 *
 * const handleSubmit = (formData) => {
 *   updateAlbum({
 *     id: album.id,
 *     data: formData
 *   });
 * };
 */
export function useUpdateAlbum(
  options?: Omit<
    UseMutationOptions<Album, ApiErrorResponse, { id: string; data: UpdateAlbumRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAlbumRequest }) =>
      photoService.updateAlbum(id, data),

    onSuccess: (album) => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.photos.all, 'albums'] });
      queryClient.invalidateQueries({ queryKey: [...queryKeys.photos.all, 'album', album.id] });
      toast.success('Album updated successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to update album');
    },

    ...options,
  });
}

/**
 * Hook to delete an album.
 *
 * @description Permanently removes an album from the system. Note that deleting an album
 * typically does not delete the photos within it - they remain accessible in the main
 * gallery. Automatically invalidates all album and photo queries to ensure the deleted
 * album is removed from all views. This action cannot be undone.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult<any, ApiErrorResponse, string>} Mutation result with mutate function
 *
 * @example
 * // Delete album with confirmation
 * const { mutate: deleteAlbum } = useDeleteAlbum();
 *
 * const handleDelete = (albumId) => {
 *   if (window.confirm('Are you sure you want to delete this album?')) {
 *     deleteAlbum(albumId);
 *   }
 * };
 *
 * @example
 * // Delete with navigation
 * const { mutate: deleteAlbum, isPending } = useDeleteAlbum({
 *   onSuccess: () => {
 *     navigate('/albums');
 *   }
 * });
 *
 * return (
 *   <Button
 *     onClick={() => deleteAlbum(album.id)}
 *     disabled={isPending}
 *     variant="danger"
 *   >
 *     Delete Album
 *   </Button>
 * );
 */
export function useDeleteAlbum(
  options?: Omit<UseMutationOptions<any, ApiErrorResponse, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (albumId: string) => photoService.deleteAlbum(albumId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.photos.all, 'albums'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.all });
      toast.success('Album deleted successfully');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to delete album');
    },

    ...options,
  });
}
