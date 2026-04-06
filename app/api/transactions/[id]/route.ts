import type { NextRequest } from "next/server";
import { z } from "zod";
import { withRole } from "@/lib/middleware/rbac";
import { ApiResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  updateTransactionSchema
} from "@/lib/validators/transaction.schema";
import type { Transaction } from "@/types/transaction";

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

const uuidSchema = z.string().uuid();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const handler = withRole("viewer", async (req, _ctx) => {
    try {
      const parsedId = uuidSchema.safeParse(params.id);
      if (!parsedId.success) {
        return ApiResponse.error("Invalid UUID format", 400);
      }

      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", parsedId.data)
        .is("deleted_at", null)
        .maybeSingle();

      if (error) return handleApiError(error);
      if (!data) return ApiResponse.error("Not found", 404);
      return ApiResponse.success(normalizeTransaction(data), 200);
    } catch (err) {
      return handleApiError(err);
    }
  });

  return handler(req);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const handler = withRole("admin", async (req, _ctx) => {
    try {
      const parsedId = uuidSchema.safeParse(params.id);
      if (!parsedId.success) {
        return ApiResponse.error("Invalid UUID format", 400);
      }

      const body = await req.json();
      const parsed = updateTransactionSchema.parse(body);
      const keys = Object.keys(parsed);
      if (keys.length === 0) return ApiResponse.error("No fields to update", 400);

      const payload: any = { ...parsed };
      if (parsed.amount !== undefined) {
        payload.amount = parsed.amount.toFixed(2);
      }

      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("transactions")
        .update(payload)
        .eq("id", parsedId.data)
        .select("*")
        .maybeSingle();

      if (error) return handleApiError(error);
      if (!data) return ApiResponse.error("Not found", 404);

      return ApiResponse.success(normalizeTransaction(data), 200);
    } catch (err) {
      return handleApiError(err);
    }
  });

  return handler(req);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const handler = withRole("admin", async (req, _ctx) => {
    try {
      const parsedId = uuidSchema.safeParse(params.id);
      if (!parsedId.success) {
        return ApiResponse.error("Invalid UUID format", 400);
      }

      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("transactions")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", parsedId.data)
        .select("*")
        .maybeSingle();

      if (error) return handleApiError(error);
      if (!data) return ApiResponse.error("Not found", 404);

      return ApiResponse.success({ ok: true }, 200);
    } catch (err) {
      return handleApiError(err);
    }
  });

  return handler(req);
}

