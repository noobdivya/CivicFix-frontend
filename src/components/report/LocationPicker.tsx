"use client";

import { Loader2, LocateFixed, MapPin } from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { api, type Place } from "@/lib/api";

const PickerMap = dynamic(() => import("./PickerMap"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-card-2" />,
});

type LatLng = { lat: number; lng: number };

/**
 * Lets the user pin the issue on a map (tap, drag, or "use my location").
 * Each new pin is reverse-geocoded so the form can suggest an address.
 */
export function LocationPicker({
  value,
  onChange,
  onPlace,
  error,
}: {
  value: LatLng | null;
  onChange: (p: LatLng) => void;
  onPlace: (place: Place | null) => void;
  error?: string;
}) {
  const [view, setView] = useState({ center: { lat: 28.6139, lng: 77.209 }, zoom: 12 });
  const [locating, setLocating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const lookupId = useRef(0);

  const pick = useCallback(
    (p: LatLng) => {
      onChange(p);
      const id = ++lookupId.current;
      api
        .reverseGeocode(p.lat, p.lng)
        .then((place) => id === lookupId.current && onPlace(place))
        .catch(() => id === lookupId.current && onPlace(null));
    },
    [onChange, onPlace],
  );

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("Your browser can't share location. Tap the map to place the pin.");
      return;
    }
    setLocating(true);
    setStatus(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        const p = { lat: coords.latitude, lng: coords.longitude };
        setView({ center: p, zoom: 17 });
        pick(p);
      },
      (err) => {
        setLocating(false);
        setStatus(
          err.code === err.PERMISSION_DENIED
            ? "Location access was denied. Tap the map to place the pin instead."
            : "Couldn't detect your location. Tap the map to place the pin.",
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60_000 },
    );
  }, [pick]);

  // Start at the default city; if location permission was already granted, locate right away.
  useEffect(() => {
    api
      .mapDefault()
      .then((c) => setView((v) => (value ? v : { center: { lat: c.lat, lng: c.lng }, zoom: 12 })))
      .catch(() => {});
    navigator.permissions
      ?.query({ name: "geolocation" })
      .then((s) => {
        if (s.state === "granted" && !value) locate();
      })
      .catch(() => {});
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="size-4 text-accent" />
          {value ? "Drag the pin or tap the map to adjust." : "Tap the map where the issue is, or use your location."}
        </p>
        <button
          type="button"
          onClick={locate}
          disabled={locating}
          className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {locating ? <Loader2 className="size-3.5 animate-spin" /> : <LocateFixed className="size-3.5" />}
          {locating ? "Locating…" : "Use my current location"}
        </button>
      </div>

      <div
        className={`relative isolate h-72 overflow-hidden rounded-xl border sm:h-80 ${error ? "border-rose-500" : "border-line"}`}
      >
        <PickerMap center={view.center} zoom={view.zoom} position={value} onPick={pick} />
      </div>

      <div className="mt-1.5 flex flex-wrap justify-between gap-2 text-xs">
        {error ? <span className="text-rose-500">{error}</span> : <span className="text-amber-500">{status}</span>}
        {value && (
          <span className="tabular-nums text-subtle">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </span>
        )}
      </div>
    </div>
  );
}
