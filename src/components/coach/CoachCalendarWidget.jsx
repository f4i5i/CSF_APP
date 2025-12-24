import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * CoachCalendarWidget - Mini calendar with highlighted event dates
 * Matches Figma design: Compact calendar grid with gold (#F3BC48) highlights
 */
const CoachCalendarWidget = ({ events = [], onDateClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get month and year
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  // Format month name
  const monthName = currentDate.toLocaleString('default', { month: 'short' }).toUpperCase();

  // Get days with events for highlighting
  const eventDates = useMemo(() => {
    // Ensure events is an array
    const eventsArray = Array.isArray(events) ? events : [];
    return eventsArray.map(event => {
      const date = new Date(event.start_datetime || event.date);
      return date.getDate();
    }).filter((day, index, self) => self.indexOf(day) === index);
  }, [events]);

  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    // Get the day of week (0 = Sunday, 1 = Monday, etc.)
    // Adjust to start week on Monday
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const days = [];

    // Add empty cells for days before the 1st
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, isEvent: false });
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isEvent: eventDates.includes(i)
      });
    }

    return days;
  }, [month, year, eventDates]);

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex flex-col gap-[9.574px] w-full">
      {/* Header with month/year and arrows */}
      <div className="flex items-center justify-between w-full">
        <p className="font-manrope font-medium text-[14px] leading-[1.5] text-[#0F1D2E] opacity-70 tracking-[-0.28px]">
          {monthName} {year}
        </p>
        <div className="flex gap-[10.795px] opacity-70">
          <button
            onClick={prevMonth}
            className="w-[21.59px] h-[21.59px] flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft size={18} className="text-[#0F1D2E]" />
          </button>
          <button
            onClick={nextMonth}
            className="w-[21.59px] h-[21.59px] flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight size={18} className="text-[#0F1D2E]" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-col gap-[12px] w-full">
        {/* Day Labels */}
        <div className="flex items-center justify-between p-[3.598px] rounded-[10.795px]">
          {dayLabels.map((day) => (
            <p
              key={day}
              className="w-[23.389px] text-center font-manrope font-light text-[10px] leading-[1.55] text-[#6F6F6F]"
            >
              {day}
            </p>
          ))}
        </div>

        {/* Date Grid */}
        <div className="grid grid-cols-7 gap-y-[10.634px]">
          {calendarDays.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-center w-[23.389px]"
            >
              {item.day !== null ? (
                <button
                  onClick={() => onDateClick && onDateClick(new Date(year, month, item.day))}
                  className={`w-[23.389px] h-[23.389px] flex items-center justify-center font-manrope font-medium text-[12px] leading-[1.55] rounded-full transition-colors ${
                    item.isEvent
                      ? 'bg-[#F3BC48] text-[#0F1D2E]'
                      : 'text-[#6F6F6F] hover:bg-gray-100'
                  }`}
                >
                  {item.day}
                </button>
              ) : (
                <span className="font-inter font-medium text-[12px] leading-[1.55] text-[#6F6F6F]">.</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoachCalendarWidget;
