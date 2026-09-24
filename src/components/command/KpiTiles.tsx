import { CheckCircle2, Clock, FileWarning, Hourglass, Inbox, Percent, type LucideIcon } from "lucide-react";
import type { DashboardData } from "@/lib/api";
import { formatHours } from "@/lib/status";

type Tile = { label: string; value: string; hint: string; icon: LucideIcon; iconClass: string };

export function KpiTiles({ stats }: { stats: DashboardData["stats"] | null }) {
  const v = (n: number | undefined) => (n === undefined ? "—" : n.toLocaleString("en-IN"));
  const rate = stats && stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : null;

  const tiles: Tile[] = [
    { label: "Total issues", value: v(stats?.total), hint: "All reports received", icon: Inbox, iconClass: "text-accent" },
    { label: "Reported", value: v(stats?.reported), hint: "Awaiting review", icon: FileWarning, iconClass: "text-st-reported" },
    { label: "In progress", value: v(stats?.inProgress), hint: "Assigned & being fixed", icon: Clock, iconClass: "text-st-progress" },
    { label: "Resolved", value: v(stats?.resolved), hint: "Fixed and closed", icon: CheckCircle2, iconClass: "text-st-resolved" },
    {
      label: "Avg. resolution",
      value: stats ? formatHours(stats.avgResolutionHours) : "—",
      hint: "Report → fix time",
      icon: Hourglass,
      iconClass: "text-violet-400",
    },
    { label: "Resolution rate", value: rate === null ? "—" : `${rate}%`, hint: "Share of issues fixed", icon: Percent, iconClass: "text-teal-400" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {tiles.map(({ label, value, hint, icon: Icon, iconClass }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-line bg-card p-4">
          <span className={`grid size-11 shrink-0 place-items-center rounded-lg bg-card-2 ${iconClass}`}>
            <Icon className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
            <p className="text-2xl font-semibold text-fg">{value}</p>
            <p className="truncate text-xs text-subtle">{hint}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
