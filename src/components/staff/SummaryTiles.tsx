"use client";

import { AlarmClock, CheckCircle2, ClipboardList, Clock, Flame, HardHat, Inbox, Timer, type LucideIcon } from "lucide-react";
import { createElement } from "react";
import type { Role, Summary } from "@/lib/staff-api";
import { formatHours } from "@/lib/status";

type Tile = { label: string; value: string; icon: LucideIcon; iconClass: string; hint?: string; onClick?: () => void; alert?: boolean };

/** Headline numbers for a portal. Clicking a tile can apply a filter. */
export function SummaryTiles({
  summary,
  role,
  onPick,
}: {
  summary: Summary | undefined;
  role: Role;
  onPick?: (filter: { status?: string; overdue?: boolean; priority?: string }) => void;
}) {
  const v = (n: number | undefined) => (n === undefined ? "—" : n.toLocaleString("en-IN"));
  const s = summary;

  const tiles: Tile[] =
    role === "worker"
      ? [
          { label: "To start", value: v(s?.assigned), icon: ClipboardList, iconClass: "text-st-reported", onClick: () => onPick?.({ status: "assigned" }) },
          { label: "In progress", value: v(s?.inProgress), icon: HardHat, iconClass: "text-st-progress", onClick: () => onPick?.({ status: "in_progress" }) },
          { label: "Overdue", value: v(s?.overdue), icon: AlarmClock, iconClass: "text-rose-500", alert: !!s?.overdue, onClick: () => onPick?.({ overdue: true }) },
          { label: "Resolved this week", value: v(s?.resolvedThisWeek), icon: CheckCircle2, iconClass: "text-st-resolved", onClick: () => onPick?.({ status: "resolved" }) },
        ]
      : [
          { label: "New", value: v(s?.new), hint: "Awaiting review", icon: Inbox, iconClass: "text-st-reported", onClick: () => onPick?.({ status: "new" }) },
          { label: "Awaiting assignment", value: v(s?.pending), icon: ClipboardList, iconClass: "text-accent", onClick: () => onPick?.({ status: "pending" }) },
          {
            label: "In progress",
            value: s ? v(s.assigned + s.inProgress) : "—",
            hint: s ? `${s.assigned} assigned · ${s.inProgress} on site` : undefined,
            icon: Clock,
            iconClass: "text-st-progress",
            onClick: () => onPick?.({ status: "active" }),
          },
          { label: "Overdue", value: v(s?.overdue), icon: AlarmClock, iconClass: "text-rose-500", alert: !!s?.overdue, onClick: () => onPick?.({ overdue: true }) },
          { label: "Critical open", value: v(s?.critical), icon: Flame, iconClass: "text-orange-500", onClick: () => onPick?.({ status: "open", priority: "critical" }) },
          {
            label: "Resolved",
            value: v(s?.resolved),
            hint: s ? `${s.resolvedThisWeek} this week` : undefined,
            icon: CheckCircle2,
            iconClass: "text-st-resolved",
            onClick: () => onPick?.({ status: "resolved" }),
          },
          { label: "Avg. fix time", value: s ? formatHours(s.avgResolutionHours) : "—", icon: Timer, iconClass: "text-violet-400" },
        ];

  return (
    <div className={`grid gap-3 ${role === "worker" ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 md:grid-cols-4 xl:grid-cols-7"}`}>
      {tiles.map((t) => (
        <button
          key={t.label}
          type="button"
          onClick={t.onClick}
          disabled={!t.onClick}
          className={`flex items-center gap-3 rounded-xl border bg-card p-4 text-left transition-colors enabled:hover:border-blue-500/50 ${
            t.alert ? "border-rose-500/50" : "border-line"
          }`}
        >
          <span className={`grid size-10 shrink-0 place-items-center rounded-lg bg-card-2 ${t.iconClass}`}>
            {createElement(t.icon, { className: "size-5" })}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[11px] font-semibold uppercase tracking-wider text-muted">{t.label}</span>
            <span className="block text-2xl font-semibold text-fg">{t.value}</span>
            {t.hint && <span className="block truncate text-xs text-subtle">{t.hint}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
