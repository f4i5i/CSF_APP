/**
 * @file Photo Upload and Management Hooks
 * @description React Query mutation hooks for uploading, updating, and managing photos.
 * These hooks handle file uploads, bulk photo operations, photo metadata updates, and
 * child tagging functionality. All mutations include automatic cache invalidation to
 * ensure photo galleries and albums stay synchronized across the application.
 *
 * File upload handling:
 * - Single photo uploads with metadata
 * - Bulk upload operations for multiple photos
 * - Progress tracking and error handling
 * - Automatic album and gallery updates
 * - Child tagging for parent notifications
 *
 * @module hooks/photos/useUploadPhoto
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { photoService } from '../../services/photo.service';
import { queryKeys } from '../../constants/query-keys';
import type { Photo, UploadPhotoRequest, BulkUploadPhotosRequest, BulkUploadResponse, UpdatePhotoRequest } from '../../types/photo.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to upload a single photo.
 *
 * @description Uploads a photo file to the server along with metadata such as caption,
 * album assignment, and tags. After successful upload, automatically invalidates photo
 * queries to ensure the new photo appears in galleries and albums. If the photo is
 * assigned to an album, also invalidates album-specific queries.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult<Photo, ApiErrorResponse, UploadPhotoRequest>} Mutation result with mutate function
 *
 * @example
 * // Basic photo upload
 * const { mutate: uploadPhoto, isPending } = useUploadPhoto();
 *
 * const handleFileSelect = (file: File) => {
 *   uploadPhoto({
 *     file,
 *     caption: 'Soccer practice',
 *     album_id: 'album-123'
 *   });
 * };
 *
 * @example
 * // Upload with preview and progress
 * const { mutate: uploadPhoto, isPending } = useUploadPhoto({
 *   onSuccess: (photo) => {
 *     console.log('Photo uploaded:', photo);
 *   }
 * });
 *
 * return (
 *   <div>
 *     <input
 *       type="file"
 *       accept="image/*"
 *       onChange={(e) => {
 *         const file = e.target.files?.[0];
 *         if (file) {
 *           uploadPhoto({
 *             file,
 *             caption: captionText,
 *             album_id: selectedAlbumId
 *           });
 *         }
 *       }}
 *     />
 *     {isPending && <UploadProgress />}
 *   </div>
 * );
 *
 * @example
 * // Upload with tags and class assignment
 * const { mutate: uploadPhoto } = useUploadPhoto();
 *
 * uploadPhoto({
 *   file: selectedFile,
 *   caption: 'Team photo',
 *   album_id: 'album-123',
 *   class_id: 'class-456',
 *   tags: ['team', 'game', 'victory']
 * });
 */
export function useUploadPhoto(
  options?: Omit<
    UseMutationOptions<Photo, ApiErrorResponse, UploadPhotoRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoData: UploadPhotoRequest) => photoService.upload(photoData),

    onSuccess: (photo) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.all });
      if (photo.album_id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.photos.list({ album_id: photo.album_id }) });
      }
      toast.success('Photo uploaded successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to upload photo');
    },

    ...options,
  });
}

/**
 * Hook to upload multiple photos in bulk.
 *
 * @description Uploads multiple photo files at once with shared metadata. Optimized for
 * batch operations when uploading photos from events or activities. Returns statistics
 * about successful and failed uploads. Automatically invalidates all photo queries to
 * ensure new photos appear immediately in galleries.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult<BulkUploadResponse, ApiErrorResponse, BulkUploadPhotosRequest>} Mutation result with upload statistics
 *
 * @example
 * // Bulk upload event photos
 * const { mutate: bulkUpload, isPending } = useBulkUploadPhotos();
 *
 * const handleMultipleFiles = (files: File[]) => {
 *   bulkUpload({
 *     files,
 *     album_id: 'tournament-2024',
 *     class_id: 'class-123',
 *     shared_tags: ['tournament', 'soccer']
 *   });
 * };
 *
 * @example
 * // Bulk upload with progress tracking
 * const { mutate: bulkUpload, isPending } = useBulkUploadPhotos({
 *   onSuccess: (result) => {
 *     console.log(`Uploaded ${result.uploaded_count} of ${result.total_count} photos`);
 *     if (result.failed_count > 0) {
 *       console.log('Failed uploads:', result.failed_uploads);
 *     }
 *   }
 * });
 *
 * return (
 *   <div>
 *     <input
 *       type="file"
 *       multiple
 *       accept="image/*"
 *       onChange={(e) => {
 *         const files = Array.from(e.target.files || []);
 *         if (files.length > 0) {
 *           bulkUpload({
 *             files,
 *             album_id: selectedAlbumId
 *           });
 *         }
 *       }}
 *     />
 *     {isPending && (
 *       <div>Uploading photos... Please wait</div>
 *     )}
 *   </div>
 * );
 *
 * @example
 * // Bulk upload with individual captions
 * const { mutate: bulkUpload } = useBulkUploadPhotos();
 *
 * bulkUpload({
 *   files: selectedFiles,
 *   album_id: 'album-123',
 *   captions: [
 *     'First photo caption',
 *     'Second photo caption',
 *     'Third photo caption'
 *   ]
 * });
 */
export function useBulkUploadPhotos(
  options?: Omit<
    UseMutationOptions<BulkUploadResponse, ApiErrorResponse, BulkUploadPhotosRequest>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bulkData: BulkUploadPhotosRequest) => photoService.bulkUpload(bulkData),

    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.all });
      const message = `Successfully uploaded ${result.uploaded_count} photo(s)${
        result.failed_count > 0 ? `. ${result.failed_count} failed.` : ''
      }`;
      toast.success(message);
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to bulk upload photos');
    },

    ...options,
  });
}

/**
 * Hook to update photo metadata.
 *
 * @description Updates a photo's metadata including caption, tags, album assignment,
 * and other properties. Does not update the photo file itself - only its associated
 * data. Automatically invalidates photo queries to reflect the updated information.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult} Mutation result with mutate function and state
 *
 * @example
 * // Update photo caption
 * const { mutate: updatePhoto } = useUpdatePhoto();
 *
 * updatePhoto({
 *   id: 'photo-123',
 *   data: {
 *     caption: 'Updated caption with more details'
 *   }
 * });
 *
 * @example
 * // Move photo to different album
 * const { mutate: updatePhoto } = useUpdatePhoto();
 *
 * updatePhoto({
 *   id: photoId,
 *   data: {
 *     album_id: newAlbumId
 *   }
 * });
 *
 * @example
 * // Update photo tags
 * const { mutate: updatePhoto, isPending } = useUpdatePhoto({
 *   onSuccess: () => {
 *     closeEditModal();
 *   }
 * });
 *
 * updatePhoto({
 *   id: photo.id,
 *   data: {
 *     tags: ['updated', 'tags', 'list'],
 *     caption: editedCaption
 *   }
 * });
 */
export function useUpdatePhoto(
  options?: Omit<
    UseMutationOptions<Photo, ApiErrorResponse, { id: string; data: UpdatePhotoRequest }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePhotoRequest }) =>
      photoService.update(id, data),

    onSuccess: (photo) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.detail(photo.id) });
      toast.success('Photo updated successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to update photo');
    },

    ...options,
  });
}

/**
 * Hook to delete a photo.
 *
 * @description Permanently removes a photo from the system. This action deletes both
 * the file and all associated metadata. The photo will be removed from all albums and
 * galleries. This action cannot be undone. Automatically invalidates photo queries to
 * remove the photo from all views.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult<any, ApiErrorResponse, string>} Mutation result with mutate function
 *
 * @example
 * // Delete photo with confirmation
 * const { mutate: deletePhoto } = useDeletePhoto();
 *
 * const handleDelete = (photoId) => {
 *   if (window.confirm('Are you sure you want to delete this photo?')) {
 *     deletePhoto(photoId);
 *   }
 * };
 *
 * @example
 * // Delete with navigation
 * const { mutate: deletePhoto, isPending } = useDeletePhoto({
 *   onSuccess: () => {
 *     navigate('/photos');
 *   }
 * });
 *
 * return (
 *   <Button
 *     onClick={() => deletePhoto(photo.id)}
 *     disabled={isPending}
 *     variant="danger"
 *   >
 *     Delete Photo
 *   </Button>
 * );
 */
export function useDeletePhoto(
  options?: Omit<UseMutationOptions<any, ApiErrorResponse, string>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) => photoService.delete(photoId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.all });
      toast.success('Photo deleted successfully');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to delete photo');
    },

    ...options,
  });
}

/**
 * Hook to tag a child in a photo.
 *
 * @description Associates a child with a photo by tagging them. This helps parents find
 * photos of their children and can trigger notifications to parents when their child is
 * tagged in new photos. Automatically updates the photo detail to reflect the new tag.
 *
 * @param {Object} [options] - Additional mutation options for custom behavior
 *
 * @returns {UseMutationResult} Mutation result with mutate function and state
 *
 * @example
 * // Tag a child in a photo
 * const { mutate: tagChild } = useTagChild();
 *
 * tagChild({
 *   photoId: 'photo-123',
 *   childId: 'child-456'
 * });
 *
 * @example
 * // Tag child from photo viewer
 * const { mutate: tagChild, isPending } = useTagChild({
 *   onSuccess: () => {
 *     console.log('Child tagged - parent will be notified');
 *   }
 * });
 *
 * return (
 *   <div>
 *     <img src={photo.url} alt={photo.caption} />
 *     <ChildSelector
 *       onSelect={(childId) => tagChild({ photoId: photo.id, childId })}
 *       disabled={isPending}
 *     />
 *   </div>
 * );
 *
 * @example
 * // Batch tag multiple children
 * const { mutate: tagChild } = useTagChild();
 *
 * const tagMultipleChildren = (photoId: string, childIds: string[]) => {
 *   childIds.forEach(childId => {
 *     tagChild({ photoId, childId });
 *   });
 * };
 */
export function useTagChild(
  options?: Omit<
    UseMutationOptions<any, ApiErrorResponse, { photoId: string; childId: string }>,
    'mutationFn'
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ photoId, childId }: { photoId: string; childId: string }) =>
      photoService.tagChild(photoId, childId),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.photos.detail(variables.photoId) });
      toast.success('Child tagged successfully!');
    },

    onError: (error) => {
      toast.error(error.message || 'Failed to tag child');
    },

    ...options,
  });
}
