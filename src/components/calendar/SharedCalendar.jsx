/**
 * SharedCalendar
 *
 * A single reusable calendar widget used on all three dashboards (admin, coach,
 * parent). It fetches the unified, role-scoped /calendar feed for the visible
 * range and renders month / week / day views with view switching and prev/next
 * navigation. Items are color-coded by type (session vs event vs cancellation),
 * and clicking an item opens a details modal.
 *
 * Role scoping is handled entirely by the backend based on the auth token, so
 * the same component works for every role with no props required.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import calendarService from "../../api/services/calendar.service";

const localizer = momentLocalizer(moment);

const TYPE_STYLES = {
  session: { bg: "#173963", border: "#173963", color: "#ffffff", label: "Session" },
  event: { bg: "#F3BC48", border: "#F3BC48", color: "#1a1a1a", label: "Event" },
  cancellation: { bg: "#FCA5A5", border: "#EF4444", color: "#7F1D1D", label: "Cancelled" },
};

// Build a "wide" date range that fully covers the visible grid for a given
// view/date. Month view shows leading/trailing days from adjacent months, so we
// pad to whole weeks; week/day map directly.
function rangeForView(date, view) {
  const m = moment(date);
  if (view === "day") {
    return { start: m.clone().startOf("day"), end: m.clone().endOf("day") };
  }
  if (view === "week") {
    return { start: m.clone().startOf("week"), end: m.clone().endOf("week") };
  }
  // month (default) — pad to whole weeks
  return {
    start: m.clone().startOf("month").startOf("week"),
    end: m.clone().endOf("month").endOf("week"),
  };
}

// Combine an ISO date string ("2026-09-07") with an optional "HH:MM" time into a
// JS Date. Falls back to midnight / +1h when times are missing.
function toDateTime(isoDate, hhmm, fallbackHour) {
  const base = moment(isoDate, "YYYY-MM-DD");
  if (hhmm && /^\d{1,2}:\d{2}/.test(hhmm)) {
    const [h, min] = hhmm.split(":");
    base.hour(Number(h)).minute(Number(min));
  } else {
    base.hour(fallbackHour).minute(0);
  }
  return base.toDate();
}

export default function SharedCalendar({ className = "", height = 600 }) {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(today);
  const [view, setView] = useState("month");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchRange = useCallback(async () => {
    const { start, end } = rangeForView(currentDate, view);
    setLoading(true);
    setError(null);
    try {
      const data = await calendarService.getRange(
        start.format("YYYY-MM-DD"),
        end.format("YYYY-MM-DD")
      );
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Failed to load calendar.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [currentDate, view]);

  useEffect(() => {
    fetchRange();
  }, [fetchRange]);

  const events = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        title: item.title,
        start: toDateTime(item.date, item.start_time, 0),
        end: toDateTime(item.date, item.end_time, 1),
        allDay: !item.start_time,
        resource: item,
      })),
    [items]
  );

  const eventPropGetter = useCallback((event) => {
    const style = TYPE_STYLES[event.resource?.type] || TYPE_STYLES.session;
    return {
      style: {
        backgroundColor: style.bg,
        borderColor: style.border,
        color: style.color,
        borderRadius: "6px",
        textDecoration:
          event.resource?.type === "cancellation" ? "line-through" : "none",
      },
    };
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-3 text-xs font-manrope">
        {Object.entries(TYPE_STYLES).map(([type, s]) => (
          <span key={type} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
            />
            {s.label}
          </span>
        ))}
        {loading && <span className="text-gray-400">Loading…</span>}
        {error && <span className="text-red-500">{error}</span>}
      </div>

      <div className={loading ? "opacity-60" : ""}>
        <Calendar
          localizer={localizer}
          events={events}
          date={currentDate}
          view={view}
          views={["month", "week", "day"]}
          onView={(next) => setView(next)}
          onNavigate={(next) => setCurrentDate(next)}
          onSelectEvent={(event) => setSelected(event.resource)}
          eventPropGetter={eventPropGetter}
          popup
          style={{ height, minHeight: 400 }}
        />
      </div>

      {/* Details modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 font-manrope"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-sm"
                  style={{
                    backgroundColor: (TYPE_STYLES[selected.type] || TYPE_STYLES.session).bg,
                  }}
                />
                <span className="text-xs uppercase tracking-wide text-gray-500">
                  {(TYPE_STYLES[selected.type] || TYPE_STYLES.session).label}
                </span>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <h3 className="text-lg font-semibold text-[#173963] mb-2">
              {selected.title}
            </h3>

            <div className="space-y-1.5 text-sm text-gray-700">
              <p>
                <span className="font-medium">Date: </span>
                {moment(selected.date).format("dddd, MMM D, YYYY")}
              </p>
              {(selected.start_time || selected.end_time) && (
                <p>
                  <span className="font-medium">Time: </span>
                  {selected.start_time || "—"}
                  {selected.end_time ? ` - ${selected.end_time}` : ""}
                </p>
              )}
              {selected.class_name && (
                <p>
                  <span className="font-medium">Class: </span>
                  {selected.class_name}
                </p>
              )}
              {selected.extra?.event_type && (
                <p>
                  <span className="font-medium">Type: </span>
                  {selected.extra.event_type}
                </p>
              )}
              {selected.extra?.location && (
                <p>
                  <span className="font-medium">Location: </span>
                  {selected.extra.location}
                </p>
              )}
              {selected.extra?.reason && (
                <p>
                  <span className="font-medium">Reason: </span>
                  {selected.extra.reason}
                </p>
              )}
              {selected.extra?.description && (
                <p className="text-gray-600">{selected.extra.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
