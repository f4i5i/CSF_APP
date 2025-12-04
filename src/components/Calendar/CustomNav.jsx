import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomNav({ onPreviousClick, onNextClick }) {
  return (
    <div className="flex justify-between mb-3">
      <button
        onClick={onPreviousClick}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <ChevronLeft size={18} />
      </button>

      <button
        onClick={onNextClick}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
