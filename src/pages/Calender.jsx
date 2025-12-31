import React, { useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import NextEvent from "../components/NextEvent";
import CalenderMini from "../components/Calendar/CalenderMini";
import FullCalender from "../components/Calendar/FullCalender";

// Hooks
import { useChildren, useApi } from '../hooks';
import { useAuth } from '../context/auth';

// Services
import { eventsService, enrollmentsService, classesService } from '../api/services';

const Calender = () => {
  // Get user role from auth context
  const { user } = useAuth();
  const role = localStorage.getItem('role');
  const isCoach = role === 'coach';

  // ============================================================================
  // PARENT-SPECIFIC DATA FETCHING
  // ============================================================================
  // Get selected child from context (only for parent role)
  const { selectedChild } = useChildren();

  // Get first active enrollment for the selected child (parent only)
  const { data: enrollmentsData, loading: loadingEnrollments, error: enrollmentsError } = useApi(
    () => enrollmentsService.getMy({
      child_id: selectedChild?.id,
      status: 'active',
    }),
    {
      initialData: [],
      dependencies: [selectedChild?.id],
      autoFetch: !isCoach && !!selectedChild?.id,
      onError: (err) => console.error('Failed to load enrollments:', err),
    }
  );

  // Derive class ID from enrollment (parent only)
  const derivedClassId = useMemo(() => {
    if (isCoach) return null;
    if (!enrollmentsData || enrollmentsData.length === 0) return null;
    const enrollment = enrollmentsData.find(e => e.child_id === selectedChild?.id) || enrollmentsData[0];
    return enrollment?.class?.id || enrollment?.class_id || null;
  }, [enrollmentsData, selectedChild?.id, isCoach]);

  // ============================================================================
  // COACH-SPECIFIC DATA FETCHING
  // ============================================================================
  const [selectedClass, setSelectedClass] = useState(null);

  // Fetch coach's assigned classes
  const { data: classesData, loading: loadingClasses } = useApi(
    () => classesService.getAll({ coach_id: user?.id }),
    {
      initialData: { items: [] },
      dependencies: [user?.id],
      autoFetch: isCoach && !!user?.id,
    }
  );

  // Extract classes array
  const classes = useMemo(() => {
    if (!isCoach) return [];
    if (Array.isArray(classesData)) return classesData;
    return classesData?.items || [];
  }, [classesData, isCoach]);

  // Set first class as default when classes load
  useMemo(() => {
    if (isCoach && classes?.length > 0 && !selectedClass) {
      setSelectedClass(classes[0]);
    }
  }, [classes, selectedClass, isCoach]);

  // Get the class ID to use for fetching events
  const classIdForEvents = isCoach ? selectedClass?.id : derivedClassId;

  // ============================================================================
  // EVENTS DATA FETCHING (shared logic)
  // ============================================================================
  // Fetch events for the class
  const { data: classEvents, loading: loadingEvents, error: eventsError } = useApi(
    () => eventsService.getByClass(classIdForEvents),
    {
      initialData: [],
      dependencies: [classIdForEvents],
      autoFetch: !!classIdForEvents,
      onError: (err) => console.error('Failed to load class events:', err),
    }
  );

  // Fetch upcoming events as fallback
  const { data: fallbackEvents, loading: loadingFallback, error: fallbackError } = useApi(
    () => eventsService.getUpcoming(10),
    {
      initialData: [],
      autoFetch: !classIdForEvents,
      onError: (err) => console.error('Failed to load upcoming events:', err),
    }
  );

  // Combined loading state
  const isLoading = (isCoach ? loadingClasses : loadingEnrollments) || loadingEvents || loadingFallback;

  // Combined error state
  const hasError = enrollmentsError || eventsError || fallbackError;

  // Normalize events to consistent format
  const normalizeEvents = (events) => {
    const raw = Array.isArray(events) ? events : events?.items || [];
    return raw.map((event) => {
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
  };

  // Use class events or fallback
  const events = useMemo(() => {
    const normalized = normalizeEvents(classEvents);
    if (normalized.length > 0) return normalized;
    return normalizeEvents(fallbackEvents);
  }, [classEvents, fallbackEvents]);

  // Get next event
  const nextEvent = useMemo(() => {
    if (!events || events.length === 0) return null;
    const now = new Date();
    const upcoming = events
      .filter(event => new Date(event.start_datetime) >= now)
      .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));
    return upcoming[0] || null;
  }, [events]);

  return (
    <div className="min-h-screen max-sm:h-fit bg-page-gradient max-sm:pb-20">
      <Header />
      <main className="px-6 py-8 max-sm:py-2 max-sm:px-3">
        {/* Page Header with Class Selector for Coach */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-fluid-2xl text-[#173151] font-kollektif font-normal leading-[1.002] tracking-[-0.02em]">
            Calendar
          </h1>

          {/* Coach Class Selector */}
          {isCoach && classes.length > 0 && (
            <div className="relative">
              <select
                value={selectedClass?.id || ''}
                onChange={(e) => {
                  const classItem = classes.find(c => c.id === e.target.value);
                  setSelectedClass(classItem);
                }}
                className="py-2 px-4 bg-white/50 border border-[#e1e1e1] rounded-full text-base font-medium font-manrope text-[#1B1B1B] cursor-pointer appearance-none pr-10"
              >
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {hasError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-manrope">
            <p className="font-medium">Unable to load calendar events</p>
            <p className="text-sm mt-1">Please try refreshing the page or check back later.</p>
          </div>
        )}

        <div className="flex gap-4 w-full max-lg:flex-col">
          {/* LEFT SIDE */}
          <div className="flex flex-col max-sm:p-3 gap-3 max-sm:w-full">
            <CalenderMini events={events} loading={isLoading} />
            <NextEvent event={nextEvent} loading={isLoading} />
          </div>

          {/* RIGHT SIDE */}
          <div className="flex-1 max-sm:p-3 max-sm:mt-4">
            <FullCalender events={events} loading={isLoading} />
          </div>
        </div>
      </main>
      <Footer isFixed={false} />
    </div>
  );
};

export default Calender;
