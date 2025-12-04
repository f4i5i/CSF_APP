import React from "react";

/**
 * Displays program revenues as a list/table
 * programs: [{ id, name, revenue }]
 */
const RevenuePrograms = ({ programs = [] }) => {
  return (
    <div>
      <h3 className="text-lg font-manrope font-semibold mb-3">Revenue by Program</h3>

      <div className="space-y-3">
        {programs.map((p) => (
          <div key={p.id} className="flex items-center justify-between border rounded-lg p-3 bg-gray-100">
            <div>
              <div className="font-medium font-manrope text-sm">{p.name}</div>
              <div className="text-xs font-manrope text-gray-500">Share: {((p.revenue / Math.max(1, programs.reduce((a,b)=>a+b.revenue,0))) * 100).toFixed(1)}%</div>
            </div>

            <div className="text-right">
              <div className="text-sm font-manrope font-semibold">${p.revenue.toLocaleString()}</div>
              <div className="text-xs font-manrope text-gray-500">Revenue</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenuePrograms;
