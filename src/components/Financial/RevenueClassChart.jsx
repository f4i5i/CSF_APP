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
 * monthlyData: array of 12 numbers (Jan..Dec)
 */
const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

const RevenueClassChart = ({ monthlyData = [] }) => {
  const data = months.map((m, i) => ({
    month: m,
    value: monthlyData[i] ?? 0,
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="4 8" stroke="#eef2f6" />
          <XAxis dataKey="month" tick={{ fill: "#6b7280" }} />
          <YAxis />
          <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
          <Bar
            dataKey="value"
            radius={[6, 6, 6, 6]}
            fill="#F3BC48"
            barSize={22}
            isAnimationActive={true}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueClassChart;
