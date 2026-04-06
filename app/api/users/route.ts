import type { NextRequest } from "next/server";
import { withRole } from "@/lib/middleware/rbac";
import { ApiResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-errors";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createUserSchema } from "@/lib/validators/user.schema";
import type { Profile } from "@/types/profile";

export async function GET(req: NextRequest) {
  const handler = withRole("admin", async (_req, _ctx) => {
    try {
      const supabase = createSupabaseServerClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("id,email,full_name,role,status,created_at,updated_at");

      if (error) return handleApiError(error);
      return ApiResponse.success((data ?? []) as Profile[], 200);
    } catch (err) {
      return handleApiError(err);
    }
  });

  return handler(req);
}

export async function POST(req: NextRequest) {
  const handler = withRole("admin", async (req, _ctx) => {
    try {
      const body = await req.json();
      const parsed = createUserSchema.parse(body);

      const supabaseAdmin = createSupabaseAdminClient();
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: parsed.email,
          password: parsed.password,
          email_confirm: true
        });

      if (authError) {
        return handleApiError(authError);
      }
      if (!authData.user) return ApiResponse.error("User not created", 500);

      const userId = authData.user.id;

      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert({
          id: userId,
          email: parsed.email,
          full_name: parsed.full_name,
          role: parsed.role,
          status: parsed.status ?? "active"
        })
        .select("id,email,full_name,role,status,created_at,updated_at")
        .maybeSingle();

      if (profileError) return handleApiError(profileError);
      if (!profile) return ApiResponse.error("Profile not created", 500);

      return ApiResponse.success(profile as Profile, 201);
    } catch (err) {
      return handleApiError(err);
    }
  });

  return handler(req);
}

