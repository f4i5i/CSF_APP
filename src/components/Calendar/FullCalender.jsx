import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../../styles/calendar-styles.css"; 
import CustomToolbar from "./CustomToolbar";
const localizer = momentLocalizer(moment);

export default function EventCalendar() {
 const [events] = useState([
  {
    title: "Tournament",
    start: new Date(2025, 0, 8, 10, 0),
    end: new Date(2025, 0, 8, 11, 0),
    className: "blue",
  },
  {
    title: "Match Day",
    start: new Date(2025, 0, 10, 10, 0),
    end: new Date(2025, 0, 10, 11, 0),
    className: "yellow",
  },
  {
    title: "Training Session",
    start: new Date(2025, 0, 15, 10, 0),
    end: new Date(2025, 0, 15, 11, 0),
    className: "yellow",
  },
  {
    title: "Workshop",
    start: new Date(2025, 0, 23, 10, 0),
    end: new Date(2025, 0, 23, 11, 0),
    className: "blue",
  }
]);

  return (
    <div className="w-full h-full">
      <Calendar
        localizer={localizer}
        defaultDate={new Date(2025, 0, 1)}
        defaultView="month"
        events={events}
        components={{
          toolbar: CustomToolbar, // ✅ THIS MAKES CHEVRONS PART OF CALENDAR
        }}
        style={{ width: "100%", height: "80vh" }}
      />
    </div>
  );
}
