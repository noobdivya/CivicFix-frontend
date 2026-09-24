import type { DashboardData } from "@/lib/api";
import { EmptyChart, Panel } from "./Panel";

/** Semicircle gauge: share of all issues that have been resolved. */
export function ResolutionGauge({ stats }: { stats: DashboardData["stats"] }) {
  const rate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : null;
  const arc = "M 20 100 A 80 80 0 0 1 180 100";

  return (
    <Panel title="Resolution overview">
      {rate === null ? (
        <EmptyChart>No issues yet — the gauge fills as issues get resolved.</EmptyChart>
      ) : (
        <figure className="flex flex-1 flex-col items-center justify-center">
          <svg viewBox="0 0 200 118" className="w-full max-w-[240px]" role="img" aria-label={`${rate}% of issues resolved`}>
            <path d={arc} fill="none" stroke="var(--card-2)" strokeWidth="14" strokeLinecap="round" />
            <path
              d={arc}
              fill="none"
              style={{ stroke: "var(--st-resolved)" }}
              strokeWidth="14"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${rate} 100`}
            />
            <text x="100" y="88" textAnchor="middle" fontSize="30" fontWeight="600" style={{ fill: "var(--fg)" }}>
              {rate}%
            </text>
            <text x="20" y="116" textAnchor="middle" fontSize="10" style={{ fill: "var(--subtle)" }}>
              0
            </text>
            <text x="180" y="116" textAnchor="middle" fontSize="10" style={{ fill: "var(--subtle)" }}>
              100
            </text>
          </svg>
          <figcaption className="mt-1 text-center text-xs text-muted">
            <span className="font-medium text-fg">{stats.resolved}</span> of {stats.total} issues resolved
          </figcaption>
        </figure>
      )}
    </Panel>
  );
}
