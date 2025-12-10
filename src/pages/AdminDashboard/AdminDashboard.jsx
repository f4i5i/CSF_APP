import React from "react";
import StatsSidebar from "../../components/AdminDashboard/StatsSidebar";
import StatsCards from "../../components/AdminDashboard/StatsCard";
import MiddleSummary from "../../components/AdminDashboard/MiddleSummary";
import MembersBarChart from "../../components/AdminDashboard/MembersBarChart";
import TodayClasses from "../../components/AdminDashboard/TodayClasses";
import Header from "../../components/Header";

const AdminDashboard = () => {
  // Mock / demo data (replace with API data)
  const stats = {
    activeStudents: 1280,
    totalStudents: 4200,
    programs: [
      { name: "Program A", count: 1200 },
      { name: "Program B", count: 900 },
      { name: "Program C", count: 700 },
      { name: "Program D", count: 400 },
    ],
    registrations: { "24h": 2, "7d": 20, "30d": 200 },
    cancellations: { "24h": 0, "7d": 1, "30d": 2 },
    subscriptionStudents: 1200,
    shortTermStudents: 600,
    monthlyMembers: [
      { month: "J", value: 50 },
      { month: "F", value: 60 },
      { month: "M", value: 70 },
      { month: "A", value: 80 },
      { month: "M", value: 110 },
      { month: "J", value: 95 },
      { month: "J", value: 120 },
      { month: "A", value: 100 },
      { month: "S", value: 130 },
      { month: "O", value: 140 },
      { month: "N", value: 120 },
      { month: "D", value: 150 },
    ],
  };

  const todayClasses = [
    {
      id: 1,
      title: "U10 After-school",
      school: "Mint Hill Elementary",
      time: "3:00 - 4:00 PM",
    },
    {
      id: 2,
      title: "U12 Skills",
      school: "Greenwood Academy",
      time: "3:15 - 4:15 PM",
    },
    {
      id: 3,
      title: "Preschool Fun",
      school: "Little Stars",
      time: "2:30 - 3:00 PM",
    },
  ];

  return (
     <div className="min-h-screen max-sm:h-fit bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8 max-sm:pb-20">
      <Header />
     <div className="max-w-9xl mx-6 py-8 max-sm:py-2 max-sm:mx-3">
       
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex flex-col gap-2">
            <div className="text-fluid-2xl text-[#173151] font-normal font-kollektif flex items-center gap-2">
              Welcome back, Admin! 👋
            </div>
            {/* locations and active students */}
         <p className="text-black font-manrope font-medium text-base">
                Managing 3 locations • 45 active students
              </p>
            
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold text-[#0F1D2E]">50</p>
            <p className="text-sm font-kollektif text-gray-600">Checked In Today</p>
          </div>
        </div>

       <div className="grid grid-cols-12 gap-6">
  {/* Left Sidebar */}
  <aside className="col-span-12 lg:col-span-3">
    <StatsSidebar stats={stats} />
  </aside>

  {/* Middle column */}
  <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
    {/* Registrations + Cancellations */}
    <StatsCards
      registrations={stats.registrations}
      cancellations={stats.cancellations}
    />

    {/* Subscription + Short Term */}
    <MiddleSummary
      subscriptionStudents={stats.subscriptionStudents}
      shortTermStudents={stats.shortTermStudents}
    />
  </div>

  {/* Right — Monthly Chart */}
  <div className="col-span-12 lg:col-span-3">
    <div className="bg-[#FFFFFF80] rounded-2xl p-4 shadow h-full">
      <h3 className="text-lg font-manrope font-semibold mb-2">Members (monthly)</h3>
      <MembersBarChart data={stats.monthlyMembers} />
    </div>
  </div>
</div>


            {/* Today's classes */}
            <div className="bg-[#FFFFFF80] rounded-2xl p-4 shadow mt-6">
              <TodayClasses dateLabel={new Date().toLocaleDateString()} classes={todayClasses} />
            </div>
         
        </div>
      </div>
   
  );
};

export default AdminDashboard;
