"use client";

import { KeyRound, Loader2, Plus, UserPlus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { adminApi, staffApi, type Role, type StaffUser, type UserInput } from "@/lib/staff-api";
import { timeAgo } from "@/lib/status";
import { useApi } from "@/lib/use-api";

const roleLabel: Record<Role, string> = { admin: "Admin", department: "Department officer", worker: "Field worker" };
const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-page px-3 py-2 text-sm text-fg placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-blue-500/50";

/** Admin screen to create staff accounts, change roles, reset passwords and deactivate. */
export function UserManagement() {
  const { user: me } = useAuth();
  const { data: users, error, reload } = useApi("users", () => adminApi.users());
  const { data: departments } = useApi("departments", () => staffApi.departments());
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | Role>("all");
  const [rowError, setRowError] = useState<string | null>(null);

  async function update(u: StaffUser, input: UserInput) {
    setRowError(null);
    try {
      await adminApi.updateUser(u.id, input);
      reload();
    } catch (e) {
      setRowError(e instanceof ApiError && Object.keys(e.fields).length ? Object.values(e.fields).join(" ") : (e as Error).message);
    }
  }

  const resetPassword = (u: StaffUser) => {
    const pw = prompt(`New password for ${u.name} (at least 8 characters). They will be signed out everywhere.`);
    if (pw) void update(u, { password: pw });
  };

  const shown = users?.filter((u) => filter === "all" || u.role === filter) ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-fg">Staff accounts</h1>
          <p className="mt-1 text-sm text-muted">Department officers review and assign issues; field workers fix them.</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          {showForm ? <X className="size-4" /> : <UserPlus className="size-4" />} {showForm ? "Close" : "Add staff member"}
        </button>
      </div>

      {showForm && departments && (
        <CreateUserForm
          departments={departments}
          onCreated={() => {
            setShowForm(false);
            reload();
          }}
        />
      )}

      <div className="flex flex-wrap gap-2">
        {(["all", "department", "worker", "admin"] as const).map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`rounded-full border px-3 py-1 text-sm ${filter === r ? "border-blue-500 bg-blue-500/10 text-fg" : "border-line text-muted hover:text-fg"}`}
          >
            {r === "all" ? "Everyone" : roleLabel[r] + "s"}
            {users && <span className="ml-1.5 text-subtle">{r === "all" ? users.length : users.filter((u) => u.role === r).length}</span>}
          </button>
        ))}
      </div>

      {(error || rowError) && <p role="alert" className="text-sm text-rose-500">{error ?? rowError}</p>}

      {/* relative: keeps the sr-only header cell inside the scroll area on narrow screens */}
      <div className="relative overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Department</th>
              <th className="p-3 font-medium">Open tasks</th>
              <th className="p-3 font-medium">Last sign-in</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {!users && !error && (
              <tr>
                <td colSpan={7} className="p-3">
                  <div className="h-40 animate-pulse rounded-lg bg-card-2" />
                </td>
              </tr>
            )}
            {shown.map((u) => (
              <tr key={u.id} className={u.active ? "" : "opacity-60"}>
                <td className="p-3">
                  <p className="font-medium text-fg">{u.name}</p>
                  <p className="text-xs text-muted">{u.email}</p>
                  {u.phone && <p className="text-xs text-subtle">+91 {u.phone}</p>}
                </td>
                <td className="p-3">
                  <select
                    value={u.role}
                    disabled={u.id === me?.id}
                    onChange={(e) => {
                      const role = e.target.value as Role;
                      if (role !== "admin" && !u.departmentId) {
                        setRowError("Set a department first — officers and workers must belong to one.");
                        return;
                      }
                      void update(u, { role });
                    }}
                    className="rounded-md border border-line bg-card px-2 py-1 text-sm text-fg disabled:opacity-60"
                    aria-label={`Role of ${u.name}`}
                  >
                    {(Object.keys(roleLabel) as Role[]).map((r) => (
                      <option key={r} value={r}>
                        {roleLabel[r]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  {u.role === "admin" ? (
                    <span className="text-subtle">All departments</span>
                  ) : (
                    <select
                      value={u.departmentId ?? ""}
                      onChange={(e) => void update(u, { departmentId: Number(e.target.value) })}
                      className="max-w-[14rem] rounded-md border border-line bg-card px-2 py-1 text-sm text-fg"
                      aria-label={`Department of ${u.name}`}
                    >
                      {departments?.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="p-3 tabular-nums text-fg">{u.role === "worker" ? u.openTasks : "—"}</td>
                <td className="p-3 text-muted" title={u.lastLoginAt ?? undefined}>
                  {u.lastLoginAt ? timeAgo(u.lastLoginAt) : `Never · added ${formatDate(u.createdAt)}`}
                </td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs ${u.active ? "bg-st-resolved/15 text-fg" : "bg-card-2 text-muted"}`}>
                    <span className={`size-2 rounded-full ${u.active ? "bg-st-resolved" : "bg-subtle"}`} />
                    {u.active ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => resetPassword(u)} className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs text-fg hover:bg-card-2">
                      <KeyRound className="size-3.5" /> Reset password
                    </button>
                    {u.id !== me?.id && (
                      <button
                        onClick={() => {
                          if (!u.active || confirm(`Deactivate ${u.name}? They will be signed out and can't log in.${u.openTasks ? ` They still have ${u.openTasks} open task(s) — reassign them.` : ""}`)) {
                            void update(u, { active: !u.active });
                          }
                        }}
                        className={`rounded-md border px-2 py-1 text-xs ${u.active ? "border-rose-500/50 text-rose-500 hover:bg-rose-500/10" : "border-line text-fg hover:bg-card-2"}`}
                      >
                        {u.active ? "Deactivate" : "Reactivate"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreateUserForm({ departments, onCreated }: { departments: { id: number; name: string }[]; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "worker" as Role, departmentId: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [general, setGeneral] = useState<string | null>(null);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setGeneral(null);
    try {
      await adminApi.createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        role: form.role,
        departmentId: form.role === "admin" || !form.departmentId ? undefined : Number(form.departmentId),
        password: form.password,
      });
      onCreated();
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) setErrors(err.fields);
      else setGeneral(err instanceof Error ? err.message : "Could not create the account.");
    } finally {
      setBusy(false);
    }
  }

  const err = (k: string) => errors[k] && <span className="mt-1 block text-xs text-rose-500">{errors[k]}</span>;

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border border-line bg-card p-5 sm:grid-cols-2 lg:grid-cols-3">
      <label className="block text-xs font-medium text-muted">
        Full name
        <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputClass} required />
        {err("name")}
      </label>
      <label className="block text-xs font-medium text-muted">
        Email (used to sign in)
        <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputClass} required />
        {err("email")}
      </label>
      <label className="block text-xs font-medium text-muted">
        Mobile <span className="text-subtle">(optional)</span>
        <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputClass} type="tel" />
        {err("phone")}
      </label>
      <label className="block text-xs font-medium text-muted">
        Role
        <select value={form.role} onChange={(e) => set("role", e.target.value)} className={inputClass}>
          {(Object.keys(roleLabel) as Role[]).map((r) => (
            <option key={r} value={r}>
              {roleLabel[r]}
            </option>
          ))}
        </select>
        {err("role")}
      </label>
      {form.role !== "admin" && (
        <label className="block text-xs font-medium text-muted">
          Department
          <select value={form.departmentId} onChange={(e) => set("departmentId", e.target.value)} className={inputClass} required>
            <option value="">Choose…</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          {err("departmentId")}
        </label>
      )}
      <label className="block text-xs font-medium text-muted">
        Temporary password
        <input type="text" value={form.password} onChange={(e) => set("password", e.target.value)} className={inputClass} minLength={8} required autoComplete="new-password" />
        {err("password")}
      </label>
      <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Create account
        </button>
        {general && <p className="text-sm text-rose-500">{general}</p>}
        <p className="text-xs text-subtle">Share the password with the person securely; you can reset it later.</p>
      </div>
    </form>
  );
}
