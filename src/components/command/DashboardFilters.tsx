"use client";

import { Check, ChevronDown, Globe2, Loader2, LocateFixed, MapPin, Search, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { api, ApiError, type Category, type SearchResult } from "@/lib/api";
import { DEFAULT_RADIUS_KM, RADIUS_OPTIONS, type PreferredArea } from "@/lib/preferred-area";
import { statusGroups, type StatusGroup } from "@/lib/status";

export type Filters = {
  area: PreferredArea | null;
  statuses: StatusGroup[];
  category: string;
  sinceDays: number; // 0 = any time
};

const selectClass =
  "rounded-lg border border-line bg-card px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50";

/** Area picker: search a place, use current location, or go back to all areas. */
function AreaPicker({ area, onChange }: { area: PreferredArea | null; onChange: (a: PreferredArea | null) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [busy, setBusy] = useState<"search" | "locate" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const radius = area?.radiusKm ?? DEFAULT_RADIUS_KM;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (a: PreferredArea | null) => {
    onChange(a);
    setOpen(false);
    setResults(null);
    setQuery("");
    setError(null);
  };

  async function search(e: FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setBusy("search");
    setError(null);
    try {
      const r = await api.searchPlaces(query.trim());
      setResults(r);
      if (r.length === 0) setError("No places found. Try a locality or city name.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Search failed. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setError("Your browser can't share location.");
      return;
    }
    setBusy("locate");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        let name = "My location";
        try {
          const place = await api.reverseGeocode(coords.latitude, coords.longitude);
          name = [place.area, place.city].filter(Boolean).join(", ") || name;
        } catch {
          // keep the generic name
        }
        setBusy(null);
        choose({ name, lat: coords.latitude, lng: coords.longitude, radiusKm: radius });
      },
      (err) => {
        setBusy(null);
        setError(err.code === err.PERMISSION_DENIED ? "Location access was denied. Search for your area instead." : "Couldn't detect your location.");
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 5 * 60 * 1000 },
    );
  }

  return (
    <div ref={boxRef} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex w-full min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors sm:w-auto sm:max-w-xs ${
          area ? "border-blue-500/60 bg-blue-500/10 text-fg" : "border-line bg-card text-fg hover:bg-card-2"
        }`}
      >
        {area ? <MapPin className="size-4 shrink-0 text-accent" /> : <Globe2 className="size-4 shrink-0 text-muted" />}
        <span className="min-w-0 flex-1 truncate">{area ? area.name : "All areas"}</span>
        <ChevronDown className="size-4 shrink-0 text-muted" />
      </button>

      {open && (
        <div className="fixed inset-x-4 top-20 z-[1200] rounded-xl border border-line bg-card p-3 shadow-2xl sm:absolute sm:inset-x-auto sm:left-0 sm:top-12 sm:w-96">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Choose your area</p>
          <form onSubmit={search} className="flex gap-2">
            <label className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Locality or city, e.g. Karol Bagh"
                className="w-full rounded-lg border border-line bg-page py-2 pl-9 pr-3 text-sm text-fg placeholder:text-subtle focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                aria-label="Search for an area"
                autoFocus
              />
            </label>
            <button type="submit" disabled={busy !== null || query.trim().length < 2} className="rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {busy === "search" ? <Loader2 className="size-4 animate-spin" /> : "Search"}
            </button>
          </form>

          {results && results.length > 0 && (
            <ul className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-line">
              {results.map((r) => (
                <li key={`${r.lat},${r.lng}`}>
                  <button
                    type="button"
                    onClick={() => choose({ name: r.name, lat: r.lat, lng: r.lng, radiusKm: radius })}
                    className="flex w-full gap-2 px-3 py-2 text-left hover:bg-card-2"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-fg">{r.name}</span>
                      <span className="block truncate text-xs text-subtle">{r.displayName}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {error && <p className="mt-2 text-xs text-amber-500">{error}</p>}

          <div className="mt-3 grid gap-1 border-t border-line pt-3">
            <button type="button" onClick={useMyLocation} disabled={busy !== null} className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-fg hover:bg-card-2 disabled:opacity-60">
              {busy === "locate" ? <Loader2 className="size-4 animate-spin text-accent" /> : <LocateFixed className="size-4 text-accent" />}
              Use my current location
            </button>
            <button type="button" onClick={() => choose(null)} className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-fg hover:bg-card-2">
              <Globe2 className="size-4 text-muted" />
              <span className="flex-1">Show all areas</span>
              {!area && <Check className="size-4 text-accent" />}
            </button>
          </div>
          <p className="mt-2 text-[11px] text-subtle">Your area is remembered on this device.</p>
        </div>
      )}
    </div>
  );
}

/** Area + radius, status, category and time filters for the whole dashboard. */
export function DashboardFilters({ value, onChange, categories }: { value: Filters; onChange: (f: Filters) => void; categories: Category[] }) {
  const toggleStatus = (g: StatusGroup) => {
    const has = value.statuses.includes(g);
    const next = has ? value.statuses.filter((s) => s !== g) : [...value.statuses, g];
    if (next.length === 0) return; // keep at least one status selected
    onChange({ ...value, statuses: statusGroups.map((s) => s.key).filter((k) => next.includes(k)) });
  };
  const allStatuses = value.statuses.length === statusGroups.length;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-line bg-card p-3 lg:flex-row lg:flex-wrap lg:items-center">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Area</span>
        <AreaPicker area={value.area} onChange={(area) => onChange({ ...value, area })} />
        <label className="flex items-center gap-2 text-sm text-muted">
          within
          <select
            value={value.area?.radiusKm ?? DEFAULT_RADIUS_KM}
            disabled={!value.area}
            onChange={(e) => value.area && onChange({ ...value, area: { ...value.area, radiusKm: Number(e.target.value) } })}
            className={selectClass}
            aria-label="Radius"
            title={value.area ? undefined : "Choose an area first"}
          >
            {RADIUS_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r} km
              </option>
            ))}
          </select>
        </label>
        {value.area && (
          <button type="button" onClick={() => onChange({ ...value, area: null })} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-card-2 hover:text-fg">
            <X className="size-3.5" /> Clear
          </button>
        )}
      </div>

      <div className="hidden h-6 w-px bg-line lg:block" aria-hidden />

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Status">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Status</span>
        {statusGroups.map((g) => {
          const on = value.statuses.includes(g.key);
          return (
            <button
              key={g.key}
              type="button"
              aria-pressed={on}
              onClick={() => toggleStatus(g.key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                on ? "border-line bg-card-2 text-fg" : "border-dashed border-line text-subtle hover:text-fg"
              }`}
            >
              <span className={`size-2.5 rounded-full ${on ? g.dotClass : "bg-transparent ring-1 ring-subtle"}`} />
              {g.label}
            </button>
          );
        })}
        {!allStatuses && (
          <button type="button" onClick={() => onChange({ ...value, statuses: statusGroups.map((s) => s.key) })} className="text-xs text-accent hover:underline">
            All
          </button>
        )}
      </div>

      <div className="hidden h-6 w-px bg-line lg:block" aria-hidden />

      <div className="flex flex-wrap items-center gap-2">
        <select value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })} className={selectClass} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select value={value.sinceDays} onChange={(e) => onChange({ ...value, sinceDays: Number(e.target.value) })} className={selectClass} aria-label="Reported">
          <option value={0}>Any time</option>
          <option value={1}>Last 24 hours</option>
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
        </select>
      </div>
    </div>
  );
}
