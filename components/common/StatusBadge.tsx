"use client";

import type { UserStatus } from "@/types";

export default function StatusBadge({ status }: { status: UserStatus }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
      Inactive
    </span>
  );
}
