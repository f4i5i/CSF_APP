/**
 * usePhotos Hook
 * React Query hooks to fetch photos
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { photoService } from '../../services/photo.service';
import { queryKeys } from '../../constants/query-keys';
import type { Photo, PhotoFilters, PhotoGalleryResponse } from '../../types/photo.types';
import type { ApiErrorResponse } from '../../types/common.types';

/**
 * Hook to fetch photos
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
 * Hook to fetch photos with pagination
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
 * Hook to fetch single photo
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
 * Hook to fetch photos by class
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
