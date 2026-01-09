import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomToolbar({ label, onNavigate, onView, view }) {
  return (
    <div className="flex items-center justify-between px-4 pb-3 max-xxl:mb-0 mb-4 flex-wrap gap-3">

      {/* Month - Year */}
      <h2 className="text-xl font-semibold text-[#1D3557] font-manrope">
        {label}
      </h2>

      {/* View & Navigation buttons */}
      <div className="flex items-center gap-3">
        {/* View Switcher */}
        <div className="flex items-center bg-gray-100 rounded-full p-1">
          <button
            onClick={() => onView("month")}
            className={`px-3 py-1.5 text-sm font-medium font-manrope rounded-full transition-colors ${
              view === "month"
                ? "bg-[#173963] text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => onView("week")}
            className={`px-3 py-1.5 text-sm font-medium font-manrope rounded-full transition-colors ${
              view === "week"
                ? "bg-[#173963] text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => onView("day")}
            className={`px-3 py-1.5 text-sm font-medium font-manrope rounded-full transition-colors ${
              view === "day"
                ? "bg-[#173963] text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Day
          </button>
        </div>

        {/* Navigation buttons */}
        <button
          onClick={() => onNavigate("PREV")}
          className="w-9 h-9 flex items-center bg-[#173963] justify-center rounded-full shadow"
        >
          <ChevronLeft size={18} className="text-white" />
        </button>

        <button
          onClick={() => onNavigate("NEXT")}
          className="w-9 h-9 flex items-center bg-[#173963] justify-center rounded-full shadow"
        >
          <ChevronRight size={18} className="text-white" />
        </button>
      </div>

    </div>
  );
}
