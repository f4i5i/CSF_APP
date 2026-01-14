/**
 * Events Page
 * Shows all upcoming events for parent's enrolled classes with RSVP functionality
 */

import React, { useMemo, useState, useEffect } from 'react';
import { Calendar, Filter, Search, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EventRsvpCard from '../components/EventRsvpCard';

// Hooks
import { useChildren, useApi } from '../hooks';
import { useAuth } from '../context/auth';

// Services
import { eventsService, enrollmentsService } from '../api/services';

// Predefined event types (same as admin panel)
const EVENT_TYPES = [
  { value: 'tournament', label: 'Tournament' },
  { value: 'practice', label: 'Practice' },
  { value: 'social', label: 'Social' },
  { value: 'showcase', label: 'Showcase' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'other', label: 'Other' },
];

const EventsPage = () => {
  const { user } = useAuth();
  const { selectedChild, children } = useChildren();

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('upcoming'); // upcoming, past, all

  // Get enrollments for selected child
  const { data: enrollmentsData, loading: loadingEnrollments } = useApi(
    () => enrollmentsService.getMy({
      child_id: selectedChild?.id,
      status: 'active',
    }),
    {
      initialData: [],
      dependencies: [selectedChild?.id],
      autoFetch: !!selectedChild?.id,
    }
  );

  // Get all class IDs from enrollments
  const classIds = useMemo(() => {
    if (!enrollmentsData) return [];
    return enrollmentsData
      .filter(e => e.child_id === selectedChild?.id)
      .map(e => e.class?.id || e.class_id)
      .filter(Boolean);
  }, [enrollmentsData, selectedChild?.id]);

  // Fetch events for all enrolled classes
  const [allEvents, setAllEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      if (classIds.length === 0) {
        setAllEvents([]);
        return;
      }

      setLoadingEvents(true);
      try {
        // Fetch events for each class and merge them
        const eventPromises = classIds.map(classId =>
          eventsService.getByClass(classId).catch(() => [])
        );
        const results = await Promise.all(eventPromises);

        // Flatten and dedupe events by ID
        // Handle both array and { items: [...] } response formats
        const eventMap = new Map();
        results.forEach(result => {
          // Extract events array from response
          const events = Array.isArray(result) ? result : (result?.items || result?.data || []);

          events.forEach(event => {
            // Get event ID - handle different field names
            const eventId = event.id || event.event_id;
            if (eventId && !eventMap.has(eventId)) {
              eventMap.set(eventId, event);
            }
          });
        });

        setAllEvents(Array.from(eventMap.values()));
      } catch (error) {
        console.error('Failed to fetch events:', error);
        setAllEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchEvents();
  }, [classIds]);

  // Normalize events to consistent format
  const normalizedEvents = useMemo(() => {
    return allEvents
      .filter(event => {
        // Filter out events without valid IDs
        const eventId = event?.id || event?.event_id;
        if (!eventId) {
          console.warn('Event missing ID, filtering out:', event);
          return false;
        }
        return true;
      })
      .map((event) => {
        if (event.start_datetime) return event;

        const { event_date, start_time, end_time } = event;
        const normalizeTime = (time) => {
          if (!time) return '00:00';
          const [h = '00', m = '00'] = time.split(':');
          const hour = Math.min(Math.max(parseInt(h, 10) || 0, 0), 23).toString().padStart(2, '0');
          const minute = Math.min(Math.max(parseInt(m, 10) || 0, 0), 59).toString().padStart(2, '0');
          return `${hour}:${minute}`;
        };

        const startIso = event_date
          ? `${event_date}T${normalizeTime(start_time)}:00`
          : new Date().toISOString();
        const endIso = event_date
          ? `${event_date}T${normalizeTime(end_time)}:00`
          : new Date().toISOString();

        return {
          ...event,
          start_datetime: startIso,
          end_datetime: endIso,
          type: event.event_type || event.type,
        };
      });
  }, [allEvents]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    const now = new Date();

    let filtered = normalizedEvents;

    // Filter by time (upcoming/past)
    if (filterStatus === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.start_datetime) >= now);
    } else if (filterStatus === 'past') {
      filtered = filtered.filter(event => new Date(event.start_datetime) < now);
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(event =>
        (event.event_type || event.type)?.toLowerCase() === filterType.toLowerCase()
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(term) ||
        event.description?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term)
      );
    }

    // Sort by date
    return filtered.sort((a, b) => {
      const dateA = new Date(a.start_datetime);
      const dateB = new Date(b.start_datetime);
      return filterStatus === 'past' ? dateB - dateA : dateA - dateB;
    });
  }, [normalizedEvents, filterStatus, filterType, searchTerm]);

  const isLoading = loadingEnrollments || loadingEvents;

  // Check if any filters are active
  const hasActiveFilters = searchTerm || filterType !== 'all' || filterStatus !== 'all';

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setFilterStatus('upcoming');
  };

  return (
    <div className="min-h-screen max-sm:h-fit bg-page-gradient max-sm:pb-20">
      <Header />

      <main className="px-6 py-8 max-sm:py-4 max-sm:px-3">
        {/* Page Header */}
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-[#F3BC48]" />
              <h1 className="text-2xl md:text-3xl font-kollektif font-normal text-[#173151]">
                Events
              </h1>
            </div>

            {/* Selected Child Indicator */}
            {selectedChild && (
              <div className="text-sm text-[#173151]/70 font-manrope">
                Showing events for {selectedChild.first_name}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-sm">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by title, description, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-manrope focus:outline-none focus:ring-2 focus:ring-[#F3BC48]/50"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400 max-sm:hidden" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-manrope focus:outline-none focus:ring-2 focus:ring-[#F3BC48]/50 cursor-pointer"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="all">All Events</option>
                </select>
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-manrope focus:outline-none focus:ring-2 focus:ring-[#F3BC48]/50 cursor-pointer"
              >
                <option value="all">All Types</option>
                {EVENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2.5 text-sm font-manrope text-[#173151]/70 hover:text-[#173151] hover:bg-white/50 rounded-full transition-colors flex items-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Events Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/30 rounded-2xl p-5 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                  <div className="h-16 bg-gray-200 rounded mt-4" />
                </div>
              ))}
            </div>
          ) : !selectedChild ? (
            <div className="text-center py-12 bg-white/30 rounded-2xl">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-manrope">
                Please select a child to view their events
              </p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-white/30 rounded-2xl">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-manrope">
                {hasActiveFilters
                  ? 'No events match your filters'
                  : 'No upcoming events scheduled'}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-[#F3BC48] hover:underline font-manrope text-sm"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map(event => (
                <EventRsvpCard
                  key={event.id}
                  event={event}
                  showFullDetails={true}
                />
              ))}
            </div>
          )}

          {/* Results Count */}
          {!isLoading && filteredEvents.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-500 font-manrope">
              Showing {filteredEvents.length} {filterStatus !== 'all' ? filterStatus : ''} event{filteredEvents.length !== 1 ? 's' : ''}
              {filterType !== 'all' && ` (${EVENT_TYPES.find(t => t.value === filterType)?.label || filterType})`}
              {searchTerm && ` matching "${searchTerm}"`}
            </div>
          )}
        </div>
      </main>

      <Footer mobileHidden={true} />
    </div>
  );
};

export default EventsPage;
