import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import RevenueCards from "../../components/Financial/RevenueCards";
import RevenuePrograms from "../../components/Financial/RevenuePrograms";
import RevenueAverage from "../../components/Financial/RevenueAverage";
import Header from "../../components/Header";
import adminService from "../../api/services/admin.service";
import programsService from "../../api/services/programs.service";
import classesService from "../../api/services/classes.service";
import toast from "react-hot-toast";

const NAVY = "#173151";
const GOLD = "#F3BC48";
const RED = "#ef4444";
const TEAL = "#0e9f8f";

const RANGE_PRESETS = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
  { value: "last_year", label: "Last year" },
  { value: "all", label: "All time" },
  { value: "custom", label: "Custom range" },
];

const PAYMENT_TYPES = [
  { value: "", label: "All payment types" },
  { value: "ONE_TIME", label: "One-time" },
  { value: "SUBSCRIPTION", label: "Subscription" },
  { value: "INSTALLMENT", label: "Installment" },
];

const toISO = (d) => d.toISOString().split("T")[0];

/** Resolve a preset into {start_date, end_date} (ISO date strings). */
function rangeFromPreset(preset, customFrom, customTo) {
  const today = new Date();
  const iso = toISO(today);
  switch (preset) {
    case "30d":
      return { start_date: toISO(new Date(Date.now() - 30 * 86400000)), end_date: iso };
    case "90d":
      return { start_date: toISO(new Date(Date.now() - 90 * 86400000)), end_date: iso };
    case "month":
      return {
        start_date: toISO(new Date(today.getFullYear(), today.getMonth(), 1)),
        end_date: iso,
      };
    case "year":
      return { start_date: `${today.getFullYear()}-01-01`, end_date: iso };
    case "last_year": {
      const y = today.getFullYear() - 1;
      return { start_date: `${y}-01-01`, end_date: `${y}-12-31` };
    }
    case "all":
      return { start_date: "2020-01-01", end_date: iso };
    case "custom":
      return {
        start_date: customFrom || toISO(new Date(Date.now() - 30 * 86400000)),
        end_date: customTo || iso,
      };
    default:
      return { start_date: toISO(new Date(Date.now() - 30 * 86400000)), end_date: iso };
  }
}

const fmtMoney = (v) =>
  `$${Number(v || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const fmtMoneyFull = (v) =>
  `$${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** "2026-08-04" -> "Aug 4" ; "2026-08" -> "Aug 2026" (no Date() UTC pitfalls). */
function labelForKey(key) {
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [y, m, d] = String(key).split("-");
  const mi = Number(m) - 1;
  if (mi < 0 || mi > 11) return key;
  return d ? `${MONTHS[mi]} ${Number(d)}` : `${MONTHS[mi]} ${y}`;
}

const KpiCard = ({ label, value, sub, accent }) => (
  <div className="bg-[#FFFFFF80] rounded-2xl p-4 shadow">
    <p className="text-xs font-bold uppercase tracking-wide text-gray-500 font-manrope">
      {label}
    </p>
    <p
      className="text-2xl font-semibold font-kollektif mt-1"
      style={{ color: accent || NAVY }}
    >
      {value}
    </p>
    {sub && <p className="text-xs text-gray-500 font-manrope mt-1">{sub}</p>}
  </div>
);

/**
 * Admin Financials Page — dynamic, filterable analytics.
 * All charts below the filter bar re-query the backend when a filter changes.
 */
const Financials = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [classes, setClasses] = useState([]);
  const [programsList, setProgramsList] = useState([]);

  // Filters
  const [preset, setPreset] = useState("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [programId, setProgramId] = useState("");
  const [classId, setClassId] = useState("");
  const [paymentType, setPaymentType] = useState("");

  // One-time page bootstrap (all-time KPI cards + filter options)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [metrics, programsData, classesData] = await Promise.all([
          adminService.getDashboardMetrics(),
          programsService.getAll(),
          classesService.getAll({ limit: 500 }),
        ]);
        setDashboardMetrics(metrics);
        setProgramsList(programsData || []);
        setClasses(classesData.items || classesData || []);
      } catch (error) {
        console.error("Failed to fetch financial data:", error);
        toast.error("Failed to load financial data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Analytics re-fetch whenever a filter changes
  const range = useMemo(
    () => rangeFromPreset(preset, customFrom, customTo),
    [preset, customFrom, customTo],
  );

  useEffect(() => {
    (async () => {
      try {
        setAnalyticsLoading(true);
        const data = await adminService.getFinanceAnalytics({
          ...range,
          ...(classId ? { class_id: classId } : {}),
          ...(programId ? { program_id: programId } : {}),
          ...(paymentType ? { payment_type: paymentType } : {}),
        });
        setAnalytics(data);
      } catch (error) {
        console.error("Failed to fetch finance analytics:", error);
        toast.error("Failed to load analytics");
      } finally {
        setAnalyticsLoading(false);
      }
    })();
  }, [range, classId, programId, paymentType]);

  const classOptions = useMemo(
    () =>
      classes
        .filter((c) => !programId || c.program_id === programId)
        .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
    [classes, programId],
  );

  // Timeseries: group by month when the range spans more than ~3 months
  const chartSeries = useMemo(() => {
    const ts = analytics?.timeseries || [];
    if (!ts.length) return [];
    const spanDays =
      (new Date(range.end_date) - new Date(range.start_date)) / 86400000;
    if (spanDays <= 92) {
      return ts.map((e) => ({ ...e, label: labelForKey(e.date) }));
    }
    const byMonth = {};
    ts.forEach((e) => {
      const key = e.date.slice(0, 7); // YYYY-MM
      const slot = (byMonth[key] ||= {
        date: key,
        label: labelForKey(key),
        one_time: 0,
        subscription: 0,
        installment: 0,
        total: 0,
        refunds: 0,
      });
      slot.one_time += e.one_time || 0;
      slot.subscription += e.subscription || 0;
      slot.installment += e.installment || 0;
      slot.total += e.total || 0;
      slot.refunds += e.refunds || 0;
    });
    return Object.values(byMonth).sort((a, b) => (a.date < b.date ? -1 : 1));
  }, [analytics, range]);

  const typePie = useMemo(() => {
    const t = analytics?.by_type || {};
    return [
      { name: "One-time", value: t.one_time || 0, color: GOLD },
      { name: "Subscription", value: t.subscription || 0, color: NAVY },
      { name: "Installment", value: t.installment || 0, color: TEAL },
    ].filter((s) => s.value > 0);
  }, [analytics]);

  const topClasses = useMemo(
    () => (analytics?.by_class || []).slice(0, 12),
    [analytics],
  );

  const statusChips = useMemo(() => {
    const styles = {
      succeeded: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      refunded: "bg-gray-200 text-gray-700",
    };
    return (analytics?.by_status || []).map((s) => ({
      ...s,
      style: styles[s.status] || "bg-gray-100 text-gray-700",
    }));
  }, [analytics]);

  // All-time headline cards (unfiltered, from dashboard metrics)
  const totals = useMemo(() => {
    if (!dashboardMetrics) return { "24h": 0, "7d": 0, "30d": 0, "90d": 0, YTD: 0 };
    return {
      "24h": dashboardMetrics.revenue_today || 0,
      "7d": dashboardMetrics.revenue_this_week || 0,
      "30d": dashboardMetrics.revenue_this_month || 0,
      "90d": dashboardMetrics.revenue_90d || 0,
      YTD: dashboardMetrics.revenue_ytd || 0,
    };
  }, [dashboardMetrics]);

  const programRevenues = useMemo(() => {
    if (!dashboardMetrics?.programs_with_counts) return [];
    return dashboardMetrics.programs_with_counts
      .map((p) => ({
        id: p.id,
        name: p.name,
        revenue: p.revenue || 0,
        enrollments: p.count || 0,
      }))
      .filter((p) => p.enrollments > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [dashboardMetrics]);

  const avgPerStudent = useMemo(
    () =>
      programRevenues.map((p) => ({
        program: p.name,
        avg: p.enrollments > 0 ? Math.round(p.revenue / p.enrollments) : 0,
      })),
    [programRevenues],
  );

  const handleExportCSV = () => {
    const t = analytics?.totals || {};
    const csvData = [
      ["Financials export", `${range.start_date} to ${range.end_date}`],
      ["Filters", `program=${programId || "all"} class=${classId || "all"} type=${paymentType || "all"}`],
      [""],
      ["Metric", "Value"],
      ["Gross revenue", t.gross ?? 0],
      ["Refunds", t.refunds ?? 0],
      ["Net revenue", t.net ?? 0],
      ["Payments", t.payments ?? 0],
      ["Average payment", t.avg_payment ?? 0],
      ["Active memberships", analytics?.memberships?.active_count ?? 0],
      ["Estimated MRR", analytics?.memberships?.mrr ?? 0],
      [""],
      ["Date", "One-time", "Subscription", "Total", "Refunds"],
      ...(analytics?.timeseries || []).map((e) => [
        e.date,
        e.one_time,
        e.subscription,
        e.total,
        e.refunds,
      ]),
      [""],
      ["Class", "Revenue", "Payments"],
      ...(analytics?.by_class || []).map((c) => [c.class_name, c.revenue, c.payments]),
    ];
    const csvContent = csvData
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financials-${range.start_date}-to-${range.end_date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported successfully");
  };

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

  const selectCls =
    "px-3 py-2 rounded-lg border border-border-light bg-white text-sm font-manrope text-[#173151] focus:outline-none focus:ring-2 focus:ring-[#F3BC48]";

  return (
    <div className="h-full max-sm:pb-20">
      <Header />
      <div className="max-w-9xl mx-6 py-8 space-y-6 max-sm:py-2 max-sm:mx-0">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-fluid-2xl text-[#173151] font-normal font-kollektif flex items-center gap-2">
              Financials
            </h1>
            <p className="text-black font-manrope font-medium text-base">
              Live revenue analytics — filter by period, program, class, or
              payment type.
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-lg border bg-[#FFFFFF80] shadow-sm text-sm font-manrope"
          >
            Export CSV
          </button>
        </div>

        {/* All-time headline cards */}
        <RevenueCards totals={totals} />

        {/* ===== Filters ===== */}
        <div className="bg-[#FFFFFF80] rounded-2xl p-4 shadow flex flex-wrap items-center gap-3">
          <select
            className={selectCls}
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
          >
            {RANGE_PRESETS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          {preset === "custom" && (
            <>
              <input
                type="date"
                className={selectCls}
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
              <span className="text-sm text-gray-500">to</span>
              <input
                type="date"
                className={selectCls}
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </>
          )}
          <select
            className={selectCls}
            value={programId}
            onChange={(e) => {
              setProgramId(e.target.value);
              setClassId("");
            }}
          >
            <option value="">All programs</option>
            {programsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className={selectCls}
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            <option value="">All classes</option>
            {classOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            className={selectCls}
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
          >
            {PAYMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {analyticsLoading && (
            <span className="text-xs text-gray-500 font-manrope animate-pulse">
              Updating…
            </span>
          )}
        </div>

        {/* ===== Filtered KPI cards ===== */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard label="Net revenue" value={fmtMoneyFull(analytics?.totals?.net)} />
          <KpiCard label="Gross" value={fmtMoneyFull(analytics?.totals?.gross)} />
          <KpiCard
            label="Refunds"
            value={fmtMoneyFull(analytics?.totals?.refunds)}
            accent={RED}
          />
          <KpiCard label="Payments" value={analytics?.totals?.payments ?? 0} />
          <KpiCard
            label="Avg payment"
            value={fmtMoneyFull(analytics?.totals?.avg_payment)}
          />
          <KpiCard
            label="Memberships"
            value={analytics?.memberships?.active_count ?? 0}
            sub={`MRR ~ ${fmtMoneyFull(analytics?.memberships?.mrr)}`}
            accent={TEAL}
          />
        </div>

        {/* ===== Revenue over time + type breakdown ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-[#FFFFFF80] rounded-2xl p-5 shadow">
            <h2 className="text-lg font-semibold text-[#173151] mb-4">
              Revenue over time
            </h2>
            {chartSeries.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-gray-500 font-manrope">
                No payments in this period.
              </div>
            ) : (
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer>
                  <AreaChart
                    data={chartSeries}
                    margin={{ left: 8, right: 16, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="4 8" stroke="#eef2f6" />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      tickFormatter={fmtMoney}
                    />
                    <Tooltip formatter={(v, name) => [fmtMoneyFull(v), name]} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="one_time"
                      name="One-time"
                      stackId="rev"
                      stroke={GOLD}
                      fill={GOLD}
                      fillOpacity={0.55}
                    />
                    <Area
                      type="monotone"
                      dataKey="subscription"
                      name="Subscription"
                      stackId="rev"
                      stroke={NAVY}
                      fill={NAVY}
                      fillOpacity={0.55}
                    />
                    <Area
                      type="monotone"
                      dataKey="refunds"
                      name="Refunds"
                      stroke={RED}
                      fill={RED}
                      fillOpacity={0.15}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 bg-[#FFFFFF80] rounded-2xl p-5 shadow">
            <h2 className="text-lg font-semibold text-[#173151] mb-4">
              Revenue by payment type
            </h2>
            {typePie.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-gray-500 font-manrope">
                No data.
              </div>
            ) : (
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={typePie}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={2}
                    >
                      {typePie.map((s) => (
                        <Cell key={s.name} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmtMoneyFull(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {/* Payment status chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {statusChips.map((s) => (
                <span
                  key={s.status}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold font-manrope ${s.style}`}
                  title={fmtMoneyFull(s.amount)}
                >
                  {s.status}: {s.count}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ===== Revenue by class (filtered, payment-based) ===== */}
        <div className="bg-[#FFFFFF80] rounded-2xl p-5 shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-[#173151]">
              Top classes by collected revenue
            </h2>
            <div className="text-sm text-gray-500 font-manrope">
              {range.start_date} → {range.end_date}
            </div>
          </div>
          {topClasses.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-gray-500 font-manrope">
              No class revenue in this period.
            </div>
          ) : (
            <div style={{ width: "100%", height: Math.max(240, topClasses.length * 36) }}>
              <ResponsiveContainer>
                <BarChart
                  layout="vertical"
                  data={topClasses.map((c) => ({
                    name: c.class_name,
                    revenue: c.revenue,
                    payments: c.payments,
                  }))}
                  margin={{ left: 12, right: 24, top: 8, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="4 8"
                    stroke="#eef2f6"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "#6b7280", fontSize: 12 }}
                    tickFormatter={fmtMoney}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={220}
                    tick={{ fill: "#374151", fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(v, name) =>
                      name === "revenue" ? [fmtMoneyFull(v), "Revenue"] : [v, name]
                    }
                  />
                  <Bar dataKey="revenue" fill={NAVY} radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* ===== All-time program breakdowns ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-[#FFFFFF80] rounded-2xl p-5 shadow">
            <RevenuePrograms programs={programRevenues} />
          </div>
          <div className="lg:col-span-7 bg-[#FFFFFF80] rounded-2xl p-5 shadow">
            <RevenueAverage list={avgPerStudent} />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Revenue for a single day from the report's revenue_by_date entry.
 * The API sends the per-payment-type keys alongside a pre-computed "total",
 * so summing every value in the entry would count the day's revenue twice.
 */
function dayRevenue(values) {
  if (!values) return 0;
  if (typeof values.total === "number") return values.total;
  return Object.entries(values)
    .filter(([key]) => key !== "total")
    .reduce((sum, [, val]) => sum + (Number(val) || 0), 0);
}

/**
 * Month index (0-11) for a "YYYY-MM-DD" report key.
 * Read off the string rather than via new Date(): a date-only string parses as
 * UTC midnight, which resolves to the previous month in US timezones.
 */
function monthIndexOf(dateStr) {
  const month = Number(String(dateStr).split("-")[1]);
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month - 1 : -1;
}

/**
 * Monthly revenue totals (Jan-Dec) from the revenue report.
 * Months with no revenue stay 0 -- an empty report renders a flat chart, which
 * is the truth. Kept for the finance report tests and any future callers.
 */
export function generateMonthlyData(revenueReport) {
  const monthlyTotals = Array(12).fill(0);
  if (!revenueReport?.revenue_by_date) return monthlyTotals;

  Object.entries(revenueReport.revenue_by_date).forEach(([dateStr, values]) => {
    const monthIndex = monthIndexOf(dateStr);
    if (monthIndex >= 0) {
      monthlyTotals[monthIndex] += dayRevenue(values);
    }
  });

  return monthlyTotals;
}

export default Financials;
