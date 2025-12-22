import React from "react";
import { BookOpen, Layers } from "lucide-react";

const SummaryBox = ({ title, value, subtitle, icon: Icon }) => (
  <div className="bg-[#FFFFFF80] rounded-2xl p-6 shadow h-full flex flex-col justify-between">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-base font-manrope text-heading-dark font-semibold">{title}</h3>
        <p className="text-sm font-manrope text-neutral-main mt-1">{subtitle}</p>
      </div>
      {Icon && (
        <div className="w-10 h-10 bg-btn-gold/10 rounded-full flex items-center justify-center">
          <Icon className="w-5 h-5 text-btn-gold" />
        </div>
      )}
    </div>
    <div className="mt-4">
      <p className="text-3xl font-kollektif font-medium text-heading-dark">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  </div>
);

const MiddleSummary = ({ totalClasses, totalPrograms }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SummaryBox
        title="Active Classes"
        subtitle="Currently running classes"
        value={totalClasses || 0}
        icon={BookOpen}
      />
      <SummaryBox
        title="Programs"
        subtitle="Active sports programs"
        value={totalPrograms || 0}
        icon={Layers}
      />
    </div>
  );
};

export default MiddleSummary;
