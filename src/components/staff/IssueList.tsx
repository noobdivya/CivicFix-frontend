"use client";

import { AlarmClock, ChevronLeft, ChevronRight, ImageOff, MapPin, RefreshCw, Search, UserRound } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PriorityBadge, StatusBadge } from "@/components/ui/badges";
import { api, API_URL, type Category } from "@/lib/api";
import { dueLabel } from "@/lib/format";
import { issuePath, PRIORITIES, staffApi, type Department, type IssueFilters, type Role } from "@/lib/staff-api";
import { timeAgo } from "@/lib/status";
import { useApi } from "@/lib/use-api";

const PAGE = 25;

const tabs: Record<Role, { value: string; label: string }[]> = {
  admin: [
    { value: "open", label: "Open" },
    { value: "new", label: "New" },
    { value: "pending", label: "Awaiting assignment" },
    { value: "active", label: "In progress" },
    { value: "resolved", label: "Resolved" },
    { value: "rejected", label: "Rejected" },
    { value: "all", label: "All" },
  ],
  department: [
    { value: "open", label: "Open" },
    { value: "new", label: "New" },
    { value: "pending", label: "Awaiting assignment" },
    { value: "active", label: "In progress" },
    { value: "resolved", label: "Resolved" },
    { value: "rejected", label: "Rejected" },
    { value: "all", label: "All" },
  ],
  worker: [
    { value: "active", label: "Active" },
    { value: "assigned", label: "To start" },
    { value: "in_progress", label: "In progress" },
    { value: "resolved", label: "Resolved" },
    { value: "all", label: "All" },
  ],
};

const selectClass =
  "rounded-lg border border-line bg-card px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-blue-500/50";

/** Filterable, paginated list of issues in the user's scope. */
export function IssueList({
  role,
  filters,
  onFiltersChange,
}: {
  role: Role;
  filters: IssueFilters;
  onFiltersChange: (f: IssueFilters) => void;
}) {
  const [search, setSearch] = useState(filters.q ?? "");
  const key = JSON.stringify(filters);
  const { data, error, reload } = useApi(key, () => staffApi.issues({ ...filters, limit: PAGE }));
  const { data: categories } = useApi<Category[]>("categories", () => api.categories());
  const { data: departments } = useApi<Department[]>(role === "admin" ? "departments" : "none", () =>
    role === "admin" ? staffApi.departments() : Promise.resolve([]),
  );

  // Debounced search.
  useEffect(() => {
    if ((filters.q ?? "") === search) return;
    const t = setTimeout(() => onFiltersChange({ ...filters, q: search || undefined, offset: 0 }), 400);
    return () => clearTimeout(t);
  }, [search, filters, onFiltersChange]);

  const set = (patch: Partial<IssueFilters>) => onFiltersChange({ ...filters, ...patch, offset: 0 });
  const offset = filters.offset ?? 0;
  const total = data?.total ?? 0;

  return (
    <div className="rounded-xl border border-line bg-card">
      <div className="flex gap-1 overflow-x-auto border-b border-line px-2 pt-2">
        {tabs[role].map((t) => {
          const active = (filters.status ?? tabs[role][0].value) === t.value;
          return (
            <button
              key={t.value}
              onClick={() => set({ status: t.value })}
              className={`whitespace-nowrap rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                active ? "border-blue-500 text-fg" : "border-transparent text-muted hover:text-fg"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
        <label className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracking ID, title or location"
            className={`${selectClass} w-full pl-9`}
            aria-label="Search issues"
          />
        </label>
        <select value={filters.priority ?? ""} onChange={(e) => set({ priority: e.target.value || undefined })} className={selectClass} aria-label="Priority">
          <option value="">Any priority</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p[0].toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>
        <select value={filters.category ?? ""} onChange={(e) => set({ category: e.target.value || undefined })} className={selectClass} aria-label="Category">
          <option value="">All categories</option>
          {categories?.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        {role === "admin" && (
          <select
            value={filters.departmentId ?? ""}
            onChange={(e) => set({ departmentId: e.target.value || undefined })}
            className={selectClass}
            aria-label="Department"
          >
            <option value="">All departments</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}
        <select value={filters.sort ?? "newest"} onChange={(e) => set({ sort: e.target.value as IssueFilters["sort"] })} className={selectClass} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="priority">Most urgent first</option>
        </select>
        <label className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-fg">
          <input type="checkbox" checked={!!filters.overdue} onChange={(e) => set({ overdue: e.target.checked || undefined })} className="accent-blue-600" />
          Overdue only
        </label>
        <button onClick={reload} className="grid size-9 place-items-center rounded-lg border border-line text-muted hover:bg-card-2 hover:text-fg" aria-label="Refresh">
          <RefreshCw className="size-4" />
        </button>
      </div>

      {error && <p className="p-6 text-center text-sm text-rose-500">{error}</p>}
      {!data && !error && (
        <div className="space-y-2 p-3" aria-busy="true">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-lg bg-card-2" />
          ))}
        </div>
      )}
      {data && data.items.length === 0 && (
        <p className="p-10 text-center text-sm text-subtle">
          {role === "worker" ? "No tasks here. Use Refresh to check for new assignments." : "No issues match these filters."}
        </p>
      )}

      {data && data.items.length > 0 && (
        <ul className="divide-y divide-line">
          {data.items.map((i) => (
            <li key={i.id}>
              <Link href={issuePath(role, i.id)} className="flex gap-3 p-3 transition-colors hover:bg-card-2/60 sm:gap-4 sm:p-4">
                {i.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- photo served by the API
                  <img src={`${API_URL}${i.photoUrl}`} alt="" className="size-16 shrink-0 rounded-lg object-cover sm:size-20" loading="lazy" />
                ) : (
                  <span className="grid size-16 shrink-0 place-items-center rounded-lg bg-card-2 text-subtle sm:size-20">
                    <ImageOff className="size-5" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted">{i.trackingCode ?? `#${i.id}`}</span>
                    <StatusBadge status={i.status} reviewed={i.reviewed} />
                    {(i.reviewed || i.status !== "reported") && <PriorityBadge priority={i.priority} />}
                    {i.overdue && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                        <AlarmClock className="size-3" /> Overdue
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate font-medium text-fg">{i.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted">
                    <span>{i.category}</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" /> {i.area || i.address}
                    </span>
                    {role === "admin" && i.departmentName && <span>{i.departmentName}</span>}
                    {role !== "worker" && (
                      <span className="inline-flex items-center gap-1">
                        <UserRound className="size-3" /> {i.worker?.name ?? "Unassigned"}
                      </span>
                    )}
                  </p>
                </div>
                <div className="hidden shrink-0 text-right text-xs text-subtle sm:block">
                  <p>{timeAgo(i.createdAt)}</p>
                  {i.dueAt && ["reported", "assigned", "in_progress"].includes(i.status) && (
                    <p className={i.overdue ? "text-rose-500" : ""}>{dueLabel(i.dueAt)}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {data && total > PAGE && (
        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-muted">
          <span>
            {offset + 1}–{Math.min(offset + PAGE, total)} of {total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => onFiltersChange({ ...filters, offset: Math.max(0, offset - PAGE) })}
              className="grid size-8 place-items-center rounded-lg border border-line disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              disabled={offset + PAGE >= total}
              onClick={() => onFiltersChange({ ...filters, offset: offset + PAGE })}
              className="grid size-8 place-items-center rounded-lg border border-line disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
