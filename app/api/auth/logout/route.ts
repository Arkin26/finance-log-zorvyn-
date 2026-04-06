import { ApiResponse } from "@/lib/api-response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = createSupabaseServerClient();

  try {
    await supabase.auth.signOut();
    return ApiResponse.success({ ok: true }, 200);
  } catch (err) {
    return ApiResponse.error(
      err instanceof Error ? err.message : "Internal Server Error",
      500
    );
  }
}

