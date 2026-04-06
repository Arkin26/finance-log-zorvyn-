import type { NextRequest } from "next/server";
import { withRole } from "@/lib/middleware/rbac";
import { ApiResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { DashboardSummaryResponse } from "@/types/dashboard";
import type { Transaction } from "@/types/transaction";

export const revalidate = 60;

function toYYYYMM(dateLike: any) {
  const d = new Date(dateLike);
  // Use UTC to avoid month shifts.
  return d.toISOString().slice(0, 7);
}

function normalizeTransaction(row: any): Transaction {
  return {
    id: row.id,
    amount: typeof row.amount === "string" ? Number(row.amount) : row.amount,
    type: row.type,
    category: row.category,
    date: row.date,
    notes: row.notes ?? null,
    created_by: row.created_by ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: row.deleted_at ?? null
  };
}

export async function GET(req: NextRequest) {
  const handler = withRole("viewer", async (_req) => {
    try {
      const supabase = createSupabaseServerClient();

      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const startISO = start.toISOString();

      const [totalsRows, trendRows, recentTx, txCountRow] = await Promise.all([
        supabase
          .from("transaction_summary")
          .select("type,category,total"),
        supabase
          .from("transaction_summary")
          .select("type,total,month")
          .gte("month", startISO),
        supabase
          .from("transactions")
          .select("id,amount,type,category,date,notes,created_by,created_at,updated_at,deleted_at")
          .order("date", { ascending: false })
          .limit(5),
        supabase
          .from("transactions")
          .select("id", { count: "exact", head: true })
      ]);

      const totalsData = (totalsRows.data ?? []) as Array<{
        type: "income" | "expense";
        category: string;
        total: string | number;
      }>;

      const trendData = (trendRows.data ?? []) as Array<{
        type: "income" | "expense";
        total: string | number;
        month: string;
      }>;

      if (totalsRows.error) return handleApiError(totalsRows.error);
      if (trendRows.error) return handleApiError(trendRows.error);
      if (recentTx.error) return handleApiError(recentTx.error);
      if (txCountRow.error) return handleApiError(txCountRow.error);

      let totalIncome = 0;
      let totalExpense = 0;

      const categoryMap = new Map<
        string,
        { income: number; expense: number }
      >();

      for (const row of totalsData) {
        const val = typeof row.total === "string" ? Number(row.total) : row.total;
        if (!categoryMap.has(row.category)) {
          categoryMap.set(row.category, { income: 0, expense: 0 });
        }
        const curr = categoryMap.get(row.category)!;
        if (row.type === "income") {
          totalIncome += val;
          curr.income += val;
        } else {
          totalExpense += val;
          curr.expense += val;
        }
      }

      const netBalance = totalIncome - totalExpense;

      // Build last-6-months timeline.
      const monthKeys: string[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthKeys.push(d.toISOString().slice(0, 7));
      }

      const monthlyMap = new Map<string, { income: number; expense: number }>();
      for (const key of monthKeys) {
        monthlyMap.set(key, { income: 0, expense: 0 });
      }

      for (const row of trendData) {
        const key = toYYYYMM(row.month);
        if (!monthlyMap.has(key)) continue;
        const val = typeof row.total === "string" ? Number(row.total) : row.total;
        const curr = monthlyMap.get(key)!;
        if (row.type === "income") curr.income += val;
        else curr.expense += val;
      }

      const monthlyTrend = monthKeys.map((m) => ({
        month: m,
        income: monthlyMap.get(m)!.income,
        expense: monthlyMap.get(m)!.expense
      }));

      const categoryBreakdown = Array.from(categoryMap.entries()).map(
        ([category, vals]) => ({
          category,
          income: vals.income,
          expense: vals.expense
        })
      );

      const recentTransactions = (recentTx.data ?? []).map(normalizeTransaction);

      const transactionCount = txCountRow.count ?? 0;

      const response: DashboardSummaryResponse = {
        totalIncome,
        totalExpense,
        netBalance,
        categoryBreakdown,
        monthlyTrend,
        recentTransactions,
        transactionCount
      };

      return ApiResponse.success(response, 200);
    } catch (err) {
      return handleApiError(err);
    }
  });

  return handler(req);
}

