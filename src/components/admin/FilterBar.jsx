/**
 * FilterBar Component
 * Reusable filter controls with date range, status, search, etc.
 */

import React, { useState, useRef, useEffect } from "react";
import { Search, Calendar, Filter, X, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

// Lightweight custom dropdown for FilterBar (preserves filter.onChange logic)
function CustomDropdown({
  value,
  onChange,
  options = [],
  placeholder = "All",
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Support both { value,label } and { id,name } option shapes
  const selected = options.find((o) =>
    o.value ? o.value === value : o.id === value
  );
  const display = selected ? selected.label || selected.name : placeholder;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((s) => !s)}
        className={`w-full lg:w-auto px-2 sm:px-3 py-2 border rounded-[12px] font-manrope font-medium focus:outline-none focus:ring-2 focus:ring-btn-gold flex items-center justify-between bg-white transition-colors ${className} ${
          selected ? "border-border-light" : "border-border-light"
        }`}
        style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
      >
        <span className={`truncate text-xs sm:text-sm ${selected ? "text-text-primary font-manrope" : "text-heading-dark font-manrope"}`}>
          {display}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.18 }}
        >
          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0 ml-1" />
        </motion.span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          y: isOpen ? 0 : -10,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.18 }}
        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
      >
        <div className="max-h-48 overflow-y-auto custom-scrollbar">
          {options.map((opt) => {
            const key = opt.value ?? opt.id;
            const label = opt.label ?? opt.name;
            const val = opt.value ?? opt.id;
            const selectedMatch = val === value;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  onChange(val);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-btn-gold font-manrope hover:text-heading-dark transition-colors ${
                  selectedMatch
                    ? "bg-btn-gold text-text-primary"
                    : "text-heading-dark"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

export default function FilterBar({
  onSearch,
  onFilterChange,
  onClearFilters,
  searchValue = "",
  searchPlaceholder = "Search...",
  filters = [],
  hasActiveFilters = false,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 relative z-20">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="w-full sm:w-auto sm:min-w-[200px] sm:max-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-border-light rounded-xl font-manrope placeholder:font-manrope text-xs sm:text-sm focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] outline-none"
              style={{ boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)" }}
            />
          </div>
        </div>

        {/* Filter Dropdowns - inline with search */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-4">
          {filters.map((filter, index) => (
            <div key={index} className="w-full sm:w-auto">
              {filter.type === "select" && (
                <div className="relative">
                  {filter.icon && (
                    <filter.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                  )}
                  <CustomDropdown
                    value={filter.value || ""}
                    onChange={(val) => filter.onChange(val)}
                    options={filter.options || []}
                    placeholder={filter.placeholder || "All"}
                    className={`${
                      filter.icon ? "pl-9 sm:pl-10" : "pl-3 sm:pl-4"
                    } pr-1 gap-4 sm:gap-7 py-2 border border-gray-300 rounded-lg font-manrope text-xs sm:text-sm focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48]`}
                  />
                </div>
              )}

              {filter.type === "date" && (
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                  <input
                    type="date"
                    value={filter.value || ""}
                    onChange={(e) => filter.onChange(e.target.value)}
                    placeholder={filter.placeholder}
                    className="w-full sm:w-auto pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 border border-gray-300 rounded-lg font-manrope text-xs sm:text-sm focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] outline-none"
                  />
                </div>
              )}

              {filter.type === "daterange" && (
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center col-span-2">
                  <input
                    type="date"
                    value={filter.startValue || ""}
                    onChange={(e) => filter.onStartChange(e.target.value)}
                    placeholder="Start date"
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg font-manrope text-xs sm:text-sm focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] outline-none"
                  />
                  <span className="text-gray-500 text-xs sm:text-sm text-center">to</span>
                  <input
                    type="date"
                    value={filter.endValue || ""}
                    onChange={(e) => filter.onEndChange(e.target.value)}
                    placeholder="End date"
                    className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg font-manrope text-xs sm:text-sm focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] outline-none"
                  />
                </div>
              )}
            </div>
          ))}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-manrope font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition whitespace-nowrap col-span-2 sm:col-span-1"
            >
              <X className="w-3 h-3 sm:w-4 sm:h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border-light">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1
                          bg-btn-gold/10 text-heading-dark rounded-full
                          text-[10px] sm:text-xs font-manrope font-semibold transition-colors duration-200">
            <Filter className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-heading-dark font-manrope" />
            Filters Active
          </div>
        </div>
      )}
    </div>
  );
}
