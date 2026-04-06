"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import DataTable from "@/components/common/DataTable";
import type { DashboardSummaryResponse } from "@/types/dashboard";
import type { CategoryBreakdownItem } from "@/types/dashboard";

const MonthlyTrendChart = dynamic(
  () => import("@/components/dashboard/MonthlyTrendChart"),
  { ssr: false }
);

const CategoryDonutChart = dynamic(
  () => import("@/components/dashboard/CategoryDonutChart"),
  { ssr: false }
);

function formatMoney(amount: number) {
  const sign = amount < 0 ? "-" : "";
  const v = Math.abs(amount);
  return `${sign}$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AnalyticsPanel() {
  const query = useQuery({
    queryKey: ["dashboardSummary", "analytics"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/summary");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to load analytics");
      return json.data as DashboardSummaryResponse;
    }
  });

  const topSpend = useMemo(() => {
    const items = (query.data?.categoryBreakdown ?? []) as CategoryBreakdownItem[];
    return [...items]
      .sort((a, b) => b.expense - a.expense)
      .slice(0, 5);
  }, [query.data]);

  const spendColumns = useMemo(() => {
    return [
      { id: "category", header: "Category", render: (row: CategoryBreakdownItem) => row.category },
      { id: "expense", header: "Spend", className: "text-right font-semibold text-red-500", render: (row: CategoryBreakdownItem) => `-${formatMoney(row.expense)}` }
    ];
  }, []);

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-4 lg:col-span-2">
            <div className="h-[320px] animate-pulse rounded-xl bg-lavender-100" />
          </div>
          <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-4">
            <div className="h-64 animate-pulse rounded-xl bg-lavender-100" />
          </div>
        </div>
        <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-4">
          <div className="h-6 w-60 animate-pulse rounded-lg bg-lavender-200" />
          <div className="mt-4 h-48 animate-pulse rounded-xl bg-lavender-100" />
        </div>
      </div>
    );
  }

  if (query.error) {
    toast.error((query.error as Error).message);
    return null;
  }

  const summary = query.data;

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-5 lg:col-span-2 hover:shadow-card-hover transition-shadow">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-zinc-900">
                Monthly Income vs Expense
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">Last 6 months</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className="h-2.5 w-2.5 rounded-sm bg-zinc-900" /> Income
              </span>
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                <span className="h-2.5 w-2.5 rounded-sm bg-lavender-300" /> Expense
              </span>
            </div>
          </div>
          <MonthlyTrendChart data={summary.monthlyTrend} />
        </div>

        <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-5 hover:shadow-card-hover transition-shadow">
          <div className="mb-3 text-sm font-bold text-zinc-900">
            Category Breakdown
          </div>
          <CategoryDonutChart items={summary.categoryBreakdown} />
        </div>
      </div>

      <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-5 hover:shadow-card-hover transition-shadow">
        <div className="mb-4 text-sm font-bold text-zinc-900">
          Top 5 Categories by Spend
        </div>
        <DataTable
          data={topSpend}
          columns={spendColumns}
          loading={false}
          enableVirtualization={false}
          emptyText="No category spend data"
        />
      </div>
    </div>
  );
}
