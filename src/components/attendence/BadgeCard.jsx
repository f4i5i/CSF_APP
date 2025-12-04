import React from "react";

export default function BadgeCard({ title,compact, subtitle, icon, active }) {
  return (
  <div
      className={`
        ${compact ? "max-sm:w-[200px]" : "max-sm:w-full"}
        w-[200px] shrink-0 min-h-[160px]
        rounded-2xl bg-white shadow-md
        flex flex-col items-center justify-center text-center
        px-4 py-6 transition-all
        ${active ? "border-2 border-[#1D3557]" : "border border-transparent"}
      `}
    >
      <img src={icon} alt={title} className="w-12 h-12 xxl1:w-20 xxl1:h-20 mb-3" />

      <h3 className="font-manrope font-medium text-[16px] xxl1:text-lg text-[#1D3557]">
        {title}
      </h3>

      {subtitle && (
        <p className="text-xs xxl1:text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  );
}
