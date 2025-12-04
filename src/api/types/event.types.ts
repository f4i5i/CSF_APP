/**
 * Event Type Definitions
 * TypeScript types for event management and RSVP operations
 */

import type { Timestamped, UUID, EventId, UserId } from './common.types';
import type { ProgramId, ClassId } from './class.types';
import type { ChildId } from './child.types';

// Re-export for convenience
export type { EventId };

/**
 * Type aliases for event identifiers
 */
export type RsvpId = UUID;

/**
 * Event type enum
 */
export enum EventType {
  TOURNAMENT = 'tournament',
  PRACTICE = 'practice',
  SOCIAL = 'social',
  WORKSHOP = 'workshop',
  SHOWCASE = 'showcase',
  FUNDRAISER = 'fundraiser',
  MEETING = 'meeting',
  OTHER = 'other',
}

/**
 * RSVP status enum
 */
export enum RsvpStatus {
  ATTENDING = 'attending',
  NOT_ATTENDING = 'not_attending',
  MAYBE = 'maybe',
}

/**
 * Event interface
 */
export interface Event extends Timestamped {
  id: EventId;
  title: string;
  description: string;
  type: EventType;
  start_datetime: string; // ISO datetime
  end_datetime: string; // ISO datetime
  location: string;
  program_id?: ProgramId;
  class_id?: ClassId;
  max_attendees?: number;
  current_attendees_count: number;
  requires_rsvp: boolean;
  is_published: boolean;
  image_url?: string;
  created_by: UserId;
  organizer_name?: string;
  registration_deadline?: string; // ISO datetime
  is_cancelled: boolean;
}

/**
 * Request to create event
 */
export interface CreateEventRequest {
  title: string;
  description: string;
  type: EventType;
  start_datetime: string;
  end_datetime: string;
  location: string;
  program_id?: ProgramId;
  class_id?: ClassId;
  max_attendees?: number;
  requires_rsvp?: boolean;
  is_published?: boolean;
  image_url?: string;
  registration_deadline?: string;
}

/**
 * Request to update event
 */
export interface UpdateEventRequest {
  title?: string;
  description?: string;
  type?: EventType;
  start_datetime?: string;
  end_datetime?: string;
  location?: string;
  program_id?: ProgramId;
  class_id?: ClassId;
  max_attendees?: number;
  requires_rsvp?: boolean;
  is_published?: boolean;
  image_url?: string;
  registration_deadline?: string;
  is_cancelled?: boolean;
}

/**
 * Event filters
 */
export interface EventFilters {
  type?: EventType;
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  program_id?: ProgramId;
  class_id?: ClassId;
  upcoming?: boolean;
  is_published?: boolean;
  limit?: number;
}

/**
 * RSVP record
 */
export interface Rsvp extends Timestamped {
  id: RsvpId;
  event_id: EventId;
  user_id: UserId;
  status: RsvpStatus;
  child_ids?: ChildId[];
  notes?: string;
  attendee_name?: string;
  attendee_email?: string;
  number_of_guests?: number;
}

/**
 * Request to create RSVP
 */
export interface CreateRsvpRequest {
  status: RsvpStatus;
  child_ids?: ChildId[];
  notes?: string;
  number_of_guests?: number;
}

/**
 * Request to update RSVP
 */
export interface UpdateRsvpRequest {
  status?: RsvpStatus;
  child_ids?: ChildId[];
  notes?: string;
  number_of_guests?: number;
}

/**
 * Event with RSVP status
 */
export interface EventWithRsvp extends Event {
  user_rsvp?: Rsvp;
  is_full: boolean;
  spots_remaining?: number;
}

/**
 * Event attendee summary
 */
export interface EventAttendeeSummary {
  event_id: EventId;
  total_rsvps: number;
  attending_count: number;
  not_attending_count: number;
  maybe_count: number;
  total_guests: number;
  attendees: Rsvp[];
}

/**
 * Calendar event (simplified for calendar view)
 */
export interface CalendarEvent {
  id: EventId;
  title: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  type: EventType;
  location: string;
  color?: string;
  is_cancelled: boolean;
}
