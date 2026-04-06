"use client";

import { ReactNode, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

type TableColumn<T> = {
  id: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
};

type Props<T> = {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyText?: string;
  enableVirtualization?: boolean;
  rowHeightEstimate?: number;
};

export default function DataTable<T>({
  data,
  columns,
  loading,
  emptyText = "No records found",
  enableVirtualization,
  rowHeightEstimate = 52
}: Props<T>) {
  const shouldVirtualize = Boolean(
    enableVirtualization && data.length > 100
  );

  const gridTemplateColumns = useMemo(
    () => `repeat(${columns.length}, minmax(0, 1fr))`,
    [columns.length]
  );

  const parentRef = useRef<HTMLDivElement | null>(null);
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeightEstimate,
    overscan: 8
  });

  if (loading) {
    return (
      <div className="rounded-2xl border border-lavender-200 bg-white shadow-card">
        <div className="p-4">
          <div className="h-4 w-40 animate-pulse rounded-lg bg-lavender-200" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-lavender-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-6 text-sm text-zinc-500">
        {emptyText}
      </div>
    );
  }

  if (!shouldVirtualize) {
    return (
      <div className="rounded-2xl border border-lavender-200 bg-white shadow-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-xs font-bold text-zinc-500 uppercase tracking-wider bg-lavender-50">
              {columns.map((c) => (
                <th key={c.id} className={`px-4 py-3 ${c.className ?? ""}`}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={[
                  "border-t border-lavender-100 transition-colors hover:bg-lavender-50/50",
                  rowIdx % 2 === 0 ? "bg-white" : "bg-lavender-50/30"
                ].join(" ")}
              >
                {columns.map((c) => (
                  <td key={c.id} className={`px-4 py-3 text-sm text-zinc-700 ${c.className ?? ""}`}>
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Virtualized rendering
  const virtualItems = rowVirtualizer.getVirtualItems();

  return (
    <div className="rounded-2xl border border-lavender-200 bg-white shadow-card overflow-hidden">
      <div className="px-4 py-3 bg-lavender-50 text-xs font-bold text-zinc-500 uppercase tracking-wider grid" style={{ gridTemplateColumns }}>
        {columns.map((c) => (
          <div key={c.id} className="truncate">
            {c.header}
          </div>
        ))}
      </div>

      <div ref={parentRef} className="max-h-[520px] overflow-auto">
        <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
          {virtualItems.map((v) => {
            const row = data[v.index];
            const rowIdx = v.index;
            const rowBg = rowIdx % 2 === 0 ? "bg-white" : "bg-lavender-50/30";

            return (
              <div
                key={rowIdx}
                className={`grid items-center px-4 ${rowBg} border-b border-lavender-100`}
                style={{
                  gridTemplateColumns,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${v.start}px)`,
                  height: rowHeightEstimate
                }}
              >
                {columns.map((c) => (
                  <div key={c.id} className={`truncate text-sm text-zinc-700 px-1 ${c.className ?? ""}`}>
                    {c.render(row)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
