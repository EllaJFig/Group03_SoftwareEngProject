"use client";

import { useEffect, useState } from "react";
import { useSavedListings } from "@/hooks/useSavedListings";

// ------------------------------------------------------
// PREVIEW SCRAPER + LOCAL CACHE
// ------------------------------------------------------
const PREVIEW_CACHE_KEY = "manje_preview_cache_v1";

function getCachedPreview(url?: string | null): string | null {
  if (typeof window === "undefined" || !url) return null;
  try {
    const raw = localStorage.getItem(PREVIEW_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const val = data[url];
    return typeof val === "string" && val.trim() ? val : null;
  } catch {
    return null;
  }
}

function setCachedPreview(url: string, preview: string) {
  if (typeof window === "undefined" || !url || !preview) return;
  try {
    const raw = localStorage.getItem(PREVIEW_CACHE_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[url] = preview;
    localStorage.setItem(PREVIEW_CACHE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

async function fetchPreviewBrowser(url?: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const proxy = "https://corsproxy.io/?";
    const fullURL = proxy + encodeURIComponent(url);

    const html = await fetch(fullURL).then((res) => res.text());
    const doc = new DOMParser().parseFromString(html, "text/html");

    const og = doc.querySelector('meta[property="og:image"]')?.getAttribute("content") || "";
    const tw = doc.querySelector('meta[name="twitter:image"]')?.getAttribute("content") || "";

    const best = og || tw;
    if (best && best.trim()) return best.trim();
    return null;
  } catch {
    return null;
  }
}

async function ensurePreview(ls: any): Promise<any> {
  if (ls.preview && typeof ls.preview === "string" && ls.preview.trim()) {
    return ls;
  }
  if (!ls.url) return ls;

  const cached = getCachedPreview(ls.url);
  if (cached) return { ...ls, preview: cached };

  const preview = await fetchPreviewBrowser(ls.url);
  if (preview) {
    setCachedPreview(ls.url, preview);
    return { ...ls, preview };
  }

  return ls;
}

function getImg(ls: any) {
  if (!ls) return null;
  if (typeof ls.preview === "string" && ls.preview.trim()) return ls.preview;
  if (typeof ls.image === "string" && ls.image.trim()) return ls.image;
  if (Array.isArray(ls.Images) && ls.Images[0]) return ls.Images[0];
  return null;
}

// ------------------------------------------------------
// PAGE
// ------------------------------------------------------
export default function SavedPage() {
  const { savedListings, removeListing, loading } = useSavedListings();
  const [listings, setListings] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [sortKey, setSortKey] = useState("date-desc");

  // When savedListings changes from Firestore, enrich with previews
  useEffect(() => {
    async function hydrate() {
      const enhanced = await Promise.all(savedListings.map((ls) => ensurePreview(ls)));
      setListings(enhanced);
    }
    hydrate();
  }, [savedListings]);

  function removeItem(id: string) {
    removeListing(id);
    if (selected?.id === id) setSelected(null);
  }

  const sorted = [...listings].sort((a, b) => {
    switch (sortKey) {
      case "price-asc":
        return (a.price || 0) - (b.price || 0);
      case "price-desc":
        return (b.price || 0) - (a.price || 0);
      case "size-asc":
        return (a.sqft || 0) - (b.sqft || 0);
      case "size-desc":
        return (b.sqft || 0) - (a.sqft || 0);
      case "bedrooms":
        return (b.bedrooms || 0) - (a.bedrooms || 0);
      case "bathrooms":
        return (b.bathrooms || 0) - (a.bathrooms || 0);
      case "date-asc":
        return (a.savedAt || 0) - (b.savedAt || 0);
      case "date-desc":
        return (b.savedAt || 0) - (a.savedAt || 0);
      default:
        return 0;
    }
  });

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white pt-24 text-center">
        Loading saved listings...
      </div>
    );

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
                    src={getImg(ls)!}
                    className="w-full h-40 object-cover rounded-lg mb-3"
                    alt={ls.title}
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
                src={getImg(selected)!}
                className="w-full h-48 object-cover rounded-lg mb-4"
                alt={selected.title}
              />
            )}

            <h2 className="text-2xl font-bold">{selected.title}</h2>

            <p>
              <strong>Price:</strong> ${selected.price}
            </p>
            <p>
              <strong>Bedrooms:</strong> {selected.bedrooms}
            </p>
            <p>
              <strong>Bathrooms:</strong> {selected.bathrooms}
            </p>
            <p>
              <strong>Sqft:</strong> {selected.sqft || "N/A"}
            </p>
            <p>
              <strong>Location:</strong>
              <br />
              {selected.address}
            </p>

            <button
              onClick={() => {
                removeItem(selected.id);
                setSelected(null);
              }}
              className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
            >
              Remove from Saved
            </button>

            <a
              href={selected.url}
              target="_blank"
              className="block text-center mt-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
              rel="noreferrer"
            >
              View Original Listing
            </a>
          </div>
        )}
      </aside>
    </main>
  );
}
