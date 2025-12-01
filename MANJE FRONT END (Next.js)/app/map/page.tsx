"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getAllListings } from "@/utils/firestore";
import { smartLocalGeocode, extractPostal } from "@/utils/localGeocode";

const ListingMap = dynamic(() => import("@/components/Map"), { ssr: false });

// SAME STORAGE KEY FOR SAVING PREVIEWS
const STORAGE_KEY = "manje_saved_listings";

// ⭐ image helper
function getListingImage(listing: any) {
  return (
    listing?.preview ||
    listing?.Images?.[0] ||
    listing?.image ||
    listing?.img ||
    null
  );
}

// ⭐ dedupe logic (URL → Location → ID)
function dedupeListings(listings: any[]) {
  const seen = new Map();
  for (const l of listings) {
    const key =
      (l.URL || "").trim().toLowerCase() ||
      (l.Location || "").trim().toLowerCase() ||
      l.id;
    if (!seen.has(key)) seen.set(key, l);
  }
  return Array.from(seen.values());
}

export default function MapPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selectedListing, setSelectedListing] = useState<any>(null);

  // filters
  const [priceFilter, setPriceFilter] = useState("Any");
  const [bedFilter, setBedFilter] = useState("Any");
  const [bathFilter, setBathFilter] = useState("Any");
  const [typeFilter, setTypeFilter] = useState("Any");

  // saved ids
  const [saved, setSaved] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("manje_saved_listings") || "[]").map(
        (l: any) => l.id
      );
    } catch {
      return [];
    }
  });

  // ⭐ SAVE/UNSAVE
  function toggleSave(listing: any) {
    const stored: any[] = JSON.parse(
      localStorage.getItem("manje_saved_listings") || "[]"
    );
    const exists = stored.find((l) => l.id === listing.id);

    if (exists) {
      const updated = stored.filter((l) => l.id !== listing.id);
      localStorage.setItem("manje_saved_listings", JSON.stringify(updated));
      setSaved(updated.map((x) => x.id));
      return;
    }

    const item = {
      id: listing.id,
      title: listing.Title,
      price: Number(listing.Price),
      bedrooms: Number(listing.Bedrooms),
      bathrooms: Number(listing.Bathrooms),
      sqft: listing.Sqft || null,
      address: listing.Location,
      url: listing.URL,
      preview: listing.preview || null,
      savedAt: Date.now(),
    };

    const updated = [...stored, item];
    localStorage.setItem("manje_saved_listings", JSON.stringify(updated));
    setSaved(updated.map((x) => x.id));
  }

  // ⭐ 1. load and geocode listings (FAST)
  useEffect(() => {
    async function load() {
      let raw = await getAllListings();
      raw = dedupeListings(raw);

      const processed = raw.map((item: any) => {
        const postal = extractPostal(item.Location);
        const [lat, lon] = smartLocalGeocode(postal, item.City);
        return {
          ...item,
          latitude: lat,
          longitude: lon,
          preview: item.preview || null,
        };
      });

      setListings(processed);
      setFiltered(processed);

      // now load previews in background
      fetchPreviewImages(processed);
    }

    load();
  }, []);

  // ⭐ 2. fetch preview images in the BACKGROUND
  async function fetchPreviewImages(listingsArr: any[]) {
    const updated = await Promise.all(
      listingsArr.map(async (l) => {
        if (l.preview) return l; // already has preview

        try {
          const res = await fetch("/api/preview", {
            method: "POST",
            body: JSON.stringify({ url: l.URL }),
          });

          const data = await res.json();
          if (data?.image) {
            return { ...l, preview: data.image };
          }

          return l;
        } catch {
          return l;
        }
      })
    );

    setListings(updated);
    setFiltered(updated);
  }

  // ⭐ 3. filters
  function applyFilters() {
    let data = [...listings];

    if (priceFilter !== "Any") {
      if (priceFilter === "$0 - $1000")
        data = data.filter((l) => Number(l.Price) <= 1000);

      if (priceFilter === "$1000 - $1500")
        data = data.filter(
          (l) => Number(l.Price) >= 1000 && Number(l.Price) <= 1500
        );

      if (priceFilter === "$1500 - $2000")
        data = data.filter(
          (l) => Number(l.Price) >= 1500 && Number(l.Price) <= 2000
        );

      if (priceFilter === "$2000+")
        data = data.filter((l) => Number(l.Price) >= 2000);
    }

    if (bedFilter !== "Any") {
      data = data.filter((l) =>
        bedFilter === "3+" ? Number(l.Bedrooms) >= 3 : l.Bedrooms === bedFilter
      );
    }

    if (bathFilter !== "Any") {
      data = data.filter((l) =>
        bathFilter === "3+" ? Number(l.Bathrooms) >= 3 : l.Bathrooms === bathFilter
      );
    }

    if (typeFilter !== "Any") {
      data = data.filter((l) =>
        (l.Type || "").toLowerCase().includes(typeFilter.toLowerCase())
      );
    }

    setFiltered(data);
  }

  return (
    <main className="flex min-h-screen bg-black text-white pt-24">

      {/* LEFT FILTERS */}
      <aside className="w-80 bg-gray-900 p-6 rounded-xl mr-4">
        <h2 className="text-xl font-bold mb-6 uppercase">Filters</h2>

        {/* Price */}
        <div className="mb-4">
          <label>Price</label>
          <select
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
          >
            <option>Any</option>
            <option>$0 - $1000</option>
            <option>$1000 - $1500</option>
            <option>$1500 - $2000</option>
            <option>$2000+</option>
          </select>
        </div>

        {/* Bedrooms */}
        <div className="mb-4">
          <label>Bedrooms</label>
          <select
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            value={bedFilter}
            onChange={(e) => setBedFilter(e.target.value)}
          >
            <option>Any</option>
            <option>1</option>
            <option>2</option>
            <option>3+</option>
          </select>
        </div>

        {/* Bathrooms */}
        <div className="mb-4">
          <label>Bathrooms</label>
          <select
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            value={bathFilter}
            onChange={(e) => setBathFilter(e.target.value)}
          >
            <option>Any</option>
            <option>1</option>
            <option>2</option>
            <option>3+</option>
          </select>
        </div>

        {/* Type */}
        <div className="mb-4">
          <label>Type</label>
          <select
            className="w-full p-2 rounded bg-gray-800 border border-gray-700"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>Any</option>
            <option>House</option>
            <option>Apartment</option>
            <option>Condo</option>
          </select>
        </div>

        <button
          onClick={applyFilters}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold mt-3"
        >
          Apply Filters
        </button>
      </aside>

      {/* MAP */}
      <section className="flex-1 rounded-xl overflow-hidden border border-gray-800">
        <ListingMap listings={filtered} onSelectListing={setSelectedListing} />
      </section>

      {/* RIGHT SIDEBAR */}
      <aside className="w-80 bg-gray-900 p-6 rounded-xl ml-4 overflow-y-scroll max-h-[85vh]">

        {!selectedListing ? (
          <p className="text-gray-500">Click a listing marker to view details.</p>
        ) : selectedListing.multi ? (
          <>
            <h2 className="text-xl font-bold mb-2">
              {selectedListing.listings.length} Listings at this Location
            </h2>

            {selectedListing.listings.map((l: any) => (
              <div key={l.id} className="bg-gray-800 p-3 rounded-lg mb-4">
                {getListingImage(l) && (
                  <img
                    src={getListingImage(l) as string}
                    className="w-full h-40 object-cover rounded-lg mb-2"
                  />
                )}
                <p className="font-bold">{l.Title}</p>
                <p>${l.Price}</p>
                <p>{l.Bedrooms} Beds • {l.Bathrooms} Baths</p>

                <button
                  onClick={() => toggleSave(l)}
                  className={`mt-2 px-3 py-1 rounded-lg ${
                    saved.includes(l.id)
                      ? "bg-red-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {saved.includes(l.id) ? "Unsave" : "Save"}
                </button>

                <a
                  href={l.URL}
                  target="_blank"
                  className="block text-blue-400 underline text-sm mt-2"
                >
                  View Listing
                </a>
              </div>
            ))}
          </>
        ) : (
          <div>

            {getListingImage(selectedListing) && (
              <img
                src={getListingImage(selectedListing) as string}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            <h2 className="text-2xl font-bold">{selectedListing.Title}</h2>
            <p><strong>Price:</strong> ${selectedListing.Price}</p>
            <p><strong>Bedrooms:</strong> {selectedListing.Bedrooms}</p>
            <p><strong>Bathrooms:</strong> {selectedListing.Bathrooms}</p>
            <p><strong>Location:</strong> {selectedListing.Location}</p>
            <p><strong>Sqft:</strong> {selectedListing.Sqft}</p>

            <button
              onClick={() => toggleSave(selectedListing)}
              className={`mt-3 w-full py-2 rounded-lg ${
                saved.includes(selectedListing.id)
                  ? "bg-red-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {saved.includes(selectedListing.id) ? "Unsave" : "Save"}
            </button>

            <a
              href={selectedListing.URL}
              target="_blank"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg w-full text-center"
            >
              View Original Listing
            </a>
          </div>
        )}

      </aside>
    </main>
  );
}





