"use client";

import { useEffect, useState } from "react";
import { getSavedListings } from "@/utils/saved";

export default function SavedPage() {
  const [listings, setListings] = useState([]);
  const [sorting, setSorting] = useState("date-desc");

  // Load saved listings on page load
  useEffect(() => {
    const saved = getSavedListings();
    setListings(saved);
  }, []);

  // Sorting logic
  const sortedListings = [...listings].sort((a, b) => {
    if (sorting === "price-asc") return a.price - b.price;
    if (sorting === "price-desc") return b.price - a.price;
    if (sorting === "date-desc") return b.savedAt - a.savedAt;
    if (sorting === "date-asc") return a.savedAt - b.savedAt;

    // Bedroom filters (ONLY WORK IF listings have a bedrooms field)
    if (sorting === "bed-1") return a.bedrooms - b.bedrooms;
    if (sorting === "bed-2") return a.bedrooms - b.bedrooms;
    if (sorting === "bed-3") return b.bedrooms - a.bedrooms;

    return 0;
  });

  return (
    <main className="min-h-screen bg-black text-white p-8 flex">

      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-gray-900 border border-gray-800 rounded-xl p-6 mr-8 h-fit space-y-8">
        
        {/* SORT BY DATE */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Sort by Date</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="dateSort"
                value="date-desc"
                checked={sorting === "date-desc"}
                onChange={() => setSorting("date-desc")}
                className="accent-blue-500"
              />
              <span>Newest → Oldest</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="dateSort"
                value="date-asc"
                checked={sorting === "date-asc"}
                onChange={() => setSorting("date-asc")}
                className="accent-blue-500"
              />
              <span>Oldest → Newest</span>
            </label>
          </div>
        </div>

        {/* SORT BY PRICE */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Sort by Price</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="priceSort"
                value="price-asc"
                checked={sorting === "price-asc"}
                onChange={() => setSorting("price-asc")}
                className="accent-blue-500"
              />
              <span>Low → High</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="priceSort"
                value="price-desc"
                checked={sorting === "price-desc"}
                onChange={() => setSorting("price-desc")}
                className="accent-blue-500"
              />
              <span>High → Low</span>
            </label>
          </div>
        </div>

        {/* BEDROOM FILTER */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Bedrooms</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="bedrooms"
                value="1"
                onChange={() => setSorting("bed-1")}
                className="accent-blue-500"
              />
              <span>1 Bedroom</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="bedrooms"
                value="2"
                onChange={() => setSorting("bed-2")}
                className="accent-blue-500"
              />
              <span>2 Bedrooms</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="bedrooms"
                value="3+"
                onChange={() => setSorting("bed-3")}
                className="accent-blue-500"
              />
              <span>3+ Bedrooms</span>
            </label>
          </div>
        </div>

      </aside>

      {/* RIGHT CONTENT */}
      <section className="flex-1">
        <h1 className="text-4xl font-bold mb-8">Saved Listings</h1>

        {sortedListings.length === 0 ? (
          <p className="text-gray-400 text-lg">You haven't saved any listings yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedListings.map((listing) => (
              <div
                key={listing.id}
                className="p-5 bg-gray-900 border border-gray-800 rounded-xl"
              >
                <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
                <p className="text-gray-400 mb-1">${listing.price}/month</p>
                <p className="text-gray-500 mb-4">{listing.address}</p>

                <button className="text-red-400 hover:text-red-300 text-sm">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
