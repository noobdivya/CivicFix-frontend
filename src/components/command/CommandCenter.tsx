"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { LiveMap } from "@/components/landing/map/LiveMap";
import { api, type Category, type DashboardData, type DashboardFilter, type MapIssue } from "@/lib/api";
import { loadPreferredArea, savePreferredArea } from "@/lib/preferred-area";
import { groupOf, statusGroups, timeAgo, type StatusGroup } from "@/lib/status";
import { ActivityFeed } from "./ActivityFeed";
import { CategoryBars } from "./CategoryBars";
import { DashboardFilters, type Filters } from "./DashboardFilters";
import { HotspotBars } from "./HotspotBars";
import { KpiTiles } from "./KpiTiles";
import { MapFilters, type DraftFilters, type Layers } from "./MapFilters";
import { RecentTable } from "./RecentTable";
import { ResolutionGauge } from "./ResolutionGauge";
import { StatusDonut } from "./StatusDonut";
import { TrendChart } from "./TrendChart";

type AppliedFilters = { category: string; since: number | null };

/**
 * The dashboard at the top of the landing page: KPIs, map, charts and activity.
 * Data is fetched when the page loads, when the dashboard filter changes and
 * when the user clicks Refresh (no automatic background updates).
 * The dashboard filter (area + radius, status, category, time) only changes the
 * statistics; the map keeps its own behaviour and filters.
 */
export function CommandCenter() {
  const [dash, setDash] = useState<Filters>({ area: null, statuses: statusGroups.map((g) => g.key), category: "", sinceDays: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [data, setData] = useState<DashboardData | null>(null);
  const [mapIssues, setMapIssues] = useState<MapIssue[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [layers, setLayers] = useState<Layers>({ reported: true, progress: true, resolved: true });
  const [draft, setDraft] = useState<DraftFilters>({ category: "all", range: "all" });
  const [applied, setApplied] = useState<AppliedFilters>({ category: "all", since: null });

  // Restore the viewer's preferred dashboard area; load category names.
  useEffect(() => {
    Promise.resolve().then(() => {
      const saved = loadPreferredArea();
      if (saved) setDash((d) => ({ ...d, area: saved }));
    });
    api
      .categories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const dashQuery: DashboardFilter = useMemo(
    () => ({
      area: dash.area,
      statuses: dash.statuses,
      category: dash.category || undefined,
      sinceDays: dash.sinceDays || undefined,
    }),
    [dash],
  );

  const onDashChange = (f: Filters) => {
    if (f.area !== dash.area) savePreferredArea(f.area);
    setDash(f);
  };

  const load = useCallback(() => {
    // The dashboard statistics follow the dashboard filter; the map always gets all issues.
    Promise.all([api.dashboard(dashQuery), api.mapIssues()])
      .then(([d, m]) => {
        setData(d);
        setMapIssues(m);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [dashQuery]);

  useEffect(() => {
    load();
  }, [load]);

  const applyFilters = () =>
    setApplied({
      category: draft.category,
      since: draft.range === "all" ? null : Date.now() - Number(draft.range) * 24 * 60 * 60 * 1000,
    });

  // Issues matching the category/date filters (before layer toggles), and the final visible set.
  const { filtered, visible, counts } = useMemo(() => {
    const filtered = mapIssues.filter(
      (i) =>
        (applied.category === "all" || i.categorySlug === applied.category) &&
        (applied.since === null || new Date(i.createdAt).getTime() >= applied.since),
    );
    const counts: Record<StatusGroup, number> = { reported: 0, progress: 0, resolved: 0 };
    for (const i of filtered) {
      const g = groupOf(i.status);
      if (g) counts[g]++;
    }
    const visible = filtered.filter((i) => {
      const g = groupOf(i.status);
      return g !== null && layers[g];
    });
    return { filtered, visible, counts };
  }, [mapIssues, applied, layers]);

  return (
    <section id="home" className="mx-auto w-full max-w-[1600px] scroll-mt-16 space-y-4 px-4 py-5 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">
            Report it. Track it. <span className="text-accent">Get it fixed.</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Overview of civic issues — potholes, streetlights, garbage, water leaks, roads and traffic signals.
          </p>
        </div>
        <p className="flex items-center gap-2 text-xs text-subtle">
          {error ? (
            <>
              <AlertTriangle className="size-3.5 text-st-reported" />
              {data ? "Connection lost — showing last known data." : error}
            </>
          ) : data ? (
            <>
              Updated {timeAgo(data.updatedAt)}
            </>
          ) : (
            "Loading data…"
          )}
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-1 text-muted hover:bg-card-2 hover:text-fg"
          >
            <RefreshCw className="size-3.5" /> Refresh
          </button>
        </p>
      </div>

      <DashboardFilters value={dash} onChange={onDashChange} categories={categories} />
      <p className="-mt-2 px-1 text-xs text-subtle">
        {dash.area ? `Statistics for issues within ${dash.area.radiusKm} km of ${dash.area.name}` : "Statistics for all areas"}
        {dash.statuses.length < statusGroups.length &&
          ` · ${statusGroups
            .filter((g) => dash.statuses.includes(g.key))
            .map((g) => g.label.toLowerCase())
            .join(" & ")} only`}
        . The map below is not affected by these filters.
      </p>

      <KpiTiles stats={data?.stats ?? null} />

      <div className="grid *:min-w-0 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-3 xl:col-span-2">
          <MapFilters
            layers={layers}
            onToggleLayer={(k) => setLayers((l) => ({ ...l, [k]: !l[k] }))}
            counts={counts}
            categories={data?.categories ?? []}
            draft={draft}
            onDraftChange={setDraft}
            onApply={applyFilters}
            shown={visible.length}
            total={mapIssues.length}
          />
        </div>
        <div className="lg:col-span-9 xl:col-span-5">
          <LiveMap issues={visible} />
        </div>
        <div className="grid *:min-w-0 gap-4 sm:grid-cols-2 lg:col-span-12 xl:col-span-5">
          {data ? (
            <>
              <ResolutionGauge stats={data.stats} />
              <CategoryBars categories={data.categories} total={data.stats.total} />
              <HotspotBars areas={data.topAreas} />
              <TrendChart trend={data.trend} />
            </>
          ) : (
            [0, 1, 2, 3].map((i) => <div key={i} className="h-56 animate-pulse rounded-xl bg-card" />)
          )}
        </div>
      </div>

      <div className="grid *:min-w-0 gap-4 lg:grid-cols-12">
        {data ? (
          <>
            <div className="lg:col-span-12 xl:col-span-5">
              <RecentTable issues={data.recentIssues} />
            </div>
            <div className="lg:col-span-5 xl:col-span-3">
              <StatusDonut stats={data.stats} />
            </div>
            <div className="lg:col-span-7 xl:col-span-4">
              <ActivityFeed activity={data.activity} />
            </div>
          </>
        ) : (
          <div className="h-64 animate-pulse rounded-xl bg-card lg:col-span-12" />
        )}
      </div>
      {filtered.length === 0 && mapIssues.length > 0 && (
        <p className="text-center text-xs text-subtle">No mapped issues match the current filters.</p>
      )}
    </section>
  );
}
