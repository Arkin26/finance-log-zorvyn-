"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import FilterBar from "@/components/dashboard/FilterBar";
import DataTable from "@/components/common/DataTable";
import Modal from "@/components/modals/Modal";
import ConfirmDialog from "@/components/modals/ConfirmDialog";
import type { Transaction, TransactionListResponse } from "@/types/transaction";
import type { UserRole } from "@/types";
import { createTransactionSchema as ctSchema } from "@/lib/validators/transaction.schema";

function formatMoney(amount: number) {
  const sign = amount < 0 ? "-" : "";
  const v = Math.abs(amount);
  return `${sign}$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function readRoleCookie(): UserRole {
  if (typeof document === "undefined") return "viewer";
  const match = document.cookie.match(/(?:^|; )fd-role=([^;]+)/);
  const role = match?.[1] as UserRole | undefined;
  if (role === "viewer" || role === "analyst" || role === "admin") return role;
  return "viewer";
}

export default function TransactionsPage() {
  const queryClient = useQueryClient();

  const [role, setRole] = useState<UserRole>("viewer");

  useEffect(() => {
    setRole(readRoleCookie());
  }, []);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [type, setType] = useState<"income" | "expense" | "all">("all");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filters = useMemo(() => {
    return {
      type: type === "all" ? undefined : type,
      category: category.trim() ? category.trim() : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined
    };
  }, [type, category, dateFrom, dateTo]);

  const queryKey = useMemo(() => {
    return ["transactions", { ...filters, page, limit, sort_by: "date", order: "desc" }];
  }, [filters, page, limit]);

  const listQuery = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.type) params.set("type", filters.type);
      if (filters.category) params.set("category", filters.category);
      if (filters.date_from) params.set("date_from", filters.date_from);
      if (filters.date_to) params.set("date_to", filters.date_to);
      params.set("page", String(page));
      params.set("limit", String(limit));
      params.set("sort_by", "date");
      params.set("order", "desc");

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to load transactions");
      return json.data as TransactionListResponse;
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000
  });

  useEffect(() => {
    if (listQuery.error) {
      toast.error((listQuery.error as Error).message);
    }
  }, [listQuery.error]);

  const canAdd = role === "analyst" || role === "admin";
  const canEdit = role === "admin";

  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const [editing, setEditing] = useState<Transaction | null>(null);

  const [form, setForm] = useState<{
    amount: string;
    type: "income" | "expense";
    category: string;
    date: string;
    notes: string;
  }>({
    amount: "",
    type: "income",
    category: "",
    date: new Date().toISOString().slice(0, 10),
    notes: ""
  });

  useEffect(() => {
    if (!editing) return;
    setForm({
      amount: String(editing.amount.toFixed(2)),
      type: editing.type,
      category: editing.category,
      date: editing.date,
      notes: editing.notes ?? ""
    });
  }, [editing]);

  const columns = useMemo(() => {
    return [
      { id: "date", header: "Date", render: (row: Transaction) => row.date },
      { id: "category", header: "Category", render: (row: Transaction) => row.category },
      {
        id: "type",
        header: "Type",
        render: (row: Transaction) => (
          <span className={row.type === "income"
            ? "inline-flex items-center gap-1.5 text-emerald-600 font-semibold"
            : "inline-flex items-center gap-1.5 text-red-500 font-semibold"
          }>
            <span>{row.type === "income" ? "↙" : "↗"}</span>
            {row.type === "income" ? "Income" : "Expense"}
          </span>
        )
      },
      {
        id: "amount",
        header: "Amount",
        className: "text-right",
        render: (row: Transaction) => {
          const isIncome = row.type === "income";
          return (
            <span className={isIncome ? "text-emerald-600 font-bold" : "text-red-500 font-bold"}>
              {isIncome ? "+" : "-"}{formatMoney(row.amount)}
            </span>
          );
        }
      },
      {
        id: "notes",
        header: "Notes",
        render: (row: Transaction) => (
          <span className="text-zinc-500">{row.notes ?? "-"}</span>
        )
      },
      {
        id: "actions",
        header: "Actions",
        className: "text-right",
        render: (row: Transaction) => (
          <div className="flex justify-end gap-3">
            {canEdit ? (
              <button
                type="button"
                onClick={() => {
                  setEditing(row);
                  setFormOpen(true);
                }}
                className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Edit
              </button>
            ) : null}
            {canEdit ? (
              <button
                type="button"
                onClick={() => {
                  setConfirmId(row.id);
                  setConfirmOpen(true);
                }}
                className="text-sm font-semibold text-zinc-500 hover:text-red-600 transition-colors"
              >
                Delete
              </button>
            ) : null}
          </div>
        )
      }
    ];
  }, [canEdit]);

  const addMutation = useMutation({
    mutationFn: async () => {
      const amount = Number(form.amount);
      const body = {
        amount,
        type: form.type,
        category: form.category.trim(),
        date: form.date,
        notes: form.notes.trim() ? form.notes.trim() : null
      };

      const parsed = ctSchema.parse(body);
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to add transaction");
      return json.data as Transaction;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const prev = queryClient.getQueryData<TransactionListResponse>(queryKey);
      if (!prev) return;

      const amountNumber = Number(form.amount);
      if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
        return { prev };
      }

      const optimistic: Transaction = {
        id: `temp-${Date.now()}`,
        amount: amountNumber,
        type: form.type,
        category: form.category.trim(),
        date: form.date,
        notes: form.notes.trim() ? form.notes.trim() : null,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null
      };

      queryClient.setQueryData<TransactionListResponse>(queryKey, {
        ...prev,
        data: [optimistic, ...prev.data].slice(0, limit)
      });

      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev);
      toast.error((err as Error).message);
    },
    onSuccess: () => {
      toast.success("Transaction added");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  const editMutation = useMutation({
    mutationFn: async () => {
      if (!editing) throw new Error("No transaction selected");
      const amount = Number(form.amount);
      const body = {
        amount,
        type: form.type,
        category: form.category.trim(),
        date: form.date,
        notes: form.notes.trim() ? form.notes.trim() : null
      };
      const parsed = ctSchema.parse(body);
      const res = await fetch(`/api/transactions/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to update transaction");
      return json.data as Transaction;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<TransactionListResponse>(queryKey);
      if (!prev || !editing) return;

      const amountNumber = Number(form.amount);
      if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
        return { prev };
      }

      queryClient.setQueryData<TransactionListResponse>(queryKey, {
        ...prev,
        data: prev.data.map((t) =>
          t.id === editing.id
            ? {
                ...t,
                amount: amountNumber,
                type: form.type,
                category: form.category.trim(),
                date: form.date,
                notes: form.notes.trim() ? form.notes.trim() : null
              }
            : t
        )
      });

      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev);
      toast.error((err as Error).message);
    },
    onSuccess: () => toast.success("Transaction updated"),
    onSettled: () => queryClient.invalidateQueries({ queryKey })
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!confirmId) throw new Error("No transaction selected");
      const res = await fetch(`/api/transactions/${confirmId}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to delete transaction");
      return confirmId;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<TransactionListResponse>(queryKey);
      if (!prev || !confirmId) return;

      queryClient.setQueryData<TransactionListResponse>(queryKey, {
        ...prev,
        data: prev.data.filter((t) => t.id !== confirmId)
      });

      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev);
      toast.error((err as Error).message);
    },
    onSuccess: () => toast.success("Transaction deleted"),
    onSettled: () => queryClient.invalidateQueries({ queryKey })
  });

  const isSubmitting =
    addMutation.isPending ||
    editMutation.isPending ||
    deleteMutation.isPending;

  const inputClass =
    "mt-2 w-full rounded-xl border border-lavender-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-lavender-400/40 transition-shadow";

  return (
    <div className="space-y-4">
      {listQuery.error ? (
        <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-4 text-sm text-red-600">
          {(listQuery.error as Error).message}
        </div>
      ) : null}
      <FilterBar
        type={type}
        category={category}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onChange={(next) => {
          setType(next.type);
          setCategory(next.category);
          setDateFrom(next.dateFrom);
          setDateTo(next.dateTo);
          setPage(1);
        }}
        onClear={() => {
          setType("all");
          setCategory("");
          setDateFrom("");
          setDateTo("");
          setPage(1);
        }}
      />

      <div className="flex items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-lavender-200 shadow-card">
        <div>
          <div className="text-sm font-bold text-zinc-900">Transactions</div>
          <div className="text-xs text-zinc-500 mt-0.5">
            {listQuery.data
              ? `Showing page ${page} · Total ${listQuery.data.total} records`
              : "Loading..."}
          </div>
        </div>

        {canAdd ? (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm({
                amount: "",
                type: "income",
                category: "",
                date: new Date().toISOString().slice(0, 10),
                notes: ""
              });
              setFormOpen(true);
            }}
            className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 transition-colors shadow-md"
          >
            + Add Transaction
          </button>
        ) : (
          <div className="text-xs text-zinc-400">
            Only analyst/admin can add transactions.
          </div>
        )}
      </div>

      <DataTable
        data={listQuery.data?.data ?? []}
        columns={columns}
        loading={listQuery.isLoading || listQuery.isFetching}
        enableVirtualization
        rowHeightEstimate={56}
        emptyText="No transactions match your filters"
      />

      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-lavender-200 shadow-card">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded-xl border border-lavender-200 bg-white px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-lavender-50 disabled:opacity-60 transition-colors"
        >
          Prev
        </button>
        <div className="text-sm font-semibold text-zinc-500">
          Page {page}
          {listQuery.data?.totalPages !== undefined &&
          listQuery.data.totalPages !== null
            ? ` of ${listQuery.data.totalPages}`
            : ""}
        </div>
        <button
          type="button"
          disabled={
            listQuery.data ? page >= listQuery.data.totalPages : false
          }
          onClick={() => setPage((p) => p + 1)}
          className="rounded-xl border border-lavender-200 bg-white px-4 py-2 text-sm font-bold text-zinc-600 hover:bg-lavender-50 disabled:opacity-60 transition-colors"
        >
          Next
        </button>
      </div>

      <Modal
        open={formOpen}
        onClose={() => {
          if (isSubmitting) return;
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? "Edit Transaction" : "Add Transaction"}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setFormOpen(false);
                setEditing(null);
              }}
              className="rounded-xl border border-lavender-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-lavender-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  if (editing) await editMutation.mutateAsync();
                  else await addMutation.mutateAsync();
                  setFormOpen(false);
                  setEditing(null);
                } catch {
                  // errors handled in mutations
                }
              }}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-800 transition-colors disabled:opacity-60 shadow-md"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : editing
                ? "Save Changes"
                : "Create Transaction"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Amount
              </label>
              <input
                type="number"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                className={inputClass}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value as any }))
                }
                className={inputClass}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Category
            </label>
            <input
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              className={inputClass}
              placeholder="Salaries"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Notes (optional)
              </label>
              <input
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                className={inputClass}
                placeholder="e.g. Monthly payment"
              />
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          if (isSubmitting) return;
          setConfirmOpen(false);
          setConfirmId(null);
        }}
        onConfirm={async () => {
          try {
            await deleteMutation.mutateAsync();
            setConfirmOpen(false);
            setConfirmId(null);
          } catch {
            // error handled
          }
        }}
        title="Delete Transaction?"
        description={
          <span className="text-sm text-zinc-600">
            This will soft-delete the transaction.
          </span>
        }
        confirmText={isSubmitting ? "Deleting..." : "Delete"}
        danger
      />
    </div>
  );
}
