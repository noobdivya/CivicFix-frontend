"use client";

import { useEffect, useRef, useState } from "react";
import type { DashboardData } from "@/lib/api";
import { ChartTooltip, Panel } from "./Panel";

const H = 160;
const PAD = { top: 10, right: 10, bottom: 22, left: 26 };

const series = [
  { key: "reported", label: "Reported", color: "var(--st-reported)" },
  { key: "resolved", label: "Resolved", color: "var(--st-resolved)" },
] as const;

function dayLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/** Line chart: issues reported vs resolved per day over the last 14 days. */
export function TrendChart({ trend }: { trend: DashboardData["trend"] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = trend.length;
  const peak = Math.max(0, ...trend.flatMap((d) => [d.reported, d.resolved]));
  const yMax = Math.max(4, Math.ceil(peak / 4) * 4);
  const innerW = Math.max(10, width - PAD.left - PAD.right);
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / yMax) * innerH;
  const ticks = [0, yMax / 2, yMax];

  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    setHover(Math.min(n - 1, Math.max(0, Math.round((px / rect.width) * (n - 1)))));
  };

  return (
    <Panel
      title="14-day trend"
      action={
        <ul className="flex gap-3 text-xs text-muted">
          {series.map((s) => (
            <li key={s.key} className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded" style={{ background: s.color }} /> {s.label}
            </li>
          ))}
        </ul>
      }
    >
      <div ref={ref} className="relative flex-1">
        <svg width={width} height={H} role="img" aria-label="Issues reported and resolved per day, last 14 days">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={1} />
              <text x={PAD.left - 6} y={y(t) + 3} textAnchor="end" fontSize="10" style={{ fill: "var(--subtle)" }}>
                {t}
              </text>
            </g>
          ))}
          {trend.map((d, i) =>
            (i % 3 === 0 && n - 1 - i >= 2) || i === n - 1 ? (
              <text key={d.date} x={x(i)} y={H - 6} textAnchor={i === n - 1 ? "end" : "middle"} fontSize="10" style={{ fill: "var(--subtle)" }}>
                {i === n - 1 ? "Today" : dayLabel(d.date)}
              </text>
            ) : null,
          )}

          {hover !== null && (
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--subtle)" strokeDasharray="3 3" />
          )}

          {series.map((s) => (
            <g key={s.key}>
              <polyline
                fill="none"
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                style={{ stroke: s.color }}
                points={trend.map((d, i) => `${x(i)},${y(d[s.key])}`).join(" ")}
              />
              {hover !== null && trend[hover] && (
                <circle
                  cx={x(hover)}
                  cy={y(trend[hover][s.key])}
                  r={4}
                  strokeWidth={2}
                  style={{ fill: s.color, stroke: "var(--card)" }}
                />
              )}
            </g>
          ))}

          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onMouseMove={onMove}
            onMouseLeave={() => setHover(null)}
          />
        </svg>

        {hover !== null && trend[hover] && (
          <ChartTooltip x={x(hover)} y={PAD.top + 4}>
            <p className="mb-1 font-medium">{dayLabel(trend[hover].date)}</p>
            {series.map((s) => (
              <p key={s.key} className="flex items-center gap-1.5 text-muted">
                <span className="size-2 rounded-full" style={{ background: s.color }} />
                {s.label}: <span className="tabular-nums text-fg">{trend[hover][s.key]}</span>
              </p>
            ))}
          </ChartTooltip>
        )}
      </div>
    </Panel>
  );
}
