import { ApiResponse } from "@/lib/api-response";
import { getCurrentUserWithProfile } from "@/lib/auth/session";

export async function GET() {
  try {
    const { user, profile } = await getCurrentUserWithProfile();
    if (!user) {
      return ApiResponse.error("Unauthorized", 401);
    }
    return ApiResponse.success({ user, profile }, 200);
  } catch (err) {
    return ApiResponse.error(
      err instanceof Error ? err.message : "Internal Server Error",
      500
    );
  }
}

