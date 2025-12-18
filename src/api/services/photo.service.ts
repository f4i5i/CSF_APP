/**
 * @fileoverview Photo Service Module
 *
 * Provides a comprehensive API client for managing photo gallery operations including:
 * - Photo retrieval and filtering (with pagination support)
 * - Single and bulk photo uploads with FormData handling
 * - Photo metadata management (captions, tags, associations)
 * - Album management (create, update, delete, retrieve)
 * - Child tagging in photos for identification
 * - Contextual photo retrieval (by child, event, or class)
 *
 * All write operations (upload, update, delete) require admin privileges.
 *
 * @module services/photo
 * @example
 * // Single photo upload
 * const photo = await photoService.upload({
 *   file: fileInput.files[0],
 *   caption: 'Summer Picnic 2024',
 *   album_id: 'album123',
 *   taken_at: '2024-06-15T14:30:00Z'
 * });
 *
 * @example
 * // Bulk photo upload
 * const result = await photoService.bulkUpload({
 *   files: Array.from(fileInput.files),
 *   event_id: 'event456',
 *   class_id: 'class789'
 * });
 *
 * @example
 * // Retrieve photos with filters
 * const photos = await photoService.getAll({
 *   album_id: 'album123',
 *   start_date: '2024-01-01',
 *   end_date: '2024-12-31',
 *   limit: 20,
 *   offset: 0
 * });
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
   * Retrieve all photos with optional filtering.
   *
   * Fetches a complete list of photos from the server. Supports multiple filter criteria
   * to narrow down results by album, event, class, child, or date range.
   *
   * @async
   * @function getAll
   * @param {PhotoFilters} [filters] - Optional filter criteria
   * @param {string} [filters.album_id] - Filter by album ID
   * @param {string} [filters.event_id] - Filter by event ID
   * @param {string} [filters.class_id] - Filter by class ID
   * @param {string} [filters.child_id] - Filter by tagged child ID
   * @param {string} [filters.date] - Filter by specific date (YYYY-MM-DD format)
   * @param {string} [filters.start_date] - Filter from start date (YYYY-MM-DD format)
   * @param {string} [filters.end_date] - Filter to end date (YYYY-MM-DD format)
   * @param {number} [filters.limit] - Limit number of results
   * @param {number} [filters.offset] - Pagination offset
   * @returns {Promise<Photo[]>} Array of photo objects
   * @throws {AxiosError} If the request fails
   *
   * @example
   * const allPhotos = await photoService.getAll();
   * const albumPhotos = await photoService.getAll({ album_id: 'album1' });
   * const recentPhotos = await photoService.getAll({
   *   start_date: '2024-01-01',
   *   end_date: '2024-12-31'
   * });
   */
  async getAll(filters?: PhotoFilters): Promise<Photo[]> {
    const { data } = await apiClient.get<Photo[]>(ENDPOINTS.PHOTOS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Retrieve paginated photo gallery response.
   *
   * Fetches photos with pagination metadata including total count and pagination tokens.
   * Useful for implementing infinite scroll or pagination UI components.
   *
   * @async
   * @function getPaginated
   * @param {PhotoFilters} [filters] - Optional filter criteria (same as getAll)
   * @returns {Promise<PhotoGalleryResponse>} Gallery response containing photos array, total count, and pagination info
   * @returns {Photo[]} response.photos - Array of photo objects
   * @returns {number} response.total_count - Total number of photos matching filters
   * @returns {boolean} response.has_more - Whether more photos are available
   * @returns {number} [response.next_offset] - Offset for next page if has_more is true
   * @throws {AxiosError} If the request fails
   *
   * @example
   * const { photos, total_count, has_more } = await photoService.getPaginated({
   *   album_id: 'album1',
   *   limit: 20,
   *   offset: 0
   * });
   */
  async getPaginated(filters?: PhotoFilters): Promise<PhotoGalleryResponse> {
    const { data } = await apiClient.get<PhotoGalleryResponse>(ENDPOINTS.PHOTOS.GALLERY, {
      params: filters,
    });
    return data;
  },

  /**
   * Retrieve a single photo by ID.
   *
   * Fetches detailed information about a specific photo including metadata, tags, and view count.
   *
   * @async
   * @function getById
   * @param {string} id - The unique photo ID
   * @returns {Promise<Photo>} Complete photo object with all metadata
   * @throws {AxiosError} If photo not found (404) or request fails
   *
   * @example
   * const photo = await photoService.getById('photo-uuid-123');
   * console.log(photo.url, photo.caption, photo.file_size);
   */
  async getById(id: PhotoId): Promise<Photo> {
    const { data } = await apiClient.get<Photo>(ENDPOINTS.PHOTOS.BY_ID(id));
    return data;
  },

  /**
   * Upload a single photo with metadata.
   *
   * Uploads a photo file to the server with optional metadata including caption, album association,
   * event/class context, and child tagging. Uses FormData for multipart file upload.
   *
   * Admin-only operation.
   *
   * @async
   * @function upload
   * @param {UploadPhotoRequest} photoData - Photo upload data
   * @param {File} photoData.file - The image file to upload (required)
   * @param {string} [photoData.album_id] - Associate photo with an album
   * @param {string} [photoData.event_id] - Associate photo with an event
   * @param {string} [photoData.class_id] - Associate photo with a class
   * @param {string} [photoData.caption] - Photo caption or description
   * @param {string[]} [photoData.child_ids] - Array of child IDs to tag in photo
   * @param {string} [photoData.taken_at] - Photo taken timestamp (ISO 8601 format)
   * @returns {Promise<Photo>} The uploaded photo object with assigned ID and URLs
   * @throws {AxiosError} If upload fails (413 for file too large, 422 for validation error, etc.)
   *
   * @description File Upload Handling:
   * - Creates FormData object and appends the File blob
   * - Optionally includes metadata as form fields (strings/JSON)
   * - Sets Content-Type header to multipart/form-data
   * - Returns complete Photo object with generated thumbnail_url and url
   *
   * @example
   * // Basic photo upload
   * const file = document.getElementById('photoInput').files[0];
   * const photo = await photoService.upload({
   *   file: file,
   *   caption: 'Class Trip to Museum'
   * });
   *
   * @example
   * // Upload with full metadata
   * const photo = await photoService.upload({
   *   file: file,
   *   album_id: 'summer-2024',
   *   event_id: 'field-day',
   *   class_id: 'grade-3-a',
   *   caption: 'Prize winners',
   *   child_ids: ['child1', 'child2', 'child3'],
   *   taken_at: new Date().toISOString()
   * });
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
   * Upload multiple photos in a single request.
   *
   * Performs bulk upload of multiple photo files with shared metadata context (album, event, class).
   * Individual photos cannot have separate captions in bulk uploads. Uses FormData for multipart handling.
   *
   * Admin-only operation. Partial failures are handled with per-file error reporting.
   *
   * @async
   * @function bulkUpload
   * @param {BulkUploadPhotosRequest} bulkData - Bulk upload configuration
   * @param {File[]} bulkData.files - Array of image files to upload (required, non-empty)
   * @param {string} [bulkData.album_id] - Associate all photos with an album
   * @param {string} [bulkData.event_id] - Associate all photos with an event
   * @param {string} [bulkData.class_id] - Associate all photos with a class
   * @returns {Promise<BulkUploadResponse>} Upload result with success count and per-file error information
   * @returns {boolean} response.success - Whether all files uploaded successfully
   * @returns {number} response.uploaded_count - Number of successfully uploaded photos
   * @returns {number} response.failed_count - Number of failed uploads
   * @returns {Photo[]} response.photos - Array of successfully uploaded photo objects
   * @returns {Array<{filename: string, error: string}>} [response.errors] - Errors for failed uploads
   * @throws {AxiosError} If request fails completely (network error, 413, etc.)
   *
   * @description Bulk File Upload Handling:
   * - Iterates through files array and appends each to FormData with key 'files'
   * - Shared metadata (album_id, event_id, class_id) appended once
   * - Server returns individual file results with error details
   * - Partial success is treated as successful response (check uploaded_count vs failed_count)
   *
   * @example
   * // Bulk upload multiple photos
   * const fileInput = document.getElementById('photoInput');
   * const files = Array.from(fileInput.files);
   *
   * const result = await photoService.bulkUpload({
   *   files: files,
   *   album_id: 'school-event-2024',
   *   event_id: 'sports-day'
   * });
   *
   * if (result.failed_count > 0) {
   *   result.errors?.forEach(err => {
   *     console.warn(`${err.filename}: ${err.error}`);
   *   });
   * }
   *
   * console.log(`Uploaded ${result.uploaded_count} photos`);
   *
   * @example
   * // Handle partial failures
   * const result = await photoService.bulkUpload({
   *   files: largeFileArray
   * });
   *
   * if (!result.success) {
   *   console.log(`${result.uploaded_count}/${result.uploaded_count + result.failed_count} uploaded`);
   *   // Retry failed files individually with upload() method
   * }
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
   * Update photo metadata and associations.
   *
   * Modifies an existing photo's caption, album, child tags, or taken date.
   * Does not allow changing the actual image file (use delete + upload instead).
   *
   * Admin-only operation.
   *
   * @async
   * @function update
   * @param {string} id - The photo ID to update
   * @param {UpdatePhotoRequest} photoData - Photo data to update (partial)
   * @param {string} [photoData.caption] - New photo caption
   * @param {string} [photoData.album_id] - Move photo to different album
   * @param {string[]} [photoData.child_ids] - Update child tags (replaces existing tags)
   * @param {string} [photoData.taken_at] - Update photo taken timestamp
   * @returns {Promise<Photo>} Updated photo object
   * @throws {AxiosError} If photo not found or update fails
   *
   * @example
   * const updated = await photoService.update('photo-123', {
   *   caption: 'Updated caption text',
   *   child_ids: ['child1', 'child2']
   * });
   */
  async update(id: PhotoId, photoData: UpdatePhotoRequest): Promise<Photo> {
    const { data } = await apiClient.put<Photo>(
      ENDPOINTS.PHOTOS.BY_ID(id),
      photoData
    );
    return data;
  },

  /**
   * Delete a photo permanently.
   *
   * Removes the photo and its associated file from the server. This action is irreversible.
   *
   * Admin-only operation.
   *
   * @async
   * @function delete
   * @param {string} id - The photo ID to delete
   * @returns {Promise<{message: string}>} Confirmation message
   * @throws {AxiosError} If photo not found or deletion fails
   *
   * @example
   * const result = await photoService.delete('photo-123');
   * console.log(result.message); // 'Photo deleted successfully'
   */
  async delete(id: PhotoId): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(ENDPOINTS.PHOTOS.BY_ID(id));
    return data;
  },

  /**
   * Retrieve all photo albums.
   *
   * Fetches a list of all available photo albums with basic metadata.
   * To get photos within an album, use getAlbumById().
   *
   * @async
   * @function getAlbums
   * @returns {Promise<Album[]>} Array of album objects
   * @throws {AxiosError} If request fails
   *
   * @example
   * const albums = await photoService.getAlbums();
   * albums.forEach(album => {
   *   console.log(`${album.name} (${album.photo_count} photos)`);
   * });
   */
  async getAlbums(): Promise<Album[]> {
    const { data } = await apiClient.get<Album[]>(ENDPOINTS.PHOTOS.ALBUMS);
    return data;
  },

  /**
   * Create a new photo album.
   *
   * Creates an empty album that can be used to organize and group photos.
   * Albums can be associated with events or classes.
   *
   * Admin-only operation.
   *
   * @async
   * @function createAlbum
   * @param {CreateAlbumRequest} albumData - Album creation data
   * @param {string} albumData.name - Album name (required)
   * @param {string} [albumData.description] - Album description
   * @param {string} [albumData.event_id] - Associated event ID
   * @param {string} [albumData.class_id] - Associated class ID
   * @param {string} [albumData.cover_photo_id] - Photo ID to use as cover
   * @param {boolean} [albumData.is_public=true] - Whether album is publicly visible
   * @returns {Promise<Album>} Created album object with ID
   * @throws {AxiosError} If album creation fails
   *
   * @example
   * const album = await photoService.createAlbum({
   *   name: 'Summer Camp 2024',
   *   description: 'Photos from summer camp activities',
   *   event_id: 'event-summer-camp',
   *   is_public: true
   * });
   */
  async createAlbum(albumData: CreateAlbumRequest): Promise<Album> {
    const { data } = await apiClient.post<Album>(
      ENDPOINTS.PHOTOS.CREATE_ALBUM,
      albumData
    );
    return data;
  },

  /**
   * Retrieve a specific album with all its photos.
   *
   * Fetches an album and all photos contained within it, including photo metadata.
   *
   * @async
   * @function getAlbumById
   * @param {string} id - The album ID
   * @returns {Promise<AlbumWithPhotos>} Album object with embedded photos array
   * @returns {Photo[]} result.photos - Array of photos in the album
   * @throws {AxiosError} If album not found (404) or request fails
   *
   * @example
   * const albumWithPhotos = await photoService.getAlbumById('album-123');
   * console.log(`Album: ${albumWithPhotos.name}`);
   * console.log(`Contains ${albumWithPhotos.photos.length} photos`);
   *
   * albumWithPhotos.photos.forEach(photo => {
   *   console.log(photo.caption, photo.thumbnail_url);
   * });
   */
  async getAlbumById(id: AlbumId): Promise<AlbumWithPhotos> {
    const { data } = await apiClient.get<AlbumWithPhotos>(ENDPOINTS.PHOTOS.ALBUM_BY_ID(id));
    return data;
  },

  /**
   * Update album information.
   *
   * Modifies album metadata such as name, description, cover photo, or visibility.
   *
   * Admin-only operation.
   *
   * @async
   * @function updateAlbum
   * @param {string} id - The album ID to update
   * @param {UpdateAlbumRequest} albumData - Album data to update (partial)
   * @param {string} [albumData.name] - New album name
   * @param {string} [albumData.description] - New album description
   * @param {string} [albumData.cover_photo_id] - New cover photo ID
   * @param {boolean} [albumData.is_public] - Update visibility
   * @returns {Promise<Album>} Updated album object
   * @throws {AxiosError} If album not found or update fails
   *
   * @example
   * const updated = await photoService.updateAlbum('album-123', {
   *   name: 'Updated Album Name',
   *   cover_photo_id: 'photo-456'
   * });
   */
  async updateAlbum(id: AlbumId, albumData: UpdateAlbumRequest): Promise<Album> {
    const { data } = await apiClient.put<Album>(
      ENDPOINTS.PHOTOS.ALBUM_BY_ID(id),
      albumData
    );
    return data;
  },

  /**
   * Delete an album permanently.
   *
   * Removes the album from the system. Photos within the album may or may not be deleted
   * depending on server policy (typically photos are retained, only album association is removed).
   *
   * Admin-only operation.
   *
   * @async
   * @function deleteAlbum
   * @param {string} id - The album ID to delete
   * @returns {Promise<{message: string}>} Confirmation message
   * @throws {AxiosError} If album not found or deletion fails
   *
   * @example
   * const result = await photoService.deleteAlbum('album-123');
   * console.log(result.message);
   */
  async deleteAlbum(id: AlbumId): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(ENDPOINTS.PHOTOS.ALBUM_BY_ID(id));
    return data;
  },

  /**
   * Tag a child in a photo.
   *
   * Associates a child with a photo for identification purposes. A child can be tagged
   * in multiple photos, and photos can have multiple children tagged.
   *
   * Admin-only operation.
   *
   * @async
   * @function tagChild
   * @param {string} photoId - The photo ID
   * @param {string} childId - The child ID to tag
   * @returns {Promise<{message: string}>} Confirmation message
   * @throws {AxiosError} If photo/child not found or tag operation fails
   *
   * @example
   * const result = await photoService.tagChild('photo-123', 'child-456');
   * console.log(result.message); // 'Child tagged successfully'
   */
  async tagChild(photoId: PhotoId, childId: string): Promise<{ message: string }> {
    const { data } = await apiClient.post<{ message: string }>(
      ENDPOINTS.PHOTOS.TAG_CHILD(photoId),
      { child_id: childId }
    );
    return data;
  },

  /**
   * Remove a child tag from a photo.
   *
   * Unassociates a previously tagged child from a photo.
   *
   * Admin-only operation.
   *
   * @async
   * @function untagChild
   * @param {string} photoId - The photo ID
   * @param {string} childId - The child ID to untag
   * @returns {Promise<{message: string}>} Confirmation message
   * @throws {AxiosError} If photo/child not found or untag operation fails
   *
   * @example
   * const result = await photoService.untagChild('photo-123', 'child-456');
   * console.log(result.message); // 'Child untagged successfully'
   */
  async untagChild(photoId: PhotoId, childId: string): Promise<{ message: string }> {
    const { data } = await apiClient.delete<{ message: string }>(
      ENDPOINTS.PHOTOS.UNTAG_CHILD(photoId, childId)
    );
    return data;
  },

  /**
   * Retrieve all photos tagged with a specific child.
   *
   * Convenience method that filters all photos by a child ID.
   * Equivalent to calling getAll({ child_id: childId }).
   *
   * @async
   * @function getByChild
   * @param {string} childId - The child ID to filter by
   * @returns {Promise<Photo[]>} Array of photos containing the tagged child
   * @throws {AxiosError} If request fails
   *
   * @example
   * const childPhotos = await photoService.getByChild('child-123');
   * console.log(`Found ${childPhotos.length} photos of this child`);
   */
  async getByChild(childId: string): Promise<Photo[]> {
    return this.getAll({ child_id: childId });
  },

  /**
   * Retrieve all photos associated with a specific event.
   *
   * Convenience method that filters photos by event ID.
   * Equivalent to calling getAll({ event_id: eventId }).
   *
   * @async
   * @function getByEvent
   * @param {string} eventId - The event ID to filter by
   * @returns {Promise<Photo[]>} Array of photos from the event
   * @throws {AxiosError} If request fails
   *
   * @example
   * const eventPhotos = await photoService.getByEvent('event-field-day-2024');
   * console.log(`${eventPhotos.length} photos from this event`);
   */
  async getByEvent(eventId: string): Promise<Photo[]> {
    return this.getAll({ event_id: eventId });
  },

  /**
   * Retrieve all photos associated with a specific class.
   *
   * Fetches photos that are tagged with a class ID. Supports additional query parameters
   * for further filtering.
   *
   * @async
   * @function getByClass
   * @param {string} classId - The class ID to filter by
   * @param {Record<string, any>} [params] - Additional query parameters for filtering
   * @returns {Promise<Photo[]>} Array of photos from the class
   * @throws {AxiosError} If request fails
   *
   * @example
   * const classPhotos = await photoService.getByClass('grade-3-a');
   *
   * @example
   * // With additional filters
   * const recentClassPhotos = await photoService.getByClass('grade-3-a', {
   *   start_date: '2024-01-01',
   *   end_date: '2024-12-31',
   *   limit: 50
   * });
   */
  async getByClass(classId: string, params?: Record<string, any>): Promise<Photo[]> {
    const { data } = await apiClient.get<Photo[]>(
      ENDPOINTS.PHOTOS.BY_CLASS(classId),
      { params }
    );
    return data;
  },
};
