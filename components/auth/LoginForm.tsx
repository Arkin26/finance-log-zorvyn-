"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass = error
    ? "mt-2 w-full rounded-2xl border border-red-500 bg-red-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all font-mono"
    : "mt-2 w-full rounded-2xl border border-lavender-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-lavender-400/40 transition-all font-mono hover:border-lavender-300 shadow-sm";

  return (
    <form
      className="mt-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });

          const json = await res.json().catch(() => null);

          if (!res.ok) {
            const msg =
              json?.error ??
              "Login failed. Please verify your email and password.";
            setError(msg);
            toast.error(msg);
            return;
          }

          toast.success("Signed in");
          router.push("/");
        } catch {
          const msg = "Network error. Please try again.";
          setError(msg);
          toast.error(msg);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Password
            </label>
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Min 8 characters"
            autoComplete="current-password"
            className={inputClass}
          />
        </div>

        {error ? <p className="text-sm font-semibold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-2xl bg-zinc-900 px-4 py-3.5 text-sm font-bold text-white hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/60 disabled:opacity-60 transition-colors shadow-md"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  );
}
