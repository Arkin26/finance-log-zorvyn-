"use client";

import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import toast from "react-hot-toast";
import StatCard from "@/components/dashboard/StatCard";
import DataTable from "@/components/common/DataTable";
import type { DashboardSummaryResponse } from "@/types/dashboard";
import type { Transaction } from "@/types/transaction";
import { useMemo } from "react";
import type { CategoryBreakdownItem } from "@/types/dashboard";

const MonthlyTrendChart = dynamic(() => import("@/components/dashboard/MonthlyTrendChart"), {
  ssr: false
});

function formatMoney(amount: number) {
  const sign = amount < 0 ? "-" : "";
  const v = Math.abs(amount);
  return `${sign}$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatSigned(amount: number) {
  return `${amount < 0 ? "-" : ""}$${Math.abs(amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function DashboardPage() {
  const query = useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/summary");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to load summary");
      return json.data as DashboardSummaryResponse;
    }
  });

  const categoryColumns = useMemo(() => {
    return [
      { id: "category", header: "Category", render: (row: CategoryBreakdownItem) => row.category },
      { id: "income", header: "Income", render: (row: CategoryBreakdownItem) => formatMoney(row.income), className: "text-right" },
      { id: "expense", header: "Expense", render: (row: CategoryBreakdownItem) => formatMoney(row.expense), className: "text-right" }
    ];
  }, []);

  const recentColumns = useMemo(() => {
    return [
      {
        id: "date",
        header: "Date",
        render: (row: Transaction) => row.date
      },
      {
        id: "category",
        header: "Category",
        render: (row: Transaction) => row.category
      },
      {
        id: "type",
        header: "Type",
        render: (row: Transaction) => (
          <span className={row.type === "income"
            ? "inline-flex items-center gap-1.5 text-emerald-600 font-semibold"
            : "inline-flex items-center gap-1.5 text-red-500 font-semibold"
          }>
            <span>{row.type === "income" ? "↙" : "↗"}</span>
            {row.type === "income" ? "Income" : "Expense"}
          </span>
        )
      },
      {
        id: "amount",
        header: "Amount",
        render: (row: Transaction) => (
          <span className={row.type === "income" ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
            {row.type === "income" ? "+" : "-"}${row.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ),
        className: "text-right"
      }
    ];
  }, []);

  if (query.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Total Income", "Total Expenses", "Net Balance", "Transaction Count"].map(
            (label) => (
              <div
                key={label}
                className="rounded-2xl border border-lavender-200 bg-white shadow-card p-5"
              >
                <div className="h-4 w-40 animate-pulse rounded-lg bg-lavender-200" />
                <div className="mt-3 h-8 w-32 animate-pulse rounded-lg bg-lavender-100" />
              </div>
            )
          )}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-4 lg:col-span-2">
            <div className="h-[320px] animate-pulse rounded-xl bg-lavender-100" />
          </div>
          <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-4">
            <div className="h-64 animate-pulse rounded-xl bg-lavender-100" />
          </div>
        </div>
      </div>
    );
  }

  if (query.error) {
    toast.error((query.error as Error).message);
    return null;
  }

  const summary = query.data;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Income"
          value={formatMoney(summary.totalIncome)}
          tone="lavender"
          icon="↙"
        />
        <StatCard
          label="Total Expenses"
          value={formatMoney(summary.totalExpense)}
          tone="lavender"
          icon="↗"
        />
        <StatCard
          label="Net Balance"
          value={formatSigned(summary.netBalance)}
          icon="💰"
        />
        <StatCard
          label="Transactions"
          value={`${summary.transactionCount}`}
          icon="📋"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Monthly Trend — Statistics panel style */}
        <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-5 lg:col-span-2 hover:shadow-card-hover transition-shadow">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-zinc-900">
                Statistics
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
          {/* Summary cards below chart */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-lavender-50 border border-lavender-200 p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">↙</span>
                <span className="text-xs font-semibold text-zinc-500">Income</span>
              </div>
              <div className="mt-1 text-base font-bold text-zinc-900">{formatMoney(summary.totalIncome)}</div>
            </div>
            <div className="rounded-xl bg-lavender-50 border border-lavender-200 p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">↗</span>
                <span className="text-xs font-semibold text-zinc-500">Expenses</span>
              </div>
              <div className="mt-1 text-base font-bold text-zinc-900">{formatMoney(summary.totalExpense)}</div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-5 hover:shadow-card-hover transition-shadow">
          <div className="mb-3 text-sm font-bold text-zinc-900">
            Category Breakdown
          </div>
          <DataTable
            loading={false}
            data={summary.categoryBreakdown}
            columns={categoryColumns}
            enableVirtualization={false}
            emptyText="No category data"
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-5 hover:shadow-card-hover transition-shadow">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-zinc-900">
              Recent Transactions
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">Last 5 entries</div>
          </div>
        </div>
        <DataTable
          loading={false}
          data={summary.recentTransactions}
          columns={recentColumns}
          enableVirtualization={false}
          emptyText="No transactions yet"
        />
      </div>
    </div>
  );
}
