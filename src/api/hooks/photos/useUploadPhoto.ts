/**
 * useUploadPhoto Hook
 * React Query mutation hooks for uploading/managing photos
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { photoService } from '../../services/photo.service';
import { queryKeys } from '../../constants/query-keys';
import type { Photo, UploadPhotoRequest, BulkUploadPhotosRequest, BulkUploadResponse, UpdatePhotoRequest } from '../../types/photo.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to upload photo
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
 * Hook to bulk upload photos
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
 * Hook to update photo
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
 * Hook to delete photo
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
 * Hook to tag child in photo
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
