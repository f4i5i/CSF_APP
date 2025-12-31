import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CalenderMini = ({ events = [], loading = false }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Selected date state
  const [selectedDay, setSelectedDay] = useState(null);

  // Calculate highlighted dates from events
  const highlightedDates = useMemo(() => {
    if (!events || events.length === 0) return [];
    return events
      .filter((event) => {
        const eventDate = new Date(event.start_datetime || event.start);
        return (
          eventDate.getMonth() === currentMonth &&
          eventDate.getFullYear() === currentYear
        );
      })
      .map((event) => new Date(event.start_datetime || event.start).getDate());
  }, [events, currentMonth, currentYear]);

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
    <div className={`rounded-3xl max-sm:py-1 w-full ${loading ? 'opacity-60' : ''}`}>
      <h2 className="text-[20px] font-kollektif text-[#1B1B1B] font-medium pb-8 max-xxl:pb-4 ">Calendar</h2>

      <div className="bg-[#FFFFFF50] rounded-3xl p-6 max-sm:p-4 shadow-sm lg:w-fit w-full">

        {/* Month Header */}
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium text-[#1B1B1B] font-manrope">
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

        {/* Days Header */}
        <div className="grid grid-cols-7 text-center text-xs font-manrope text-[#6F6F6F] mb-2">
          {days.map((d) => (
            <div className="font-manrope" key={d}>{d}</div>
          ))}
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-7 text-center">
          {[...Array(startingIndex)].map((_, i) => (
            <div key={i} className="text-[#6F6F6F] ">.</div>
          ))}

          {[...Array(totalDays)].map((_, i) => {
            const day = i + 1;
            const isEvent = highlightedDates.includes(day);
            const dateObj = new Date(currentYear, currentMonth, day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isPast = dateObj < today;
            const isSelected =
              selectedDay &&
              selectedDay.getDate() === day &&
              selectedDay.getMonth() === currentMonth &&
              selectedDay.getFullYear() === currentYear;

            return (
              <div
                key={day}
                onClick={() =>
                  setSelectedDay(new Date(currentYear, currentMonth, day))
                }
                className={`mx-auto w-9 h-9 font-manrope flex items-center justify-center
                rounded-full cursor-pointer text-xs
                ${
                  isSelected
                    ? "bg-[#1D3557] text-white"
                    : isEvent
                    ? "bg-yellow-400 text-white"
                    : isPast
                    ? "text-gray-400"
                    : "text-[#6F6F6F]"
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Text */}
      <p className="mt-6 text-[20px]  font-kollektif text-[#1B1B1B]">
        {selectedDay
          ? selectedDay.toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "No date selected"}
      </p>
    </div>
  );
};

export default CalenderMini;
