"use client";

import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-setup";
import { useEffect } from "react";
import { Circle, CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import type { MapIssue } from "@/lib/api";
import { statusHex, statusLabel } from "@/lib/status";
import { useTheme } from "@/lib/theme";

// Free OpenStreetMap tiles (no API key). In dark mode they are darkened with a CSS filter (globals.css).
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

type Props = {
  center: { lat: number; lng: number; zoom: number };
  userPos: { lat: number; lng: number } | null;
  issues: MapIssue[];
};

/** Moves the map when the center changes (MapContainer's props are only read once). */
function Recenter({ lat, lng, zoom }: Props["center"]) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], zoom, { duration: 1.2 });
  }, [map, lat, lng, zoom]);
  return null;
}

export default function MapView({ center, userPos, issues }: Props) {
  const { theme } = useTheme();

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={center.zoom}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer url={TILE_URL} attribution={attribution} maxZoom={19} />
      <Recenter {...center} />

      {userPos && (
        <>
          <Circle
            center={[userPos.lat, userPos.lng]}
            radius={400}
            pathOptions={{ color: "#3b82f6", weight: 1, fillOpacity: 0.08 }}
          />
          <CircleMarker
            center={[userPos.lat, userPos.lng]}
            radius={8}
            pathOptions={{ color: "#ffffff", weight: 3, fillColor: "#3b82f6", fillOpacity: 1 }}
          >
            <Popup>You are here</Popup>
          </CircleMarker>
        </>
      )}

      {issues.map((issue) => {
        const color = statusHex(issue.status, theme);
        return (
          <CircleMarker
            key={issue.id}
            center={[issue.lat, issue.lng]}
            radius={7}
            pathOptions={{ color, weight: 2, fillColor: color, fillOpacity: 0.75 }}
          >
            <Popup>
              <strong>{issue.title}</strong>
              <br />
              {issue.category} · {statusLabel[issue.status]}
              {issue.address && (
                <>
                  <br />
                  {issue.address}
                </>
              )}
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
