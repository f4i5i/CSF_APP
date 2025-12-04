/**
 * Photo Service
 * Handles photo gallery management and uploads
 */

import { apiClient } from '../client/axios-client';
import { ENDPOINTS } from '../config/endpoints';
import type {
  Photo,
  PhotoId,
  Album,
  AlbumId,
  UploadPhotoRequest,
  BulkUploadPhotosRequest,
  BulkUploadResponse,
  UpdatePhotoRequest,
  PhotoFilters,
  CreateAlbumRequest,
  UpdateAlbumRequest,
  AlbumWithPhotos,
  PhotoGalleryResponse,
} from '../types/photo.types';

export const photoService = {
  /**
   * Get all photos with optional filters
   */
  async getAll(filters?: PhotoFilters): Promise<Photo[]> {
    const { data } = await apiClient.get<Photo[]>(ENDPOINTS.PHOTOS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get photos with pagination
   */
  async getPaginated(filters?: PhotoFilters): Promise<PhotoGalleryResponse> {
    const { data } = await apiClient.get<PhotoGalleryResponse>(ENDPOINTS.PHOTOS.GALLERY, {
      params: filters,
    });
    return data;
  },

  /**
   * Get photo by ID
   */
  async getById(id: PhotoId): Promise<Photo> {
    const { data } = await apiClient.get<Photo>(ENDPOINTS.PHOTOS.BY_ID(id));
    return data;
  },

  /**
   * Upload new photo (admin only)
   */
  async upload(photoData: UploadPhotoRequest): Promise<Photo> {
    const formData = new FormData();

    formData.append('file', photoData.file);
    if (photoData.album_id) formData.append('album_id', photoData.album_id);
    if (photoData.event_id) formData.append('event_id', photoData.event_id);
    if (photoData.class_id) formData.append('class_id', photoData.class_id);
    if (photoData.caption) formData.append('caption', photoData.caption);
    if (photoData.child_ids) {
      formData.append('child_ids', JSON.stringify(photoData.child_ids));
    }
    if (photoData.taken_at) formData.append('taken_at', photoData.taken_at);

    const { data } = await apiClient.post<Photo>(
      ENDPOINTS.PHOTOS.UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /**
   * Bulk upload photos (admin only)
   */
  async bulkUpload(bulkData: BulkUploadPhotosRequest): Promise<BulkUploadResponse> {
    const formData = new FormData();

    bulkData.files.forEach((file) => {
      formData.append('files', file);
    });
    if (bulkData.album_id) formData.append('album_id', bulkData.album_id);
    if (bulkData.event_id) formData.append('event_id', bulkData.event_id);
    if (bulkData.class_id) formData.append('class_id', bulkData.class_id);

    const { data } = await apiClient.post<BulkUploadResponse>(
      ENDPOINTS.PHOTOS.BULK_UPLOAD,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  /**
   * Update photo information (admin only)
   */
  async update(id: PhotoId, photoData: UpdatePhotoRequest): Promise<Photo> {
    const { data } = await apiClient.put<Photo>(
      ENDPOINTS.PHOTOS.BY_ID(id),
      photoData
    );
    return data;
  },

  /**
   * Delete photo (admin only)
   */
  async delete(id: PhotoId): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(ENDPOINTS.PHOTOS.BY_ID(id));
    return data;
  },

  /**
   * Get all albums
   */
  async getAlbums(): Promise<Album[]> {
    const { data } = await apiClient.get<Album[]>(ENDPOINTS.PHOTOS.ALBUMS);
    return data;
  },

  /**
   * Create new album (admin only)
   */
  async createAlbum(albumData: CreateAlbumRequest): Promise<Album> {
    const { data } = await apiClient.post<Album>(
      ENDPOINTS.PHOTOS.CREATE_ALBUM,
      albumData
    );
    return data;
  },

  /**
   * Get album by ID
   */
  async getAlbumById(id: AlbumId): Promise<AlbumWithPhotos> {
    const { data } = await apiClient.get<AlbumWithPhotos>(ENDPOINTS.PHOTOS.ALBUM_BY_ID(id));
    return data;
  },

  /**
   * Update album (admin only)
   */
  async updateAlbum(id: AlbumId, albumData: UpdateAlbumRequest): Promise<Album> {
    const { data } = await apiClient.put<Album>(
      ENDPOINTS.PHOTOS.ALBUM_BY_ID(id),
      albumData
    );
    return data;
  },

  /**
   * Delete album (admin only)
   */
  async deleteAlbum(id: AlbumId): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(ENDPOINTS.PHOTOS.ALBUM_BY_ID(id));
    return data;
  },

  /**
   * Tag child in photo (admin only)
   */
  async tagChild(photoId: PhotoId, childId: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      ENDPOINTS.PHOTOS.TAG_CHILD(photoId),
      { child_id: childId }
    );
    return data;
  },

  /**
   * Remove child tag from photo (admin only)
   */
  async untagChild(photoId: PhotoId, childId: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(
      ENDPOINTS.PHOTOS.UNTAG_CHILD(photoId, childId)
    );
    return data;
  },

  /**
   * Get photos of a specific child
   */
  async getByChild(childId: string): Promise<Photo[]> {
    return this.getAll({ child_id: childId });
  },

  /**
   * Get photos for an event
   */
  async getByEvent(eventId: string): Promise<Photo[]> {
    return this.getAll({ event_id: eventId });
  },

  /**
   * Get photos for a class
   */
  async getByClass(classId: string, params?: Record<string, any>): Promise<Photo[]> {
    const { data } = await apiClient.get<Photo[]>(
      ENDPOINTS.PHOTOS.BY_CLASS(classId),
      { params }
    );
    return data;
  },
};
