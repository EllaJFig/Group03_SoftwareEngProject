"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

interface Listing {
  id: number;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  latitude: number;
  longitude: number;
  address: string;
}

interface MiniMapProps {
  listings: Listing[];
}

export default function MiniMap({ listings }: MiniMapProps) {
  const center = listings.length
    ? [listings[0].latitude, listings[0].longitude]
    : [43.4723, -80.5449];

  const colorMap: Record<string, string> = {
    House: "green",
    Apartment: "blue",
    Condo: "purple",
  };

  return (
    <div className="w-full h-full">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.carto.com/">CARTO</a>'
        />

        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={L.icon({
              iconUrl:
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              shadowUrl:
                "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            })}
          >
            <Popup>
              <b>{listing.title}</b>
              <br />
              ${listing.price}/month
              <br />
              {listing.bedrooms} Bed • {listing.bathrooms} Bath
              <br />
              {listing.area} sq ft
              <br />
              {listing.address}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
