"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

// Dynamic Leaflet components (browser only)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

export default function MiniMap() {
  return (
    <div className="w-full h-full">
      <MapContainer
        center={[43.4723, -80.5449]}
        zoom={12}
        zoomControl={true}
        scrollWheelZoom={true}
        dragging={true}
        style={{
          height: "100%",
          width: "100%",
        }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
      </MapContainer>
    </div>
  );
}
