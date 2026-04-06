import type { UserRole } from "@/types";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 1,
  analyst: 2,
  admin: 3
};

export function canAccess(minRole: UserRole, role: UserRole) {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minRole];
}

