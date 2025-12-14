import React, { useMemo, useState } from "react";
import RevenueCards from "../../components/Financial/RevenueCards";
import RevenuePrograms from "../../components/Financial/RevenuePrograms";
import RevenueClassChart from "../../components/Financial/RevenueClassChart";
import RevenueAverage from "../../components/Financial/RevenueAverage";
import Header from "../../components/Header";
import GenericButton from "@/components/GenericButton";

/**
 * Admin Financials Page
 * Place this component in a route e.g. /admin/financials
 */
const Financials = () => {
  // MOCK DATA (replace with API)
  const totals = {
    "24h": 1250,
    "7d": 10230,
    "30d": 45210,
    "90d": 132345,
    YTD: 623450,
  };

  const programRevenues = [
    { id: "A", name: "Program A - Academy", revenue: 120000 },
    { id: "B", name: "Program B - Preschool", revenue: 90000 },
    { id: "C", name: "Program C - League", revenue: 70000 },
    { id: "D", name: "Program D - TDC", revenue: 40000 },
    { id: "E", name: "Facility Booking", revenue: 15000 },
  ];

  // classes for dropdown (per program)
  const classes = [
    {
      id: "c1",
      label: "Mint Hill • U8 After-school",
      monthly: [200, 300, 250, 210, 290, 320, 330, 310, 360, 345, 300, 410],
    },
    {
      id: "c2",
      label: "Greenwood • U10 Skills",
      monthly: [150, 180, 170, 160, 190, 220, 230, 210, 240, 220, 200, 260],
    },
    {
      id: "c3",
      label: "Little Stars • Preschool",
      monthly: [60, 85, 78, 70, 100, 110, 120, 115, 125, 130, 110, 140],
    },
  ];

  const avgPerStudent = [
    { program: "Program A", avg: 120 },
    { program: "Program B", avg: 110 },
    { program: "Program C", avg: 100 },
    { program: "Program D", avg: 90 },
    { program: "Facility Booking", avg: 55 },
  ];

  const [selectedClassId, setSelectedClassId] = useState(classes[0].id);
  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId),
    [selectedClassId]
  );

  return (
    <div className="min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">
      <Header />
      <div className="max-w-9xl mx-6 py-8 space-y-6 max-sm:py-2 max-sm:mx-0">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-fluid-2xl text-[#173151] font-normal font-kollektif flex items-center gap-2">
              Financials
            </h1>
            <p className="text-black font-manrope font-medium text-base">
              Overview of revenue, per-program breakdown, and averages.
            </p>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg border bg-[#FFFFFF80] shadow-sm text-sm">
              Export CSV
            </button>
            <GenericButton> Add Report</GenericButton>

            {/* <button className="px-4 py-2 rounded-lg bg-[#F3BC48] text-black font-semibold">
            </button> */}
          </div>
        </div>

        {/* Totals */}
        <RevenueCards totals={totals} />

        {/* Middle row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left - Programs list (span 4) */}
          <div className="lg:col-span-4 bg-[#FFFFFF80] rounded-2xl p-5 shadow">
            <RevenuePrograms programs={programRevenues} />
          </div>

          {/* Right - Class chart (span 8) */}
          <div className="lg:col-span-8 bg-[#FFFFFF80] rounded-2xl p-5 shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <h2 className="text-lg font-semibold text-[#173151]">
                Revenue per Class
              </h2>
              <div className="flex items-center gap-3">
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-3 py-2 border rounded-lg bg-[#FFFFFF80]"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <div className="text-sm text-gray-500">Monthly</div>
              </div>
            </div>

            <RevenueClassChart monthlyData={selectedClass.monthly} />
          </div>
        </div>

        {/* Bottom - Average per student */}
        <div className="bg-[#FFFFFF80] rounded-2xl p-5 shadow">
          <RevenueAverage list={avgPerStudent} />
        </div>
      </div>
    </div>
  );
};

export default Financials;
