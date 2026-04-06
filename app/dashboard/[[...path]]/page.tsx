import { redirect } from "next/navigation";

export default async function LegacyDashboardRedirect({
  params
}: {
  params: { path?: string[] };
}) {
  const path = params.path ?? [];
  const target = path.length > 0 ? `/${path.join("/")}` : "/";
  redirect(target);
}

