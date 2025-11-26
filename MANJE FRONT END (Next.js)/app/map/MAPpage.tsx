"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  yearBuilt: number;
  amenities: string[];
  parking: string;
  petsAllowed: boolean;
  sourcePlatform: string;
  sourceUrl: string;
  imageUrl: string;
}

export default function MapView() {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const listings: Listing[] = [
    {
      id: 1,
      title: "Luxury Condo Downtown",
      price: 2200,
      bedrooms: 2,
      bathrooms: 2,
      area: 900,
      type: "Condo",
      latitude: 43.4641,
      longitude: -80.5242,
      address: "456 Road, Waterloo",
      yearBuilt: 2018,
      amenities: ["Pool", "Gym", "Balcony"],
      parking: "Underground",
      petsAllowed: true,
      sourcePlatform: "Realtor.ca",
      sourceUrl: "#",
      imageUrl: "/dummy-condo.jpg",
    },
    {
      id: 2,
      title: "Cozy Apartment",
      price: 1800,
      bedrooms: 1,
      bathrooms: 1,
      area: 700,
      type: "Apartment",
      latitude: 43.4735,
      longitude: -80.5434,
      address: "123 Street, Kitchener",
      yearBuilt: 2015,
      amenities: ["Gym", "Balcony"],
      parking: "Street",
      petsAllowed: false,
      sourcePlatform: "Kijiji",
      sourceUrl: "#",
      imageUrl: "/dummy-apartment.jpg",
    },
    {
      id: 3,
      title: "Family House",
      price: 2500,
      bedrooms: 3,
      bathrooms: 2,
      area: 1200,
      type: "House",
      latitude: 43.4602,
      longitude: -80.5151,
      address: "789 Ave, Cambridge",
      yearBuilt: 2005,
      amenities: ["Garage", "Garden", "Fireplace"],
      parking: "Driveway",
      petsAllowed: true,
      sourcePlatform: "Kijiji",
      sourceUrl: "#",
      imageUrl: "/dummy-house.jpg",
    },
  ];

  const iconColors: Record<string, string> = {
    House: "green",
    Apartment: "blue",
    Condo: "purple",
  };

  return (
    <main className="flex min-h-screen bg-gray-900 text-white p-6 gap-6">
      {/* LEFT PANEL — FILTERS */}
      <aside className="w-80 bg-gray-800 p-6 rounded-2xl overflow-y-auto">
        <h2 className="text-xl font-bold uppercase mb-4">Filters</h2>
        <div className="space-y-4">
          <label className="block uppercase font-semibold">Price Range</label>
          <select className="w-full p-2 rounded bg-gray-700 text-white">
            <option>Any</option>
            <option>$0 - $1000</option>
            <option>$1000 - $1500</option>
            <option>$1500 - $2000</option>
            <option>$2000+</option>
          </select>

          <label className="block uppercase font-semibold">Bedrooms</label>
          <select className="w-full p-2 rounded bg-gray-700 text-white">
            <option>Any</option>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4+</option>
          </select>

          <label className="block uppercase font-semibold">Bathrooms</label>
          <select className="w-full p-2 rounded bg-gray-700 text-white">
            <option>Any</option>
            <option>1</option>
            <option>2</option>
            <option>3+</option>
          </select>

          <label className="block uppercase font-semibold">Area (sq ft)</label>
          <select className="w-full p-2 rounded bg-gray-700 text-white">
            <option>Any</option>
            <option>500+</option>
            <option>700+</option>
            <option>1000+</option>
          </select>

          <label className="block uppercase font-semibold">Property Type</label>
          <select className="w-full p-2 rounded bg-gray-700 text-white">
            <option>Any</option>
            <option>House</option>
            <option>Apartment</option>
            <option>Condo</option>
          </select>

          <button className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold uppercase">
            Apply Filters
          </button>
        </div>
      </aside>

      {/* MIDDLE PANEL — MAP */}
      <section className="flex-1 rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
        <MapContainer
          center={[43.4723, -80.5449]}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
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
                shadowSize: [41, 41],
              })}
              eventHandlers={{
                click: () => setSelectedListing(listing),
              }}
            >
              <Popup>
                <b>{listing.title}</b>
                <br />
                ${listing.price}/month
                <br />
                {listing.bedrooms} Bed • {listing.bathrooms} Bath
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>

      {/* RIGHT PANEL — DETAILS */}
      <aside className="w-80 bg-gray-800 p-6 rounded-2xl overflow-y-auto">
        {selectedListing ? (
          <div className="space-y-3">
            <h2 className="text-xl font-bold uppercase">{selectedListing.title}</h2>
            <img
              src={selectedListing.imageUrl}
              alt={selectedListing.title}
              className="w-full rounded-lg border border-gray-700"
            />
            <p className="mb-1"><strong>Price:</strong> ${selectedListing.price}/month</p>
            <p className="mb-1"><strong>Bedrooms:</strong> {selectedListing.bedrooms}</p>
            <p className="mb-1"><strong>Bathrooms:</strong> {selectedListing.bathrooms}</p>
            <p className="mb-1"><strong>Area:</strong> {selectedListing.area} sq ft</p>
            <p className="mb-1"><strong>Address:</strong> {selectedListing.address}</p>
            <p className="mb-1"><strong>Year Built:</strong> {selectedListing.yearBuilt}</p>
            <p className="mb-1"><strong>Amenities:</strong> {selectedListing.amenities.join(", ")}</p>
            <p className="mb-1"><strong>Parking:</strong> {selectedListing.parking}</p>
            <p className="mb-1"><strong>Pets Allowed:</strong> {selectedListing.petsAllowed ? "Yes" : "No"}</p>
            <p className="italic">{selectedListing.sourcePlatform}</p>
            <a
              href={selectedListing.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-400 hover:underline"
            >
              View Original Listing
            </a>
          </div>
        ) : (
          <p className="text-gray-400 uppercase">Select a listing on the map to see details here.</p>
        )}
      </aside>
    </main>
  );
}
