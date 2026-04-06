"use client";

export default function FilterBar({
  type,
  category,
  dateFrom,
  dateTo,
  onChange,
  onClear
}: {
  type: "income" | "expense" | "all";
  category: string;
  dateFrom: string;
  dateTo: string;
  onChange: (next: {
    type: "income" | "expense" | "all";
    category: string;
    dateFrom: string;
    dateTo: string;
  }) => void;
  onClear: () => void;
}) {
  const inputClass =
    "mt-2 w-full rounded-xl border border-lavender-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-lavender-400/40 transition-shadow";

  return (
    <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Type
          </label>
          <select
            value={type}
            onChange={(e) =>
              onChange({
                type: e.target.value as any,
                category,
                dateFrom,
                dateTo
              })
            }
            className={inputClass}
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Category
          </label>
          <input
            value={category}
            onChange={(e) =>
              onChange({ type, category: e.target.value, dateFrom, dateTo })
            }
            placeholder="e.g. Salaries"
            className={`${inputClass} placeholder:text-zinc-400`}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Date From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) =>
              onChange({
                type,
                category,
                dateFrom: e.target.value,
                dateTo
              })
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Date To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) =>
              onChange({
                type,
                category,
                dateFrom,
                dateTo: e.target.value
              })
            }
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-zinc-400">
          Filters apply instantly.
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl bg-lavender-100 px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-lavender-200 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
