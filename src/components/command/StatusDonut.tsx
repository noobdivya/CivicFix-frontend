"use client";

import { useState } from "react";
import type { DashboardData } from "@/lib/api";
import { statusGroups, type StatusGroup } from "@/lib/status";
import { EmptyChart, Panel } from "./Panel";

const GAP = 1; // gap between segments, in pathLength units (~2px)

/** Donut: how all issues split across reported / in progress / resolved. */
export function StatusDonut({ stats }: { stats: DashboardData["stats"] }) {
  const [hover, setHover] = useState<StatusGroup | null>(null);
  const values: Record<StatusGroup, number> = {
    reported: stats.reported,
    progress: stats.inProgress,
    resolved: stats.resolved,
  };
  const sum = values.reported + values.progress + values.resolved;
  const nonZero = statusGroups.filter((g) => values[g.key] > 0).length;

  const pctOf = (k: StatusGroup) => (sum ? (values[k] / sum) * 100 : 0);
  const segments = statusGroups.map((g, i) => ({
    ...g,
    pct: pctOf(g.key),
    // Each segment starts where the previous ones end.
    start: statusGroups.slice(0, i).reduce((acc, prev) => acc + pctOf(prev.key), 0),
  }));

  return (
    <Panel title="Status distribution">
      {sum === 0 ? (
        <EmptyChart>No issues to show yet.</EmptyChart>
      ) : (
        <div className="flex flex-1 flex-wrap items-center justify-center gap-6">
          <svg viewBox="0 0 120 120" className="size-36 shrink-0 -rotate-90" role="img" aria-label="Issues by status">
            {segments.map((s) =>
              s.pct > 0 ? (
                <circle
                  key={s.key}
                  cx="60"
                  cy="60"
                  r="44"
                  fill="none"
                  strokeWidth={hover === s.key ? 20 : 16}
                  pathLength={100}
                  strokeDasharray={`${nonZero > 1 ? Math.max(0.5, s.pct - GAP) : s.pct} 100`}
                  strokeDashoffset={-s.start}
                  style={{ stroke: s.cssVar, opacity: hover && hover !== s.key ? 0.45 : 1, transition: "all .2s" }}
                  onMouseEnter={() => setHover(s.key)}
                  onMouseLeave={() => setHover(null)}
                >
                  <title>{`${s.label}: ${values[s.key]} (${Math.round(s.pct)}%)`}</title>
                </circle>
              ) : null,
            )}
            <text
              x="60"
              y="60"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="22"
              fontWeight="600"
              transform="rotate(90 60 60)"
              style={{ fill: "var(--fg)" }}
            >
              {sum}
            </text>
          </svg>

          <ul className="min-w-[9rem] space-y-2.5 text-sm">
            {segments.map((s) => (
              <li
                key={s.key}
                className="flex items-center gap-2"
                onMouseEnter={() => setHover(s.key)}
                onMouseLeave={() => setHover(null)}
              >
                <span className={`size-2.5 rounded-sm ${s.dotClass}`} />
                <span className="flex-1 text-muted">{s.label}</span>
                <span className="tabular-nums text-fg">{values[s.key]}</span>
                <span className="w-10 text-right tabular-nums text-subtle">{Math.round(s.pct)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}
