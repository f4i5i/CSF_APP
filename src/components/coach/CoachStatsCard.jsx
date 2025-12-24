import React from 'react';

/**
 * CoachStatsCard - Displays a stat with large number and label
 * Matches Figma design: 60px Kollektif number, 16px Manrope label with 60% opacity
 */
const CoachStatsCard = ({ value, label }) => {
  return (
    <div className="flex flex-col items-start pb-[5px]">
      <p className="font-kollektif text-[60px] leading-normal text-[#0F1D2E]">
        {value}
      </p>
      <p className="font-manrope font-medium text-[16px] leading-[1.6] text-black opacity-60">
        {label}
      </p>
    </div>
  );
};

export default CoachStatsCard;
