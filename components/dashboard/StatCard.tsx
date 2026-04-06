"use client";

export default function StatCard({
  label,
  value,
  tone,
  icon
}: {
  label: string;
  value: string;
  tone?: "blue" | "zinc" | "lavender";
  icon?: string;
}) {
  const isLavender = tone === "lavender" || tone === "blue";

  return (
    <div
      className={[
        "rounded-2xl p-5 transition-shadow duration-200 hover:shadow-card-hover",
        isLavender
          ? "bg-lavender-300/40 border border-lavender-300/60"
          : "bg-white border border-lavender-200"
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
          {label}
        </div>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/60 text-base">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-3 text-2xl font-bold text-zinc-900 tracking-tight">
        {value}
      </div>
    </div>
  );
}
