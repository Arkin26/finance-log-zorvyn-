import { z } from "zod";
import { ApiResponse } from "@/lib/api-response";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().min(1).trim()
});

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return ApiResponse.error(
        "Validation failed",
        400,
        parsed.error.flatten().fieldErrors
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password
    });

    if (error || !data.session) {
      return ApiResponse.error("Invalid credentials", 401);
    }

    return ApiResponse.success({ session: data.session, user: data.user }, 200);
  } catch (err) {
    return ApiResponse.error(
      err instanceof Error ? err.message : "Internal Server Error",
      500
    );
  }
}

