import { redirect } from "next/navigation";
import AnalyticsPanel from "@/components/dashboard/AnalyticsPanel";
import { getCurrentUserWithProfile } from "@/lib/auth/session";

export default async function AnalyticsPage() {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || !profile) redirect("/");
  if (profile.role !== "analyst" && profile.role !== "admin") redirect("/");
  return <AnalyticsPanel />;
}

