import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/auth-helpers-nextjs";

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"]
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // `@supabase/auth-helpers-nextjs@0.15.0` removed `createMiddlewareClient`.
  // Use `createServerClient` instead and provide cookie accessors.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Middleware can set cookies via the response.
        res.cookies.set(name, value, options);
      },
      remove(name: string, _options: CookieOptions) {
        res.cookies.delete(name);
      }
    }
  });
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;

  // Allow login endpoint to run for unauthenticated users.
  if (path === "/api/auth/login") {
    return res;
  }

  // Protect everything else under /dashboard and /api.
  if (!user) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  // Best-effort role cookie for client-side gating only.
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("id", user.id)
      .maybeSingle();

    const role =
      profile?.status === "active" ? (profile?.role as string) : "viewer";

    res.cookies.set("fd-role", role, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
  } catch {
    // If role cookie can't be set, API RBAC will still enforce authorization.
  }

  return res;
}

