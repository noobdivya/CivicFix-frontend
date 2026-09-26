import L from "leaflet";

// Drop Leaflet's default "Leaflet 🇺🇦" link from the attribution line on every map.
// The OpenStreetMap credit stays: its licence (ODbL) requires it to be visible.
L.Control.Attribution.prototype.options.prefix = false;
