"use client";

import { useState } from "react";
import type { DashboardData } from "@/lib/api";
import { Panel } from "./Panel";

/** Horizontal bars: number of issues per category (single series, one hue). */
export function CategoryBars({ categories, total }: { categories: DashboardData["categories"]; total: number }) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...categories.map((c) => c.issueCount));

  return (
    <Panel title="Issues by category">
      <ul className="flex flex-1 flex-col justify-center gap-2.5">
        {categories.map((c) => {
          const pct = total ? Math.round((c.issueCount / total) * 100) : 0;
          return (
            <li
              key={c.slug}
              className="grid grid-cols-[minmax(0,10.5rem)_1fr_2rem] items-center gap-3 rounded text-sm"
              onMouseEnter={() => setHover(c.slug)}
              onMouseLeave={() => setHover(null)}
              title={`${c.name}: ${c.issueCount} ${c.issueCount === 1 ? "issue" : "issues"} (${pct}%)`}
            >
              <span className={`truncate ${hover === c.slug ? "text-fg" : "text-muted"}`}>{c.name}</span>
              <span className="h-2.5 overflow-hidden rounded-r bg-card-2">
                <span
                  className="block h-full rounded-r transition-[width,opacity] duration-500"
                  style={{
                    width: `${(c.issueCount / max) * 100}%`,
                    background: "var(--accent)",
                    opacity: hover && hover !== c.slug ? 0.45 : 1,
                  }}
                />
              </span>
              <span className="text-right tabular-nums text-fg">{c.issueCount}</span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
