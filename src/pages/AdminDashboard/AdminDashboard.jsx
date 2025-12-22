import React, { useState, useEffect } from "react";
import StatsSidebar from "../../components/AdminDashboard/StatsSidebar";
import StatsCards from "../../components/AdminDashboard/StatsCard";
import MiddleSummary from "../../components/AdminDashboard/MiddleSummary";
import MembersBarChart from "../../components/AdminDashboard/MembersBarChart";
import TodayClasses from "../../components/AdminDashboard/TodayClasses";
import Header from "../../components/Header";
import adminService from "../../api/services/admin.service";
import { useAuth } from "../../context/auth";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardMetrics();
      setMetrics(data);
    } catch (error) {
      console.error("Failed to fetch dashboard metrics:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Transform API data into format expected by components
  const stats = metrics ? {
    activeStudents: metrics.active_enrollments,
    totalStudents: metrics.total_students,
    programs: metrics.programs_with_counts?.map(p => ({
      name: p.name,
      count: p.count
    })) || [],
    registrations: {
      "24h": metrics.registrations_24h,
      "7d": metrics.registrations_7d,
      "30d": metrics.registrations_30d
    },
    cancellations: {
      "24h": metrics.cancellations_24h,
      "7d": metrics.cancellations_7d,
      "30d": metrics.cancellations_30d
    },
    subscriptionStudents: metrics.active_enrollments,
    shortTermStudents: metrics.pending_orders,
    monthlyMembers: metrics.monthly_enrollments || []
  } : {
    activeStudents: 0,
    totalStudents: 0,
    programs: [],
    registrations: { "24h": 0, "7d": 0, "30d": 0 },
    cancellations: { "24h": 0, "7d": 0, "30d": 0 },
    subscriptionStudents: 0,
    shortTermStudents: 0,
    monthlyMembers: []
  };

  const todayClasses = metrics?.today_classes?.map((cls, index) => ({
    id: cls.id || index,
    title: cls.name,
    school: cls.school_name,
    time: cls.start_time && cls.end_time
      ? `${cls.start_time} - ${cls.end_time}`
      : cls.start_time || "TBD",
    enrolled: cls.enrolled_count
  })) || [];

  const userName = user?.first_name || user?.full_name?.split(' ')[0] || 'Admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7]">
        <Header />
        <div className="max-w-9xl sm:px-6 px-3 pb-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-btn-gold"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-sm:h-fit opacity-8 max-sm:pb-20 bg-gradient-to-b from-[#f3f6fb] via-[#dee5f2] to-[#c7d3e7] opacity-8">
      <Header />
      <div className="max-w-9xl sm:px-6 px-3 pb-8 max-sm:py-2 rounded-lg">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex flex-col gap-2">
            <div className="lg:text-[46px] text-[20px] md:text-[30px] text-text-primary font-normal font-kollektif flex items-center gap-2">
              Welcome back, {userName}!
            </div>
            <p className="text-heading-dark font-manrope font-medium md:text-base text-xs">
              Managing {metrics?.total_schools || 0} locations &bull; {metrics?.active_enrollments || 0} active students
            </p>
          </div>
          <div className="text-right">
            <p className="lg:text-[30px] text-[18px] md:text-[24px] font-kollektif font-semibold text-heading-dark">
              {metrics?.checked_in_today || 0}
            </p>
            <p className="sm:text-sm text-xs font-manrope text-neutral-main">
              Checked In Today
            </p>
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

            {/* Summary Cards */}
            <MiddleSummary
              totalClasses={metrics?.total_classes || 0}
              totalPrograms={metrics?.total_programs || 0}
            />
          </div>

          {/* Right — Monthly Chart */}
          <div className="col-span-12 lg:col-span-3">
            <div className="bg-[#FFFFFF80] rounded-2xl p-4 shadow h-full flex flex-col">
              <h3 className="text-lg font-manrope font-semibold mb-2">
                Enrollments (monthly)
              </h3>
              <div className="flex-1">
                <MembersBarChart data={stats.monthlyMembers} />
              </div>
            </div>
          </div>
        </div>

        {/* Today's classes */}
        <div className="bg-[#FFFFFF80] rounded-2xl p-4 shadow mt-6">
          <TodayClasses
            dateLabel={new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
            classes={todayClasses}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
