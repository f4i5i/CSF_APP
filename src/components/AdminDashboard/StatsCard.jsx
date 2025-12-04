import React from "react";

/**
 * Small top cards: Registrations (24h / 7d / 30d) and Cancellations
 */
const StatCard = ({ title, items }) => {
  return (
    <div className="bg-[#FFFFFF80] rounded-2xl p-4 shadow flex  items-center justify-between">
      <div>
        <h4 className="text-sm font-manrope text-gray-500">{title}</h4>
        <div className="flex gap-4 mt-3">
          {Object.entries(items).map(([k, v]) => (
            <div key={k} className="text-center">
              <p className="text-lg font-manrope font-semibold">{v}</p>
              <p className="text-xs font-manrope text-gray-500">{k}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        {/* placeholder circle icon */}
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
          📊
        </div>
      </div>
    </div>
  );
};

const StatsCards = ({ registrations, cancellations }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <StatCard title="Registrations" items={registrations} />
      <StatCard title="Cancellations" items={cancellations} />
    </div>
  );
};

export default StatsCards;
