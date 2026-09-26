import { AlertTriangle, ArrowDown, ArrowUp, Flame } from "lucide-react";
import { createElement } from "react";
import type { IssueStatus } from "@/lib/api";
import type { Priority } from "@/lib/staff-api";
import { groupOf, statusGroups, statusLabel } from "@/lib/status";

export function StatusBadge({ status, reviewed }: { status: IssueStatus; reviewed?: boolean }) {
  const group = statusGroups.find((g) => g.key === groupOf(status));
  const label = status === "reported" && reviewed === false ? "New" : status === "reported" && reviewed ? "Reviewed" : statusLabel[status];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-card-2 px-2 py-0.5 text-xs text-fg">
      <span className={`size-2 rounded-full ${status === "rejected" ? "bg-subtle" : (group?.dotClass ?? "bg-subtle")}`} />
      {label}
    </span>
  );
}

const priorityStyle: Record<Priority, { label: string; className: string; icon: typeof Flame }> = {
  critical: { label: "Critical", className: "bg-rose-500/15 text-rose-600 dark:text-rose-400", icon: Flame },
  high: { label: "High", className: "bg-orange-500/15 text-orange-600 dark:text-orange-400", icon: ArrowUp },
  medium: { label: "Medium", className: "bg-sky-500/15 text-sky-700 dark:text-sky-400", icon: AlertTriangle },
  low: { label: "Low", className: "bg-slate-500/15 text-muted", icon: ArrowDown },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const s = priorityStyle[priority];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}>
      {createElement(s.icon, { className: "size-3" })}
      {s.label}
    </span>
  );
}

export function priorityLabel(p: Priority): string {
  return priorityStyle[p].label;
}
