/**
 * Announcement Type Definitions
 * TypeScript types for announcements and notifications management
 */

import type { Timestamped, AnnouncementId, UserId } from './common.types';
import type { ProgramId, ClassId } from './class.types';

// Re-export for convenience
export type { AnnouncementId };

/**
 * Announcement type enum
 */
export enum AnnouncementType {
  GENERAL = 'general',
  URGENT = 'urgent',
  EVENT = 'event',
  CLASS = 'class',
  MAINTENANCE = 'maintenance',
  CELEBRATION = 'celebration',
}

/**
 * Announcement priority enum
 */
export enum AnnouncementPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

/**
 * Announcement interface
 */
export interface Announcement extends Timestamped {
  id: AnnouncementId;
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  program_id?: ProgramId;
  class_id?: ClassId;
  author_id: UserId;
  author_name?: string;
  send_email: boolean;
  send_push: boolean;
  expires_at?: string; // ISO date
  is_pinned: boolean;
  is_published: boolean;
  published_at?: string;
  attachment_urls?: string[];
  view_count?: number;
}

/**
 * Request to create announcement
 */
export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  program_id?: ProgramId;
  class_id?: ClassId;
  send_email?: boolean;
  send_push?: boolean;
  expires_at?: string;
  is_published?: boolean;
  attachment_urls?: string[];
}

/**
 * Request to update announcement
 */
export interface UpdateAnnouncementRequest {
  title?: string;
  content?: string;
  type?: AnnouncementType;
  priority?: AnnouncementPriority;
  program_id?: ProgramId;
  class_id?: ClassId;
  expires_at?: string;
  is_published?: boolean;
  attachment_urls?: string[];
}

/**
 * Announcement filters
 */
export interface AnnouncementFilters {
  priority?: AnnouncementPriority;
  type?: AnnouncementType;
  program_id?: ProgramId;
  class_id?: ClassId;
  unread?: boolean;
  is_pinned?: boolean;
  is_published?: boolean;
  limit?: number;
}

/**
 * Announcement read status
 */
export interface AnnouncementReadStatus {
  announcement_id: AnnouncementId;
  user_id: UserId;
  read_at: string; // ISO date
  is_read: boolean;
}

/**
 * Unread count response
 */
export interface UnreadCountResponse {
  unread_count: number;
  by_priority?: {
    high: number;
    medium: number;
    low: number;
  };
  by_type?: {
    urgent: number;
    general: number;
    event: number;
    class: number;
  };
}

/**
 * Announcement with read status
 */
export interface AnnouncementWithStatus extends Announcement {
  is_read: boolean;
  read_at?: string;
}
