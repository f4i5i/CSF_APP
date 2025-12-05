import { useState } from "react";
import { ChevronLeft, ChevronRight, Paperclip } from "lucide-react";

export default function Calender1() {
  const [currentMonth, setCurrentMonth] = useState(9); // October (0-indexed)
  const [currentYear, setCurrentYear] = useState(2025);

  // Sample highlighted event dates
  const highlightedDates = [8, 9, 20, 21];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const totalDays = getDaysInMonth(currentMonth, currentYear);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const startingIndex = firstDay === 0 ? 6 : firstDay - 1;

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  return (
   
     <div className=" rounded-3xl py-6 max-xxl:py-4 w-full " >
      <h2 className="text-[20px] xxl1:text-2xl font-kollektif max-xxl:text-lg font-normal text-[#0f1d2e] mb-4 max-xxl:mb-3">Calendar</h2>

        <div className="flex justify-between items-center mb-3 max-xxl:mb-2">
          <span className="font-medium max-xxl:text-sm text-[#0F1D2E]">
            {new Date(currentYear, currentMonth).toLocaleString("default", {
              month: "short",
              year: "numeric",
            })}
          </span>

          <div className="flex gap-3">
            <button onClick={prevMonth}>
              <ChevronLeft className="w-5 h-5 text-[#0F1D2E]" />
            </button>
            <button onClick={nextMonth}>
              <ChevronRight className="w-5 h-5 text-[#0F1D2E]" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7  text-center xxl:text-sm text-xs text-[#6F6F6F] mb-2">
          {days.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-7 span-x-2 text-center">
          {[...Array(startingIndex)].map((_, i) => (
            <div key={i} className="text-[#6F6F6F]">.</div>
          ))}

          {[...Array(totalDays)].map((_, i) => {
            const day = i + 1;
            const isEvent = highlightedDates.includes(day);

            return (
              <div
                key={i}
                className={`mx-auto w-9 h-9 max-xxl1:w-7 max-xxl1:h-7 flex items-center justify-center 
                rounded-full text-xs xxl:text-sm cursor-pointer 
                ${isEvent ? "bg-yellow-400 text-white font-semibold" : "text-[#6F6F6F]"}`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

     
   
  );
}
