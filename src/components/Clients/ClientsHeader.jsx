import React from "react";
import ExportButton from "./ExportButton";

export default function ClientsHeader({ title, description, query, setQuery }) {
  return (
    <div className="flex flex-col lg:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#173151] font-kollektif">{title}</h1>
        <p className="text-sm text-gray-600 mt-1 font-manrope">{description}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-white rounded-full px-3 py-2 shadow-sm border border-gray-200 sm:w-[200px] md:w-[300px] lg:w-[420px]">
          <svg className="w-5 h-5 text-gray-400 mr-2" viewBox="0 0 24 24" fill="none">
            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          <input
            className="w-full outline-none font-manrope placeholder:font-manrope bg-transparent text-sm"
            placeholder="Search accounts, members or coach..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <ExportButton />
      </div>
    </div>
  );
}
