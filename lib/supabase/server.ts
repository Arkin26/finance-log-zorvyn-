import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/auth-helpers-nextjs";

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  // Support either `NEXT_PUBLIC_SUPABASE_ANON_KEY` or the older
  // `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` env var name.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
  if (!supabaseAnonKey || !supabaseUrl) {
    // Helpful error to confirm which env vars Next actually loaded.
    throw new Error(
      `Supabase env missing: URL=${Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)} ANON_KEY=${Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)} PUBLISHABLE_DEFAULT_KEY=${Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
      )}`
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore errors from Server Components
          }
        }
      }
    }
  );
}

