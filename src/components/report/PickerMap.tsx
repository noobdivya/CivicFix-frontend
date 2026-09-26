"use client";

import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-setup";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

type LatLng = { lat: number; lng: number };

// A CSS pin (avoids Leaflet's default marker images, which bundlers break).
const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:#2563eb;border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

function FlyTo({ center, zoom }: { center: LatLng; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], zoom, { duration: 0.8 });
  }, [map, center.lat, center.lng, zoom]);
  return null;
}

function ClickToPick({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

/** Map where tapping or dragging the pin chooses the issue's location. */
export default function PickerMap({
  center,
  zoom,
  position,
  onPick,
}: {
  center: LatLng;
  zoom: number;
  position: LatLng | null;
  onPick: (p: LatLng) => void;
}) {
  const handlers = useMemo(
    () => ({
      dragend: (e: L.DragEndEvent) => {
        const p = (e.target as L.Marker).getLatLng();
        onPick({ lat: p.lat, lng: p.lng });
      },
    }),
    [onPick],
  );

  return (
    <MapContainer center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer url={TILE_URL} attribution={attribution} maxZoom={19} />
      <FlyTo center={center} zoom={zoom} />
      <ClickToPick onPick={onPick} />
      {position && <Marker position={[position.lat, position.lng]} icon={pinIcon} draggable eventHandlers={handlers} />}
    </MapContainer>
  );
}
