"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LogoutButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {
          // ignore; redirect anyway
        } finally {
          toast.success("Signed out");
          router.push("/login");
        }
      }}
      className="rounded-xl border border-lavender-200 bg-white px-3 py-2 text-sm font-semibold text-zinc-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
    >
      Sign out
    </button>
  );
}
