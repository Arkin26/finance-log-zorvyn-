import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = {
  title: "Login | Finance Dashboard"
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const supabaseSession = cookieStore.get("sb-access-token");

  if (supabaseSession) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef0f8] p-4">
      <div className="w-full max-w-md rounded-3xl border border-lavender-200 bg-white p-8 shadow-card-hover relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-lavender-50 to-transparent pointer-events-none" />

        <div className="relative mb-8 text-center">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-white font-bold text-lg shadow-md">
            FD
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500">
            Sign in to view analytics and manage transactions.
          </p>
        </div>

        <div className="relative">
          <LoginForm />
        </div>

        <div className="relative mt-6 rounded-2xl bg-lavender-50 p-4 border border-lavender-100">
          <p className="text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
            Demo Accounts
          </p>
          <div className="space-y-1 text-xs text-zinc-600 font-mono">
            <div><span className="font-bold">Admin:</span> admin@demo.com / Admin@1234</div>
            <div><span className="font-bold">Analyst:</span> analyst@demo.com / Analyst@1234</div>
            <div><span className="font-bold">Viewer:</span> viewer@demo.com / Viewer@1234</div>
          </div>
        </div>

        <p className="relative mt-6 text-center text-xs font-semibold text-zinc-400">
          Built with Supabase &amp; Next.js ·{" "}
          <Link href="https://supabase.com" className="text-zinc-600 hover:text-zinc-900 underline transition-colors">
            Supabase
          </Link>
        </p>
      </div>
    </div>
  );
}
