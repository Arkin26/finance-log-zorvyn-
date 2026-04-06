"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import type { CategoryBreakdownItem } from "@/types/dashboard";

const COLORS = ["#18181b", "#3f3f46", "#71717a", "#a8ace6", "#c5c9f0", "#dde0f3", "#eef0f8"];

export default function CategoryDonutChart({
  items
}: {
  items: CategoryBreakdownItem[];
}) {
  const data = items
    .map((i) => ({ name: i.category, value: i.expense }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-lavender-200 bg-white p-4 text-sm text-zinc-500">
        No spend data.
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              borderColor: "#c5c9f0",
              borderRadius: "0.75rem",
              boxShadow: "0 8px 24px -4px rgba(0,0,0,0.08)",
              fontFamily: '"Geist Mono", monospace',
              fontSize: "12px"
            }}
            itemStyle={{ color: "#52525b" }}
            labelStyle={{ color: "#18181b", fontWeight: 700 }}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, idx) => (
              <Cell
                key={entry.name}
                fill={COLORS[idx % COLORS.length]}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
