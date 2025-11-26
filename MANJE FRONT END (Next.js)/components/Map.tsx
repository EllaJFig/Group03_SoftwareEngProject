"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";

// Dynamic imports for React Leaflet
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
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  type?: string;
  latitude: number;
  longitude: number;
  address?: string;
  sourcePlatform?: string;
  sourceUrl?: string;
  yearBuilt?: number;
  amenities?: string[];
  parking?: string;
  petsAllowed?: boolean;
  imageUrl?: string;
}

export default function MapView() {
  const [listings] = useState<Listing[]>([
    {
      id: 1,
      title: "Listing 1",
      price: 1800,
      bedrooms: 2,
      bathrooms: 1,
      area: 900,
      type: "Apartment",
      latitude: 43.4735,
      longitude: -80.5434,
      address: "123 Street",
      sourcePlatform: "Kijiji",
      sourceUrl: "#",
      yearBuilt: 2015,
      amenities: ["Pool", "Gym", "Balcony"],
      parking: "Street",
      petsAllowed: true,
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: 2,
      title: "Listing 2",
      price: 2200,
      bedrooms: 1,
      bathrooms: 1,
      area: 700,
      type: "Condo",
      latitude: 43.4641,
      longitude: -80.5242,
      address: "456 Road",
      sourcePlatform: "Realtor.ca",
      sourceUrl: "#",
      yearBuilt: 2018,
      amenities: ["Elevator", "Gym"],
      parking: "Garage",
      petsAllowed: false,
      imageUrl: "https://via.placeholder.com/150",
    },
    {
      id: 3,
      title: "Listing 3",
      price: 2000,
      bedrooms: 2,
      bathrooms: 2,
      area: 1000,
      type: "House",
      latitude: 43.4602,
      longitude: -80.5151,
      address: "789 Ave",
      sourcePlatform: "Kijiji",
      sourceUrl: "#",
      yearBuilt: 2010,
      amenities: ["Garden", "Garage"],
      parking: "Garage",
      petsAllowed: true,
      imageUrl: "https://via.placeholder.com/150",
    },
  ]);

  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const iconMap: Record<string, { icon: string; color: string }> = {
    House: { icon: "home", color: "green" },
    Apartment: { icon: "building", color: "blue" },
    Condo: { icon: "university", color: "purple" },
  };

  return (
    <div className="flex h-screen">
      {/* LEFT - Filters */}
      <aside className="w-80 bg-gray-900 text-white p-6 overflow-y-auto">
        <h2 className="text-xl font-bold uppercase mb-4 text-blue-400">Filters</h2>

        <div className="mb-4">
          <label className="block mb-1 text-gray-300">Price Range</label>
          <select className="w-full p-2 rounded text-black">
            <option>Any</option>
            <option>$0 - $1000</option>
            <option>$1000 - $1500</option>
            <option>$1500 - $2000</option>
            <option>$2000+</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-300">Bedrooms</label>
          <select className="w-full p-2 rounded text-black">
            <option>Any</option>
            <option>1 Bedroom</option>
            <option>2 Bedrooms</option>
            <option>3 Bedrooms</option>
            <option>4+</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-300">Bathrooms</label>
          <select className="w-full p-2 rounded text-black">
            <option>Any</option>
            <option>1 Bathroom</option>
            <option>2 Bathrooms</option>
            <option>3+</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-300">Property Type</label>
          <select className="w-full p-2 rounded text-black">
            <option>Any</option>
            <option>House</option>
            <option>Apartment</option>
            <option>Condo</option>
          </select>
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold uppercase">
          Apply Filters
        </button>
      </aside>

      {/* MIDDLE - Map */}
      <section className="flex-1 relative">
        <MapContainer
          center={[43.4723, -80.5449]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CARTO'
          />

          {listings.map((listing) => (
            <Marker
              key={listing.id}
              position={[listing.latitude, listing.longitude]}
              icon={L.icon({
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                shadowUrl: "",
                shadowSize: [0, 0],
              })}
              eventHandlers={{ click: () => setSelectedListing(listing) }}
            >
              <Popup>
                <b>{listing.title}</b>
                <br />
                <strong>${listing.price}</strong>/month
                <br />
                {listing.bedrooms} Bed • {listing.bathrooms} Bath
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>

      {/* RIGHT - Details */}
      <aside className="w-96 bg-gray-800 text-gray-200 p-6 overflow-y-auto">
        {selectedListing ? (
          <div>
            <h2 className="text-xl font-bold uppercase mb-4 text-blue-400">
              {selectedListing.title}
            </h2>
            <img
              src={selectedListing.imageUrl || "https://via.placeholder.com/300x200"}
              alt="Listing"
              className="w-full mb-4 rounded"
            />
            <p className="mb-1">
              <strong>Price:</strong> ${selectedListing.price}
            </p>
            <p className="mb-1">
              <strong>Bedrooms:</strong> {selectedListing.bedrooms ?? "N/A"}
            </p>
            <p className="mb-1">
              <strong>Bathrooms:</strong> {selectedListing.bathrooms ?? "N/A"}
            </p>
            <p className="mb-1">
              <strong>Area:</strong> {selectedListing.area ?? "N/A"} sq ft
            </p>
            <p className="mb-1">
              <strong>Address:</strong> {selectedListing.address ?? "N/A"}
            </p>
            <p className="mb-1">
              <strong>Year Built:</strong> {selectedListing.yearBuilt ?? "N/A"}
            </p>
            <p className="mb-1">
              <strong>Amenities:</strong>{" "}
              {selectedListing.amenities?.join(", ") ?? "N/A"}
            </p>
            <p className="mb-1">
              <strong>Parking:</strong> {selectedListing.parking ?? "N/A"}
            </p>
            <p className="mb-1">
              <strong>Pets Allowed:</strong>{" "}
              {selectedListing.petsAllowed === undefined
                ? "N/A"
                : selectedListing.petsAllowed
                ? "Yes"
                : "No"}
            </p>
            <p className="italic">{selectedListing.sourcePlatform ?? "Unknown"}</p>
          </div>
        ) : (
          <p className="text-gray-400">Click on a marker to see details here</p>
        )}
      </aside>
    </div>
  );
}
