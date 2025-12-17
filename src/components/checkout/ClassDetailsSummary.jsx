/**
 * ClassDetailsSummary Component
 * Displays class information including name, schedule, location, price, and capacity
 */

import React from 'react';

export default function ClassDetailsSummary({ classData, hasCapacity }) {
  if (!classData) {
    return (
      <div className="bg-white/50 rounded-fluid-xl p-fluid-5 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  // Format schedule display
  const getScheduleDisplay = () => {
    if (classData.schedule && classData.schedule.length > 0) {
      return classData.schedule
        .map((s) => `${s.day_of_week} ${s.start_time} - ${s.end_time}`)
        .join(', ');
    }
    return 'Schedule TBD';
  };

  // Format date range
  const getDateRange = () => {
    if (classData.start_date && classData.end_date) {
      const start = new Date(classData.start_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const end = new Date(classData.end_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      return `${start} - ${end}`;
    }
    return null;
  };

  // Format price
  const getPrice = () => {
    const price = classData.base_price || classData.price || 0;
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // Capacity display removed per requirements

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-fluid-xl p-fluid-5 shadow-sm border border-white/20">
      <h2 className="text-fluid-lg font-semibold font-manrope text-[#173151] leading-[1.5] tracking-[-0.2px] mb-4">
        Class Details
      </h2>

      <div className="space-y-3">
        {/* Class Name */}
        <div>
          <h3 className="text-fluid-xl font-bold font-kollektif text-[#0F1D2E] leading-[1.2]">
            {classData.name}
          </h3>
        </div>

        {/* Schedule */}
        <div className="flex items-start gap-2">
          <span className="font-manrope font-semibold text-fluid-base text-[#173151]">
            Schedule:
          </span>
          <span className="font-manrope font-normal text-fluid-base text-[#666D80]">
            {getScheduleDisplay()}
          </span>
        </div>

        {/* Date Range */}
        {getDateRange() && (
          <div className="flex items-start gap-2">
            <span className="font-manrope font-semibold text-fluid-base text-[#173151]">
              Duration:
            </span>
            <span className="font-manrope font-normal text-fluid-base text-[#666D80]">
              {getDateRange()}
            </span>
          </div>
        )}

        {/* Location */}
        {classData.location && (
          <div className="flex items-start gap-2">
            <span className="font-manrope font-semibold text-fluid-base text-[#173151]">
              Location:
            </span>
            <span className="font-manrope font-normal text-fluid-base text-[#666D80]">
              {classData.location}
            </span>
          </div>
        )}

        {/* Age Range */}
        {(classData.min_age || classData.max_age) && (
          <div className="flex items-start gap-2">
            <span className="font-manrope font-semibold text-fluid-base text-[#173151]">
              Age Range:
            </span>
            <span className="font-manrope font-normal text-fluid-base text-[#666D80]">
              {classData.min_age && classData.max_age
                ? `${classData.min_age} - ${classData.max_age} years`
                : classData.min_age
                ? `${classData.min_age}+ years`
                : `Up to ${classData.max_age} years`}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-start gap-2">
          <span className="font-manrope font-semibold text-fluid-base text-[#173151]">
            Price:
          </span>
          <span className="font-manrope font-bold text-fluid-lg text-[#F3BC48]">
            {getPrice()}
          </span>
        </div>

        {/* Capacity status removed per requirements */}
      </div>
    </div>
  );
}
