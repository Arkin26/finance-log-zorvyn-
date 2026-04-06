import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole, UserStatus } from "@/lib/auth/session";

const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 1,
  analyst: 2,
  admin: 3
};

interface WithRoleContext {
  user: {
    id: string;
    email: string;
  };
  role: UserRole;
}

type Handler = (
  req: NextRequest,
  ctx: WithRoleContext
) => Promise<NextResponse> | NextResponse;

type NextRouteHandler = (
  req: NextRequest,
  routeContext?: any
) => Promise<NextResponse> | NextResponse;

export function withRole(minRole: UserRole, handler: Handler): NextRouteHandler {
  return async (req: NextRequest, routeContext?: any) => {
    const supabase = createSupabaseServerClient();

    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id,email,role,status")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Forbidden: profile not found" },
        { status: 403 }
      );
    }

    const status = profile.status as UserStatus;
    if (status === "inactive") {
      return NextResponse.json(
        { success: false, error: "Forbidden: inactive user" },
        { status: 403 }
      );
    }

    const role = profile.role as UserRole;
    if (ROLE_HIERARCHY[role] < ROLE_HIERARCHY[minRole]) {
      return NextResponse.json(
        { success: false, error: "Forbidden: insufficient role" },
        { status: 403 }
      );
    }

    return handler(req, {
      user: {
        id: user.id,
        email: user.email ?? ""
      },
      role
    });
  };
}

