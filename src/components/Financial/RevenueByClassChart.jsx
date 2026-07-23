import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

/**
 * Horizontal bar chart of real revenue per class.
 *
 * Each bar is one class showing ONLY its own revenue (from the backend's
 * `revenue_by_class` breakdown), replacing the old widget that cloned the
 * org-wide monthly total onto every class and labelled them all "Unknown".
 *
 * @param {Array<{class_id, class_name, total_revenue, enrollment_count}>} data
 */
const RevenueByClassChart = ({ data = [] }) => {
  const rows = [...data]
    .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
    .map((c) => ({
      name: c.class_name || "Unnamed class",
      revenue: Number(c.total_revenue || 0),
      enrollments: c.enrollment_count || 0,
    }));

  if (rows.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-gray-500 font-manrope">
        No class revenue yet.
      </div>
    );
  }

  // Give the chart enough height to breathe when there are many classes.
  const height = Math.max(300, rows.length * 38);

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={rows}
          margin={{ left: 12, right: 24, top: 8, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="4 8" stroke="#eef2f6" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "#6b7280", fontSize: 12 }}
            tickFormatter={(v) => `$${v.toLocaleString()}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={180}
            tick={{ fill: "#374151", fontSize: 12 }}
          />
          <Tooltip
            formatter={(v, key) =>
              key === "revenue"
                ? [`$${Number(v).toLocaleString()}`, "Revenue"]
                : [v, key]
            }
          />
          <Bar
            dataKey="revenue"
            radius={[0, 6, 6, 0]}
            fill="#F3BC48"
            barSize={20}
            isAnimationActive={true}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueByClassChart;
