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
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6">
      {/* Header */}
      <h2 className="text-lg sm:text-xl lg:text-2xl font-kollektif font-normal text-[#1B1B1B] mb-4 sm:mb-6">
        Calendar
      </h2>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <span className="text-sm sm:text-base font-medium text-[#1B1B1B]">
          {new Date(currentYear, currentMonth).toLocaleString("default", {
            month: "short",
            year: "numeric",
          })}
        </span>
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={prevMonth}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#1B1B1B]" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#1B1B1B]" />
          </button>
        </div>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
        {days.map((day) => (
          <div
            key={day}
            className="text-xs sm:text-sm font-medium text-[#6F6F6F] py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
        {/* Previous Month Dates */}
        {leadingDates.map((day, i) => (
          <div
            key={`lead-${i}`}
            className="aspect-square flex items-center justify-center rounded-full text-xs sm:text-sm text-gray-300"
          >
            {day}
          </div>
        ))}

        {/* Current Month Dates */}
        {[...Array(totalDays)].map((_, i) => {
          const day = i + 1;
          const isEvent = highlightedDates.includes(day);
          const dateObj = new Date(currentYear, currentMonth, day);
          const isToday = dateObj.getTime() === today.getTime();
          const isPast = dateObj < today;

          return (
            <button
              key={day}
              className={`aspect-square flex items-center justify-center rounded-full text-xs sm:text-sm transition-all duration-200 hover:scale-110
                ${
                  isEvent
                    ? "bg-yellow-400 text-white font-semibold shadow-sm hover:bg-yellow-500"
                    : isToday
                    ? "border-2 border-[#F3BC48] text-[#0F1D2E] font-medium"
                    : isPast
                    ? "text-gray-400"
                    : "text-[#1B1B1B] hover:bg-gray-50"
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
            className="aspect-square flex items-center justify-center rounded-full text-xs sm:text-sm text-gray-300"
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}