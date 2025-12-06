import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Calender1() {
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

  const prevMonthMeta = currentMonth === 0
    ? { month: 11, year: currentYear - 1 }
    : { month: currentMonth - 1, year: currentYear };
  const nextMonthMeta = currentMonth === 11
    ? { month: 0, year: currentYear + 1 }
    : { month: currentMonth + 1, year: currentYear };

  const prevMonthTotalDays = getDaysInMonth(prevMonthMeta.month, prevMonthMeta.year);
  const leadingDates = Array.from({ length: startingIndex }, (_, idx) => prevMonthTotalDays - startingIndex + idx + 1);

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
    <div className="rounded-3xl py-6 max-xxl:py-4 w-full">
      <h2 className="text-[20px] xxl1:text-2xl font-kollektif max-xxl:text-lg font-normal text-[#1B1B1B] mb-4 max-xxl:mb-3">
        Calendar
      </h2>

      <div className="flex justify-between items-center mb-3 max-xxl:mb-2">
        <span className="font-medium max-xxl:text-sm text-[#1B1B1B]">
          {new Date(currentYear, currentMonth).toLocaleString("default", {
            month: "short",
            year: "numeric",
          })}
        </span>

        <div className="flex gap-3">
          <button onClick={prevMonth}>
            <ChevronLeft className="w-5 h-5 text-[#1B1B1B]" />
          </button>
          <button onClick={nextMonth}>
            <ChevronRight className="w-5 h-5 text-[#1B1B1B]" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center xxl:text-sm text-xs text-[#6F6F6F] mb-2">
        {days.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center">
        {leadingDates.map((day, i) => (
          <div
            key={`lead-${i}`}
            className="mx-auto w-9 h-9 max-xxl1:w-7 max-xxl1:h-7 flex items-center justify-center rounded-full text-xs xxl:text-sm text-gray-300"
          >
            {day}
          </div>
        ))}

        {[...Array(totalDays)].map((_, i) => {
          const day = i + 1;
          const isEvent = highlightedDates.includes(day);
          const dateObj = new Date(currentYear, currentMonth, day);
          const isToday = dateObj.getTime() === today.getTime();
          const isPast = dateObj < today;

          return (
            <div
              key={day}
              className={`mx-auto w-9 h-9 max-xxl1:w-7 max-xxl1:h-7 flex items-center justify-center rounded-full text-xs xxl:text-sm cursor-pointer transition
                ${isEvent ? "bg-yellow-400 text-white font-semibold" : isToday ? "border border-[#F3BC48] text-[#0F1D2E]" : isPast ? "text-gray-400" : "text-[#1B1B1B]"}`}
            >
              {day}
            </div>
          );
        })}

        {trailingDates.map((day, i) => (
          <div
            key={`trail-${i}`}
            className="mx-auto w-9 h-9 max-xxl1:w-7 max-xxl1:h-7 flex items-center justify-center rounded-full text-xs xxl:text-sm text-gray-300"
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}
