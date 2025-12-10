import React from 'react';

/**
 * StatCard Component
 * Displays a large statistic number with a descriptive label below
 * Used in the hero section for Attendance Streak and Badges Earned
 */
export default function StatCard({ value, label, className = '' }) {
  return (
    <div className={`flex flex-col items-end text-end ${className}`}>
      {/* Large stat number */}
      <p className="text-fluid-3xl font-kollektif font-normal leading-normal text-[#0F1D2E]">
        {value}
      </p>

      {/* Descriptive label */}
      <p className="text-black opacity-60 font-kollektif text-fluid-base leading-[160%] font-normal">
        {label}
      </p>
    </div>
  );
}
