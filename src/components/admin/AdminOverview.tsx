"use client";

import { AlarmClock, Repeat } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { LiveMap } from "@/components/landing/map/LiveMap";
import { SummaryTiles } from "@/components/staff/SummaryTiles";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { adminApi, staffApi } from "@/lib/staff-api";
import { formatHours } from "@/lib/status";
import { useApi } from "@/lib/use-api";

function Panel({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-xl border border-line bg-card p-4">
      <header className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  );
}

const th = "py-2 pr-3 text-left text-xs font-medium text-muted";
const td = "py-2.5 pr-3 tabular-nums";

/** City-wide overview for administrators. */
export function AdminOverview() {
  const { data: summary } = useApi("summary", () => staffApi.summary());
  const { data: a, error } = useApi("analytics", () => adminApi.analytics());
  const { data: mapIssues } = useApi("map", () => api.mapIssues());

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-fg">City overview</h1>
        <p className="mt-1 text-sm text-muted">Performance across all departments, recurring problem spots and field team output.</p>
      </div>

      <SummaryTiles summary={summary} role="admin" />
      {error && <p className="text-sm text-rose-500">{error}</p>}

      <div className="grid *:min-w-0 gap-5 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <Panel title="Department performance" action={<Link href="/admin/issues" className="text-xs text-accent hover:underline">All issues →</Link>}>
            <div className="-mx-4 overflow-x-auto px-4">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className={th}>Department</th>
                    <th className={th}>Open</th>
                    <th className={th}>Overdue</th>
                    <th className={th}>Resolved</th>
                    <th className={th}>Resolution rate</th>
                    <th className={th}>Avg. fix time</th>
                    <th className={th}>Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {a?.departments.map((d) => {
                    const rate = d.total ? Math.round((d.resolved / d.total) * 100) : null;
                    return (
                      <tr key={d.id}>
                        <td className="py-2.5 pr-3 text-fg">{d.name}</td>
                        <td className={`${td} text-fg`}>{d.open}</td>
                        <td className={`${td} ${d.overdue ? "font-semibold text-rose-500" : "text-muted"}`}>
                          {d.overdue > 0 && <AlarmClock className="mr-1 inline size-3.5" />}
                          {d.overdue}
                        </td>
                        <td className={`${td} text-fg`}>{d.resolved}</td>
                        <td className={td}>
                          {rate === null ? (
                            <span className="text-subtle">—</span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <span className="h-1.5 w-20 overflow-hidden rounded-full bg-card-2">
                                <span className="block h-full rounded-full bg-st-resolved" style={{ width: `${rate}%` }} />
                              </span>
                              <span className="text-fg">{rate}%</span>
                            </span>
                          )}
                        </td>
                        <td className={`${td} text-fg`}>{formatHours(d.avgResolutionHours)}</td>
                        <td className={`${td} text-muted`}>
                          {d.officers} officer{d.officers === 1 ? "" : "s"} · {d.workers} worker{d.workers === 1 ? "" : "s"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!a && !error && <div className="h-48 animate-pulse rounded-lg bg-card-2" />}
          </Panel>
        </div>

        <div className="xl:col-span-2">
          <Panel title="Recurring problem spots (90 days)">
            {a && a.hotspots.length === 0 && (
              <p className="py-6 text-center text-sm text-subtle">No repeat reports yet. Places with 2+ reports of the same problem will appear here.</p>
            )}
            <ul className="divide-y divide-line">
              {a?.hotspots.map((h) => (
                <li key={`${h.area}-${h.category}`} className="flex items-center gap-3 py-2.5">
                  <span className="grid *:min-w-0 size-9 shrink-0 place-items-center rounded-lg bg-orange-500/15 text-orange-500">
                    <Repeat className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">
                      {h.category} · {h.area}
                    </p>
                    <p className="text-xs text-muted">
                      Last reported {formatDate(h.lastReportedAt)} · {h.open} still open
                    </p>
                  </div>
                  <span className="text-lg font-semibold tabular-nums text-fg">{h.count}×</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      <div className="grid *:min-w-0 gap-5 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <div className="h-[460px]">
            <LiveMap issues={mapIssues ?? []} />
          </div>
        </div>
        <div className="space-y-5 xl:col-span-2">
          <Panel title="Resolution time by category">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className={th}>Category</th>
                  <th className={th}>Reports</th>
                  <th className={th}>Resolved</th>
                  <th className={th}>Avg. fix time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {a?.categories.map((c) => (
                  <tr key={c.name}>
                    <td className="py-2 pr-3 text-fg">{c.name}</td>
                    <td className={`${td} text-fg`}>{c.total}</td>
                    <td className={`${td} text-muted`}>{c.resolved}</td>
                    <td className={`${td} text-fg`}>{formatHours(c.avgResolutionHours)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      </div>

      <Panel title="Field workers" action={<Link href="/admin/users" className="text-xs text-accent hover:underline">Manage staff →</Link>}>
        <div className="-mx-4 overflow-x-auto px-4">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className={th}>Name</th>
                <th className={th}>Department</th>
                <th className={th}>Active tasks</th>
                <th className={th}>Resolved</th>
                <th className={th}>Avg. time (assigned → fixed)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {a?.workers.map((w) => (
                <tr key={w.id}>
                  <td className="py-2.5 pr-3 text-fg">{w.name}</td>
                  <td className="py-2.5 pr-3 text-muted">{w.department}</td>
                  <td className={`${td} text-fg`}>{w.active}</td>
                  <td className={`${td} text-fg`}>{w.resolved}</td>
                  <td className={`${td} text-fg`}>{formatHours(w.avgResolutionHours)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {a && a.workers.length === 0 && <p className="py-6 text-center text-sm text-subtle">No field workers yet. Add them under Staff.</p>}
        </div>
      </Panel>
    </div>
  );
}
