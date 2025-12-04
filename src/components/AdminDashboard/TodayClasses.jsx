import React from "react";

const ClassRow = ({ cls }) => (
  <div className="flex items-center justify-between py-3 border-b last:border-b-0">
    <div>
      <p className="font-medium text-[#0F2D50]">{cls.title}</p>
      <p className="text-sm text-gray-500">{cls.school}</p>
    </div>
    <div className="text-right">
      <p className="text-sm font-semibold">{cls.time}</p>
    </div>
  </div>
);

const TodayClasses = ({ dateLabel, classes }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-manrope font-semibold">Class Overview for today</h3>
          <p className="text-sm font-manrope text-gray-500">{dateLabel}</p>
        </div>
        <button className="px-4 py-2 font-kollektif bg-[#F3BC48] rounded-lg text-black font-semibold">
          Export
        </button>
      </div>

      <div>
        {classes.map((c) => (
          <ClassRow key={c.id} cls={c} />
        ))}
      </div>
    </div>
  );
};

export default TodayClasses;
