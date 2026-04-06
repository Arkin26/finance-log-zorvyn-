"use client";

import RoleBadge from "@/components/common/RoleBadge";
import type { ReactNode } from "react";

export default function Topbar({
  fullName,
  role,
  actions
}: {
  fullName: string;
  role: "viewer" | "analyst" | "admin";
  actions?: ReactNode;
}) {
  const firstName = fullName?.split(" ")[0] ?? "User";

  return (
    <header className="flex items-center justify-between bg-white border-b border-lavender-200 px-6 py-4 md:px-8">
      {/* Left: Greeting */}
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
          Hello, {firstName}!
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          All information about your finance records in the sections below.
        </p>
      </div>

      {/* Right: Search + Badge + Actions */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-2 rounded-full bg-lavender-50 border border-lavender-200 px-4 py-2">
          <svg
            className="h-4 w-4 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span className="text-xs text-zinc-400">Search something</span>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-lavender-50 border border-lavender-200 text-zinc-500 hover:bg-lavender-200 relative"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
        </button>

        <RoleBadge role={role} />

        {/* Profile Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 text-white text-xs font-bold">
          {firstName.charAt(0).toUpperCase()}
        </div>

        {actions ? actions : null}
      </div>
    </header>
  );
}
