"use client";

import type { UserRole } from "@/types";

export default function RoleBadge({ role }: { role: UserRole }) {
  if (role === "admin") {
    return (
      <span className="inline-flex items-center rounded-full bg-zinc-900 px-3 py-1 text-xs font-bold text-white">
        Admin
      </span>
    );
  }

  if (role === "analyst") {
    return (
      <span className="inline-flex items-center rounded-full bg-lavender-300/50 px-3 py-1 text-xs font-bold text-zinc-700">
        Analyst
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-lavender-100 px-3 py-1 text-xs font-bold text-zinc-500">
      Viewer
    </span>
  );
}
