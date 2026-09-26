"use client";

import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-setup";
import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:26px;height:26px;border-radius:50% 50% 50% 0;background:#2563eb;border:3px solid #fff;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

export default function MiniMapView({ lat, lng }: { lat: number; lng: number }) {
  return (
    <MapContainer center={[lat, lng]} zoom={16} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        maxZoom={19}
      />
      <Marker position={[lat, lng]} icon={pinIcon} />
    </MapContainer>
  );
}
