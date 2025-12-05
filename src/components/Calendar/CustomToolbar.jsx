import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomToolbar({ label, onNavigate }) {
  return (
    <div className="flex items-center justify-between px-4 pb-3 max-xxl:mb-0 mb-4">
      
      {/* Month - Year */}
      <h2 className="text-xl font-semibold text-[#1D3557]">
        {label}
      </h2>

      {/* Navigation buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate("PREV")}
          className="w-9 h-9 flex items-center bg-[#173963] justify-center rounded-full  shadow "
        >
          <ChevronLeft size={18} className="text-white" />
        </button>

        <button
          onClick={() => onNavigate("NEXT")}
          className="w-9 h-9 flex items-center bg-[#173963] justify-center rounded-full  shadow "
        >
          <ChevronRight size={18} className="text-white" />
        </button>
      </div>

    </div>
  );
}
