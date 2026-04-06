"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/types";
import { useMemo } from "react";

const NAV_ITEMS: Array<{
  href: string;
  label: string;
  minRole: UserRole;
  icon: string;
}> = [
  { href: "/", label: "Home", minRole: "viewer", icon: "🏠" },
  { href: "/transactions", label: "Transactions", minRole: "viewer", icon: "💳" },
  { href: "/analytics", label: "Analytics", minRole: "analyst", icon: "📊" },
  { href: "/users", label: "Users", minRole: "admin", icon: "👥" }
];

function roleRank(role: UserRole) {
  if (role === "viewer") return 1;
  if (role === "analyst") return 2;
  return 3;
}

export default function DashboardSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();

  const items = useMemo(() => {
    return NAV_ITEMS.filter((i) => roleRank(role) >= roleRank(i.minRole));
  }, [role]);

  return (
    <aside className="hidden h-screen w-[220px] flex-col bg-white border-r border-lavender-200 px-4 py-6 md:flex shadow-sidebar">
      {/* Logo */}
      <div className="mb-8 px-2">
        <div className="inline-flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-white font-bold text-sm">
            FD
          </div>
          <div className="text-sm font-bold text-zinc-900 tracking-tight">Finance</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold",
                "transition-all duration-200",
                active
                  ? "bg-zinc-900 text-white shadow-md"
                  : "text-zinc-500 hover:bg-lavender-100 hover:text-zinc-900"
              ].join(" ")}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Settings link at bottom */}
      <div className="mt-auto pt-4 border-t border-lavender-200">
        <div className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-zinc-400">
          <span className="text-base">⚙️</span>
          <span>Settings</span>
        </div>
      </div>
    </aside>
  );
}
