import React from "react";

const SummaryBox = ({ title, value, subtitle }) => (
  <div className="bg-[#FFFFFF80] rounded-2xl p-6 shadow h-full flex flex-col justify-between">
    <div>
      <h3 className="text-base font-manrope text-heading-dark font-semibold">{title}</h3>
      <p className="text-sm font-manrope text-neutral-main mt-1">{subtitle}</p>
    </div>
    <div className="mt-4">
      <p className="text-3xl font-kollektif font-medium text-heading-dark">{value}</p>
    </div>
  </div>
);

const MiddleSummary = ({ subscriptionStudents, shortTermStudents }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SummaryBox
        title="Students on subscription"
        subtitle="Active subscription enrollments"
        value={subscriptionStudents}
      />
      <SummaryBox
        title="Students in short-term sessions"
        subtitle="Drop-in & short programs"
        value={shortTermStudents}
      />
    </div>
  );
};

export default MiddleSummary;
