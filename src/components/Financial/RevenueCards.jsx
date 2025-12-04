import React from "react";

/**
 * Small stat cards row
 * totals: { "24h": number, "7d": number, "30d": number, "90d": number, "YTD": number }
 */
const RevenueCards = ({ totals }) => {
  const items = [
    { key: "24h", label: "24 hours" },
    { key: "7d", label: "7 days" },
    { key: "30d", label: "30 days" },
    { key: "90d", label: "90 days" },
    { key: "YTD", label: "Year to date" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((it) => (
        <div key={it.key} className="bg-[#FFFFFF80] rounded-xl p-4 shadow flex flex-col">
          <div className="text-xs font-manrope text-gray-700">{it.label}</div>
          <div className="mt-2 text-2xl font-semibold font-kollektif text-[#0F1D2E]">
            ${Number(totals[it.key] ?? 0).toLocaleString()}
          </div>
          <div className="text-sm font-manrope text-gray-700 mt-1">Revenue</div>
        </div>
      ))}
    </div>
  );
};

export default RevenueCards;
