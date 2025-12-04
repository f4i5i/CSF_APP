/**
 * Photos Service
 * Handles photo gallery management and uploads
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../../constants/api.constants';

const photosService = {
  /**
   * Get all photos with optional filters
   * @param {Object} filters - Filter parameters
   * @param {string} [filters.album_id] - Filter by album ID
   * @param {string} [filters.event_id] - Filter by event ID
   * @param {string} [filters.class_id] - Filter by class ID
   * @param {string} [filters.child_id] - Filter by child ID (if tagged)
   * @param {string} [filters.date] - Filter by date (YYYY-MM-DD)
   * @param {number} [filters.limit] - Limit number of results
   * @param {number} [filters.offset] - Offset for pagination
   * @returns {Promise<Array>} List of photos
   */
  async getAll(filters = {}) {
    const { data } = await apiClient.get(API_ENDPOINTS.PHOTOS.LIST, {
      params: filters,
    });
    return data;
  },

  /**
   * Get photo by ID
   * @param {string} id - Photo ID
   * @returns {Promise<Object>} Photo details with metadata and tags
   */
  async getById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.PHOTOS.BY_ID(id));
    return data;
  },

  /**
   * Upload new photo (admin only)
   * @param {Object} photoData - Photo information
   * @param {File} photoData.file - Photo file
   * @param {string} [photoData.album_id] - Album ID
   * @param {string} [photoData.event_id] - Event ID
   * @param {string} [photoData.class_id] - Class ID
   * @param {string} [photoData.caption] - Photo caption
   * @param {Array<string>} [photoData.child_ids] - Array of child IDs to tag
   * @returns {Promise<Object>} Uploaded photo
   */
  async upload(photoData) {
    const formData = new FormData();

    formData.append('file', photoData.file);
    if (photoData.album_id) formData.append('album_id', photoData.album_id);
    if (photoData.event_id) formData.append('event_id', photoData.event_id);
    if (photoData.class_id) formData.append('class_id', photoData.class_id);
    if (photoData.caption) formData.append('caption', photoData.caption);
    if (photoData.child_ids) {
      formData.append('child_ids', JSON.stringify(photoData.child_ids));
    }

    const { data } = await apiClient.post(
      API_ENDPOINTS.PHOTOS.UPLOAD,
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
   * @param {Object} bulkData - Bulk upload data
   * @param {Array<File>} bulkData.files - Array of photo files
   * @param {string} [bulkData.album_id] - Album ID for all photos
   * @param {string} [bulkData.event_id] - Event ID for all photos
   * @param {string} [bulkData.class_id] - Class ID for all photos
   * @returns {Promise<Object>} Bulk upload result
   */
  async bulkUpload(bulkData) {
    const formData = new FormData();

    bulkData.files.forEach((file) => {
      formData.append('files', file);
    });
    if (bulkData.album_id) formData.append('album_id', bulkData.album_id);
    if (bulkData.event_id) formData.append('event_id', bulkData.event_id);
    if (bulkData.class_id) formData.append('class_id', bulkData.class_id);

    const { data } = await apiClient.post(
      API_ENDPOINTS.PHOTOS.BULK_UPLOAD,
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
   * @param {string} id - Photo ID
   * @param {Object} photoData - Updated photo data
   * @param {string} [photoData.caption] - Updated caption
   * @param {string} [photoData.album_id] - Updated album ID
   * @param {Array<string>} [photoData.child_ids] - Updated child tags
   * @returns {Promise<Object>} Updated photo
   */
  async update(id, photoData) {
    const { data } = await apiClient.put(
      API_ENDPOINTS.PHOTOS.BY_ID(id),
      photoData
    );
    return data;
  },

  /**
   * Delete photo (admin only)
   * @param {string} id - Photo ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    const { data } = await apiClient.delete(API_ENDPOINTS.PHOTOS.BY_ID(id));
    return data;
  },

  /**
   * Get all albums
   * @returns {Promise<Array>} List of photo albums
   */
  async getAlbums() {
    const { data } = await apiClient.get(API_ENDPOINTS.PHOTOS.ALBUMS);
    return data;
  },

  /**
   * Create new album (admin only)
   * @param {Object} albumData - Album information
   * @param {string} albumData.name - Album name
   * @param {string} [albumData.description] - Album description
   * @param {string} [albumData.event_id] - Associated event ID
   * @param {string} [albumData.class_id] - Associated class ID
   * @param {string} [albumData.cover_photo_id] - Cover photo ID
   * @returns {Promise<Object>} Created album
   */
  async createAlbum(albumData) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.PHOTOS.CREATE_ALBUM,
      albumData
    );
    return data;
  },

  /**
   * Get album by ID
   * @param {string} id - Album ID
   * @returns {Promise<Object>} Album with photos
   */
  async getAlbumById(id) {
    const { data } = await apiClient.get(API_ENDPOINTS.PHOTOS.ALBUM_BY_ID(id));
    return data;
  },

  /**
   * Update album (admin only)
   * @param {string} id - Album ID
   * @param {Object} albumData - Updated album data
   * @returns {Promise<Object>} Updated album
   */
  async updateAlbum(id, albumData) {
    const { data } = await apiClient.put(
      API_ENDPOINTS.PHOTOS.ALBUM_BY_ID(id),
      albumData
    );
    return data;
  },

  /**
   * Delete album (admin only)
   * @param {string} id - Album ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteAlbum(id) {
    const { data } = await apiClient.delete(API_ENDPOINTS.PHOTOS.ALBUM_BY_ID(id));
    return data;
  },

  /**
   * Tag child in photo (admin only)
   * @param {string} photoId - Photo ID
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Tag confirmation
   */
  async tagChild(photoId, childId) {
    const { data } = await apiClient.post(
      API_ENDPOINTS.PHOTOS.TAG_CHILD(photoId),
      { child_id: childId }
    );
    return data;
  },

  /**
   * Remove child tag from photo (admin only)
   * @param {string} photoId - Photo ID
   * @param {string} childId - Child ID
   * @returns {Promise<Object>} Removal confirmation
   */
  async untagChild(photoId, childId) {
    const { data } = await apiClient.delete(
      API_ENDPOINTS.PHOTOS.UNTAG_CHILD(photoId, childId)
    );
    return data;
  },

  /**
   * Get photos of a specific child
   * @param {string} childId - Child ID
   * @returns {Promise<Array>} Photos featuring the child
   */
  async getByChild(childId) {
    return this.getAll({ child_id: childId });
  },

  /**
   * Get photos for an event
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} Event photos
   */
  async getByEvent(eventId) {
    return this.getAll({ event_id: eventId });
  },

  /**
   * Get photos for a class
   * @param {string} classId - Class ID
   * @param {Object} params - Optional query parameters (limit, offset, etc.)
   * @returns {Promise<Array>} Class photos
   */
  async getByClass(classId, params = {}) {
    const { data } = await apiClient.get(
      API_ENDPOINTS.PHOTOS.BY_CLASS(classId),
      { params }
    );
    return data;
  },
};

export default photosService;
