"use client";

import { LocateFixed, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { api, type MapIssue } from "@/lib/api";
import { statusGroups } from "@/lib/status";

// Leaflet touches `window`, so it only loads in the browser.
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-card-2" />,
});

type Center = { lat: number; lng: number; zoom: number };
type LocationState =
  | { kind: "locating" }
  | { kind: "user"; label: string }
  | { kind: "fallback"; label: string; reason: string };

const FALLBACK = { name: "New Delhi", lat: 28.6139, lng: 77.209 };

/** Map of the user's area (or the default city) with the given issues as markers. */
export function LiveMap({ issues }: { issues: MapIssue[] }) {
  const [center, setCenter] = useState<Center>({ lat: FALLBACK.lat, lng: FALLBACK.lng, zoom: 11 });
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [location, setLocation] = useState<LocationState>({ kind: "locating" });

  const showFallback = useCallback((reason: string) => {
    api
      .mapDefault()
      .catch(() => FALLBACK)
      .then((city) => {
        setCenter({ lat: city.lat, lng: city.lng, zoom: 11 });
        setUserPos(null);
        setLocation({ kind: "fallback", label: city.name, reason });
      });
  }, []);

  // Asks the browser for the user's position; falls back to the default city.
  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) {
      showFallback("Your browser doesn't support location.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const pos = { lat: coords.latitude, lng: coords.longitude };
        setUserPos(pos);
        setCenter({ ...pos, zoom: 14 });
        try {
          const place = await api.reverseGeocode(pos.lat, pos.lng);
          const label = [place.area, place.city].filter(Boolean).join(", ") || "Your area";
          setLocation({ kind: "user", label });
        } catch {
          setLocation({ kind: "user", label: "Your area" });
        }
      },
      (err) => {
        showFallback(err.code === err.PERMISSION_DENIED ? "Location access was denied." : "Couldn't detect your location.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
    );
  }, [showFallback]);

  const relocate = () => {
    setLocation({ kind: "locating" });
    requestLocation();
  };

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return (
    <div className="flex h-full min-h-[420px] flex-col overflow-hidden rounded-xl border border-line bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="size-4 shrink-0 text-accent" />
          <p className="truncate text-sm font-medium text-fg">
            {location.kind === "locating" && "Finding your location…"}
            {location.kind === "user" && <>Issues near {location.label}</>}
            {location.kind === "fallback" && <>Showing {location.label}</>}
          </p>
        </div>
        <button
          type="button"
          onClick={relocate}
          className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs font-medium text-fg transition-colors hover:bg-card-2"
        >
          <LocateFixed className="size-3.5" /> My location
        </button>
      </div>

      <div className="relative isolate min-h-[320px] flex-1">
        <div className="absolute inset-0">
          <MapView center={center} userPos={userPos} issues={issues} />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2 text-xs text-muted">
        <ul className="flex flex-wrap gap-4">
          {statusGroups.map((g) => (
            <li key={g.key} className="flex items-center gap-1.5">
              <span className={`size-2.5 rounded-full ${g.dotClass}`} /> {g.label}
            </li>
          ))}
        </ul>
        <span>{location.kind === "fallback" ? location.reason : `${issues.length} on map`}</span>
      </div>
    </div>
  );
}
