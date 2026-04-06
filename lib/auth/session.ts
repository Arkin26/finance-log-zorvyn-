import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UserRole = "viewer" | "analyst" | "admin";
export type UserStatus = "active" | "inactive";

export interface SessionUser {
  id: string;
  email: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
}

export async function getCurrentUserWithProfile() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { user: null, profile: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return {
      user: {
        id: user.id,
        email: user.email ?? ""
      } as SessionUser,
      profile: null
    };
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? ""
    } as SessionUser,
    profile: profile as UserProfile
  };
}

