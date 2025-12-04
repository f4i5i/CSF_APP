/**
 * Photo Type Definitions
 * TypeScript types for photo gallery management and uploads
 */

import type { Timestamped, PhotoId, AlbumId, UserId } from './common.types';
import type { EventId } from './event.types';
import type { ClassId } from './class.types';
import type { ChildId } from './child.types';

// Re-export for convenience
export type { AlbumId, PhotoId };

/**
 * Photo interface
 */
export interface Photo extends Timestamped {
  id: PhotoId;
  url: string;
  thumbnail_url?: string;
  caption?: string;
  album_id?: AlbumId;
  event_id?: EventId;
  class_id?: ClassId;
  uploaded_by: UserId;
  uploader_name?: string;
  file_size?: number; // bytes
  width?: number;
  height?: number;
  mime_type?: string;
  taken_at?: string; // ISO date
  tagged_children?: ChildId[];
  view_count?: number;
  like_count?: number;
}

/**
 * Photo album interface
 */
export interface Album extends Timestamped {
  id: AlbumId;
  name: string;
  description?: string;
  event_id?: EventId;
  class_id?: ClassId;
  cover_photo_id?: PhotoId;
  cover_photo_url?: string;
  photo_count: number;
  created_by: UserId;
  is_public: boolean;
}

/**
 * Request to upload photo
 */
export interface UploadPhotoRequest {
  file: File;
  album_id?: AlbumId;
  event_id?: EventId;
  class_id?: ClassId;
  caption?: string;
  child_ids?: ChildId[];
  taken_at?: string;
}

/**
 * Request to bulk upload photos
 */
export interface BulkUploadPhotosRequest {
  files: File[];
  album_id?: AlbumId;
  event_id?: EventId;
  class_id?: ClassId;
}

/**
 * Bulk upload response
 */
export interface BulkUploadResponse {
  success: boolean;
  uploaded_count: number;
  failed_count: number;
  photos: Photo[];
  errors?: Array<{
    filename: string;
    error: string;
  }>;
}

/**
 * Request to update photo
 */
export interface UpdatePhotoRequest {
  caption?: string;
  album_id?: AlbumId;
  child_ids?: ChildId[];
  taken_at?: string;
}

/**
 * Photo filters
 */
export interface PhotoFilters {
  album_id?: AlbumId;
  event_id?: EventId;
  class_id?: ClassId;
  child_id?: ChildId;
  date?: string; // YYYY-MM-DD
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

/**
 * Request to create album
 */
export interface CreateAlbumRequest {
  name: string;
  description?: string;
  event_id?: EventId;
  class_id?: ClassId;
  cover_photo_id?: PhotoId;
  is_public?: boolean;
}

/**
 * Request to update album
 */
export interface UpdateAlbumRequest {
  name?: string;
  description?: string;
  cover_photo_id?: PhotoId;
  is_public?: boolean;
}

/**
 * Album with photos
 */
export interface AlbumWithPhotos extends Album {
  photos: Photo[];
}

/**
 * Photo tag (child tag in photo)
 */
export interface PhotoTag {
  photo_id: PhotoId;
  child_id: ChildId;
  child_name?: string;
  tagged_at: string; // ISO date
  tagged_by?: UserId;
}

/**
 * Request to tag child in photo
 */
export interface TagChildRequest {
  child_id: ChildId;
}

/**
 * Photo with tags
 */
export interface PhotoWithTags extends Photo {
  tags: PhotoTag[];
}

/**
 * Photo gallery pagination response
 */
export interface PhotoGalleryResponse {
  photos: Photo[];
  total_count: number;
  has_more: boolean;
  next_offset?: number;
}
