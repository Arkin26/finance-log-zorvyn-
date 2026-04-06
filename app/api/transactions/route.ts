import type { NextRequest } from "next/server";
import { withRole } from "@/lib/middleware/rbac";
import { ApiResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { transactionQuerySchema } from "@/lib/validators/query.schema";
import type { Transaction, TransactionListResponse } from "@/types/transaction";

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
  const handler = withRole("viewer", async (req, _ctx) => {
    try {
      const url = req.nextUrl;
      const sp = url.searchParams;

      const parsed = transactionQuerySchema.parse({
        type: sp.get("type") ?? undefined,
        category: sp.get("category") ?? undefined,
        date_from: sp.get("date_from") ?? undefined,
        date_to: sp.get("date_to") ?? undefined,
        page: sp.get("page") ?? undefined,
        limit: sp.get("limit") ?? undefined,
        sort_by: sp.get("sort_by") ?? undefined,
        order: sp.get("order") ?? undefined
      });

      const page = parsed.page;
      const limit = parsed.limit;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const supabase = createSupabaseServerClient();

      // When `type` is undefined, Supabase `.eq` is problematic.
      // Rebuild count query with conditional filters.
      let countQuery = supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .is("deleted_at", null);

      if (parsed.type) countQuery = countQuery.eq("type", parsed.type);
      if (parsed.category) countQuery = countQuery.eq("category", parsed.category);
      if (parsed.date_from) countQuery = countQuery.gte("date", parsed.date_from);
      if (parsed.date_to) countQuery = countQuery.lte("date", parsed.date_to);

      const { count: total } = await countQuery;

      const totalPages = total ? Math.ceil(total / limit) : 0;

      if (totalPages !== 0 && page > totalPages) {
        const empty: TransactionListResponse = {
          data: [],
          total: total ?? 0,
          page,
          limit,
          totalPages
        };
        return ApiResponse.success(empty, 200);
      }

      let dataQuery = supabase
        .from("transactions")
        .select("*")
        .is("deleted_at", null);

      if (parsed.type) dataQuery = dataQuery.eq("type", parsed.type);
      if (parsed.category) dataQuery = dataQuery.eq("category", parsed.category);
      if (parsed.date_from) dataQuery = dataQuery.gte("date", parsed.date_from);
      if (parsed.date_to) dataQuery = dataQuery.lte("date", parsed.date_to);

      dataQuery = dataQuery.order(parsed.sort_by, {
        ascending: parsed.order === "asc"
      });

      const { data, error } = await dataQuery.range(from, to);
      if (error) return handleApiError(error);

      const list: TransactionListResponse = {
        data: (data ?? []).map(normalizeTransaction),
        total: total ?? 0,
        page,
        limit,
        totalPages
      };

      return ApiResponse.success(list, 200);
    } catch (err) {
      return handleApiError(err);
    }
  });

  return handler(req);
}

export async function POST(req: NextRequest) {
  const handler = withRole("analyst", async (req, ctx) => {
    try {
      const body = await req.json();
      const { createTransactionSchema } = await import(
        "@/lib/validators/transaction.schema"
      );
      const parsed = createTransactionSchema.parse(body);

      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          amount: parsed.amount.toFixed(2),
          type: parsed.type,
          category: parsed.category,
          date: parsed.date,
          notes: parsed.notes ?? null,
          created_by: ctx.user.id
        })
        .select("*")
        .maybeSingle();

      if (error) return handleApiError(error);
      if (!data) return ApiResponse.error("Not found", 404);

      return ApiResponse.success(normalizeTransaction(data), 201);
    } catch (err) {
      return handleApiError(err);
    }
  });

  return handler(req);
}

