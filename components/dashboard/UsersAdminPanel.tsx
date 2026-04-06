"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import DataTable from "@/components/common/DataTable";
import Modal from "@/components/modals/Modal";
import type { Profile } from "@/types/profile";
import type { UserRole, UserStatus } from "@/types";
import RoleBadge from "@/components/common/RoleBadge";
import StatusBadge from "@/components/common/StatusBadge";
import { createUserSchema } from "@/lib/validators/user.schema";

type MeResponse = { user: { id: string; email: string }; profile: Profile | null };

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toISOString().slice(0, 10);
}

export default function UsersAdminPanel() {
  const queryClient = useQueryClient();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to load profile");
      return json.data as MeResponse;
    },
    staleTime: 30_000
  });

  const usersQuery = useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to load users");
      return json.data as Profile[];
    },
    staleTime: 30_000
  });

  const profiles = usersQuery.data ?? [];

  const adminCount = useMemo(
    () => profiles.filter((p) => p.role === "admin").length,
    [profiles]
  );

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    email: "",
    full_name: "",
    role: "viewer" as UserRole,
    status: "active" as UserStatus,
    password: ""
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const parsed = createUserSchema.parse(addForm);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to add user");
      return json.data as Profile;
    },
    onSuccess: () => {
      toast.success("User created");
    },
    onError: (err) => {
      toast.error((err as Error).message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    }
  });

  const patchMutation = useMutation({
    mutationFn: async ({
      id,
      payload
    }: {
      id: string;
      payload: Partial<Pick<Profile, "role" | "status">>;
    }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error ?? "Failed to update user");
      return json.data as Profile;
    },
    onSuccess: () => toast.success("User updated"),
    onError: (err) => toast.error((err as Error).message),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["profiles"] })
  });

  const currentUserId = meQuery.data?.profile?.id ?? meQuery.data?.user?.id;

  const roleColumns = useMemo(() => {
    return [
      {
        id: "full_name",
        header: "Name",
        render: (row: Profile) => (
          <div className="text-sm font-bold text-zinc-900">{row.full_name}</div>
        )
      },
      {
        id: "email",
        header: "Email",
        render: (row: Profile) => (
          <div className="text-sm text-zinc-500">{row.email}</div>
        )
      },
      {
        id: "role",
        header: "Role",
        render: (row: Profile) => (
          <RoleBadge role={row.role} />
        )
      },
      {
        id: "status",
        header: "Status",
        render: (row: Profile) => (
          <StatusBadge status={row.status} />
        )
      },
      {
        id: "created_at",
        header: "Created At",
        render: (row: Profile) => formatDate(row.created_at)
      },
      {
        id: "actions",
        header: "Actions",
        className: "text-right",
        render: (row: Profile) => {
          const disablingRole =
            adminCount === 1 && row.role === "admin";

          return (
            <div className="flex justify-end gap-2">
              <select
                disabled={disablingRole && row.role === "admin"}
                title={
                  disablingRole
                    ? "Cannot demote the last admin."
                    : "Change role"
                }
                value={row.role}
                onChange={(e) => {
                  const nextRole = e.target.value as UserRole;
                  patchMutation.mutate({
                    id: row.id,
                    payload: { role: nextRole }
                  });
                }}
                className="rounded-xl border border-lavender-200 bg-white px-2 py-1.5 text-sm font-semibold text-zinc-700 disabled:opacity-60 focus:ring-2 focus:ring-lavender-400/40 outline-none"
              >
                <option value="viewer">viewer</option>
                <option value="analyst">analyst</option>
                <option value="admin">admin</option>
              </select>

              <select
                disabled={currentUserId === row.id && row.status === "active"}
                title={
                  currentUserId === row.id
                    ? "Cannot deactivate your own account."
                    : "Change status"
                }
                value={row.status}
                onChange={(e) => {
                  const nextStatus = e.target.value as UserStatus;
                  patchMutation.mutate({
                    id: row.id,
                    payload: { status: nextStatus }
                  });
                }}
                className="rounded-xl border border-lavender-200 bg-white px-2 py-1.5 text-sm font-semibold text-zinc-700 disabled:opacity-60 focus:ring-2 focus:ring-lavender-400/40 outline-none"
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
          );
        }
      }
    ];
  }, [adminCount, currentUserId, patchMutation.mutate]);

  const inputClass =
    "mt-2 w-full rounded-xl border border-lavender-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-lavender-400/40 transition-shadow";

  if (meQuery.isLoading || usersQuery.isLoading) {
    return (
      <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-5">
        <div className="h-6 w-52 animate-pulse rounded-lg bg-lavender-200" />
        <div className="mt-4 h-64 animate-pulse rounded-xl bg-lavender-100" />
      </div>
    );
  }

  if (meQuery.error) {
    return (
      <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-5 text-sm text-red-600">
        {(meQuery.error as Error).message}
      </div>
    );
  }

  if (usersQuery.error) {
    return (
      <div className="rounded-2xl border border-lavender-200 bg-white shadow-card p-5 text-sm text-red-600">
        {(usersQuery.error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-lavender-200 shadow-card">
        <div>
          <div className="text-sm font-bold text-zinc-900">
            User Management
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            Admin-only controls for roles and status.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 transition-colors shadow-md"
        >
          + Add User
        </button>
      </div>

      <DataTable
        data={profiles}
        columns={roleColumns}
        loading={false}
        enableVirtualization={false}
        emptyText="No users found"
      />

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add User"
        footer={
          <>
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="rounded-xl border border-lavender-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-lavender-50 transition-colors"
              disabled={addMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={async () => {
                try {
                  await addMutation.mutateAsync();
                  setAddOpen(false);
                  setAddForm({
                    email: "",
                    full_name: "",
                    role: "viewer",
                    status: "active",
                    password: ""
                  });
                } catch {
                  // toast handled by mutation
                }
              }}
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-800 transition-colors disabled:opacity-60 shadow-md"
              disabled={addMutation.isPending}
            >
              {addMutation.isPending ? "Creating..." : "Create"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Email
            </label>
            <input
              value={addForm.email}
              onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Full name
            </label>
            <input
              value={addForm.full_name}
              onChange={(e) => setAddForm((f) => ({ ...f, full_name: e.target.value }))}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Role
              </label>
              <select
                value={addForm.role}
                onChange={(e) => setAddForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                className={inputClass}
              >
                <option value="viewer">viewer</option>
                <option value="analyst">analyst</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Status
              </label>
              <select
                value={addForm.status}
                onChange={(e) => setAddForm((f) => ({ ...f, status: e.target.value as UserStatus }))}
                className={inputClass}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Password
            </label>
            <input
              value={addForm.password}
              onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
              type="password"
              className={inputClass}
              placeholder="Min 8 characters"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
