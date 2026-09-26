"use client";

import { ExternalLink } from "lucide-react";
import dynamic from "next/dynamic";

const MiniMapView = dynamic(() => import("./MiniMapView"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-card-2" />,
});

/** Small read-only map with a pin, plus a Google Maps directions link. */
export function MiniMap({ lat, lng, className = "h-56" }: { lat: number; lng: number; className?: string }) {
  return (
    <div>
      <div className={`relative isolate overflow-hidden rounded-lg border border-line ${className}`}>
        <MiniMapView lat={lat} lng={lng} />
      </div>
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
      >
        Get directions <ExternalLink className="size-3" />
      </a>
    </div>
  );
}
