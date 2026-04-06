"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { MonthlyTrendItem } from "@/types/dashboard";

export default function MonthlyTrendChart({
  data
}: {
  data: MonthlyTrendItem[];
}) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4} barSize={24}>
          <CartesianGrid stroke="#dde0f3" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: "#71717a", fontSize: 11, fontFamily: '"Geist Mono", monospace' }}
            axisLine={{ stroke: "#dde0f3" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 11, fontFamily: '"Geist Mono", monospace' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              borderColor: "#c5c9f0",
              borderRadius: "0.75rem",
              boxShadow: "0 8px 24px -4px rgba(0,0,0,0.08)",
              fontFamily: '"Geist Mono", monospace',
              fontSize: "12px"
            }}
            labelStyle={{ color: "#18181b", fontWeight: 700 }}
            itemStyle={{ color: "#52525b" }}
          />
          <Bar dataKey="income" fill="#18181b" name="Income" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" fill="#c5c9f0" name="Expense" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
