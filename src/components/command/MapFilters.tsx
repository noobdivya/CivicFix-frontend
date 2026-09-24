"use client";

import { SlidersHorizontal } from "lucide-react";
import { statusGroups, type StatusGroup } from "@/lib/status";
import { Panel } from "./Panel";

export type Layers = Record<StatusGroup, boolean>;
export type DraftFilters = { category: string; range: "all" | "1" | "7" | "30" };

const ranges: { value: DraftFilters["range"]; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "1", label: "Last 24 hours" },
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
];

const selectClass =
  "mt-1 w-full rounded-md border border-line bg-card-2 px-2.5 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-blue-500/50";

export function MapFilters({
  layers,
  onToggleLayer,
  counts,
  categories,
  draft,
  onDraftChange,
  onApply,
  shown,
  total,
}: {
  layers: Layers;
  onToggleLayer: (key: StatusGroup) => void;
  counts: Record<StatusGroup, number>;
  categories: { slug: string; name: string }[];
  draft: DraftFilters;
  onDraftChange: (d: DraftFilters) => void;
  onApply: () => void;
  shown: number;
  total: number;
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Panel title="Map layers">
        <ul className="space-y-2.5">
          {statusGroups.map((g) => (
            <li key={g.key}>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm text-fg">
                <input
                  type="checkbox"
                  checked={layers[g.key]}
                  onChange={() => onToggleLayer(g.key)}
                  className="size-4 rounded accent-blue-600"
                />
                <span className={`size-2.5 rounded-full ${g.dotClass}`} aria-hidden />
                <span className="flex-1">{g.label}</span>
                <span className="tabular-nums text-muted">{counts[g.key]}</span>
              </label>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Filters" className="flex-1">
        <form
          className="flex flex-1 flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            onApply();
          }}
        >
          <label className="block text-xs font-medium text-muted">
            Category
            <select
              value={draft.category}
              onChange={(e) => onDraftChange({ ...draft, category: e.target.value })}
              className={selectClass}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-muted">
            Reported
            <select
              value={draft.range}
              onChange={(e) => onDraftChange({ ...draft, range: e.target.value as DraftFilters["range"] })}
              className={selectClass}
            >
              {ranges.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="mt-auto inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Apply filters <SlidersHorizontal className="size-4" />
          </button>
          <p className="text-center text-xs text-subtle">
            Showing {shown} of {total} mapped issues
          </p>
        </form>
      </Panel>
    </div>
  );
}
