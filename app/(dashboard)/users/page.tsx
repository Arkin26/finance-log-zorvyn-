import { redirect } from "next/navigation";
import UsersAdminPanel from "@/components/dashboard/UsersAdminPanel";
import { getCurrentUserWithProfile } from "@/lib/auth/session";

export default async function UsersPage() {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || !profile) redirect("/");
  if (profile.role !== "admin") redirect("/");
  return <UsersAdminPanel />;
}

