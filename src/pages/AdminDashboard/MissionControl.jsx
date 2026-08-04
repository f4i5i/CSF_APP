import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import {
  Users,
  CheckCircle2,
  CalendarDays,
  Bell,
  ArrowRight,
} from "lucide-react";
import Header from "../../components/Header";
import adminService from "../../api/services/admin.service";
import toast from "react-hot-toast";

const NAVY = "#173151";
const GOLD = "#F3BC48";
const TEAL = "#0e9f8f";
const RED = "#ef4444";

const fmtMoney = (v) =>
  `$${Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const Delta = ({ pct }) => {
  if (pct === null || pct === undefined) return null;
  const up = pct >= 0;
  return (
    <span
      className={`text-xs font-semibold font-manrope ${
        up ? "text-green-600" : "text-red-600"
      }`}
    >
      {up ? "▲" : "▼"} {Math.abs(pct)}%
    </span>
  );
};

const GlanceCard = ({ icon: Icon, label, value, sub, delta, accent }) => (
  <div className="bg-[#FFFFFF80] rounded-2xl p-4 shadow flex items-start gap-3">
    <div
      className="p-2.5 rounded-xl shrink-0"
      style={{ backgroundColor: `${accent}22` }}
    >
      <Icon className="w-5 h-5" style={{ color: accent }} />
    </div>
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-gray-500 font-manrope">
        {label}
      </p>
      <p className="text-2xl font-semibold font-kollektif text-[#173151]">
        {value}
      </p>
      <div className="flex items-center gap-2">
        <Delta pct={delta} />
        {sub && <p className="text-xs text-gray-500 font-manrope">{sub}</p>}
      </div>
    </div>
  </div>
);

const SectionCard = ({ title, right, children, className = "" }) => (
  <div className={`bg-[#FFFFFF80] rounded-2xl p-5 shadow ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-[#173151]">{title}</h2>
      {right}
    </div>
    {children}
  </div>
);

const SEVERITY_STYLES = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-gray-100 text-gray-600",
};

/**
 * Mission Control — the owner's landing page. Everything is generated from
 * live system state; the Action Inbox is derived, never manually curated.
 */
const MissionControl = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const mc = await adminService.getMissionControl();
        setData(mc);
      } catch (error) {
        console.error("Failed to load mission control:", error);
        toast.error("Failed to load Mission Control");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const momentumSeries = useMemo(() => {
    if (!data?.momentum) return [];
    const dayLabel = (iso) => {
      const [, m, d] = iso.split("-");
      return `${Number(m)}/${Number(d)}`;
    };
    return (data.momentum.this_week || []).map((p, i) => ({
      label: dayLabel(p.day),
      thisWeek: p.count,
      lastWeek: data.momentum.last_week?.[i]?.count ?? 0,
    }));
  }, [data]);

  const financePie = useMemo(() => {
    const t = data?.finance?.by_type || {};
    return [
      { name: "One-time", value: t.one_time || 0, color: GOLD },
      { name: "Subscription", value: t.subscription || 0, color: NAVY },
      { name: "Installment", value: t.installment || 0, color: TEAL },
    ].filter((s) => s.value > 0);
  }, [data]);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  if (loading) {
    return (
      <div className="h-full">
        <Header />
        <div className="max-w-9xl mx-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-btn-gold"></div>
          </div>
        </div>
      </div>
    );
  }

  const g = data?.glance || {};

  return (
    <div className="h-full max-sm:pb-20">
      <Header />
      <div className="max-w-9xl mx-6 py-8 space-y-6 max-sm:py-2 max-sm:mx-0">
        {/* Page header with CSF branding */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/images/logo.png"
              alt="Carolina Soccer Factory"
              className="w-14 h-14 object-contain max-sm:hidden"
            />
            <div>
              <h1 className="text-fluid-2xl text-[#173151] font-normal font-kollektif">
                Mission Control
              </h1>
              <p className="text-black font-manrope font-medium text-base">
                Welcome back! Here's what's happening today.
              </p>
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-[#FFFFFF80] shadow-sm text-sm font-manrope text-[#173151] font-semibold max-sm:hidden">
            {todayLabel}
          </div>
        </div>

        {/* Today at a Glance */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <GlanceCard
            icon={Users}
            label="Active enrollments"
            value={g.active_enrollments ?? 0}
            delta={g.new_week_delta_pct}
            sub={`${g.new_this_week ?? 0} new this week`}
            accent={NAVY}
          />
          <GlanceCard
            icon={CheckCircle2}
            label="Check-ins today"
            value={g.checkins_today ?? 0}
            delta={g.checkins_delta_pct}
            sub="vs yesterday"
            accent={TEAL}
          />
          <GlanceCard
            icon={CalendarDays}
            label="Classes today"
            value={g.classes_today ?? 0}
            accent={GOLD}
          />
          <GlanceCard
            icon={Bell}
            label="Needs attention"
            value={g.actions_count ?? 0}
            sub={g.actions_count ? "items in the inbox" : "all clear"}
            accent={g.actions_count ? RED : TEAL}
          />
        </div>

        {/* Schedule | Coach status | Momentum */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <SectionCard
            title="Daily class schedule"
            className="xl:col-span-5"
            right={
              <Link
                to="/calendar"
                className="text-sm text-[#173151] font-semibold font-manrope hover:text-[#F3BC48] flex items-center gap-1"
              >
                Full schedule <ArrowRight className="w-4 h-4" />
              </Link>
            }
          >
            {(data?.schedule || []).length === 0 ? (
              <p className="text-sm text-gray-500 font-manrope py-6 text-center">
                No classes scheduled today.
              </p>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {data.schedule.map((c) => (
                  <div
                    key={c.class_id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-white/40"
                  >
                    <div className="text-xs font-semibold font-manrope text-[#173151] w-[86px] shrink-0">
                      {c.start_time || "TBD"}
                      {c.end_time ? (
                        <span className="block text-gray-400">
                          – {c.end_time}
                        </span>
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#173151] font-manrope truncate">
                        {c.name}
                      </p>
                      <p className="text-xs text-gray-500 font-manrope truncate">
                        {c.coach || "No coach"} ·{" "}
                        {c.location || "No location"} · {c.enrolled}/
                        {c.capacity}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                        c.checkins > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.checkins > 0 ? `${c.checkins} checked in` : "not started"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Coach check-in status" className="xl:col-span-3">
            {(data?.coach_status || []).length === 0 ? (
              <p className="text-sm text-gray-500 font-manrope py-6 text-center">
                No coaches scheduled today.
              </p>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {data.coach_status.map((c) => {
                  const pct = c.classes
                    ? Math.round((c.started / c.classes) * 100)
                    : 0;
                  return (
                    <div
                      key={c.coach}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-white/40"
                    >
                      <span
                        className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                          pct === 100
                            ? "bg-green-100 text-green-700"
                            : pct > 0
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-600"
                        }`}
                      >
                        {pct}%
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#173151] font-manrope truncate">
                          {c.coach}
                        </p>
                        <p className="text-xs text-gray-500 font-manrope">
                          {c.started} of {c.classes} class
                          {c.classes === 1 ? "" : "es"} started
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Program momentum" className="xl:col-span-4">
            <p className="text-xs text-gray-500 font-manrope mb-2">
              New enrollments — this week vs last week
            </p>
            <div style={{ width: "100%", height: 170 }}>
              <ResponsiveContainer>
                <LineChart
                  data={momentumSeries}
                  margin={{ left: 0, right: 12, top: 4, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="4 8" stroke="#eef2f6" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                  />
                  <YAxis
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    allowDecimals={false}
                    width={28}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="thisWeek"
                    name="This week"
                    stroke={NAVY}
                    strokeWidth={2.5}
                    dot={{ r: 2.5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="lastWeek"
                    name="Last week"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-xl bg-white/70 border border-white/40">
                <p className="text-xs text-gray-500 font-manrope">
                  New enrollments (7d)
                </p>
                <p className="text-lg font-semibold text-[#173151] font-kollektif">
                  {data?.momentum?.new_enrollments_7d ?? 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/70 border border-white/40">
                <p className="text-xs text-gray-500 font-manrope">
                  Active memberships
                </p>
                <p className="text-lg font-semibold text-[#173151] font-kollektif">
                  {data?.momentum?.active_memberships ?? 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/70 border border-white/40">
                <p className="text-xs text-gray-500 font-manrope">Waitlist</p>
                <p className="text-lg font-semibold text-[#173151] font-kollektif">
                  {data?.momentum?.waitlist ?? 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/70 border border-white/40">
                <p className="text-xs text-gray-500 font-manrope">
                  Retention rate
                </p>
                <p
                  className="text-lg font-semibold font-kollektif"
                  style={{
                    color:
                      (data?.momentum?.retention_pct ?? 100) >= 85 ? TEAL : RED,
                  }}
                >
                  {data?.momentum?.retention_pct != null
                    ? `${data.momentum.retention_pct}%`
                    : "—"}
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Action inbox | Financial snapshot */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <SectionCard
            title="Action inbox"
            className="xl:col-span-7"
            right={
              <span className="text-xs text-gray-500 font-manrope">
                Generated live from system state
              </span>
            }
          >
            {(data?.actions || []).length === 0 ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="text-sm font-manrope text-green-700 font-semibold">
                  All clear — nothing needs your attention right now.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {data.actions.map((a, i) => (
                  <Link
                    key={i}
                    to={a.link}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-white/40 hover:border-[#F3BC48] transition-colors"
                  >
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase shrink-0 ${
                        SEVERITY_STYLES[a.severity] || SEVERITY_STYLES.low
                      }`}
                    >
                      {a.severity}
                    </span>
                    <p className="text-sm font-manrope text-[#173151] flex-1">
                      {a.label}
                    </p>
                    <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Financial snapshot"
            className="xl:col-span-5"
            right={
              <Link
                to="/financials"
                className="text-sm text-[#173151] font-semibold font-manrope hover:text-[#F3BC48] flex items-center gap-1"
              >
                Full financials <ArrowRight className="w-4 h-4" />
              </Link>
            }
          >
            <p className="text-xs text-gray-500 font-manrope">
              Collected in {data?.finance?.month || "this month"}
            </p>
            <p className="text-3xl font-semibold text-[#173151] font-kollektif mb-2">
              {fmtMoney(data?.finance?.total)}
            </p>
            {financePie.length === 0 ? (
              <p className="text-sm text-gray-500 font-manrope py-6 text-center">
                No payments yet this month.
              </p>
            ) : (
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={financePie}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={82}
                      paddingAngle={2}
                    >
                      {financePie.map((s) => (
                        <Cell key={s.name} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) =>
                        `$${Number(v).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}`
                      }
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default MissionControl;
