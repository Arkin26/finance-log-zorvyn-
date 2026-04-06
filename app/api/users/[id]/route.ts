import type { NextRequest } from "next/server";
import { z } from "zod";
import { withRole } from "@/lib/middleware/rbac";
import { ApiResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { updateUserSchema } from "@/lib/validators/user.schema";

const uuidSchema = z.string().uuid();

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const handler = withRole("admin", async (req, ctx) => {
    try {
      const parsedId = uuidSchema.safeParse(params.id);
      if (!parsedId.success) return ApiResponse.error("Invalid UUID format", 400);

      const body = await req.json();
      const parsed = updateUserSchema.parse(body);

      const supabase = createSupabaseServerClient();

      const { data: target, error: targetError } = await supabase
        .from("profiles")
        .select("id,role,status,email,full_name")
        .eq("id", parsedId.data)
        .maybeSingle();

      if (targetError) return handleApiError(targetError);
      if (!target) return ApiResponse.error("Not found", 404);

      if (parsed.status === "inactive" && parsedId.data === ctx.user.id) {
        return ApiResponse.error("Cannot deactivate your own account", 400);
      }

      if (parsed.role && target.role === "admin" && parsed.role !== "admin") {
        const { count } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "admin");

        const adminCount = count ?? 0;
        if (adminCount <= 1) {
          return ApiResponse.error("Cannot demote the last admin", 400);
        }
      }

      const { data: updated, error: updateError } = await supabase
        .from("profiles")
        .update({
          ...(parsed.role ? { role: parsed.role } : {}),
          ...(parsed.status ? { status: parsed.status } : {})
        })
        .eq("id", parsedId.data)
        .select("id,email,full_name,role,status,created_at,updated_at")
        .maybeSingle();

      if (updateError) return handleApiError(updateError);
      if (!updated) return ApiResponse.error("Not found", 404);

      return ApiResponse.success(updated, 200);
    } catch (err) {
      return handleApiError(err);
    }
  });

  return handler(req);
}

