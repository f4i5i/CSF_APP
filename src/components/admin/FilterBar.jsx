/**
 * FilterBar Component
 * Reusable filter controls with date range, status, search, etc.
 */

import React from 'react';
import { Search, Calendar, Filter, X } from 'lucide-react';

export default function FilterBar({
  onSearch,
  onFilterChange,
  onClearFilters,
  searchValue = '',
  searchPlaceholder = 'Search...',
  filters = [],
  hasActiveFilters = false,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg font-manrope text-sm focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] outline-none"
            />
          </div>
        </div>

        {/* Filter Dropdowns */}
        {filters.map((filter, index) => (
          <div key={index} className="w-full sm:w-auto">
            {filter.type === 'select' && (
              <div className="relative">
                {filter.icon && (
                  <filter.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                )}
                <select
                  value={filter.value || ''}
                  onChange={(e) => filter.onChange(e.target.value)}
                  className={`
                    w-full sm:w-auto ${filter.icon ? 'pl-10' : 'pl-4'} pr-10 py-2
                    border border-gray-300 rounded-lg font-manrope text-sm
                    focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] outline-none
                    appearance-none bg-white cursor-pointer
                  `}
                >
                  <option value="">{filter.placeholder || 'All'}</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            )}

            {filter.type === 'date' && (
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  type="date"
                  value={filter.value || ''}
                  onChange={(e) => filter.onChange(e.target.value)}
                  placeholder={filter.placeholder}
                  className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg font-manrope text-sm focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] outline-none"
                />
              </div>
            )}

            {filter.type === 'daterange' && (
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={filter.startValue || ''}
                  onChange={(e) => filter.onStartChange(e.target.value)}
                  placeholder="Start date"
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg font-manrope text-sm focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] outline-none"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={filter.endValue || ''}
                  onChange={(e) => filter.onEndChange(e.target.value)}
                  placeholder="End date"
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg font-manrope text-sm focus:ring-2 focus:ring-[#F3BC48] focus:border-[#F3BC48] outline-none"
                />
              </div>
            )}
          </div>
        ))}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm font-manrope font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition whitespace-nowrap"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-manrope font-semibold">
            <Filter className="w-3 h-3" />
            Filters Active
          </div>
        </div>
      )}
    </div>
  );
}
