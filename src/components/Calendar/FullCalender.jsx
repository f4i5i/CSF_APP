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
  const isYellow = event.className?.includes('yellow');

  return (
    <div
      className={`flex flex-col gap-1 rounded-lg sm:rounded-[15px] p-1 lg:mx-2 sm:px-4 sm:py-2 shadow-sm border
        ${isYellow ? 'bg-[#F3BC48] border-[#F3BC48] text-[#000]' : 'bg-[#173963] border-[#173963] text-white'}`}
      // style={{ minWidth: '120px' }}
    >
      <span className="text-[8px] sm:text-[12px] font-medium tracking-[0.01em] font-manrope">
        {event.title}
      </span>
      <span className="font-manrope text-[8px] sm:text-[12px] font-medium tracking-[0.01em] opacity-90">
        {startTime} - {endTime}
      </span>
    </div>
  );
};

export default function EventCalendar({ events: propEvents = [], loading = false }) {
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
      }));
    }
    return demoEvents;
  }, [propEvents, demoEvents]);

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
        components={{
          toolbar: (props) => <CustomToolbar {...props} />, // ✅ custom toolbar
          event: CustomEvent, // ✅ SHOWS TIME WITH EVENT TITLE
        }}
        style={{ width: "100%", height: "80vh" }}
      />
    </div>
  );
}
