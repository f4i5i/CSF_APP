/**
 * useAlbums Hook
 * React Query hooks for photo albums
 */

import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { photoService } from '../../services/photo.service';
import { queryKeys } from '../../constants/query-keys';
import type { Album, AlbumWithPhotos, CreateAlbumRequest, UpdateAlbumRequest } from '../../types/photo.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch all albums
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
 * Hook to fetch single album with photos
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
 * Hook to create album
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
 * Hook to update album
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
 * Hook to delete album
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
