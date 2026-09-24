"use client";

import { useState } from "react";
import type { DashboardData } from "@/lib/api";
import { EmptyChart, Panel } from "./Panel";

/** Vertical bars: the areas with the most reports (recurring hotspots). */
export function HotspotBars({ areas }: { areas: DashboardData["topAreas"] }) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...areas.map((a) => a.count));

  return (
    <Panel title="Hotspot areas">
      {areas.length === 0 ? (
        <EmptyChart>No locations reported yet.</EmptyChart>
      ) : (
        <div className="flex flex-1 items-end gap-3 border-b border-line pt-2" style={{ minHeight: 150 }}>
          {areas.map((a) => (
            <div
              key={a.area}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
              onMouseEnter={() => setHover(a.area)}
              onMouseLeave={() => setHover(null)}
              title={`${a.area}: ${a.count} ${a.count === 1 ? "report" : "reports"}`}
            >
              <span className="text-xs tabular-nums text-fg">{a.count}</span>
              <span
                className="w-full max-w-10 rounded-t transition-[height,opacity] duration-500"
                style={{
                  height: `${(a.count / max) * 110}px`,
                  background: "var(--accent)",
                  opacity: hover && hover !== a.area ? 0.45 : 1,
                }}
              />
            </div>
          ))}
        </div>
      )}
      {areas.length > 0 && (
        <div className="mt-1.5 flex gap-3">
          {areas.map((a) => (
            <span key={a.area} className="min-w-0 flex-1 truncate text-center text-[11px] text-muted" title={a.area}>
              {a.area}
            </span>
          ))}
        </div>
      )}
    </Panel>
  );
}
