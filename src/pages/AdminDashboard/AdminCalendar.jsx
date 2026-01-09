/**
 * Admin Calendar Page
 * Calendar view for admin to see all events across classes
 * Uses the same calendar components as parent calendar
 */

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Header from "../../components/Header";
import CalenderMini from "../../components/Calendar/CalenderMini";
import FullCalender from "../../components/Calendar/FullCalender";
import NextEvent from "../../components/NextEvent";

// Services
import eventsService from "../../api/services/events.service";
import classesService from "../../api/services/classes.service";

const AdminCalendar = () => {
  // State for class filter
  const [selectedClassId, setSelectedClassId] = useState("");
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // State for events
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all classes for filter dropdown
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const response = await classesService.getAll({ limit: 100 });
        const classesList = Array.isArray(response)
          ? response
          : response.items || response.data || [];
        setClasses(classesList);
      } catch (err) {
        console.error("Failed to fetch classes:", err);
        setClasses([]);
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  // Fetch events based on selected class
  const fetchEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      setError(null);

      let eventsData;
      if (selectedClassId) {
        // Fetch events for specific class
        eventsData = await eventsService.getByClass(selectedClassId);
      } else {
        // Fetch all events (upcoming)
        eventsData = await eventsService.getUpcoming(50);
      }

      // Normalize events data
      const rawEvents = Array.isArray(eventsData)
        ? eventsData
        : eventsData?.items || [];

      const normalized = rawEvents.map((event) => {
        if (event.start_datetime) return event;

        const { event_date, start_time, end_time } = event;
        const normalizeTime = (time) => {
          if (!time) return "00:00";
          const [h = "00", m = "00"] = time.split(":");
          const hour = Math.min(Math.max(parseInt(h, 10) || 0, 0), 23)
            .toString()
            .padStart(2, "0");
          const minute = Math.min(Math.max(parseInt(m, 10) || 0, 0), 59)
            .toString()
            .padStart(2, "0");
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

      setEvents(normalized);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Failed to load calendar events");
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, [selectedClassId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Get next upcoming event
  const nextEvent = useMemo(() => {
    if (!events || events.length === 0) return null;
    const now = new Date();
    const upcoming = events
      .filter((event) => new Date(event.start_datetime) >= now)
      .sort(
        (a, b) => new Date(a.start_datetime) - new Date(b.start_datetime)
      );
    return upcoming[0] || null;
  }, [events]);

  const isLoading = loadingClasses || loadingEvents;

  return (
    <div className="h-full max-sm:pb-20 overflow-hidden">
      <Header />

      <div className="max-w-9xl mx-auto sm:px-6 px-3 pb-4">
        {/* Page Header */}
        <div className="mb-4 flex lg:flex-row flex-col lg:items-center items-start lg:gap-0 gap-4 justify-between">
          <div>
            <h1 className="lg:text-[36px] text-[20px] md:text-[28px] font-bold text-text-primary font-kollektif">
              Calendar
            </h1>
            <p className="text-neutral-main font-manrope text-sm">
              View and manage events across all classes
            </p>
          </div>

          {/* Class Filter */}
          <div className="relative">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={loadingClasses}
              className="py-2.5 px-4 bg-white border border-gray-200 rounded-lg text-sm font-medium font-manrope text-text-primary cursor-pointer appearance-none pr-10 min-w-[200px] focus:ring-2 focus:ring-btn-gold focus:border-btn-gold"
            >
              <option value="">All Classes</option>
              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-manrope">
            <p className="font-medium">Unable to load calendar events</p>
            <p className="text-sm mt-1">
              Please try refreshing the page or check back later.
            </p>
          </div>
        )}

        {/* Calendar Content */}
        <div className="bg-[#FFFFFF80] rounded-2xl p-4 lg:p-6 shadow">
          <div className="flex gap-4 lg:gap-6 w-full max-lg:flex-col">
            {/* LEFT SIDE - Mini Calendar & Next Event */}
            <div className="flex flex-col gap-4 lg:w-[280px] xl:w-[320px] w-full flex-shrink-0">
              <CalenderMini events={events} loading={isLoading} />
              <NextEvent event={nextEvent} loading={isLoading} />
            </div>

            {/* RIGHT SIDE - Full Calendar */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <FullCalender events={events} loading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCalendar;
