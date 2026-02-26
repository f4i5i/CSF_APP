/**
 * Admin Calendar Page
 * Calendar view for admin to see all events and practice sessions across classes
 * Practices are auto-generated from class schedules (weekdays + times)
 * Supports cancelling/restoring individual practice dates
 */

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Header from "../../components/Header";
import CalenderMini from "../../components/Calendar/CalenderMini";
import FullCalender from "../../components/Calendar/FullCalender";
import NextEvent from "../../components/NextEvent";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import toast from "react-hot-toast";

// Services
import eventsService from "../../api/services/events.service";
import classesService from "../../api/services/classes.service";

const WEEKDAY_MAP = {
  monday: 1, tuesday: 2, wednesday: 3, thursday: 4,
  friday: 5, saturday: 6, sunday: 0,
};

/**
 * Generate practice dates from a class schedule.
 * Returns an array of {date, dayOfWeek, startTime, endTime}.
 */
function generatePracticeDates(classItem) {
  const { weekdays, start_time, end_time, start_date, end_date } = classItem;
  if (!weekdays || !start_date || !end_date) return [];

  const targetDays = weekdays
    .map((d) => WEEKDAY_MAP[d.toLowerCase()])
    .filter((d) => d !== undefined);
  if (targetDays.length === 0) return [];

  const dates = [];
  const current = new Date(start_date + "T00:00:00");
  const endDt = new Date(end_date + "T00:00:00");

  while (current <= endDt) {
    if (targetDays.includes(current.getDay())) {
      dates.push({
        date: current.toISOString().split("T")[0],
        startTime: start_time || "00:00",
        endTime: end_time || "01:00",
      });
    }
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

/**
 * Convert a practice date object into an event for the calendar.
 */
function practiceToEvent(practice, classItem, isCancelled = false) {
  const st = practice.startTime || "00:00";
  const et = practice.endTime || "01:00";
  const startIso = `${practice.date}T${st.length === 5 ? st + ":00" : st}`;
  const endIso = `${practice.date}T${et.length === 5 ? et + ":00" : et}`;

  return {
    title: isCancelled
      ? `[CANCELLED] ${classItem.name}`
      : `${classItem.name}`,
    start_datetime: startIso,
    end_datetime: endIso,
    type: "practice",
    _isPractice: true,
    _isCancelled: isCancelled,
    _classId: classItem.id,
    _className: classItem.name,
    _practiceDate: practice.date,
  };
}

const AdminCalendar = () => {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [error, setError] = useState(null);

  // Practice cancellations: Set of "classId::date" strings
  const [cancelledDates, setCancelledDates] = useState(new Set());
  const [loadingPractices, setLoadingPractices] = useState(false);

  // Cancel/restore dialog
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });

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

  // Fetch cancellations for selected class
  const fetchCancellations = useCallback(async (classId) => {
    if (!classId) {
      setCancelledDates(new Set());
      return;
    }
    try {
      setLoadingPractices(true);
      const res = await classesService.getPractices(classId);
      const cancelled = new Set();
      (res.practices || []).forEach((p) => {
        if (p.is_cancelled) cancelled.add(`${classId}::${p.date}`);
      });
      setCancelledDates(cancelled);
    } catch (err) {
      console.error("Failed to fetch practice cancellations:", err);
    } finally {
      setLoadingPractices(false);
    }
  }, []);

  // Fetch events based on selected class
  const fetchEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      setError(null);

      let eventsData;
      if (selectedClassId) {
        eventsData = await eventsService.getByClass(selectedClassId);
      } else {
        eventsData = await eventsService.getUpcoming(50);
      }

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

  // Fetch cancellations when class changes
  useEffect(() => {
    fetchCancellations(selectedClassId);
  }, [selectedClassId, fetchCancellations]);

  // Generate practice events from class schedules and merge with real events
  const allCalendarEvents = useMemo(() => {
    const practiceEvents = [];

    if (selectedClassId) {
      // Single class selected — show its practices
      const classItem = classes.find((c) => c.id === selectedClassId);
      if (classItem) {
        const practices = generatePracticeDates(classItem);
        practices.forEach((p) => {
          const key = `${classItem.id}::${p.date}`;
          const isCancelled = cancelledDates.has(key);
          practiceEvents.push(practiceToEvent(p, classItem, isCancelled));
        });
      }
    }
    // When "All Classes" is selected, don't generate practices (too many).
    // Only show real events.

    return [...events, ...practiceEvents];
  }, [events, classes, selectedClassId, cancelledDates]);

  // Handle clicking a practice event on the calendar
  const handleEventClick = useCallback(
    (calEvent) => {
      if (!calEvent._isPractice) return; // Only handle practice events

      const { _classId, _className, _practiceDate, _isCancelled } = calEvent;

      if (_isCancelled) {
        // Restore
        setConfirmDialog({
          isOpen: true,
          title: "Restore Practice",
          message: `Restore practice for "${_className}" on ${_practiceDate}?`,
          action: async () => {
            setConfirmDialog({ isOpen: false });
            try {
              await classesService.restorePractice(_classId, _practiceDate);
              toast.success(`Practice on ${_practiceDate} restored`);
              setCancelledDates((prev) => {
                const next = new Set(prev);
                next.delete(`${_classId}::${_practiceDate}`);
                return next;
              });
            } catch (err) {
              console.error("Failed to restore practice:", err);
              toast.error("Failed to restore practice");
            }
          },
        });
      } else {
        // Cancel
        setConfirmDialog({
          isOpen: true,
          title: "Cancel Practice",
          message: `Cancel practice for "${_className}" on ${_practiceDate}? This will mark it as cancelled on the calendar.`,
          action: async () => {
            setConfirmDialog({ isOpen: false });
            try {
              await classesService.cancelPractice(_classId, _practiceDate);
              toast.success(`Practice on ${_practiceDate} cancelled`);
              setCancelledDates((prev) => {
                const next = new Set(prev);
                next.add(`${_classId}::${_practiceDate}`);
                return next;
              });
            } catch (err) {
              console.error("Failed to cancel practice:", err);
              toast.error("Failed to cancel practice");
            }
          },
        });
      }
    },
    [],
  );

  // Get next upcoming event
  const nextEvent = useMemo(() => {
    if (!allCalendarEvents || allCalendarEvents.length === 0) return null;
    const now = new Date();
    const upcoming = allCalendarEvents
      .filter(
        (event) =>
          new Date(event.start_datetime) >= now && !event._isCancelled,
      )
      .sort(
        (a, b) => new Date(a.start_datetime) - new Date(b.start_datetime),
      );
    return upcoming[0] || null;
  }, [allCalendarEvents]);

  const isLoading = loadingClasses || loadingEvents || loadingPractices;

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
              View events and practice sessions across all classes
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

        {/* Info banner when a class is selected */}
        {selectedClassId && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 font-manrope text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Click a practice session to cancel or restore it.
          </div>
        )}

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
              <CalenderMini events={allCalendarEvents} loading={isLoading} />
              <NextEvent event={nextEvent} loading={isLoading} />
            </div>

            {/* RIGHT SIDE - Full Calendar */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <FullCalender
                events={allCalendarEvents}
                loading={isLoading}
                onEventClick={handleEventClick}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false })}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant="warning"
      />
    </div>
  );
};

export default AdminCalendar;
