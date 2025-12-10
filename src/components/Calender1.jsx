import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Calendar1() {
  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const highlightedDates = [8, 9, 20, 21];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  const totalDays = getDaysInMonth(currentMonth, currentYear);
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const startingIndex = firstDay === 0 ? 6 : firstDay - 1;

  const prevMonthMeta =
    currentMonth === 0
      ? { month: 11, year: currentYear - 1 }
      : { month: currentMonth - 1, year: currentYear };

  const prevMonthTotalDays = getDaysInMonth(prevMonthMeta.month, prevMonthMeta.year);

  const leadingDates = Array.from(
    { length: startingIndex },
    (_, idx) => prevMonthTotalDays - startingIndex + idx + 1
  );

  const totalCells = startingIndex + totalDays;
  const trailingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const trailingDates = Array.from({ length: trailingCells }, (_, idx) => idx + 1);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  return (
    <div className="w-full">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-manrope font-medium text-[#0F1D2E] opacity-70 uppercase tracking-tight">
          {new Date(currentYear, currentMonth).toLocaleString("default", {
            month: "short",
            year: "numeric",
          })}
        </span>
        <div className="flex items-center gap-2.5 opacity-70">
          <button
            onClick={prevMonth}
            className="p-0.5 hover:opacity-100 transition-opacity"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-[#0F1D2E]" />
          </button>
          <button
            onClick={nextMonth}
            className="p-0.5 hover:opacity-100 transition-opacity"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-[#0F1D2E]" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-0 mb-3 text-center">
        {days.map((day) => (
          <div
            key={day}
            className="text-fluid-xs font-manrope font-light text-[#6F6F6F] leading-[155%] py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-y-2.5 gap-x-0 text-center">
        {/* Previous Month Dates */}
        {leadingDates.map((day, i) => (
          <div
            key={`lead-${i}`}
            className="h-fluid-cell flex items-center justify-center text-fluid-sm font-manrope font-medium text-gray-300"
          >
            .
          </div>
        ))}

        {/* Current Month Dates */}
        {[...Array(totalDays)].map((_, i) => {
          const day = i + 1;
          const isEvent = highlightedDates.includes(day);
          const dateObj = new Date(currentYear, currentMonth, day);
          const isToday = dateObj.getTime() === today.getTime();

          return (
            <button
              key={day}
              className={`h-fluid-cell flex items-center justify-center text-fluid-sm font-manrope font-medium leading-[1.55] transition-colors
                ${
                  isEvent
                    ? "bg-[#F3BC48] text-[#0F1D2E] rounded-full px-fluid-2"
                    : "text-[#6F6F6F] hover:bg-gray-50 rounded-full px-2"
                }`}
              aria-label={`${day} ${new Date(currentYear, currentMonth).toLocaleString("default", { month: "long" })}`}
            >
              {day}
            </button>
          );
        })}

        {/* Next Month Dates */}
        {trailingDates.map((day, i) => (
          <div
            key={`trail-${i}`}
            className="h-fluid-cell flex items-center justify-center text-fluid-sm font-manrope font-medium text-gray-300"
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}