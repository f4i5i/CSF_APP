import React, { useMemo, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/calendar-styles.css";
import CustomToolbar from "./CustomToolbar";
const localizer = momentLocalizer(moment);

// Custom event component to show time
const CustomEvent = ({ event }) => {
  const startTime = moment(event.start).format('h:mm a');
  const endTime = moment(event.end).format('h:mm a');

  // Determine color scheme
  let bgClass, borderClass, textClass;
  if (event._isCancelled) {
    bgClass = 'bg-red-200';
    borderClass = 'border-red-300';
    textClass = 'text-red-700';
  } else if (event._isPractice) {
    bgClass = 'bg-emerald-600';
    borderClass = 'border-emerald-600';
    textClass = 'text-white';
  } else if (event.className?.includes('yellow')) {
    bgClass = 'bg-[#F3BC48]';
    borderClass = 'border-[#F3BC48]';
    textClass = 'text-[#000]';
  } else {
    bgClass = 'bg-[#173963]';
    borderClass = 'border-[#173963]';
    textClass = 'text-white';
  }

  return (
    <div
      className={`flex flex-col gap-1 rounded-lg sm:rounded-[15px] p-1 lg:mx-2 sm:px-4 sm:py-2 max-w-full shadow-sm border overflow-hidden
        ${bgClass} ${borderClass} ${textClass} ${event._isCancelled ? 'line-through opacity-70' : ''} ${event._isPractice ? 'cursor-pointer' : ''}`}
    >
      <span className="text-[8px] sm:text-[12px] font-medium tracking-[0.01em] font-manrope truncate max-w-[120px] sm:max-w-[150px]">
        {event.title}
      </span>
      <span className="font-manrope text-[8px] sm:text-[12px] font-medium tracking-[0.01em] opacity-90 whitespace-nowrap">
        {startTime} - {endTime}
      </span>
    </div>
  );
};

export default function EventCalendar({ events: propEvents = [], loading = false, onEventClick }) {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(today);
  const [view, setView] = useState("month");

  // Demo events for fallback
  const demoEvents = useMemo(() => [
    {
      title: "Tournament",
      start: new Date(today.getFullYear(), today.getMonth(), 8, 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), 8, 11, 0),
      className: "blue",
    },
    {
      title: "Match Day",
      start: new Date(today.getFullYear(), today.getMonth(), 10, 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), 10, 11, 0),
      className: "yellow",
    },
    {
      title: "Training Session",
      start: new Date(today.getFullYear(), today.getMonth(), 15, 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), 15, 11, 0),
      className: "yellow",
    },
    {
      title: "Workshop",
      start: new Date(today.getFullYear(), today.getMonth(), 23, 10, 0),
      end: new Date(today.getFullYear(), today.getMonth(), 23, 11, 0),
      className: "blue",
    }
  ], [today]);

  // Transform API events to calendar format or use demo
  const events = useMemo(() => {
    if (propEvents && propEvents.length > 0) {
      return propEvents.map(event => ({
        title: event.title || event.name,
        start: new Date(event.start_datetime || event.start),
        end: new Date(event.end_datetime || event.end || event.start_datetime || event.start),
        className: event.type === 'tournament' || event.type === 'match' ? 'yellow' : 'blue',
        // Pass through practice metadata
        _isPractice: event._isPractice || false,
        _isCancelled: event._isCancelled || false,
        _classId: event._classId,
        _className: event._className,
        _practiceDate: event._practiceDate,
      }));
    }
    return demoEvents;
  }, [propEvents, demoEvents]);

  const handleSelectEvent = (event) => {
    if (onEventClick && event._isPractice) {
      onEventClick(event);
    }
  };

  return (
    <div className={`w-full h-full ${loading ? 'opacity-60' : ''}`}>
      <Calendar
        localizer={localizer}
        date={currentDate}
        view={view}
        onView={(nextView) => setView(nextView)}
        onNavigate={(nextDate) => setCurrentDate(nextDate)}
        events={events}
        selectable
        onSelectSlot={(slotInfo) => {
          if (view === "month") {
            setCurrentDate(slotInfo.start);
            setView("day");
          }
        }}
        onSelectEvent={handleSelectEvent}
        components={{
          toolbar: (props) => <CustomToolbar {...props} />, // ✅ custom toolbar
          event: CustomEvent, // ✅ SHOWS TIME WITH EVENT TITLE
        }}
        style={{ width: "100%", height: "calc(100vh - 280px)", minHeight: "500px" }}
      />
    </div>
  );
}
