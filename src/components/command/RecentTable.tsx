import Link from "next/link";
import type { DashboardData } from "@/lib/api";
import { groupOf, statusGroups, statusLabel, timeAgo } from "@/lib/status";
import { EmptyChart, Panel } from "./Panel";

function StatusBadge({ status }: { status: DashboardData["recentIssues"][number]["status"] }) {
  const group = statusGroups.find((g) => g.key === groupOf(status));
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-card-2 px-2 py-0.5 text-xs text-fg">
      <span className={`size-2 rounded-full ${group?.dotClass ?? "bg-subtle"}`} />
      {statusLabel[status]}
    </span>
  );
}

export function RecentTable({ issues }: { issues: DashboardData["recentIssues"] }) {
  return (
    <Panel title="Recent reports">
      {issues.length === 0 ? (
        <EmptyChart>
          No issues reported yet.{" "}
          <Link href="/report" className="ml-1 font-medium text-accent hover:underline">
            Report one →
          </Link>
        </EmptyChart>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs text-muted">
                <th className="py-2 pr-3 font-medium">Category</th>
                <th className="py-2 pr-3 font-medium">Location</th>
                <th className="py-2 pr-3 font-medium">Issue</th>
                <th className="py-2 pr-3 font-medium">Reported</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {issues.map((i) => (
                <tr key={i.id}>
                  <td className="whitespace-nowrap py-2.5 pr-3 text-fg">{i.category}</td>
                  <td className="whitespace-nowrap py-2.5 pr-3 text-muted">{i.address || "—"}</td>
                  <td className="max-w-[10rem] truncate py-2.5 pr-3 text-fg" title={i.title}>
                    {i.title}
                  </td>
                  <td className="whitespace-nowrap py-2.5 pr-3 tabular-nums text-muted">{timeAgo(i.createdAt)}</td>
                  <td className="py-2.5">
                    <StatusBadge status={i.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
