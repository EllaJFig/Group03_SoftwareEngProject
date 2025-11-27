"use client";

import { useEffect, useState } from "react";
import { getSavedListings, removeListing } from "@/utils/saved";

// Browser scraper using corsproxy.io
async function fetchPreviewBrowser(url: string) {
  try {
    const proxy = "https://corsproxy.io/?";
    const full = proxy + encodeURIComponent(url);

    const html = await fetch(full).then((res) => res.text());
    const doc = new DOMParser().parseFromString(html, "text/html");

    const og = doc.querySelector('meta[property="og:image"]')?.content;
    const tw = doc.querySelector('meta[name="twitter:image"]')?.content;

    return og || tw || null;
  } catch {
    return null;
  }
}

function getImg(ls: any) {
  return (
    ls.preview ||
    ls.image ||
    (Array.isArray(ls.Images) ? ls.Images[0] : null) ||
    null
  );
}

export default function SavedPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  //  Restore ALL sort options
  const [sortKey, setSortKey] = useState("date-desc");

  useEffect(() => {
    const data = getSavedListings();
    setListings(data);
    fetchPreviews(data);
  }, []);

  async function fetchPreviews(list: any[]) {
    const updated = await Promise.all(
      list.map(async (ls) => {
        if (ls.preview) return ls;
        const preview = await fetchPreviewBrowser(ls.url);
        return { ...ls, preview };
      })
    );

    setListings(updated);
    localStorage.setItem("manje_saved_listings", JSON.stringify(updated));
  }

  function removeItem(id: string) {
    removeListing(id);
    const updated = getSavedListings();
    setListings(updated);
    if (selected?.id === id) setSelected(null);
  }

  // FULL SORTING LOGIC (RESTORED)
  const sorted = [...listings].sort((a, b) => {
    switch (sortKey) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;

      case "size-asc":
        return (a.sqft || 0) - (b.sqft || 0);
      case "size-desc":
        return (b.sqft || 0) - (a.sqft || 0);

      case "bedrooms":
        return (b.bedrooms || 0) - (a.bedrooms || 0);

      case "bathrooms":
        return (b.bathrooms || 0) - (a.bathrooms || 0);

      case "date-asc":
        return a.savedAt - b.savedAt;
      case "date-desc":
        return b.savedAt - a.savedAt;

      default:
        return 0;
    }
  });

  return (
    <main className="flex min-h-screen bg-black text-white pt-24">
      
      {/* LEFT SORT PANEL */}
      <aside className="w-80 bg-gray-900 p-6 rounded-xl mr-4 space-y-6 h-fit">
        <h2 className="text-xl font-bold uppercase">Sort Listings</h2>

        {/* PRICE SORT */}
        <div>
          <h3 className="font-semibold mb-2">By Price</h3>

          <label className="flex items-center gap-2 mb-1">
            <input
              type="radio"
              name="price"
              checked={sortKey === "price-asc"}
              onChange={() => setSortKey("price-asc")}
              className="accent-blue-500"
            />
            Low → High
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="price"
              checked={sortKey === "price-desc"}
              onChange={() => setSortKey("price-desc")}
              className="accent-blue-500"
            />
            High → Low
          </label>
        </div>

        {/* SIZE SORT */}
        <div>
          <h3 className="font-semibold mb-2">By Size (Sqft)</h3>

          <label className="flex items-center gap-2 mb-1">
            <input
              type="radio"
              checked={sortKey === "size-asc"}
              onChange={() => setSortKey("size-asc")}
              className="accent-blue-500"
            />
            Small → Large
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={sortKey === "size-desc"}
              onChange={() => setSortKey("size-desc")}
              className="accent-blue-500"
            />
            Large → Small
          </label>
        </div>

        {/* BEDROOMS SORT */}
        <div>
          <h3 className="font-semibold mb-2">Bedrooms</h3>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={sortKey === "bedrooms"}
              onChange={() => setSortKey("bedrooms")}
              className="accent-blue-500"
            />
            Most Bedrooms
          </label>
        </div>

        {/* BATHROOMS SORT */}
        <div>
          <h3 className="font-semibold mb-2">Bathrooms</h3>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={sortKey === "bathrooms"}
              onChange={() => setSortKey("bathrooms")}
              className="accent-blue-500"
            />
            Most Bathrooms
          </label>
        </div>

        {/* DATE SORT */}
        <div>
          <h3 className="font-semibold mb-2">Date Saved</h3>

          <label className="flex items-center gap-2 mb-1">
            <input
              type="radio"
              checked={sortKey === "date-desc"}
              onChange={() => setSortKey("date-desc")}
              className="accent-blue-500"
            />
            Newest → Oldest
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={sortKey === "date-asc"}
              onChange={() => setSortKey("date-asc")}
              className="accent-blue-500"
            />
            Oldest → Newest
          </label>
        </div>
      </aside>

      {/* CENTER GRID */}
      <section className="flex-1 mr-4">
        <h1 className="text-4xl font-bold mb-6">Saved Listings</h1>

        {sorted.length === 0 ? (
          <p className="text-gray-400">No saved listings yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {sorted.map((ls) => (
              <div
                key={ls.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:bg-gray-800 transition"
                onClick={() => setSelected(ls)}
              >
                {getImg(ls) && (
                  <img
                    src={getImg(ls)}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                  />
                )}

                <h2 className="text-xl font-semibold">{ls.title}</h2>
                <p className="text-gray-400">${ls.price}</p>
                <p className="text-gray-500 text-sm">{ls.address}</p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(ls.id);
                  }}
                  className="mt-2 text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RIGHT DETAILS PANEL */}
      <aside className="w-80 bg-gray-900 p-6 rounded-xl ml-4 h-fit overflow-y-auto">
        {!selected ? (
          <p className="text-gray-500">Click a listing to view details.</p>
        ) : (
          <div className="space-y-3">

            {getImg(selected) && (
              <img
                src={getImg(selected)}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}

            <h2 className="text-2xl font-bold">{selected.title}</h2>

            <p><strong>Price:</strong> ${selected.price}</p>
            <p><strong>Bedrooms:</strong> {selected.bedrooms}</p>
            <p><strong>Bathrooms:</strong> {selected.bathrooms}</p>
            <p><strong>Sqft:</strong> {selected.sqft || "N/A"}</p>
            <p><strong>Location:</strong><br />{selected.address}</p>

            <button
              onClick={() => removeItem(selected.id)}
              className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
            >
              Remove from Saved
            </button>

            <a
              href={selected.url}
              target="_blank"
              className="block text-center mt-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
            >
              View Original Listing
            </a>
          </div>
        )}
      </aside>

    </main>
  );
}
