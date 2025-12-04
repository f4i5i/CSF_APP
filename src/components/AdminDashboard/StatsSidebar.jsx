import React from "react";

const StatsSidebar = ({ stats }) => {
  return (
    <div className="bg-[#FFFFFF80] rounded-2xl p-4 shadow sticky top-6">
      <div className="mb-4">
        <h3 className="text-sm font-manrope text-gray-500">Active students</h3>
        <p className="text-3xl font-manrope font-semibold text-[#0F2D50]">{stats.activeStudents}</p>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-manrope text-gray-500">Total students</h3>
        <p className="text-2xl font-manrope font-semibold text-[#0F2D50]">{stats.totalStudents}</p>
      </div>

      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium font-manrope text-gray-700 mb-2">Programs</h4>
        <ul className="space-y-2">
          {stats.programs.map((p) => (
            <li key={p.name} className="flex justify-between items-center">
              <span className="text-sm text-gray-700">{p.name}</span>
              <span className="text-sm font-semibold text-[#0F2D50]">{p.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StatsSidebar;
