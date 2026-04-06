import type { Transaction } from "@/types/transaction";

export interface CategoryBreakdownItem {
  category: string;
  income: number;
  expense: number;
}

export interface MonthlyTrendItem {
  month: string; // YYYY-MM
  income: number;
  expense: number;
}

export interface DashboardSummaryResponse {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  categoryBreakdown: CategoryBreakdownItem[];
  monthlyTrend: MonthlyTrendItem[];
  recentTransactions: Transaction[];
  transactionCount: number;
}

