import React from "react";

/**
 * list: [{ program, avg }]
 */
const RevenueAverage = ({ list = [] }) => {
  return (
    <div>
      <h3 className="text-lg font-manrope font-semibold mb-4">Average Revenue per Student</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {list.map((row) => (
          <div key={row.program} className="p-4 rounded-lg border bg-gray-100">
            <div className="text-sm font-manrope text-gray-500">{row.program}</div>
            <div className="mt-2 text-2xl font-semibold text-[#0F1D2E]">${row.avg}</div>
            <div className="text-xs font-manrope text-gray-500 mt-1">Average</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueAverage;
