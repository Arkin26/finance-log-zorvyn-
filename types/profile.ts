export type UserRole = "viewer" | "analyst" | "admin";
export type UserStatus = "active" | "inactive";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

