import { startOfMonth, addMonths, format } from "date-fns";

export default function CustomCaption({ displayMonth, onMonthChange }) {
  const monthStart = startOfMonth(displayMonth);

  return (
    <div className="flex items-center justify-center gap-4 mb-4">
      {/* LEFT CHEVRON */}
      <button
        onClick={() => onMonthChange(addMonths(monthStart, -1))}
        className="text-[#1D3557] text-lg"
      >
        ‹
      </button>

      {/* MONTH NAME */}
      <h2 className="text-[18px] xxl1:text-xl font-semibold text-[#0f1d2e]">
        {format(displayMonth, "MMMM yyyy")}
      </h2>

      {/* RIGHT CHEVRON */}
      <button
        onClick={() => onMonthChange(addMonths(monthStart, 1))}
        className="text-[#1D3557] text-lg"
      >
        ›
      </button>
    </div>
  );
}
