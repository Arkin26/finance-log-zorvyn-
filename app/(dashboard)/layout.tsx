import { redirect } from "next/navigation";
import { getCurrentUserWithProfile } from "@/lib/auth/session";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import Topbar from "@/components/dashboard/Topbar";
import LogoutButton from "@/components/dashboard/LogoutButton";
import type { UserRole } from "@/types";
import QueryProvider from "@/components/providers/QueryProvider";

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await getCurrentUserWithProfile();
  if (!user || !profile) {
    redirect("/login");
  }

  const role = profile.role as UserRole;

  return (
    <QueryProvider>
      <div className="flex min-h-screen bg-[#eef0f8]">
        <DashboardSidebar role={role} />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar
            fullName={profile.full_name}
            role={role}
            actions={<LogoutButton />}
          />
          <main className="flex-1 px-6 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </QueryProvider>
  );
}
