"use client";

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMemo } from "react";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

// ------------------------------------------------------
// ICONS
// ------------------------------------------------------
const houseIcon = L.icon({
  iconUrl: "/icons/house.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const apartmentIcon = L.icon({
  iconUrl: "/icons/apartment.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

const condoIcon = L.icon({
  iconUrl: "/icons/condo.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// MULTIPLE LISTINGS ICON (your custom PNG)
const multiIcon = L.icon({
  iconUrl: "/icons/multi.png",
  iconSize: [45, 45],
  iconAnchor: [22, 45],
});

// Pick correct icon
function getIcon(type: string, count: number) {
  if (count > 1) return multiIcon;

  const t = type.toLowerCase();
  if (t.includes("house")) return houseIcon;
  if (t.includes("apartment")) return apartmentIcon;
  if (t.includes("condo")) return condoIcon;

  return houseIcon;
}

// ------------------------------------------------------
// MAP COMPONENT
// ------------------------------------------------------
export default function ListingMap({ listings, onSelectListing }: any) {
  const safe = Array.isArray(listings) ? listings : [];

  // Group listings by exact coordinates
  const groups = useMemo(() => {
    const map: Record<string, any[]> = {};

    safe.forEach((l) => {
      const key = `${l.latitude},${l.longitude}`;
      if (!map[key]) map[key] = [];
      map[key].push(l);
    });

    return map;
  }, [safe]);

  return (
    <MapContainer
      center={[43.4723, -80.5449]}
      zoom={13}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

      {Object.entries(groups).map(([key, group]: any) => {
        const [lat, lon] = key.split(",").map(Number);
        const count = group.length;

        return (
          <Marker
            key={key}
            position={[lat, lon]}
            icon={getIcon(group[0].Type, count)}
            eventHandlers={{
              click: () => {
                if (count === 1) {
                  onSelectListing(group[0]);
                } else {
                  onSelectListing({
                    multi: true,
                    listings: group,
                  });
                }
              },
            }}
          >
            <Popup>
              {count === 1 ? (
                <>
                  <b>{group[0].Title}</b><br />
                  ${group[0].Price}<br />
                  {group[0].Bedrooms} Beds • {group[0].Bathrooms} Baths
                </>
              ) : (
                <>
                  <b>{count} Listings Here</b>
                  <ul>
                    {group.map((l: any) => (
                      <li key={l.id}>
                        — ${l.Price}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

